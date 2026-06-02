import React from "react";
import { Image, StyleSheet, View, ImageSourcePropType } from "react-native";
import { AffordButton } from "@/components/ui/AffordButton";

export interface AffordableItemCardProps {
  text: string;
  image: ImageSourcePropType;
  afford?: () => void;
}

function AffordableItemCard(props: AffordableItemCardProps) {
  const { text, image, afford } = props;
  return (
    <View style={styles.root}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} />
      </View>
      <AffordButton buttonText={text} action={afford} style={{ bottom: 0 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "48%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 23,
    paddingTop: 25,
    paddingBottom: 16,
    paddingHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 8,
  },
  imageContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});

export default AffordableItemCard;
