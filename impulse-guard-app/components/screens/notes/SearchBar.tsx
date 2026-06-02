import {StyleSheet, TextInput, TextStyle, View} from "react-native";
import SearchIcon from "@/assets/icons/search.svg"
import {Colors} from "@/constants/Colors";

export type SearchBarProps = {
  onChange: (value: string) => void;
};

export type StyleProps = {
  style?: TextStyle;
};

export function SearchBar(props: SearchBarProps & StyleProps) {
  return (
      <View style={styles.root}>
        <SearchIcon width={20} height={20} color={Colors.light.pale} />
        <TextInput
            style={[props.style, styles.input]}
            onChangeText={props.onChange}
            placeholderTextColor={Colors.light.pale}
            placeholder={"Search"}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 14,
    width: "100%",
  },
  root: {
    gap: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
  }
});
