import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateEggDto } from './dto/create-egg.dto';
import { UpdateEggDto } from './dto/update-egg.dto';
import { Egg, EggDocument } from './schema/egg.schema';
import { HATCH_DURATION_BY_RARITY } from './consts';
import { StatisticsService } from 'src/statistics/statistics.service';
import { PetsService } from 'src/pets/pets.service';
import { UsersService } from 'src/users/users.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class EggsService {
  constructor(
    @InjectModel(Egg.name) private eggModel: Model<EggDocument>,
    private readonly statisticsService: StatisticsService,
    @Inject(forwardRef(() => PetsService))
    private readonly petsService: PetsService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getRandomRarity(): Promise<'common' | 'rare' | 'epic' | 'legendary'> {
    const distribution = [
      { rarity: 'common' as const, chance: 0.7 },
      { rarity: 'rare' as const, chance: 0.2 },
      { rarity: 'epic' as const, chance: 0.08 },
      { rarity: 'legendary' as const, chance: 0.02 },
    ];

    const roll = Math.random(); // від 0.0 до 1.0
    let sum = 0;

    for (const dist of distribution) {
      sum += dist.chance;
      if (roll < sum) {
        return dist.rarity;
      }
    }

    return 'common';
  }

  async getRandomImageUrl(): Promise<string> {
    const randomNumber = Math.floor(Math.random() * 6) + 1;

    return randomNumber.toString();
  }

  async create(createEggDto: CreateEggDto) {
    const owner = new Types.ObjectId(createEggDto.ownerUserId);
    const rarity = 'common';
    const imageUrl = await this.getRandomImageUrl();
    const hatchDuration = HATCH_DURATION_BY_RARITY[rarity];

    const egg = new this.eggModel({
      ...createEggDto,
      hatchDurationMs: hatchDuration,
      rarity,
      imageUrl,
      ownerUserId: owner,
    });
    return egg.save();
  }

  async findAll(userId: string, limit: number, page: number) {
    const total = await this.eggModel.countDocuments({
      ownerUserId: new Types.ObjectId(userId),
    });

    const eggs = await this.eggModel
      .find({ ownerUserId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    return {
      eggs,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOne(id: string, userId: string) {
    const egg = await this.eggModel
      .findOne({
        _id: new Types.ObjectId(id),
        ownerUserId: userId,
      })
      .exec();
    if (!egg) {
      throw new NotFoundException(`Egg #${id} not found`);
    }
    return egg;
  }

  async update(id: string, updateEggDto: UpdateEggDto, userId: string) {
    const egg = await this.eggModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        ownerUserId: userId,
      },
      updateEggDto,
      {
        new: true,
      },
    );
    if (!egg) {
      throw new NotFoundException(`Egg #${id} not found`);
    }
    return egg;
  }

  async remove(id: string, userId: string) {
    const egg = await this.eggModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      ownerUserId: userId,
    });
    if (!egg) {
      throw new NotFoundException(`Egg #${id} not found`);
    }
    return egg;
  }

  async hatchStart(id: string, userId: string) {
    const egg = await this.eggModel.findOne({
      _id: new Types.ObjectId(id),
      ownerUserId: new Types.ObjectId(userId),
    });

    if (!egg) {
      throw new NotFoundException(`Egg #${id} not found`);
    }
    if (egg.isHatched) {
      throw new BadRequestException('Egg is already hatched');
    }
    if (egg.hatchStartTime) {
      throw new BadRequestException('Egg hatching is already in progress');
    }

    const hatchingEggs = await this.eggModel
      .find({
        ownerUserId: egg.ownerUserId,
        hatchStartTime: { $exists: true, $ne: null },
      })
      .sort({ createdAt: -1 })
      .exec();
    const hatchingAtTheMoment = hatchingEggs.filter((egg) => {
      return new Date().getTime() < egg.hatchEndTime!.getTime();
    }).length;
    if (hatchingAtTheMoment > 0) {
      throw new BadRequestException('Another egg is already being hatched.');
    }

    const rarity = egg.rarity || 'common';
    const now = new Date();
    const hatchDuration =
      HATCH_DURATION_BY_RARITY[rarity] || 4 * 60 * 60 * 1000;

    egg.hatchStartTime = now;
    egg.hatchEndTime = new Date(now.getTime() + hatchDuration);

    await egg.save();
    return egg;
  }

  async quickHatch(id: string, userId: string) {
    const egg = await this.eggModel.findOne({
      _id: new Types.ObjectId(id),
      ownerUserId: new Types.ObjectId(userId),
    });
    if (!egg) {
      throw new NotFoundException(`Egg #${id} not found`);
    }
    const user = await this.usersService.findOneById(
      egg.ownerUserId.toString(),
    );
    const price = 50;
    if (user.glims < price) {
      throw new BadRequestException('Insufficient glims');
    }
    user.glims -= price;
    await user.save();
    egg.hatchStartTime = new Date();
    egg.hatchEndTime = new Date();
    await egg.save();
    return {
      pet: await this.finishHatch(id, userId),
      user: {
        ...user.toJSON(),
        password: undefined,
      },
    };
  }

  async finishHatch(id: string, userId: string) {
    const egg = await this.eggModel.findOne({
      _id: new Types.ObjectId(id),
      ownerUserId: new Types.ObjectId(userId),
    });
    if (!egg) {
      throw new NotFoundException(`Egg #${id} not found`);
    }
    if (egg.isHatched) {
      throw new BadRequestException('Egg is already hatched');
    }
    if (!egg.hatchStartTime || !egg.hatchEndTime) {
      throw new BadRequestException('Egg hatching has not started');
    }

    const now = new Date();
    if (egg.hatchEndTime > now) {
      throw new BadRequestException('Egg is not ready to hatch');
    }

    const newPet = await this.petsService.create({
      ownerUserId: egg.ownerUserId.toString(),
      name: 'New Pet',
      rarity: egg.rarity as 'common' | 'rare' | 'epic' | 'legendary',
    });

    const gainedXp = 50;
    const user = await this.usersService.increaseExperience(
      egg.ownerUserId._id.toHexString(),
      gainedXp,
    );

    await this.statisticsService.update({
      ownerUserId: egg.ownerUserId.toString(),
      newEggsHatched: 1,
    });

    // Send pet hatched notification
    this.notificationsService
      .sendPushNotification(
        userId,
        {
          title: 'New Pet Hatched!',
          body: 'Say hello to your newest companion!',
          sound: 'default',
          data: { id: 'notif.pet.hatched', petId: newPet._id.toString() },
        },
        { onPetHatched: true },
      )
      .catch((error) =>
        console.error('Pet hatched notification error:', error),
      );

    await this.eggModel.deleteOne(egg._id);

    return {
      ...newPet.toObject(),
      user,
      gainedXp,
    };
  }
}
