export interface User {
  _id: string;
  email: string;
  username: string;
  avatar?: string;
  level: number;
  experience: number;
  glims: number;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  isOnboardingCompleted: boolean;
  streakInfo: {
    goal: number;
    daysInRow: number;
    declined: boolean;
    nextPromptDate?: Date;
  };
}
