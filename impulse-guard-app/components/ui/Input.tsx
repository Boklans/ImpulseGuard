import React from "react";
import {
  TextInput,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from "react-native";
import {Colors} from "@/constants/Colors";

type InputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  variant?: "default" | "outline" | "underline";
  keyboardType?: TextInputProps["keyboardType"];
};

const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  style,
  inputStyle,
  variant = "default",
  keyboardType = "default",
}) => {
  return (
    <View style={[styles.wrapper, styles[variant], style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        style={[styles.input, inputStyle]}
        keyboardType={keyboardType}
        placeholderTextColor="#A1A1A1"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  input: {
    fontSize: 18,
    color: "#333",
  },
  default: {
    backgroundColor: "#fff",
    minHeight: 48,
  },
  outline: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  underline: {
    borderBottomWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 0,
  },
});

export default Input;
