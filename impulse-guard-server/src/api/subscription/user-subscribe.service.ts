import { HttpException, Injectable, Logger } from '@nestjs/common';
import { UserSubscription } from './schema/subscription.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class UserSubscribeService {
  private readonly logger = new Logger(UserSubscribeService.name);
  constructor(
    @InjectModel(UserSubscription.name)
    private readonly subscriptionModel: Model<UserSubscription>,
  ) {}

  public async createSubscription(createDto: CreateSubscriptionDto) {
    try {
      const existingSub = await this.subscriptionModel
        .findOne({
          $or: [{ ip: createDto.ip }, { email: createDto.email }],
        })
        .select(['ip', 'email'])
        .exec();

      this.logger.log(existingSub);

      if (existingSub) {
        throw new Error('Already subscribed');
      }

      const user = await this.subscriptionModel.create({
        email: createDto.email,
        platform: createDto.platform.toString(),
        ip: createDto.ip,
        at: new Date(),
        language: createDto.language,
      });

      return user;
    } catch (error) {
      this.logger.error('AssistantsService.create', error.message, error.stack);
      throw new HttpException('Bad request: ' + error.message, 400);
    }
  }
}
