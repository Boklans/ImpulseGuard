import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  ImageSourcePropType,
  Pressable,
} from "react-native";
import { RarityBadge } from "../pets/RarityBadge";

export interface ItemCardProps {
  count: number;
  rarity?: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  image: ImageSourcePropType;
  onPress?: () => void;
  recoverEnergy?: number;
  recoverHealth?: number;
  addFriendship?: number;
}

export function ItemCard(props: ItemCardProps) {
  const {
    count,
    image,
    rarity,
    recoverEnergy,
    recoverHealth,
    addFriendship,
    onPress,
  } = props;
  return (
    <Pressable style={styles.root} onPress={onPress}>
      <Image source={image} style={styles.image} />
      <View
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          paddingVertical: 2,
          paddingHorizontal: 4,
          borderRadius: 8,
        }}
      >
        {rarity && <RarityBadge rarity={rarity} />}
      </View>
      <View
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          paddingVertical: 2,
          paddingHorizontal: 4,
          borderRadius: 8,
          backgroundColor: "#F5F5F7",
        }}
      >
        <Text style={styles.countLabel}>{`x${count}`}</Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          position: "absolute",
          bottom: 8,
        }}
      >
        {recoverHealth && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Image
              source={require("@/assets/icons/hp.png")}
              style={styles.icon}
            />
            <Text style={{ fontSize: 18 }}>{recoverHealth}</Text>
          </View>
        )}
        {recoverEnergy && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Image
              source={require("@/assets/icons/en.png")}
              style={styles.icon}
            />
            <Text style={{ fontSize: 18 }}>{recoverEnergy}</Text>
          </View>
        )}
        {addFriendship && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Image
              source={require("@/assets/icons/friendship.png")}
              style={styles.icon}
            />
            <Text style={{ fontSize: 18 }}>{addFriendship}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "48%",
    height: "48%",
    backgroundColor: "white",
    aspectRatio: 1,
    marginBottom: 16,
  },
  countLabel: {
    fontSize: 16,
    fontWeight: "medium",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarsContainer: {
    flexDirection: "row",
    position: "absolute",
    right: 4,
    bottom: 7,
  },
  progressBar: {
    width: 7,
    height: 25,
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    width: "100%",
    borderRadius: 8,
    position: "absolute",
    bottom: 0,
  },
  icon: {
    width: 24,
    height: 24,
  },
  image: {
    aspectRatio: 1,
    objectFit: "contain",
    height: "70%",
  },
  progressBarWrapper: {
    flexDirection: "column",
    alignItems: "center",
  },
});
