import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKS_TO_SHOW = 8;
const CELL_GAP = 6;
const DAY_LABEL_WIDTH = 36;

const COLORS = {
  empty: "#E8E8E8",
  low: "#B8E4E8",
  medium: "#7DCFD6",
  high: "#4DBAC4",
  max: "#2BA3AE",
};

interface SessionHeatmapProps {
  impulseDates?: Record<string, string[]>;
}

function getColorForCount(count: number): string {
  if (count === 0) return COLORS.empty;
  if (count === 1) return COLORS.low;
  if (count === 2) return COLORS.medium;
  if (count <= 4) return COLORS.high;
  return COLORS.max;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function transformToHeatmapData(
  impulseDates?: Record<string, string[]>
): number[][] {
  const grid: number[][] = Array.from({ length: 7 }, () =>
    Array(WEEKS_TO_SHOW).fill(0)
  );

  if (!impulseDates) return grid;

  const now = new Date();
  const currentWeekStart = getStartOfWeek(now);
  const startDate = new Date(currentWeekStart);
  startDate.setDate(startDate.getDate() - (WEEKS_TO_SHOW - 1) * 7);

  const allDates: Date[] = [];
  Object.values(impulseDates).forEach((dates) => {
    dates.forEach((dateStr) => {
      allDates.push(new Date(dateStr));
    });
  });

  allDates.forEach((date) => {
    if (date < startDate || date > now) return;

    const dayOfWeek = date.getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(diffDays / 7);

    if (weekIndex >= 0 && weekIndex < WEEKS_TO_SHOW) {
      grid[adjustedDay][weekIndex]++;
    }
  });

  return grid;
}

export function SessionHeatmap({ impulseDates }: SessionHeatmapProps) {
  const heatmapData = useMemo(
    () => transformToHeatmapData(impulseDates),
    [impulseDates]
  );

  return (
    <View style={styles.container}>
      {heatmapData.map((row, dayIndex) => (
        <View key={dayIndex} style={styles.row}>
          <Text style={styles.dayLabel}>{DAYS[dayIndex]}</Text>
          {row.map((count, weekIndex) => (
            <View
              key={`${dayIndex}-${weekIndex}`}
              style={[
                styles.cell,
                { backgroundColor: getColorForCount(count) },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: CELL_GAP,
    marginBottom: CELL_GAP,
  },
  dayLabel: {
    width: DAY_LABEL_WIDTH,
    fontSize: 14,
    color: "#6C6C6C",
    fontWeight: "500",
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 6,
  },
});
