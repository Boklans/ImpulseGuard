import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet, PetDocument } from './schema/pet.schema';
import { UsersService } from 'src/users/users.service';
import {
  getImageIdForEvolution,
  getRandomEvolutionLine,
  getStageForLevel,
  inferEvolutionFromImage,
  PET_EVOLUTION_LINES,
} from './pet-evolution.config';

export const MAX_PET_FRIENDSHIP = 5;

@Injectable()
export class PetsService {
  constructor(
    @InjectModel(Pet.name) private petModel: Model<PetDocument>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  private getSafeEvolutionLine(evolutionLine?: number): number {
    if (
      Number.isInteger(evolutionLine) &&
      evolutionLine >= 1 &&
      evolutionLine <= PET_EVOLUTION_LINES
    ) {
      return evolutionLine;
    }
    return getRandomEvolutionLine();
  }

  private async syncEvolutionState(pet: PetDocument): Promise<PetDocument> {
    const inferred = inferEvolutionFromImage(pet.imageUrl);
    const levelStage = getStageForLevel(pet.level);
    const evolutionLine = pet.evolutionLine ?? inferred.evolutionLine;
    const nextImageUrl = getImageIdForEvolution(evolutionLine, levelStage);
    const xpForNextLevel = this.totalXPNeededForLevel(pet.level + 1);

    let changed = false;

    if (pet.evolutionLine !== evolutionLine) {
      pet.evolutionLine = evolutionLine;
      changed = true;
    }

    if (pet.stage !== levelStage) {
      pet.stage = levelStage;
      pet.evolvedAt = new Date();
      changed = true;
    }

    if (pet.imageUrl !== nextImageUrl) {
      pet.imageUrl = nextImageUrl;
      changed = true;
    }

    if (pet.xpForNextLevel !== xpForNextLevel) {
      pet.xpForNextLevel = xpForNextLevel;
      changed = true;
    }

    if (changed) {
      await pet.save();
    }

    return pet;
  }

  private applyEvolutionAfterLevelChange(pet: PetDocument): void {
    const nextStage = getStageForLevel(pet.level);
    const evolutionLine =
      pet.evolutionLine ?? inferEvolutionFromImage(pet.imageUrl).evolutionLine;
    const nextImageUrl = getImageIdForEvolution(evolutionLine, nextStage);

    if (pet.evolutionLine !== evolutionLine) {
      pet.evolutionLine = evolutionLine;
    }

    if (pet.stage !== nextStage) {
      pet.stage = nextStage;
      pet.evolvedAt = new Date();
    }

    pet.imageUrl = nextImageUrl;
    pet.xpForNextLevel = this.totalXPNeededForLevel(pet.level + 1);
  }

  async create(createPetDto: CreatePetDto) {
    const owner = new Types.ObjectId(createPetDto.ownerUserId);
    const level = createPetDto.level ?? 1;
    const evolutionLine = this.getSafeEvolutionLine(createPetDto.evolutionLine);
    const stage = getStageForLevel(level);
    const pet = new this.petModel({
      ...createPetDto,
      ownerUserId: owner,
      imageUrl: getImageIdForEvolution(evolutionLine, stage),
      evolutionLine,
      stage,
      friendship: 1,
      currentFriendshipXp: 0,
      currentXP: createPetDto.currentXP ?? 0,
      level,
      xpForNextLevel: this.totalXPNeededForLevel(level + 1),
    });
    return pet.save();
  }

  async findAll(
    userId: string,
    limit: number,
    page: number,
    aliveOnly: boolean = false,
  ) {
    const filter =
      aliveOnly === true
        ? { ownerUserId: new Types.ObjectId(userId), isActive: true }
        : { ownerUserId: new Types.ObjectId(userId) };
    const total = await this.petModel.countDocuments(filter);

    const pets = await this.petModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const syncedPets = await Promise.all(
      pets.map((pet) => this.syncEvolutionState(pet)),
    );

    return {
      pets: syncedPets,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOne(id: string): Promise<PetDocument> {
    const pet = await this.petModel.findById(id).exec();
    if (!pet) {
      throw new NotFoundException(`Pet #${id} not found`);
    }
    return this.syncEvolutionState(pet);
  }

  async findOneAndValidateUser(
    petId: string,
    userId: string,
  ): Promise<PetDocument> {
    const pet = await this.findOne(petId);
    if (pet.ownerUserId.toString() !== userId) {
      throw new BadRequestException('ПашОл нахуй');
    }
    return pet;
  }

  async revivePet(id: string, userId: string) {
    const pet = await this.petModel.findById(new Types.ObjectId(id));
    if (!pet || pet.ownerUserId.toHexString() !== userId) {
      throw new NotFoundException("Can't find pet with id: " + id);
    }
    if (pet.currentHealth > 0) {
      throw new BadRequestException(`Pet ${id} is not dead`);
    }
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException("Can't find user with id: " + userId);
    }

    if (user.glims < 500) {
      return {
        glims: user.glims,
        pet: pet,
      };
    }
    user.glims -= 500;
    await user.save();
    pet.currentHealth = pet.maxHealth;
    pet.currentEnergy = pet.maxEnergy;
    pet.isActive = true;
    await pet.save();
    return {
      glims: user.glims,
      pet: pet,
    };
  }

  async update(id: string, updatePetDto: UpdatePetDto, userId: string) {
    const pet = await this.petModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        ownerUserId: new Types.ObjectId(userId),
      },
      updatePetDto,
      {
        new: true,
      },
    );

    if (!pet) {
      throw new NotFoundException(`Pet #${id} not found`);
    }
    return pet;
  }

