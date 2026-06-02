export const PET_EVOLUTION_STAGE_THRESHOLDS: Record<number, number> = {
  1: 1,
  2: 5,
  3: 10,
  4: 20,
};

export function getNextEvolutionLevel(stage?: number): number | null {
  if (!stage || stage >= 4) return null;
  return PET_EVOLUTION_STAGE_THRESHOLDS[stage + 1] ?? null;
}
