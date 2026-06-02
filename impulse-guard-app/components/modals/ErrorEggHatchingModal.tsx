import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Button from "../ui/Button";
import Glim from "@/assets/icons/glim.svg";

import ModalWithBlur from "@/components/ui/BluredModal";
import { AffordButton } from "@/components/ui/AffordButton";

type ErrorEggHatchingModalProps = {
  opened: boolean;
  costToHatch: number;
  close: () => void;
  action: () => void;
};

export function ErrorEggHatchingModal(props: ErrorEggHatchingModalProps) {
  const { opened, costToHatch, close, action } = props;

  return (
    <ModalWithBlur opened={opened} close={close} style={styles.root}>
      <Image
        source={require("@/assets/images/eggs/warningEgg.png")}
        style={{ alignSelf: "center" }}
      />
      <View style={{ alignItems: "center", gap: 8 }}>
        <Text style={styles.title}>Warning</Text>
        <Text style={styles.description}>
          You can only one egg hatching at a time
        </Text>
      </View>
      <View
        style={{
          flexDirection: "column",
          gap: 8,
          marginTop: 16,
          alignItems: "center",
        }}
      >
        <AffordButton
          buttonText={`Hatch for ${costToHatch} glims`}
          action={action}
        />
        <Button onPress={close} variant="ghost" title={"Cancel"} />
      </View>
    </ModalWithBlur>
  );
}

const styles = StyleSheet.create({
  root: {
    marginVertical: "auto",
    marginHorizontal: 40,
    paddingVertical: 18,
    gap: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
  },
  button: {
    paddingVertical: 3,
    paddingHorizontal: 11,
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

export default ErrorEggHatchingModal;
