import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import Glim from "@/assets/icons/glim.svg";
import React from "react";

type AffordButtonProps = {
  buttonText: string;
  action?: () => void;
  style?: ViewStyle;
};

export function AffordButton(props: AffordButtonProps) {
  const { action, buttonText, style } = props;

  return (
    <TouchableOpacity style={[style, styles.button]} onPress={action}>
      <Glim width={32} />
      <Text style={styles.buttonText}>{buttonText}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    flexDirection: "row",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#6AC3CE",
    color: "#fff",
    marginHorizontal: "auto",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
