import React, { useEffect } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

export function ProgressBar({
  progress,
  level,
  type = "normal",
  style,
}: {
  progress: number;
  level: number;
  type: "normal" | "thin" | "leveless";
  style?: ViewStyle;
}) {
  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  return (
    <View style={{ ...styles.root, ...style }}>
      {type !== "leveless" && (
        <View style={[styles.box, styles[`${type}Box`]]}>
          <Text style={[styles.levelText, styles[`${type}LevelText`]]}>
            {level}
          </Text>
        </View>
      )}
      <View style={[styles.progressRoot, styles[`${type}ProgressRoot`]]}>
        <Animated.View style={[styles.progressElem, animatedStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 26,
    height: 26,
    borderRadius: 99,
    backgroundColor: "#6AC3CEFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },

  levelessBox: {},

  thinBox: {
    height: 12,
    paddingHorizontal: 3,
    paddingVertical: 0,
  },
  normalBox: {},

  root: {
    flexDirection: "row",
    alignItems: "center",
  },

  levelText: {
    fontSize: 16,
    fontWeight: "regular",
    color: "white",
    lineHeight: 19,
  },
  levelessLevelText: {},

  thinLevelText: {
    fontSize: 10,
    lineHeight: 12,
  },
  normalLevelText: {},

  progressRoot: {
    flexDirection: "row",
    backgroundColor: "#D9D9D9",
    borderTopEndRadius: 10,
    borderBottomEndRadius: 10,
    right: 10,
    flex: 1,
    height: 12,
    overflow: "hidden",
  },

  thinProgressRoot: {
    height: 5,
  },
  normalProgressRoot: {},
  levelessProgressRoot: {
    borderRadius: 10,
    backgroundColor: "#CFF1F7",
    right: 0
  },

  progressElem: {
    backgroundColor: "#6AC3CE",
    borderTopEndRadius: 10,
    borderBottomEndRadius: 10,
  },
});
