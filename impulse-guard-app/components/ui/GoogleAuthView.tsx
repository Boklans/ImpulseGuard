import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";
import GoogleIcon from "@/assets/icons/google.svg";

type Props = {
  style?: ViewStyle;
  onPress?: () => void;
};

export function GoogleAuthView({ style, onPress }: Props) {
  return (
    <View style={[style, styles.root]}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 7,
          alignItems: "center",
        }}
      >
        <View style={styles.divider} />
        <Text>OR</Text>
        <View style={styles.divider} />
      </View>
      <TouchableOpacity onPress={onPress} style={styles.button}>
        <View style={styles.icon}>
          <GoogleIcon />
        </View>
        <Text style={styles.title}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 27,
  },
  title: {
    fontSize: 16,
    fontWeight: "regular",
  },
  divider: {
    backgroundColor: "white",
    height: 2,
    flex: 1,
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
