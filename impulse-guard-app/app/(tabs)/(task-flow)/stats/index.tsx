import React from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/Colors";
import ChartIcon from "@/assets/icons/chart-no-axes-combined.svg";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { useAchievements, useStats } from "@/hooks/useStats";
import { useAppSelector } from "@/hooks/reduxHooks";
import { LockedIcons, statsMetadata, UnlockedIcons } from "@/constants/Config";
import EmptyStateWrapper from "@/components/ui/EmptyStateWrapper";
import { SessionHeatmap } from "@/components/screens/stats/SessionHeatmap";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  blockContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    color: Colors.light.text,
    textAlign: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "white",
    paddingHorizontal: 21,
    gap: 20,
  },
  icon: {
    height: 40,
    width: 40,
    backgroundSize: "cover",
  },
  statKey: {
    flex: 1,
    fontSize: 20,
    fontWeight: "500",
    color: "#353D46",
  },
  statValue: {
    fontSize: 40,
    fontWeight: "500",
    color: "#353D46",
  },
  groupTitle: {
    fontSize: 20,
    marginBottom: 13,
  },
  grid: {
    gap: 8,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "space-between",
    gap: 8,
  },
});

export default function StatsScreen() {
  const { user } = useAppSelector((state) => state.user);
  const { data: stats, isLoading: isStatsLoading } = useStats(user?._id);
  const { data: achievements, isLoading: isAchievementsLoading } =
    useAchievements(user?._id);

  if (isStatsLoading && isAchievementsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6AC3CE" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <EmptyStateWrapper
        title={"No victories yet"}
        icon={ChartIcon}
        isEmpty={!stats}
        description={"Start your first session today!"}
      >
        <ScrollView>
          <Text style={[styles.groupTitle]}>Stats</Text>
          {stats &&
            Object.entries(stats.stats).filter(([key]) => statsMetadata.has(key)).map(([key, value]) => {
              const { title, icon } = statsMetadata.get(key)!;
              return (
                <View key={key} style={styles.statItem}>
                  <Image
                    source={icon}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                  <Text style={styles.statKey}>{title}</Text>
                  <Text style={styles.statValue}>{value as number}</Text>
                </View>
              );
            })}
          <View>
            <Text style={styles.groupTitle}>Achievements</Text>
            <View
              style={{
                position: "absolute",
                backgroundColor: "white",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 10,
                right: 0,
              }}
            >
              <Text>
                {achievements?.pages[0].totalCompleted} of{" "}
                {achievements?.pages[0].total} unlocked
              </Text>
            </View>
            <FlatList
              data={achievements?.pages.flatMap(
                (page) => page.finalAchievements
              )}
              numColumns={2}
              style={styles.grid}
              renderItem={({ item }) => (
                <AchievementCard
                  title={item.title}
                  description={item.description}
                  image={
                    item.unlocked
                      ? UnlockedIcons.get(item.icon)
                      : LockedIcons.get(item.icon)
                  }
                />
              )}
              columnWrapperStyle={styles.gridContainer}
              scrollEnabled={false}
            />
          </View>
          <Text style={[styles.groupTitle]}>Session Activity</Text>
          <SessionHeatmap impulseDates={stats?.impulseDates} />
        </ScrollView>
      </EmptyStateWrapper>
    </SafeAreaView>
  );
}
