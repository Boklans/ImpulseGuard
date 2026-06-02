export function xpTotalToReachLevel(L: number): number {
  const n = Math.max(0, L - 1);
  const sumSquares = (n * (n + 1) * (2 * n + 1)) / 6;
  const sumLinear = (n * (n + 1)) / 2;
  return 50 * (sumSquares + sumLinear);
}

export function xpRequiredForLevel(L: number): number {
  return 50 * (L * L + L);
}

export function computeXpProgress(level: number, totalXp: number) {
  const prevTotal = xpTotalToReachLevel(level);
  const nextTotal = xpTotalToReachLevel(level + 1);

  const gainedWithinLevel = Math.max(0, totalXp - prevTotal);
  const requiredForNext = Math.max(1, nextTotal - prevTotal);
  const pct = Math.min(
    100,
    Math.max(0, (gainedWithinLevel / requiredForNext) * 100)
  );

  return {
    current: gainedWithinLevel,
    required: requiredForNext,
    percent: pct,
    prevTotal,
    nextTotal,
  };
}
