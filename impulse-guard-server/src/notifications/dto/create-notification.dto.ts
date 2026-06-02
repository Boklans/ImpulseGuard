export class CreateNotificationSettingsDto {
  userId: string;
  pushToken?: string;

  onLevelUp?: boolean;

  onAchievement?: boolean;

  onStreakWarning?: boolean;

  onWeeklySummary?: boolean;

  onEngagementPushes?: boolean;

  onEggReady?: boolean;

  onPetHatched?: boolean;

  onPetNeeds?: boolean;

  onMissedFirstSession?: boolean;
}
