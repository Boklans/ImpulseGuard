import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Egg, EggDocument } from 'src/eggs/schema/egg.schema';
import { User, UserDocument } from 'src/users/schema/user.schema';
import { EGG_PRICES, EggRarity } from './shop.config';
import { HATCH_DURATION_BY_RARITY } from 'src/eggs/consts';

type PublicUser = Omit<
  ReturnType<UserDocument['toJSON']>,
  'password' | 'clerkId'
>;

export type EggPrices = typeof EGG_PRICES;

export interface SoldEggInfo {
  rarity: string;
  imageUrl: string;
}

export interface SellEggResult {
  soldEgg: SoldEggInfo;
  glims: number;
  user: PublicUser;
}

export interface BuyEggResult {
  egg: EggDocument;
  glims: number;
  user: PublicUser;
}

@Injectable()
export class ShopService {
  constructor(
    @InjectModel(Egg.name) private eggModel: Model<EggDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  getEggPrices(): EggPrices {
    return EGG_PRICES;
  }

  async sellEgg(eggId: string, userId: string): Promise<SellEggResult> {
    const egg = await this.eggModel.findOne({
      _id: new Types.ObjectId(eggId),
      ownerUserId: new Types.ObjectId(userId),
    });

    if (!egg) {
      throw new NotFoundException('Egg not found');
    }

    if (egg.hatchStartTime) {
      throw new BadRequestException('Cannot sell egg that is hatching');
    }

    const sellPrice = EGG_PRICES.common.sell;

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $inc: { glims: sellPrice } },
      { new: true },
    );

    await this.eggModel.deleteOne({ _id: egg._id });

    return {
      soldEgg: {
        rarity: egg.rarity,
        imageUrl: egg.imageUrl,
      },
      glims: sellPrice,
      user: {
        ...user.toJSON(),
        password: undefined,
        clerkId: undefined,
      },
    };
  }

  async buyEgg(
    _rarity: EggRarity | undefined,
    userId: string,
  ): Promise<BuyEggResult> {
    const rarity: EggRarity = 'common';
    const buyPrice = EGG_PRICES.common.buy;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.glims < buyPrice) {
      throw new BadRequestException(
        `Not enough glims. Need ${buyPrice}, have ${user.glims}`,
      );
    }

    user.glims -= buyPrice;
    await user.save();

    const imageUrl = (Math.floor(Math.random() * 6) + 1).toString();
    const hatchDuration = HATCH_DURATION_BY_RARITY[rarity];

    const egg = new this.eggModel({
      ownerUserId: new Types.ObjectId(userId),
      rarity,
      imageUrl,
      hatchDurationMs: hatchDuration,
    });
    await egg.save();

    return {
      egg,
      glims: buyPrice,
      user: {
        ...user.toJSON(),
        password: undefined,
        clerkId: undefined,
      },
    };
  }
}
