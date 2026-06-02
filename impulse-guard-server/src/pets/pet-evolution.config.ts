export type PetEvolutionStage = 1 | 2 | 3 | 4;

export const PET_EVOLUTION_LINES = 10;
export const PET_EVOLUTION_STAGES = 4;

export const PET_EVOLUTION_STAGE_THRESHOLDS: Record<PetEvolutionStage, number> =
  {
    1: 1,
    2: 5,
    3: 10,
    4: 20,
  };

export function getStageForLevel(level: number): PetEvolutionStage {
  if (level >= PET_EVOLUTION_STAGE_THRESHOLDS[4]) return 4;
  if (level >= PET_EVOLUTION_STAGE_THRESHOLDS[3]) return 3;
  if (level >= PET_EVOLUTION_STAGE_THRESHOLDS[2]) return 2;
  return 1;
}

export function getImageIdForEvolution(
  evolutionLine: number,
  stage: PetEvolutionStage,
): string {
  const safeLine =
    Number.isInteger(evolutionLine) &&
    evolutionLine >= 1 &&
    evolutionLine <= PET_EVOLUTION_LINES
      ? evolutionLine
      : 1;

  return String((safeLine - 1) * PET_EVOLUTION_STAGES + stage);
}

export function inferEvolutionFromImage(imageUrl?: string | null): {
  evolutionLine: number;
  stage: PetEvolutionStage;
} {
  const imageId = Number(imageUrl);
  const safeImageId =
    Number.isInteger(imageId) &&
    imageId >= 1 &&
    imageId <= PET_EVOLUTION_LINES * PET_EVOLUTION_STAGES
      ? imageId
      : 1;

  return {
    evolutionLine: Math.ceil(safeImageId / PET_EVOLUTION_STAGES),
    stage: (((safeImageId - 1) % PET_EVOLUTION_STAGES) +
      1) as PetEvolutionStage,
  };
}

export function getRandomEvolutionLine(): number {
  return Math.floor(Math.random() * PET_EVOLUTION_LINES) + 1;
}
