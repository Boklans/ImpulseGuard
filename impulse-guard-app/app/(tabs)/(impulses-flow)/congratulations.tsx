import { Colors } from "@/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  FoodImages,
  PotionsImages,
  RewardIcons,
  ToysImages,
} from "@/constants/Config";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { computeXpProgress } from "@/utils/xp";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { AnalyticsEvents, useAnalytics } from "@/hooks/useAnalytics";

type RewardIconProps = {
  type: string;
  imageId: string;
};

function GetRewardIcon({ type, imageId }: RewardIconProps) {
  let image = null;
  if (type === "glims" || type === "egg") {
    const icon = RewardIcons.get(type);
    return <Image source={icon} style={styles.rewardImage} />;
  } else if (type === "food") {
    image = FoodImages.get(imageId);
  } else if (type === "toy") {
    image = ToysImages.get(imageId);
  } else if (type === "potion") {
    image = PotionsImages.get(imageId);
  } else if (type === "special") {
    image = require("@/assets/images/rewardIcons/special.png");
  }

  return <Image source={image} style={styles.rewardImage} />;
}

type RewardCardProps = {
  type: string;
  amount: number;
  imageId: number;
};

const RewardCard = ({ type, amount, imageId }: RewardCardProps) => {
  const imageIdString = imageId ? imageId.toString() : "default";

  return (
    <View style={styles.rewardCard}>
      <GetRewardIcon type={type} imageId={imageIdString} />
      <Text style={styles.amountText} numberOfLines={1} ellipsizeMode="clip">
        +{amount} {type}
      </Text>
    </View>
  );
};

export default function CongratulationsPage() {
  const { status } = useLocalSearchParams();
  const { track } = useAnalytics();
  const { user, lastSessionRewards } = useSelector(
    (state: RootState) => state.user
  );

  const xp = React.useMemo(() => {
    if (!user) return { current: 0, required: 1, percent: 0 };
    return computeXpProgress(user.level, user.experience);
  }, [user]);

  const rewardEntries = React.useMemo(
    () => Object.entries(lastSessionRewards),
    [lastSessionRewards]
  );

  useEffect(() => {
    track(AnalyticsEvents.PET_REWARD_VIEWED, {
      status,
      reward_count: rewardEntries.length,
      reward_types: rewardEntries.map(([type]) => type),
    });
  }, [rewardEntries, status, track]);

  return (
    <View style={styles.container}>
      <View style={{ width: "100%", marginTop: "auto" }}>
        <Animated.Text
          entering={FadeInUp.duration(400).springify()}
          style={styles.header}
        >
          {status === "success"
            ? "Congratulations!"
            : "It is ok, I believe in your next try!"}
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(100).duration(400).springify()}
          style={{ fontSize: 24, fontWeight: 500, textAlign: "center" }}
        >
          You are getting stronger every time.
        </Animated.Text>
        <Animated.View
          entering={FadeInUp.delay(200).duration(400).springify()}
          style={{
            backgroundColor: "white",
            width: "100%",
            padding: 12,
            borderRadius: 10,
            gap: 12,
            marginTop: 48,
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ fontSize: 16, fontWeight: 400 }}>
              EXP to next lvl
            </Text>
            <Text style={{ fontSize: 16, fontWeight: 400 }}>
              {xp.current}/{xp.required}
            </Text>
          </View>
          <ProgressBar
            progress={xp.percent}
            type={"leveless"}
            level={user?.level ?? 1}
          />
        </Animated.View>

        <View
          style={{
            gap: 8,
            width: "100%",
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "center",
            marginTop: 12,
          }}
        >
          {rewardEntries.map(([type, data], index) => (
            <Animated.View
              key={type}
              entering={FadeInUp.delay(300 + index * 100).duration(400).springify()}
              style={{ flex: 1 }}
            >
              <RewardCard
                type={type}
                amount={data.amount}
                imageId={data.id}
              />
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(500).duration(400).springify()}
        style={{ width: "100%", marginTop: "auto" }}
      >
        <Pressable
          onPress={() => {
            track(AnalyticsEvents.SESSION_NOTE_PROMPT_CLICKED, {
              status,
              reward_count: rewardEntries.length,
            });

            router.replace({
              pathname: "/(tabs)/(impulses-flow)/impulses",
              params: {
                openModal: 1,
              },
            });

            setTimeout(
              () =>
                router.push({
                  pathname: "/(tabs)/(task-flow)/notes",
                  params: {
                    openModal: 1,
                  },
                }),
              50
            );
          }}
          style={{
            backgroundColor: Colors.light.tabIconSelected,
            width: "100%",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Take a note
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            track(AnalyticsEvents.SESSION_NOTE_PROMPT_SKIPPED, {
              status,
              reward_count: rewardEntries.length,
            });

            router.push({
              pathname: "/(tabs)/(impulses-flow)/impulses",
            });
          }}
          style={{
            backgroundColor: "transparent",
            width: "100%",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <Text
            style={{
              color: "#E1E3E4",
              fontSize: 20,
              textAlign: "center",
            }}
          >
            Skip
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 32,
    justifyContent: "center",
    backgroundColor: "#F2F2F7",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  rewardCard: {
    backgroundColor: "#fff",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 16,
    aspectRatio: 1,
    borderRadius: 10,
  },
  rewardImage: {
    objectFit: "contain",
    aspectRatio: 1,
    height: 72,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 500,
  },
});
