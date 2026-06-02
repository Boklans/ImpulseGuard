export interface Impulses {
  impulses: Impulse[];
  loading: boolean;
  error: string;
}

export interface Impulse {
  _id: string;
  name: string;
  description: string;
  avatarUrl: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  successCount: number;
  sessionsCount: number;
}
