import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors } from "@/constants/Colors";
import React, { FC } from "react";
import { SvgProps } from "react-native-svg";

type InputProps = {
  title: string;
  description: string;
  icon: FC<SvgProps>;
  style?: ViewStyle;
};

export function EmptyView({
  title,
  description,
  icon: Icon,
  style,
}: InputProps) {
  return (
    <View style={[styles.contentWrapper, style]}>
      <Icon width={64} height={64} color={Colors.light.primary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    margin: "auto",
    marginTop: "25%",
    width: 350,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 32,
    marginBottom: 7,
  },
  description: {
    color: "#6C6C6C",
    textAlign: "center",
    fontSize: 16,
    width: 250,
  },
});
