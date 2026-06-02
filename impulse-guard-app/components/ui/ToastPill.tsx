import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  Animated,
} from "react-native";

type ToastPillProps = {
  visible: boolean;
  onHide?: () => void;
  durationMs?: number;
  icon: ImageSourcePropType;
  title: string;
  hp?: number;
  energy?: number;
  friendship?: number;
};

export const ToastPill: React.FC<ToastPillProps> = ({
  visible,
  onHide,
  durationMs = 1600,
  icon,
  title,
  hp,
  energy,
  friendship,
}) => {
  const translateY = useRef(new Animated.Value(-40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      const t = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -40,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => finished && onHide?.());
      }, durationMs);

      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible) return null;

  function prettifyTitle(title: string): string {
    return title
      .split("_")
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { transform: [{ translateY }], opacity }]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image source={icon} style={styles.icon} />
        <Text style={styles.title} numberOfLines={1}>
          <Text>{prettifyTitle(title)}</Text>
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={styles.row}>
          {typeof hp === "number" && (
            <View style={styles.stat}>
              <Image
                source={require("@/assets/icons/hp.png")}
                style={styles.statIcon}
              />
              <Text style={styles.statText}>{hp}</Text>
            </View>
          )}
          {typeof energy === "number" && (
            <View style={styles.stat}>
              <Image
                source={require("@/assets/icons/en.png")}
                style={styles.statIcon}
              />
              <Text style={styles.statText}>{energy}</Text>
            </View>
          )}
          {typeof friendship === "number" && (
            <View style={styles.stat}>
              <Image
                source={require("@/assets/icons/friendship.png")}
                style={styles.statIcon}
              />
              <Text style={styles.statText}>{friendship}</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    maxWidth: "90%",
  },
  icon: { width: 64, height: 64, resizeMode: "contain" },
  title: { fontSize: 16, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  stat: { flexDirection: "row", alignItems: "center", gap: 6 },
  statIcon: { width: 32, height: 32, resizeMode: "contain" },
  statText: { fontSize: 20, fontWeight: "500" },
});
