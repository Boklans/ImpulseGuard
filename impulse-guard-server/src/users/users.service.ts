// users/users.service.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument, User } from './schema/user.schema';
import { StatisticsService } from 'src/statistics/statistics.service';
import { UpdateStreakDto } from './dto/update-streak.dto';
import { AchievementsService } from 'src/achievements/achievements.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import {
  LEVEL_REWARDS,
  LevelRewardConfig,
} from './config/level-rewards.config';
import { LevelRewardDto } from './dto/level-reward.dto';
import { match } from 'ts-pattern';
import { GiveMultipleRewardsDto, GiveRewardDto } from './dto/give-reward.dto';
import { EggsService } from 'src/eggs/eggs.service';
import { ItemsService } from 'src/items/items.service';
import { ItemsKey } from 'src/items/config/items.config';
import {
  EmailAddressJSON,
  UserJSON,
  WebhookEvent,
} from '@clerk/clerk-sdk-node';
import { Cron } from '@nestjs/schedule';
import { EggDocument } from 'src/eggs/schema/egg.schema';
import { ItemDocument } from 'src/items/schema/item.schema';
import { BossesService } from 'src/bosses/bosses.service';
import { ImpulseReward } from 'src/impulses/impulses.service';
import { startOfUtcDay, utcDayDiff } from './streak-date.utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly statisticsService: StatisticsService,
    private readonly achievementsService: AchievementsService,
    private readonly notificationService: NotificationsService,
    @Inject(forwardRef(() => EggsService))
    private readonly eggService: EggsService,
    private readonly itemService: ItemsService,
    @Inject(forwardRef(() => BossesService))
    private readonly bossService: BossesService,
  ) {}

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  // Hourly - update boss data only
  @Cron('0 0 * * * *')
  async handleHourlyCron() {
    this.findAll()
      .then((users) => {
        users.forEach((user) => {
          this.bossService
            .updateBoss(user)
            .catch((e) => console.error('updateBoss error:', e));
        });
      })
      .catch((e) => console.error('handleHourlyCron error:', e));
  }

  // Daily at midnight - check and decline missed streaks
  @Cron('0 0 0 * * *')
  async handleDailyStreakCheck() {
    try {
      const users = await this.findAll();
      const today = startOfUtcDay(new Date());

      for (const user of users) {
        // Skip already declined users
        if (user.streakInfo.declined) continue;

        // Skip users with no active streak
        if (!user.streakInfo.endDate) continue;

        const daysSinceLastSession = utcDayDiff(
          new Date(user.streakInfo.endDate),
          today,
        );

        // Decline only after a full calendar day was missed.
        if (daysSinceLastSession > 1) {
          await this.declineStreak(user._id.toHexString());
        }
      }
    } catch (e) {
      console.error('handleDailyStreakCheck error:', e);
    }
  }

  // Daily at 18:00 - send streak warning notifications
  @Cron('0 0 18 * * *')
  async sendStreakWarnings() {
    try {
      const users = await this.userModel.find({
        'streakInfo.totalDaysInRow': { $gt: 0 },
        'streakInfo.declined': false,
      });

      const today = startOfUtcDay(new Date());

      for (const user of users) {
        // Check if user hasn't done a session today
        const lastSessionDate = user.streakInfo.endDate;
        if (lastSessionDate) {
          if (utcDayDiff(new Date(lastSessionDate), today) > 0) {
            // User hasn't done a session today - send warning
            this.notificationService
              .sendPushNotification(
                user._id.toHexString(),
                {
                  title: 'Streak at Risk!',
                  body: `Your ${user.streakInfo.totalDaysInRow}-day streak is at risk! Complete a session to keep it going.`,
                  sound: 'default',
                  data: { id: 'notif.streak.warning' },
                },
                { onStreakWarning: true },
              )
              .catch((error) =>
                console.error('Streak warning notification error:', error),
              );
          }
        }
      }
    } catch (error) {
      console.error('Streak warning cron error:', error);
    }
  }

  // Daily at 12:00 - send missed first session notifications
  @Cron('0 0 12 * * *')
  async sendMissedFirstSessionReminders() {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      // Find users created more than 24h ago with 0 experience (no sessions)
      const users = await this.userModel.find({
        createdAt: { $lt: oneDayAgo },
        experience: 0,
      });

      for (const user of users) {
        this.notificationService
          .sendPushNotification(
            user._id.toHexString(),
            {
              title: 'Start Your Journey!',
              body: 'Complete your first session today and get your first pet!',
              sound: 'default',
              data: { id: 'notif.missed.first.session' },
            },
            { onMissedFirstSession: true },
          )
          .catch((error) =>
            console.error('Missed first session notification error:', error),
          );
      }
    } catch (error) {
      console.error('Missed first session cron error:', error);
    }
  }

  async declineStreak(userId: string): Promise<UserDocument> {
    let user = await this.findOneById(userId);
    if (!user.streakInfo.declined) {
      user = await this.updateStreak({
        userId: userId,
        declined: true,
      });
      this.statisticsService
        .update({
          ownerUserId: userId,
          newCurrentStreak: 0,
        })
        .catch((error) => console.error(error));
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByClerkId(clerkId: string) {
    return this.userModel.findOne({ clerkId });
  }

  async updateStreak(updateDto: UpdateStreakDto): Promise<UserDocument> {
    const user = await this.findOneById(updateDto.userId);
    const streak = user.streakInfo;
    if (updateDto.totalDaysInRow !== undefined) {
      streak.totalDaysInRow = updateDto.totalDaysInRow;
    }
    if (updateDto.daysInRow !== undefined) {
      streak.daysInRow = updateDto.daysInRow;
    }
    if (updateDto.declined !== undefined) {
      streak.declined = updateDto.declined;
    }
    if (updateDto.goal !== undefined) {
      streak.goal = updateDto.goal;
    }
    if (updateDto.nextPromptData !== undefined) {
      streak.nextPromptDate = updateDto.nextPromptData;
    }
    if (updateDto.startDate !== undefined) {
      streak.startDate = updateDto.startDate;
    }
    if (updateDto.endDate !== undefined) {
      streak.endDate = updateDto.endDate;
    }
    user.markModified('streakInfo');
    return await user.save();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`User #${id} not found`);
    }
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

  async increaseGlims(
    userId: string,
    glimsToAdd: number,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.glims += glimsToAdd;
    await user.save();
    return user;
  }

  async getLevelRewards(userId: string): Promise<LevelRewardDto[]> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const rewards: LevelRewardDto[] = [];
    for (let i = 1; i <= Object.values(LEVEL_REWARDS).length; i++) {
      rewards.push({
        claimed: user.claimedRewards.indexOf(i) != -1,
        claimedPremium: user.claimedPremiumRewards.indexOf(i) != -1,
        level: i,
        rewards: LEVEL_REWARDS[i] || { basic: [], premium: [] },
      });
    }
    return rewards;
  }

  async claimReward(
    userId: string,
    level: number,
    premium: boolean,
  ): Promise<GiveRewardDto> {
    let user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    let rewardIsClaimed: boolean;
    if (premium) {
      rewardIsClaimed = user.claimedPremiumRewards.indexOf(level) != -1;
    } else {
      rewardIsClaimed = user.claimedRewards.indexOf(level) != -1;
    }
    if (rewardIsClaimed) {
      throw new BadRequestException('Already claimed');
    }
    if (user.level < level) {
      throw new BadRequestException('You are too low, to claim that reward');
    }
    const rewards: GiveRewardDto = [];
    let chosenRewards: LevelRewardConfig[];
    const levelReward = LEVEL_REWARDS[level] || { basic: [], premium: [] };
    if (premium) {
      chosenRewards = levelReward.premium;
    } else {
      chosenRewards = levelReward.basic;
    }
    chosenRewards.forEach((reward) => {
      match(reward)
        .with({ type: 'glims' }, async () => {
          rewards.push({
            glims: (await this.increaseGlims(userId, reward.amount)).glims,
          });
        })
        .with({ type: 'egg' }, async () => {
          for (let i = 0; i < reward.amount; i++) {
            rewards.push({
              egg: await this.eggService.create({
                ownerUserId: userId,
              }),
            });
          }
        })
        .otherwise(async () => {
          rewards.push({
            item: await this.itemService.create({
              ownerUserId: userId,
              itemRef: reward.type.toUpperCase() as ItemsKey,
              amount: reward.amount,
            }),
          });
        });
    });
    user = await this.userModel.findById(userId);
    user.claimedRewards.push(level);
    user.markModified('claimedRewards');
    await user.save();
    return rewards;
  }

  async giveRewards(
    userId: string,
    rewards: ImpulseReward[],
  ): Promise<GiveMultipleRewardsDto> {
    let user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const eggs: EggDocument[] = [];
    const items: ItemDocument[] = [];

    for (const reward of rewards) {
      switch (reward.type) {
        case 'egg':
          // Create eggs in parallel for better performance
          const newEggs = await Promise.all(
            Array.from({ length: reward.amount }, () =>
              this.eggService.create({ ownerUserId: userId }),
            ),
          );
          eggs.push(...newEggs);

          this.statisticsService
            .update({
              ownerUserId: userId,
              newEggsObtained: reward.amount,
            })
            .catch((error) => console.error(error));
          break;
        case 'glims':
          user = await this.increaseGlims(userId, reward.amount);
          break;
        default:
          items.push(
            await this.itemService.create({
              ownerUserId: userId,
              amount: reward.amount,
              itemRef: reward.type.toUpperCase() as ItemsKey,
            }),
          );
          break;
      }
    }

    return {
      eggs,
      items,
      user,
    };
  }

  async increaseExperience(
    userId: string,
    xpToAdd: number,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.experience += xpToAdd;

    while (true) {
      const xpForNextLevel = this.totalXPNeededForLevel(user.level + 1);

      if (user.experience >= xpForNextLevel) {
        user.level++;
        this.achievementsService
          .userLevelUp(user._id.toHexString(), user.level)
          .catch((error) => console.error(error));
        this.notificationService.sendPushNotification(
          userId,
          {
            body: `Congratulations! You are now level ${user.level}`,
            title: `🎉 Level ${user.level}!`,
            sound: 'default',
            data: {
              id: 'notif.level.up',
              level: user.level,
            },
          },
          {
            onLevelUp: true,
          },
        );
      } else {
        break;
      }
    }

    await user.save();
    return user;
  }

  async declineStreakGoal(userId: string) {
    const nextPromptDate = new Date();
    nextPromptDate.setDate(nextPromptDate.getDate() + 7);
    await this.statisticsService.update({
      ownerUserId: userId,
      newCurrentStreak: 0,
    });
    await this.userModel.findByIdAndUpdate(userId, {
      'streakInfo.declined': true,
      'streakInfo.nextPromptDate': nextPromptDate,
      'streakInfo.daysInRow': 0,
      'streakInfo.totalDaysInRow': 0,
    });
  }

  async resetStreakGoal(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      'streakInfo.declined': false,
      'streakInfo.nextPromptDate': null,
    });
  }

  async setStreakGoal(userId: string, goal: number) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userModel.findByIdAndUpdate(userId, {
      'streakInfo.declined': false,
      'streakInfo.nextPromptDate': null,
      'streakInfo.goal': goal,
    });
  }

  async checkStreak(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let streakReached = false;
    let xpAwarded = 0;

    if (
      user.streakInfo.daysInRow >= user.streakInfo.goal &&
      user.streakInfo.goal > 0
    ) {
      streakReached = true;
      xpAwarded = 200;

      const nextPromptDate = new Date();
      nextPromptDate.setDate(nextPromptDate.getDate() + 1);

      await this.userModel.findByIdAndUpdate(userId, {
        'streakInfo.nextPromptDate': nextPromptDate,
        'streakInfo.goal': 0,
        'streakInfo.daysInRow': 0,
      });

      await this.increaseExperience(user._id.toString(), xpAwarded);
    }

    return {
      streakReached,
      xpAwarded,
      user,
    };
  }

  /* ------------------------------------------------------------------ */
  /* Clerk webhook helpers                                              */
  /* ------------------------------------------------------------------ */

  async createFromClerk(data: WebhookEvent['data']) {
    const user = data as unknown as UserJSON;
    const email = (user.email_addresses ?? []).map(
      (e: EmailAddressJSON) => e.email_address,
    )[0];

    // First, try to find by clerkId or email (handles re-registration with same email)
    return this.userModel.findOneAndUpdate(
      { $or: [{ clerkId: user.id }, { email }] },
      {
        clerkId: user.id,
        email,
        username: user.first_name,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async updateFromClerk(data: WebhookEvent['data']) {
    const user = data as unknown as UserJSON;

    return this.userModel.findOneAndUpdate(
      { clerkId: user.id },
      {
        emailAddresses: (user.email_addresses ?? []).map(
          (e: EmailAddressJSON) => e.email_address,
        ),
        firstName: user.first_name,
        lastName: user.last_name,
        imageUrl: user.image_url,
        updatedAt: new Date(),
      },
      { new: true },
    );
  }

  async deleteByClerkId(clerkId: string) {
    return this.userModel.findOneAndDelete({ clerkId });
  }
}
