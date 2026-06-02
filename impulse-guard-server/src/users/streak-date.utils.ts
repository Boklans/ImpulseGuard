const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startOfUtcDay(date: Date): Date {
  const day = new Date(date);
  day.setUTCHours(0, 0, 0, 0);
  return day;
}

export function utcDayDiff(from: Date, to: Date): number {
  return Math.floor(
    (startOfUtcDay(to).getTime() - startOfUtcDay(from).getTime()) /
      MS_PER_DAY,
  );
}

