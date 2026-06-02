import React from "react";
import {
  Text,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from "react-native";
import { AnimatedPressable } from "./AnimatedPressable";

type ButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: "primary" | "ghost" | "secondary" | "outline" | "danger";
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  variant = "primary",
}) => {
  return (
    <AnimatedPressable
      style={[
        styles.button,
        styles[variant],
        style,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
        {title}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  text: {
    fontSize: 20,
    fontWeight: "500",
  },
  primary: {
    backgroundColor: "#6AC3CE",
  },
  outline: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#6AC3CE",
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  secondary: {
    backgroundColor: "#fff",
  },
  danger: {
    backgroundColor: "#fff",
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: "#6AC3CE",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  ghostText: {
    color: "#E1E3E4",
  },
  outlineText: {
    color: "#6AC3CE",
  },
  dangerText: {
    color: "#E73700",
    fontSize: 16,
    fontWeight: "700",
  },
  disabled: {
    backgroundColor: "#A8D5DB",
  },
});

export default Button;
