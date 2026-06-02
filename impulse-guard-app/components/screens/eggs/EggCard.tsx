import { eggsList } from "@/constants/Config";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { StyleSheet, View, Text, Animated, Easing } from "react-native";
import ReAnimated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import HourglassIcon from "@/assets/icons/hourglass.svg";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";

function EggCard({ egg, handlePress }: any) {
  const item = eggsList.find((i) => i.id === Number(egg.imageUrl));
  const getRemainingTime = useCallback(() => {
    if (!egg.hatchEndTime) return null;
    const remainingMs =
      new Date(egg.hatchEndTime).getTime() - new Date().getTime();
    if (remainingMs <= 0) return null;
    const totalMinutes = Math.floor(remainingMs / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  }, [egg.hatchEndTime]);
  const [remainingTime, setRemainingTime] = useState(getRemainingTime());

  const shakeAnimation = React.useRef(new Animated.Value(0)).current;
  const glowOpacity = useSharedValue(0);

  const isHatching = useMemo<boolean>(
    () => egg.hatchStartTime != null && egg.hatchEndTime != null,
    [egg]
  );

  const isReady =
    !!egg.hatchEndTime &&
    remainingTime === null &&
    new Date() >= new Date(egg.hatchEndTime);

  useEffect(() => {
    if (isHatching) {
      setRemainingTime(getRemainingTime());
      const interval = setInterval(() => {
        setRemainingTime(getRemainingTime());
      }, 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [egg, getRemainingTime, isHatching]);

  useEffect(() => {
    if (isReady) {
      // Shake animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnimation, {
            toValue: 1,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: -1,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: 0,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow pulse animation
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800 }),
          withTiming(0, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      glowOpacity.value = 0;
    }
  }, [glowOpacity, isReady, shakeAnimation]);

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!item) return null;

  return (
    <AnimatedPressable onPress={() => handlePress(egg)} style={styles.wrapper}>
      <LinearGradient
        colors={item.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.card}
      >
        {isReady && (
          <ReAnimated.View style={[styles.glowOverlay, glowAnimatedStyle]} />
        )}
        {isHatching && !isReady && remainingTime && (
          <View style={styles.durationTag}>
            <HourglassIcon width={14} height={14} color={"#6AC3CE"} />
            <Text style={styles.durationText}>{remainingTime}</Text>
          </View>
        )}
        {!isHatching && !isReady && (
          <View style={styles.durationTag}>
            <Text style={styles.durationText}>
              {Number(egg.hatchDurationMs) / 1000 / 3600}h
            </Text>
          </View>
        )}

        <Animated.Image
          source={item.image}
          style={[
            styles.cardImage,
            isReady && {
              transform: [
                {
                  rotate: shakeAnimation.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: ["-3deg", "0deg", "3deg"],
                  }),
                },
              ],
            },
          ]}
        />
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    aspectRatio: 1,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderRadius: 10,
    padding: 24,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFD700",
    borderRadius: 10,
  },
  cardImage: {
    flex: 1,
    width: "100%",
    resizeMode: "contain",
  },
  durationTag: {
    backgroundColor: "white",
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 8,
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});

export default EggCard;
