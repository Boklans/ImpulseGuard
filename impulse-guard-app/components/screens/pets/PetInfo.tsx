import React, { FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
} from "react-native";
import { SvgProps } from "react-native-svg";
import HeartFill from "@/assets/icons/heart.fill.svg";
import Bolt from "@/assets/icons/bolt.svg";

type Pet = {
  health: number;
  energy: number;
  level: number;
  stage: number;
  friendship: number;
};

type Props = { pet: Pet; style?: ViewStyle };

export const PetInfo: React.FC<Props> = ({ pet, style }) => {
  return (
    <Pressable style={[s.card, style]}>
      {/* блок зі статистикою */}
      <View style={s.stats}>
        {/* HP / Energy */}
        <View style={s.hpEnergy}>
          <Row label="Health" icon={HeartFill} value={pet.health} />
          <Row label="Energy" icon={Bolt} value={pet.energy} />
        </View>

        <Divider />

        {/* Level */}
        <View style={s.centered}>
          <View style={s.levelBadge}>
            <Text style={s.levelText}>{pet.level}</Text>
          </View>
          <Text style={s.text}>Level</Text>
        </View>

        <Divider />

        <View style={s.centered}>
          <View style={s.levelBadge}>
            <Text style={s.levelText}>{pet.stage}</Text>
          </View>
          <Text style={s.text}>Stage</Text>
        </View>

        <Divider />

        {/* Friendship */}
        <View style={s.centered}>
          <View style={[s.friendBadge]}>
            <HeartFill
              width={28}
              height={28}
              style={[s.friendBadgeIcon]}
            ></HeartFill>
            <Text style={[s.levelText, s.friendBadgelevelText]}>
              {pet.friendship}
            </Text>
          </View>
          <Text style={s.text}>Friendship</Text>
        </View>
      </View>
    </Pressable>
  );
};

const Row: React.FC<{ icon: FC<SvgProps>; label: string; value: number }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <View style={s.row}>
    <Icon style={s.icon} />
    {/* <Text style={s.icon}>{icon}</Text> */}
    <Text style={s.label}>{label}</Text>
    <Text style={s.value}>{value}</Text>
  </View>
);

const Divider = () => <View style={s.divider} />;

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  petImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },

  /* stats layout */
  stats: {
    flex: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "space-between",
  },
  hpEnergy: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  icon: { width: 18, height: 18, marginRight: 4 },
  label: { fontSize: 15 },
  value: { fontWeight: "600", fontSize: 17, marginLeft: 8 },

  divider: {
    width: 1,
    height: "80%",
    backgroundColor: "#E5E5E5",
  },

  centered: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "column",
    alignSelf: "stretch",
  },

  /* level / friendship badges */
  levelBadge: {
    width: 28,
    height: 28,
    borderRadius: 22,
    backgroundColor: "#6AC3CE",
    alignItems: "center",
    justifyContent: "center",
  },
  friendBadge: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  friendBadgeIcon: {
    position: "absolute",
    top: 0,
  },
  friendBadgelevelText: {
    position: "absolute",
    fontSize: 14,
    top: 5,
  },
  levelText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
    textAlign: "center",
  },
  muted: {
    color: "#6C6C6C",
    fontSize: 13,
  },
  text: {
    fontSize: 14,
    color: "#000000",
  },
});
