import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import { Colors } from "@/constants/Colors";
import ModalWithBlur from "@/components/ui/BluredModal";
import React, { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import { RootState } from "@/redux/store";
import { useLevels } from "@/hooks/useLevels";
import { confirmLevelReward } from "@/api/levelsApi";
import { LvlRewardIcons } from "@/constants/Config";
import { useAnalytics, AnalyticsEvents } from "@/hooks/useAnalytics";
import ConfettiCannon from "react-native-confetti-cannon";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
} from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("window");

export function LevelUpModal() {
  const [isOpened, setIsOpened] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const userState = useSelector((state: RootState) => state.user).user;
  const { data, isLoading } = useLevels(userState?._id);
  const { track } = useAnalytics();
  const confettiRef = useRef<any>(null);

  // Animation values
  const titleScale = useSharedValue(0);
  const imageScale = useSharedValue(0);
  const rewardOpacity = useSharedValue(0);

  const [rewardData, setRewardData] = React.useState(new Map());
  const addItem = (key: string, value: number) => {
    const newMap = new Map(rewardData);
    newMap.set(key, value);
    setRewardData(newMap);
  };

  // Start animations when modal opens
  useEffect(() => {
    if (isOpened) {
      setShowConfetti(true);
      titleScale.value = withSpring(1, { damping: 8, stiffness: 100 });
      imageScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 100 }));
      rewardOpacity.value = withDelay(400, withSpring(1));
    } else {
      titleScale.value = 0;
      imageScale.value = 0;
      rewardOpacity.value = 0;
      setShowConfetti(false);
    }
  }, [isOpened]);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const rewardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: rewardOpacity.value,
    transform: [{ translateY: (1 - rewardOpacity.value) * 20 }],
  }));

  const readRewardData = (
    rewards: Array<{ type: string; amount: number }> | null | undefined
  ) => {
    if (!rewards) {
      return;
    }
    rewards.forEach((reward) => {
      addItem(reward.type, reward.amount);
    });
  };

  const userLevel = useMemo(() => userState?.level, [userState]);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const currentLevel = data?.find((level: any) => level.level === userLevel);
    if (currentLevel?.claimed === false && currentLevel?.rewards?.length) {
      readRewardData(currentLevel.rewards);
      track(AnalyticsEvents.LEVEL_UP, { new_level: userLevel });
      setIsOpened(true);
    }
  }, [data, userLevel, track]);

  useEffect(() => {
    const currentLevel = data?.find(
      (level: any) => level.level === userState?.level
    );

    if (currentLevel?.claimed === false && currentLevel?.rewards?.length) {
      readRewardData(currentLevel?.rewards);
      setIsOpened(true);
    }
  }, []);

  const handleConfirm = () => {
    setIsOpened(false);
    confirmLevelReward(userState?._id, userState?.level);
  };

  if (!userState || isLoading) {
    return null;
  }

  return (
    <>
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={80}
          origin={{ x: screenWidth / 2, y: -10 }}
          autoStart={true}
          fadeOut={true}
          fallSpeed={3000}
          explosionSpeed={350}
          colors={["#6AC3CE", "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"]}
        />
      )}
      <ModalWithBlur opened={isOpened} close={handleConfirm} style={styles.root}>
        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          Level Up!
        </Animated.Text>
        <Text style={styles.description}>
          You reached level {userState?.level}
        </Text>
        <Animated.Image
          style={[styles.rewardImage, imageAnimatedStyle]}
          source={require("@/assets/images/reward.png")}
        />
        <Animated.View style={rewardAnimatedStyle}>
          <Text style={styles.title}>Reward</Text>
          <View style={styles.rewardBox}>
            {Array.from(rewardData.entries()).map(
              ([key, value]: [string, number]) => (
                <View style={styles.reward} key={key}>
                  <Text style={styles.rewardDescription}>{value}</Text>
                  <Image style={styles.icons} source={LvlRewardIcons.get(key)} />
                </View>
              )
            )}
          </View>
        </Animated.View>
        <Button title={"Confirm"} onPress={() => handleConfirm()} />
      </ModalWithBlur>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    minWidth: 350,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginVertical: "auto",
    marginHorizontal: "auto",
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  title: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "medium",
  },
  description: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "light",
    color: Colors.light.neutralText,
  },
  rewardBox: {
    display: "flex",
    flexDirection: "row",
    gap: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  reward: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardImage: {
    objectFit: "contain",
    marginHorizontal: "auto",
    width: 190,
    height: 190,
  },
  icons: {
    objectFit: "contain",
    height: 29,
    width: 29,
    aspectRatio: 1,
  },
  rewardDescription: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "light",
  },
});
