import { Injectable } from '@nestjs/common';
import { Achievement, AchievementDocument } from './schema/achievement.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  ACHIEVEMENTS_CONFIG,
  AchievementsKey,
} from './config/achievements.config';
import { Observable, Subject } from 'rxjs';
import { NewAchievementDto } from './dto/new-achievement.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class AchievementsService {
  private eventSubject = new Subject<MessageEvent>();

  constructor(
    @InjectModel(Achievement.name)
    private achievementModel: Model<AchievementDocument>,
    private readonly notificationService: NotificationsService,
  ) {}

  emitEvent(data: NewAchievementDto) {
    this.eventSubject.next({ data } as MessageEvent);
  }

  getEventStream(): Observable<MessageEvent> {
    return this.eventSubject.asObservable();
  }

  async findAll(userId: string): Promise<AchievementDocument[]> {
    const achievement: AchievementDocument[] = await this.achievementModel
      .find({
        ownerUserId: new Types.ObjectId(userId),
      })
      .exec();
    if (!achievement) {
      return [];
    }
    return achievement;
  }

  async findLimited(userId: string, limit: number, page: number) {
    const achievements = await this.achievementModel
      .find({ ownerUserId: new Types.ObjectId(userId) })
      .sort({ unlockedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const finalAchievements = Object.values(ACHIEVEMENTS_CONFIG).map(
      (config) => {
        const achievement = achievements.find(
          (value) => value.achievementRef === (config.id as AchievementsKey),
        );
        return {
          ...config,
          unlockedAt: achievement?.unlockedAt,
          unlocked: !!achievement,
        };
      },
    );

    const totalCompleted = finalAchievements.filter(
      (value) => value.unlocked,
    ).length;

    return {
      finalAchievements,
      total: finalAchievements.length,
      totalCompleted,
      totalPages: Math.ceil(finalAchievements.length / limit),
      currentPage: page,
    };
  }

  async create(
    userId: string,
    updateAchievementDto: NewAchievementDto,
  ): Promise<AchievementDocument[]> {
    const newAchievements = updateAchievementDto.achievementRefs.map((ref) => {
      return {
        ownerUserId: new Types.ObjectId(userId),
        achievementRef: ref.id as AchievementsKey,
      } as Achievement;
    });
    const achievements: AchievementDocument[] =
      await this.achievementModel.create(newAchievements);
    this.emitEvent(updateAchievementDto);
    return achievements;
  }

  private async completeAchievement(
    userId: string,
    trigger: string,
    value: number,
  ): Promise<AchievementDocument[]> {
    const achievements = await this.findAll(userId);
    const achievementRefs = achievements.map((value) => value.achievementRef);
    const values = Object.values(ACHIEVEMENTS_CONFIG).filter(
      (config) =>
        config.trigger === trigger &&
        config.threshold <= value &&
        !achievementRefs.includes(config.id as AchievementsKey),
    );
    if (values.length == 0) {
      return [];
    }

    const achievementNames = values
      .map((v) => `${v.icon} ${v.title}`)
      .join(', ');
    this.notificationService
      .sendPushNotification(
        userId,
        {
          body: achievementNames,
          title:
            values.length > 1
              ? 'New Achievements Unlocked!'
              : 'New Achievement Unlocked!',
          sound: 'default',
          data: {
            id: 'notif.achievement.unlocked',
            achievements: values.map((v) => v.id),
          },
        },
        {
          onAchievement: true,
        },
      )
      .catch((err) => console.error(err));

    return this.create(userId, {
      ownerUserId: userId,
      achievementRefs: values.map((value) => ACHIEVEMENTS_CONFIG[value.id]),
    });
  }

  async sessionCompleted(
    userId: string,
    sessions: number,
  ): Promise<AchievementDocument[]> {
    return this.completeAchievement(userId, 'sessionCompleted', sessions);
  }

  async streakUpdated(
    userId: string,
    streak: number,
  ): Promise<AchievementDocument[]> {
    return this.completeAchievement(userId, 'streakUpdated', streak);
  }

  async noteCreated(
    userId: string,
    notes: number,
  ): Promise<AchievementDocument[]> {
    return this.completeAchievement(userId, 'noteCreated', notes);
  }

  async taskCompleted(
    userId: string,
    tasks: number,
  ): Promise<AchievementDocument[]> {
    return this.completeAchievement(userId, 'taskCompleted', tasks);
  }

  async petHatched(
    userId: string,
    pets: number,
  ): Promise<AchievementDocument[]> {
    return this.completeAchievement(userId, 'petHatched', pets);
  }

  async eggObtained(
    userId: string,
    eggs: number,
  ): Promise<AchievementDocument[]> {
    return this.completeAchievement(userId, 'eggObtained', eggs);
  }

  async userLevelUp(
    userId: string,
    level: number,
  ): Promise<AchievementDocument[]> {
    return this.completeAchievement(userId, 'userLevelUp', level);
  }

  async sessionFailedThenCompleted(
    userId: string,
    sessions: number,
  ): Promise<AchievementDocument[]> {
    return this.completeAchievement(
      userId,
      'sessionFailedThenCompleted',
      sessions,
    );
  }
}
