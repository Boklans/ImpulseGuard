import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateImpulseDto } from './dto/create-impulse.dto';
import { UpdateImpulseDto } from './dto/update-impulse.dto';
import { Impulse, ImpulseDocument } from './schema/impulse.schema';
import { UsersService } from 'src/users/users.service';
import { PetsService } from 'src/pets/pets.service';
import { StatisticsService } from 'src/statistics/statistics.service';
import {
  LEVEL_REWARD_TYPES,
  LevelRewardType,
} from 'src/users/config/level-rewards.config';
import { ItemType } from 'src/items/config/items.config';
import { BOSS_MAXIMUM_LEVEL } from 'src/bosses/config/bosses.config';
import { RewardsService } from 'src/rewards/rewards.service';
import { SubscriptionStatus } from 'src/users/schema/user.schema';
import { utcDayDiff } from 'src/users/streak-date.utils';

const FREE_IMPULSE_LIMIT = 3;

export class ImpulseReward {
  type: LevelRewardType;
  kind?: ItemType;
  id?: number;
  amount: number;
}

export class ImpulseRewardRanges {
  glims: { min: number; max: number };
  egg: { min: number; max: number };
  potion: { min: number; max: number };
  toy: { min: number; max: number };
  food: { min: number; max: number };
  special: { min: number; max: number };
}

// if user has low level then theirs chances will be low (~23%)
// if user has high level then theirs chances will be high (~78%)
export function getRandomAffectedByLevel(
  level: number,
  maxLevel: number,
): number {
  const p = Math.max(0, Math.min(level / maxLevel, 1));
  const probAboveHalf = 0.2 + 0.7 * p;
  const base = 1 - probAboveHalf;
  const k = Math.log(0.5) / Math.log(base);
  return Math.pow(Math.random(), k);
}