  async remove(id: string) {
    const pet = await this.petModel.findByIdAndDelete(id);
    if (!pet) {
      throw new NotFoundException(`Pet #${id} not found`);
    }
    return pet;
  }

  async validateUserAndRemove(id: string, userId: string) {
    const pet = await this.petModel.findOneAndDelete({
      _id: id,
      ownerUserId: userId,
    });
    if (!pet) {
      throw new NotFoundException(`Pet #${id} not found`);
    }
    return this.syncEvolutionState(pet);
  }

  private async getPet(petId: string): Promise<PetDocument> {
    const pet = await this.petModel.findById(petId);
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }
    return this.syncEvolutionState(pet);
  }

  async getPetXpBoost(petId: string): Promise<number> {
    const pet = await this.getPet(petId);
    if (pet.friendship <= 1) return 1;
    return (pet.friendship - 1) * 0.25 + 1;
  }

  async setFavourite(
    petId: string,
    isFavourite: boolean,
  ): Promise<PetDocument> {
    const pet = await this.getPet(petId);
    pet.isFavorite = isFavourite;
    this.applyEvolutionAfterLevelChange(pet);
    await pet.save();
    return pet;
  }

  async increaseFriendship(
    petId: string,
    friendshipXp: number,
  ): Promise<PetDocument> {
    const pet = await this.getPet(petId);

    if (pet.friendship >= MAX_PET_FRIENDSHIP) return pet;

    pet.currentFriendshipXp += friendshipXp;

    while (pet.friendship < MAX_PET_FRIENDSHIP) {
      const xpForNextFriendship = this.totalFriendshipXpForLevel(
        pet.friendship + 1,
      );
      if (pet.currentFriendshipXp >= xpForNextFriendship) {
        pet.currentFriendshipXp -= xpForNextFriendship;
        pet.friendship += 1;
      } else {
        break;
      }
    }

    this.applyEvolutionAfterLevelChange(pet);
    await pet.save();
    return pet;
  }

  private totalFriendshipXpForLevel(level: number): number {
    return 50 * level + 20 * (level - 1) * level;
  }

  async decreaseHp(petId: string, damage: number): Promise<PetDocument> {
    const pet = await this.getPet(petId);

    const hp = Math.max(pet.currentHealth - damage, 0);
    if (hp <= 0) {
      pet.isActive = false;
    }
    pet.currentHealth = hp;
    await pet.save();
    return pet;
  }

  async decreaseEnergy(petId: string, energy: number): Promise<PetDocument> {
    const pet = await this.getPet(petId);

    const energyTotal = Math.max(pet.currentEnergy - energy, 0);
    if (energyTotal <= 0) {
      pet.isActive = false;
    }
    pet.currentEnergy = energyTotal;
    await pet.save();
    return pet;
  }

  private totalXPNeededForLevel(level: number): number {
    if (level <= 1) {
      return 0;
    }

    let sum = 0;
    for (let i = 1; i < level; i++) {
      sum += 50 * (i * i + i);
    }
    return sum;
  }

  async increaseExperience(
    petId: string,
    xpToAdd: number,
  ): Promise<PetDocument> {
    const pet = await this.getPet(petId);

    pet.currentXP += xpToAdd;

    while (true) {
      const xpForNextLevel = this.totalXPNeededForLevel(pet.level + 1);

      if (pet.currentXP >= xpForNextLevel) {
        pet.level++;
      } else {
        break;
      }
    }

    this.applyEvolutionAfterLevelChange(pet);
    await pet.save();
    return pet;
  }

  async updateAfterSession(
    petId: string,
    xpGain: number,
    hpDrain: number,
    energyDrain: number,
  ): Promise<PetDocument> {
    const pet = await this.getPet(petId);

    // Apply XP and check level up
    pet.currentXP += xpGain;
    while (true) {
      const xpForNextLevel = this.totalXPNeededForLevel(pet.level + 1);
      if (pet.currentXP >= xpForNextLevel) {
        pet.level++;
      } else {
        break;
      }
    }

    this.applyEvolutionAfterLevelChange(pet);

    // Apply HP drain
    pet.currentHealth = Math.max(0, pet.currentHealth - hpDrain);
    if (pet.currentHealth <= 0) {
      pet.isActive = false;
    }

    // Apply energy drain
    pet.currentEnergy = Math.max(0, pet.currentEnergy - energyDrain);
    if (pet.currentEnergy <= 0) {
      pet.isActive = false;
    }

    await pet.save();
    return pet;
  }
}
