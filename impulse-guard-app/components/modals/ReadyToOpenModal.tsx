import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  SafeAreaView,
  Dimensions,
  Pressable,
} from "react-native";

import { eggsList } from "@/constants/Config";
import { LinearGradient } from "expo-linear-gradient";

type StartEggHatchingModalProps = {
  opened: boolean;
  timeToHatch?: number;
  image?: string;
  close: () => void;
  action: () => void;
};

const StartEggHatchingModal: React.FC<StartEggHatchingModalProps> = ({
  opened,
  image,
  close,
  action,
}) => {
  const imageItem = eggsList.find((i) => i.id === Number(image));
  const { height } = Dimensions.get("window");

  if (imageItem === undefined) return null;

  return (
    <Modal animationType="fade" transparent={true} visible={opened}>
      <TouchableWithoutFeedback onPress={() => close()}>
        <View style={styles.overlay}>
          <LinearGradient
            style={styles.modalView}
            colors={imageItem.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <Pressable onPress={action}>
              <SafeAreaView>
                <View
                  style={{
                    alignItems: "center",
                    marginTop: height * 0.2,
                  }}
                >
                  <Text style={{ fontSize: 48, fontWeight: "500" }}>
                    Tap to open!
                  </Text>
                </View>
                <View style={{ gap: 8, alignItems: "center", marginTop: 72 }}>
                  <Image
                    source={imageItem?.image}
                    style={{ height: 256, resizeMode: "contain" }}
                  />
                </View>
              </SafeAreaView>
            </Pressable>
          </LinearGradient>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: 2,
    right: 2,
    padding: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 12,
    minWidth: "100%",
    gap: 20,
    height: "100%",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default StartEggHatchingModal;
