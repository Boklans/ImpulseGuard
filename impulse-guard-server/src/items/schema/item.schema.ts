import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ItemConfig, ITEMS_CONFIG, ItemsKey } from '../config/items.config';

export type ItemDocument = HydratedDocument<Item>;

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  autoIndex: true,
})
export class Item {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerUserId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.keys(ITEMS_CONFIG) as ItemsKey[],
    default: Object.keys(ITEMS_CONFIG)[0],
  })
  itemRef: ItemsKey;

  @Prop({ default: 0 })
  amount: number;

  public item?: ItemConfig;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
ItemSchema.index({ ownerUserId: 1, itemRef: 1 }, { unique: true });
ItemSchema.virtual('item').get(function () {
  return ITEMS_CONFIG[this.itemRef];
});
