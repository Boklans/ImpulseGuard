export class UpdateStatisticDto {
  ownerUserId: string;
  newSuccessfulSessions?: number;
  newCurrentStreak?: number;
  newEggsHatched?: number;
  newRetriesAfterFail?: number;
  newEggsObtained?: number;
  newCreatedNotes?: number;
  newTasksCompleted?: number;
  newImpulseDates?: Map<string, Date[]>;
  newBossWins?: number;
}
