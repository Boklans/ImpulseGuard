import React from "react";
import { View, ViewStyle } from "react-native";

import CommonSvg from "@/assets/icons/rarity_common.svg";
import RareSvg from "@/assets/icons/rarity_rare.svg";
import EpicSvg from "@/assets/icons/rarity_epic.svg";
import LegendarySvg from "@/assets/icons/rarity_legendary.svg";

export function RarityBadge({
  rarity,
  style,
}: {
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  style?: ViewStyle;
}) {
  return (
    <View
      style={{
        ...style,
        backgroundClip: "white",
        borderRadius: 8,
      }}
    >
      {rarity === "COMMON" && <CommonSvg width={24} height={24} />}
      {rarity === "RARE" && <RareSvg width={24} height={24} />}
      {rarity === "EPIC" && <EpicSvg width={24} height={24} />}
      {rarity === "LEGENDARY" && <LegendarySvg width={24} height={24} />}
    </View>
  );
}
