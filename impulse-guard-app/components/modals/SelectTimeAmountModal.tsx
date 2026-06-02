import React, { useState } from "react";
import {
  Alert,
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import Button from "../ui/Button";
import Hourglass from "@/assets/icons/hourglass.svg";
import XIcon from "@/assets/icons/x.svg";
import { Colors } from "@/constants/Colors";

type SelectTimeAmountModalProps = {
  opened: boolean;
  close: () => void;
  action: (time: string) => void;
};

const SelectTimeAmountModal: React.FC<SelectTimeAmountModalProps> = ({
  opened,
  close,
  action,
}) => {
  return (
    <Modal animationType="fade" transparent={true} visible={opened}>
      <TouchableWithoutFeedback onPress={() => close()}>
        <View style={styles.overlay}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => close()}
              >
                <XIcon width={24} height={24} color="#E1E3E4" />
              </TouchableOpacity>
              <View
                style={{
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Hourglass
                  color={Colors.light.primary}
                  width={48}
                  height={48}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "500",
                  }}
                >
                  Select time amount
                </Text>
              </View>

              <View style={{ gap: 8 }}>
                <Button
                  onPress={() => action("300")}
                  title="5:00"
                  variant="secondary"
                />
                <Button
                  onPress={() => action("600")}
                  title="10:00"
                  variant="secondary"
                />
                <Button
                  onPress={() => action("900")}
                  title="15:00"
                  variant="secondary"
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
    minWidth: "85%",
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

export default SelectTimeAmountModal;
