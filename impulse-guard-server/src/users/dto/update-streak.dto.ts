export class UpdateStreakDto {
  userId: string;
  goal?: number;
  daysInRow?: number;
  totalDaysInRow?: number;
  declined?: boolean;
  nextPromptData?: Date;
  startDate?: Date;
  endDate?: Date;
}
