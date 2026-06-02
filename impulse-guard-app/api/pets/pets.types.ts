export interface UpdatePetDto {
  isFavorite?: boolean;
  name?: string;
}

export interface Pet {
  _id: string;
  name: string;
  imageUrl: string;
  evolutionLine?: number;
  stage?: 1 | 2 | 3 | 4;
  evolvedAt?: string;
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  maxHealth: number;
  currentHealth: number;
  maxEnergy: number;
  currentEnergy: number;
  isActive: boolean;
  friendship: number;
  currentFriendshipXp: number;
  isFavorite: boolean;
}
