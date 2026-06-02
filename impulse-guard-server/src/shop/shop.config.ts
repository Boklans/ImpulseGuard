export const EGG_PRICES = {
  common: { buy: 100, sell: 50 },
  rare: { buy: 300, sell: 150 },
  epic: { buy: 800, sell: 400 },
  legendary: { buy: 2000, sell: 1000 },
} as const;

export type EggRarity = keyof typeof EGG_PRICES;
