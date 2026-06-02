import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Boss, BossDocument } from './schema/boss.schema';
import { Model } from 'mongoose';
import { UserDocument } from 'src/users/schema/user.schema';
import { Pet, PetRarity } from 'src/pets/schema/pet.schema';
import { MAX_PET_FRIENDSHIP, PetsService } from 'src/pets/pets.service';
import { BossRewardDto } from './dto/boss-reward.dto';
import { UsersService } from 'src/users/users.service';
import { BOSS_CONFIG, BOSS_MAXIMUM_LEVEL } from './config/bosses.config';
import { StatisticsService } from 'src/statistics/statistics.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { RewardsService } from 'src/rewards/rewards.service';

@Injectable()
export class BossesService {
  constructor(
    @InjectModel(Boss.name)
    private bossesModel: Model<BossDocument>,
    private petService: PetsService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private statisticsService: StatisticsService,
    private notificationService: NotificationsService,
    private readonly rewards: RewardsService,
  ) {}

  async updateBoss(user: UserDocument) {
    const bossData = await this.bossesModel.findOne({
      ownerUserId: user._id.toHexString(),
    });
    if (!bossData) return;
    const bossInfo = bossData.boss;
    if (!bossInfo) return;

    // Calculate damage from all assigned pets
    await Promise.all(
      bossData.assignedPets.map(async (petId) => {
        const pet = await this.petService.findOne(petId.toHexString());
        if (!pet.isValid()) return;
        const damage = this.calculatePetDamage(pet);
        bossData.currentHealth -= damage;
        bossData.lastTimeWasDamaged = new Date();
      }),
    );

    if (bossData.currentHealth <= 0) {
      return;
    }

    // Apply damage to pets and check if any are about to die
    let petAboutToDie = false;
    await Promise.all(
      bossData.assignedPets.map(async (petId) => {
        let pet = await this.petService.findOne(petId.toHexString());
        if (!pet.isValid()) return;
        const damage = bossData.currentDamage;
        await this.petService.decreaseHp(petId.toHexString(), damage);
        pet = await this.petService.decreaseEnergy(petId.toHexString(), damage);
        if (pet.currentEnergy <= damage || pet.currentHealth <= damage) {
          petAboutToDie = true;
        }
      }),
    );

    if (petAboutToDie) {
      await this.notificationService.sendPushNotification(
        user._id.toHexString(),
        {
          body: 'One of your pets needs attention!',
          title: 'Pet Needs You',
          sound: 'default',
          data: {
            id: 'notif.pet.needs',
          },
        },
        {
          onPetNeeds: true,
        },
      );
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    if (bossData.lastTimeWasDamaged < threeDaysAgo) {
      const totalHp = bossInfo.scalingFormula(bossInfo, bossData.level).health;
      const newHealthAmount = bossInfo.regenerationScalingFormula(
        bossInfo,
        bossData.currentStage,
        totalHp,
        bossData.currentHealth,
      );
      bossData.lastTimeWasDamaged = new Date();
      bossData.currentHealth += newHealthAmount;
      if (bossInfo.maximumStages > bossData.currentStage) {
        bossData.currentStage += 1;
      }
    }
  }

  async addPetToBoss(userId: string, petId: string) {
    const pet = await this.petService.findOne(petId);
    if (pet.ownerUserId.toHexString() !== userId) {
      throw new BadRequestException('Pet does not belong to user');
    }
    if (!pet.isValid()) {
      throw new BadRequestException('Pet is not valid!');
    }
    const bossData = await this.bossesModel.findOne({
      ownerUserId: userId,
    });
    if (bossData == null) {
      throw new BadRequestException('No boss available');
    }
    bossData.assignedPets.push(pet._id);
    bossData.markModified('assignedPets');
    await bossData.save();
  }

  async removePetFromBoss(userId: string, petId: string) {
    const pet = await this.petService.findOne(petId);
    if (pet.ownerUserId.toHexString() !== userId) {
      throw new BadRequestException('Pet does not belong to user');
    }
    const bossData = await this.bossesModel.findOne({
      ownerUserId: userId,
    });
    if (bossData == null) {
      throw new BadRequestException('No boss available');
    }
    const petIndex = bossData.assignedPets.indexOf(pet._id);
    if (petIndex === -1) {
      throw new BadRequestException('Pet is not assigned to boss');
    }
    bossData.assignedPets.splice(petIndex, 1);
    bossData.markModified('assignedPets');
    await bossData.save();
  }

  async findBoss(userId: string) {
    return this.bossesModel.findOne({
      ownerUserId: userId,
    });
  }

  async startBoss(userId: string) {
    const bossData = await this.bossesModel.findOne({
      ownerUserId: userId,
    });
    const user = await this.usersService.findOneById(userId);
    if (bossData != null && bossData.currentHealth > 0) {
      throw new BadRequestException('Already has a boss available');
    }
    const index: number = Math.floor(
      Math.random() * Object.keys(BOSS_CONFIG).length,
    );
    const bossRef = Object.keys(BOSS_CONFIG)[index];
    const boss = BOSS_CONFIG[bossRef];
    return this.bossesModel.findOneAndUpdate(
      {
        ownerUserId: userId,
      },
      {
        ownerUserId: userId,
        level: user.level,
        currentHealth: boss.scalingFormula(boss, user.level).health,
        currentDamage: boss.scalingFormula(boss, user.level).damage,
        assignedPets: [],
        bossRef,
        currentStage: 1,
        lastTimeWasDamaged: new Date(),
      },
      {
        upsert: true,
      },
    );
  }

  async finishBoss(userId: string): Promise<BossRewardDto> {
    let user = await this.usersService.findOneById(userId);
    const bossData = await this.bossesModel.findOne({
      ownerUserId: user._id,
    });
    if (bossData == null) {
      throw new BadRequestException('No boss available');
    }
    if (bossData.currentHealth > 0) {
      throw new BadRequestException('Boss is still alive');
    }
    this.statisticsService.update({
      ownerUserId: userId,
      newBossWins: 1,
    });
    const rewards = this.rewards.generate({
      level: bossData.level,
      maxLevel: BOSS_MAXIMUM_LEVEL,
      ranges: bossData.boss.rewardMap,
    });
    const result = await this.usersService.giveRewards(userId, rewards);
    user = result.user;
    return {
      rewards,
      user,
    };
  }

  /**
   * This function calculates the total damage of a pet, that is
   * the damage that the pet will deal to the boss.
   * The damage is calculated by multiplying the level of the pet by 2,
   * then multiplying the result by the rarity of the pet (common, rare, epic, legendary),
   * and finally multiplying the result by the friendship of the pet.
   * The rarity and friendship are used to increase the damage of the pet,
   * so a pet with a higher rarity and a higher friendship will deal more damage.
   * @param pet The pet to calculate the damage for.
   * @returns The total damage of the pet.
   */
  private calculatePetDamage(pet: Pet): number {
    return (
      pet.level *
      2 *
      ((1 / Object.keys(PetRarity).length + 1) *
        (Object.keys(PetRarity).indexOf(pet.rarity) + 1)) *
      ((1 / MAX_PET_FRIENDSHIP + 1) * pet.friendship)
    );
  }
}
