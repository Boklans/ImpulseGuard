import React, { useState } from "react";
import {
  Alert,
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import Button from "../ui/Button";
import Flame from "@/assets/icons/flame.svg";
import { Colors } from "@/constants/Colors";
import { useDeclineStreakGoal } from "@/hooks/useUser";
import { useAppSelector } from "@/hooks/reduxHooks";

type SelectTimeAmountModalProps = {
  opened: boolean;
  close: () => void;
  action: (time: string) => void;
};

const SelectStreakGoalModal: React.FC<SelectTimeAmountModalProps> = ({
  opened,
  close,
  action,
}) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.user);
  const { mutate: declineGoal } = useDeclineStreakGoal();

  const handleSelect = (time: string) => {
    setSelectedTime(time);
  };
  const handleConfirm = () => {
    if (!selectedTime) {
      Alert.alert("Please select a streak goal first!");
      return;
    }
    action(selectedTime);
  };

  return (
    <Modal animationType="fade" transparent={true} visible={opened}>
      <TouchableWithoutFeedback onPress={() => close()}>
        <View style={styles.overlay}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={{ alignItems: "center", gap: 8 }}>
                <Flame color={Colors.light.primary} width={48} height={48} />
                <Text style={{ fontSize: 32, fontWeight: "500" }}>
                  Set your streak goal!
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "400",
                    maxWidth: "85%",
                    textAlign: "center",
                  }}
                >
                  Stay impulse-free for the chosen period and earn a special
                  reward!
                </Text>
              </View>

              <View style={{ gap: 8 }}>
                <Button
                  onPress={() => handleSelect("7")}
                  title="7 days"
                  variant={selectedTime === "7" ? "outline" : "secondary"}
                />
                <Button
                  onPress={() => handleSelect("14")}
                  title="14 days"
                  variant={selectedTime === "14" ? "outline" : "secondary"}
                />
                <Button
                  onPress={() => handleSelect("30")}
                  title="30 days"
                  variant={selectedTime === "30" ? "outline" : "secondary"}
                />
              </View>

              <View>
                <Button
                  onPress={handleConfirm}
                  title="Confirm"
                  variant="primary"
                  disabled={!selectedTime}
                />
                <Button
                  onPress={() => {
                    declineGoal(user?._id!);
                    close();
                  }}
                  title="Maybe later"
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

export default SelectStreakGoalModal;
