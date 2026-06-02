import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import Button from "../ui/Button";

import { eggsList } from "@/constants/Config";

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
  timeToHatch,
  close,
  action,
}) => {
  const imageItem = eggsList.find((i) => i.id === Number(image));

  return (
    <Modal animationType="fade" transparent={true} visible={opened}>
      <TouchableWithoutFeedback onPress={() => close()}>
        <View style={styles.overlay}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={{ alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 32, fontWeight: "500" }}>
                  {Number(timeToHatch) / 1000 / 3600} hours
                </Text>
              </View>

              <View style={{ gap: 8, alignItems: "center" }}>
                <Image
                  source={imageItem?.image}
                  style={{ height: 194, resizeMode: "contain" }}
                />
              </View>

              <View>
                <Button
                  onPress={() => {
                    action();
                  }}
                  title="Start hatching"
                  variant="primary"
                />
                <Button
                  onPress={() => {
                    close();
                  }}
                  title="Cancel"
                  variant="ghost"
                />
              </View>
            </View>
          </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    minWidth: "90%",
    gap: 20,
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
