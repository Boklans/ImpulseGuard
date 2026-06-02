import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Statistic, StatisticDocument } from './schema/statistic.schema';
import { Model, Types } from 'mongoose';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { AchievementsService } from 'src/achievements/achievements.service';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Statistic.name)
    private statisticModel: Model<StatisticDocument>,
    private readonly achievementsService: AchievementsService,
  ) {}

  async createNotes(userId: string, notes: number) {
    const userStats = await this.getOrCreateByUser(userId);
    userStats.createdNotes += notes;
    this.achievementsService.noteCreated(userId, userStats.createdNotes);
    await userStats.save();
  }

  async completeTasks(userId: string, tasks: number) {
    const userStats = await this.getOrCreateByUser(userId);
    userStats.tasksCompleted += tasks;
    this.achievementsService.taskCompleted(userId, userStats.tasksCompleted);
    await userStats.save();
  }

  async getOrCreateByUser(userId: string): Promise<StatisticDocument> {
    let userStats = await this.statisticModel
      .findOne({ ownerUserId: new Types.ObjectId(userId) })
      .exec();
    if (!userStats) {
      userStats = await this.statisticModel.create({
        ownerUserId: new Types.ObjectId(userId),
      });
    }
    return userStats;
  }

  async update(updateDto: UpdateStatisticDto): Promise<StatisticDocument> {
    const userStats = await this.getOrCreateByUser(updateDto.ownerUserId);
    if (updateDto.newBossWins !== undefined) {
      userStats.stats.bossWins += updateDto.newBossWins;
    }
    if (updateDto.newCurrentStreak !== undefined) {
      userStats.stats.currentStreak = updateDto.newCurrentStreak;
      if (userStats.stats.longestStreak < updateDto.newCurrentStreak) {
        userStats.stats.longestStreak = updateDto.newCurrentStreak;
      }
      this.achievementsService
        .streakUpdated(updateDto.ownerUserId, updateDto.newCurrentStreak)
        .catch((error) => console.error(error));
    }
    if (updateDto.newCreatedNotes) {
      userStats.createdNotes += updateDto.newCreatedNotes;
      this.achievementsService
        .noteCreated(updateDto.ownerUserId, userStats.createdNotes)
        .catch((error) => console.error(error));
    }
    if (updateDto.newTasksCompleted) {
      userStats.tasksCompleted += updateDto.newTasksCompleted;
      this.achievementsService
        .taskCompleted(updateDto.ownerUserId, userStats.tasksCompleted)
        .catch((error) => console.error(error));
    }
    if (updateDto.newEggsObtained) {
      userStats.eggsObtained += updateDto.newEggsObtained;
      this.achievementsService
        .eggObtained(updateDto.ownerUserId, userStats.eggsObtained)
        .catch((error) => console.error(error));
    }
    if (updateDto.newRetriesAfterFail) {
      userStats.retriesAfterFail += updateDto.newRetriesAfterFail;
      this.achievementsService
        .sessionFailedThenCompleted(
          updateDto.ownerUserId,
          userStats.retriesAfterFail,
        )
        .catch((error) => console.error(error));
    }
    if (updateDto.newEggsHatched) {
      userStats.stats.eggsHatched += updateDto.newEggsHatched;
      this.achievementsService
        .petHatched(updateDto.ownerUserId, userStats.stats.eggsHatched)
        .catch((error) => console.error(error));
    }
    if (updateDto.newSuccessfulSessions) {
      userStats.stats.successfulSessions += updateDto.newSuccessfulSessions;
      this.achievementsService
        .sessionCompleted(
          updateDto.ownerUserId,
          userStats.stats.successfulSessions,
        )
        .catch((error) => console.error(error));
    }
    if (updateDto.newImpulseDates) {
      updateDto.newImpulseDates.forEach((newValues, key) => {
        const existingDates = userStats.impulseDates.get(key) || [];
        existingDates.push(...newValues);
        userStats.impulseDates.set(key, existingDates);
      });
    }
    userStats.markModified('impulseDates');
    return await userStats.save();
  }
}
