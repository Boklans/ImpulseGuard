import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Item, ItemDocument } from './schema/item.schema';
import { Model, Types } from 'mongoose';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemConfig, ITEMS_CONFIG, ItemsKey } from './config/items.config';
import { PetsService } from 'src/pets/pets.service';
import { UsersService } from 'src/users/users.service';
import { UserPayload } from 'src/auth/payloads/user.payload';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    private readonly petsService: PetsService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  private async useItemOnPet(petId: string, itemRef: ItemsKey) {
    const item: ItemConfig = ITEMS_CONFIG[itemRef];
    const pet = await this.petsService.findOne(petId);

    if (!pet.isActive && pet.currentHealth <= 0 && pet.currentEnergy <= 0) {
      throw new BadRequestException(
        "You tried to use an item on a pet, but it didn't even move. I wonder why...",
      );
    }

    let useful = false;

    if (item.recoverHealth > 0 && pet.currentHealth < pet.maxHealth) {
      useful = true;
      pet.currentHealth = Math.min(
        pet.currentHealth + item.recoverHealth,
        pet.maxHealth,
      );
    }

    if (item.recoverEnergy > 0 && pet.currentEnergy < pet.maxEnergy) {
      useful = true;
      pet.currentEnergy = Math.min(
        pet.currentEnergy + item.recoverEnergy,
        pet.maxEnergy,
      );
    }

    // Reactivate pet if both health and energy are positive
    if (!pet.isActive && pet.currentHealth > 0 && pet.currentEnergy > 0) {
      pet.isActive = true;
      useful = true; // Reactivating counts as useful
    }

    if (!useful && item.addFriendship <= 0) {
      throw new BadRequestException(
        'Your pet is fed up already, stop you cruel person',
      );
    }

    await pet.save();

    if (item.addFriendship > 0) {
      return await this.petsService.increaseFriendship(
        petId,
        item.addFriendship,
      );
    }

    return pet;
  }

  async create(createItemDto: CreateItemDto) {
    const owner = new Types.ObjectId(createItemDto.ownerUserId);
    let item = await this.itemModel
      .findOne({
        ownerUserId: owner,
        itemRef: createItemDto.itemRef,
      })
      .exec();
    if (!item) {
      item = new this.itemModel({ ...createItemDto, ownerUserId: owner });
    } else {
      item.amount += createItemDto.amount;
    }
    return await item.save();
  }

  async findByItemAndUser(
    itemRef: ItemsKey,
    userId: string,
  ): Promise<ItemDocument> {
    const item = await this.itemModel
      .findOne({ itemRef, ownerUserId: new Types.ObjectId(userId) })
      .exec();
    if (!item) {
      throw new NotFoundException(`Item ${itemRef} not found`);
    }
    return item;
  }

  async useItem(userId: string, petId: string, itemRef: ItemsKey) {
    const pet = await this.petsService.findOne(petId);

    if (pet.ownerUserId.toString() !== userId) {
      throw new BadRequestException('Pet does not belong to user');
    }

    const inventoryItem = await this.findByItemAndUser(itemRef, userId);

    if (!inventoryItem || inventoryItem.amount < 1) {
      throw new BadRequestException(`Item ${itemRef} not found`);
    }

    const updatedPet = await this.useItemOnPet(petId, itemRef);

    inventoryItem.amount -= 1;
    await inventoryItem.save();

    return {
      pet: updatedPet,
      item: inventoryItem,
    };
  }

  getRandomItem(): ItemsKey {
    const keys = Object.keys(ITEMS_CONFIG) as ItemsKey[];
    return keys[Math.floor(Math.random() * keys.length)];
  }

  async findAll(userId: string, limit: number, page: number) {
    const total = await this.itemModel.countDocuments({
      ownerUserId: new Types.ObjectId(userId),
    });

    const userIdObj = new Types.ObjectId(userId);

    //const items = await this.itemModel
    //  .find({ ownerUserId: new Types.ObjectId(userId) })
    //  //.sort({ createdAt: -1 })
    //  //.limit(limit)
    //  //.skip((page - 1) * limit)
    //  .exec();

    const items = await this.itemModel
      .find({ ownerUserId: userIdObj })
      //.lean()
      .exec();

    const existingItemsMap = new Map(items.map((item) => [item.itemRef, item]));

    const allItemRefs = Object.keys(ITEMS_CONFIG) as ItemsKey[];
    const result = allItemRefs.map((itemRef) => {
      const existingItem = existingItemsMap.get(itemRef);
      const itemConfig = ITEMS_CONFIG[itemRef];

      if (existingItem) {
        return {
          ...existingItem.toObject(),
          item: itemConfig,
        };
      }

      return {
        ownerUserId: userIdObj,
        itemRef,
        amount: 0,
        item: itemConfig,
      };
    });

    // Sort: items with amount > 0 first, then alphabetically
    result.sort((a, b) => {
      // First priority: items with amount > 0 come first
      if (a.amount > 0 && b.amount === 0) return -1;
      if (a.amount === 0 && b.amount > 0) return 1;
      // Second priority: alphabetical by itemRef
      return a.itemRef.localeCompare(b.itemRef);
    });
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      items: result.slice(startIndex, endIndex),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOne(id: string, userPayload: UserPayload): Promise<ItemDocument> {
    const item = await this.itemModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }
    if (item.ownerUserId._id.toHexString() !== userPayload.id) {
      throw new BadRequestException("The item doesn't belong to the user");
    }
    return item;
  }

  async remove(id: string) {
    const item = await this.itemModel.findByIdAndDelete(id);
    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }
  }
}
