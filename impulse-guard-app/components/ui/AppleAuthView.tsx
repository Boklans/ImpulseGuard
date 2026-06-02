import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";
import AppleIcon from "@/assets/icons/apple.svg";

type Props = {
  style?: ViewStyle;
  onPress?: () => void;
};

export function AppleAuthView({ style, onPress }: Props) {
  return (
    <View style={[style, styles.root]}>
      <TouchableOpacity onPress={onPress} style={styles.button}>
        <View style={styles.icon}>
          <AppleIcon width={25} height={24} fill="#000000" />
        </View>
        <Text style={styles.title}>Continue with Apple</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: 16,
    fontWeight: "regular",
  },
  icon: {
    flexShrink: 0,
    left: 46,
    position: "absolute",
  },
  button: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