@Injectable()
export class ImpulsesService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly petsService: PetsService,
    private readonly statisticsService: StatisticsService,
    @InjectModel(Impulse.name) private impulseModel: Model<ImpulseDocument>,
    private readonly rewards: RewardsService,
  ) {}

  private getRandomUniqueRewardTypes(amount: number): LevelRewardType[] {
    const rewardTypes = LEVEL_REWARD_TYPES;
    const uniqueRewardTypes: LevelRewardType[] = ['glims'];
    if (Math.random() <= 0.4) {
      uniqueRewardTypes.push('egg');
    }
    while (uniqueRewardTypes.length < amount) {
      if (rewardTypes.length === 0) throw new Error('Not enough reward types');
      const randomIndex = Math.floor(Math.random() * rewardTypes.length);
      const rewardType = rewardTypes[randomIndex];
      if (!uniqueRewardTypes.includes(rewardType)) {
        uniqueRewardTypes.push(rewardType);
      }
    }
    return uniqueRewardTypes;
  }

  async create(createImpulseDto: CreateImpulseDto): Promise<ImpulseDocument> {
    const userId = new Types.ObjectId(createImpulseDto.userId);

    // Check impulse limit for non-premium users
    const user = await this.usersService.findOneById(createImpulseDto.userId);
    const isPremium =
      user.subscription?.status === SubscriptionStatus.ACTIVE ||
      user.subscription?.status === SubscriptionStatus.GRACE_PERIOD;

    if (!isPremium) {
      const impulseCount = await this.impulseModel.countDocuments({ userId });
      if (impulseCount >= FREE_IMPULSE_LIMIT) {
        throw new ForbiddenException(
          `Free users can create up to ${FREE_IMPULSE_LIMIT} impulses. Upgrade to premium for unlimited impulses.`,
        );
      }
    }

    const newImpulse = new this.impulseModel({
      ...createImpulseDto,
      userId,
    });
    return newImpulse.save();
  }

  async findAll(userId: string, limit: number, page: number) {
    const total = await this.impulseModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });

    const impulses = await this.impulseModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    return {
      impulses,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOne(id: string, userId: string): Promise<ImpulseDocument> {
    const impulse = await this.impulseModel
      .findOne({
        id,
        userId,
      })
      .exec();
    if (!impulse) {
      throw new NotFoundException(`Impulse with id ${id} not found`);
    }
    return impulse;
  }

  async update(
    id: string,
    updateImpulseDto: UpdateImpulseDto,
    userId: string,
  ): Promise<ImpulseDocument> {
    const impulse = await this.impulseModel
      .findOneAndUpdate(
        {
          id,
          userId,
        },
        { ...updateImpulseDto, updatedAt: new Date() },
        { new: true },
      )
      .exec();
    if (!impulse) {
      throw new NotFoundException(`Impulse with id ${id} not found`);
    }
    return impulse;
  }

  async remove(id: string, userId: string): Promise<ImpulseDocument> {
    const impulse = await this.impulseModel
      .findOneAndDelete({
        _id: id,
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!impulse) {
      throw new NotFoundException({
        message: `Impulse with id not found`,
        params: { id },
      });
    }
    return impulse;
  }

  private getRandomInRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  private getDurationMultiplier(duration: number): number {
    if (duration >= 900) return 1.5; // 15 min
    if (duration >= 600) return 1.2; // 10 min
    return 1; // 5 min or less
  }

  async finishSession(data: {
    userId: string;
    impulseId: string;
    success: boolean;
    duration: number;
    selectedPetId?: string;
  }) {
    let user = await this.usersService.findOneById(data.userId);

    const impulse = await this.impulseModel.findOne({
      userId: new Types.ObjectId(data.userId),
      _id: new Types.ObjectId(data.impulseId),
    });

    if (!impulse) {
      throw new BadRequestException("Can't find impulse");
    }

    const durationMultiplier = this.getDurationMultiplier(data.duration);

    let gainedPetXp = 0;
    if (data.success) {
      gainedPetXp = Math.floor(
        this.getRandomInRange(10, 50) * durationMultiplier,
      );
    } else {
      gainedPetXp = this.getRandomInRange(1, 20);
    }

    let gainedXP = 0;
    if (data.success) {
      gainedXP = Math.floor(this.getRandomInRange(10, 50) * durationMultiplier);
    } else {
      gainedXP = this.getRandomInRange(1, 20);
    }

    if (data.selectedPetId) {
      gainedXP *= await this.petsService.getPetXpBoost(data.selectedPetId);
    }

    const rewards = this.rewards.generate({
      level: user.level,
      maxLevel: BOSS_MAXIMUM_LEVEL,
      ranges: data.success
        ? {
            egg: {
              min: 1,
              max: Math.floor(3 * durationMultiplier),
            },
            glims: {
              min: Math.floor(50 * durationMultiplier),
              max: Math.floor(200 * durationMultiplier),
            },
            food: {
              min: 1,
              max: Math.floor(3 * durationMultiplier),
            },
            potion: {
              min: 1,
              max: Math.floor(3 * durationMultiplier),
            },
            toy: {
              min: 1,
              max: Math.floor(3 * durationMultiplier),
            },
            special: {
              min: 0,
              max: 1,
            },
          }
        : {
            egg: {
              min: 0,
              max: 1,
            },
            glims: {
              min: 20,
              max: 70,
            },
            food: {
              min: 0,
              max: 2,
            },
            potion: {
              min: 0,
              max: 1,
            },
            toy: {
              min: 0,
              max: 2,
            },
            special: {
              min: 0,
              max: 0,
            },
          },
    });

    const rewardResult = await this.usersService.giveRewards(
      data.userId,
      rewards,
    );

    user = rewardResult.user;
    user = await this.usersService.increaseExperience(data.userId, gainedXP);

    let pet = undefined;
    if (data.selectedPetId) {
      pet = await this.petsService.findOne(data.selectedPetId);

      if (!pet.isActive) {
        // Pet became inactive - skip pet updates but allow session to complete
      } else {
        const hpDrain = data.success ? 0 : this.getRandomInRange(30, 50);
        const energyDrain = this.getRandomInRange(4, 12);

        pet = await this.petsService.updateAfterSession(
          data.selectedPetId,
          gainedPetXp,
          hpDrain,
          energyDrain,
        );
      }
    }

    if (data.success) {
      const isDeclined = user.streakInfo.declined;
      const now = new Date();
      if (isDeclined) {
        user = await this.usersService.updateStreak({
          userId: data.userId,
          startDate: now,
          endDate: now,
          daysInRow: 1,
          totalDaysInRow: 1,
          declined: false,
        });
      } else {
        const daysSinceLastSession = user.streakInfo.endDate
          ? utcDayDiff(new Date(user.streakInfo.endDate), now)
          : undefined;

        if (daysSinceLastSession === undefined || daysSinceLastSession === 1) {
          user = await this.usersService.updateStreak({
            userId: data.userId,
            startDate: user.streakInfo.startDate
              ? user.streakInfo.startDate
              : now,
            endDate: now,
            daysInRow: user.streakInfo.daysInRow + 1,
            totalDaysInRow: user.streakInfo.totalDaysInRow + 1,
          });
        } else if (daysSinceLastSession > 1) {
          user = await this.usersService.updateStreak({
            userId: data.userId,
            startDate: now,
            endDate: now,
            daysInRow: 1,
            totalDaysInRow: 1,
            declined: false,
          });
        }
      }

      this.statisticsService
        .update({
          ownerUserId: data.userId,
          newImpulseDates: new Map<string, Date[]>([
            [`${data.impulseId}`, [new Date()]],
          ]),
          newSuccessfulSessions: 1,
          newCurrentStreak: user.streakInfo.totalDaysInRow,
          newRetriesAfterFail: isDeclined ? 1 : 0,
        })
        .catch((error) => console.error(error));
    } else {
      user = await this.usersService.declineStreak(data.userId);
    }

    // 3. Updating the impulse:

    await this.impulseModel.findByIdAndUpdate(
      new Types.ObjectId(data.impulseId),
      {
        $inc: { sessionsCount: 1, successCount: data.success ? 1 : 0 },
      },
    );

    return {
      gainedXP,
      user: {
        ...user.toJSON(),
        password: undefined,
        clerkId: undefined,
      },
      pet: pet,
      rewards,
    };
  }
}
