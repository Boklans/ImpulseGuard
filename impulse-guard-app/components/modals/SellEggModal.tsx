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
import GlimIcon from "@/assets/icons/glim.svg";

type SellEggModalProps = {
  opened: boolean;
  egg: {
    imageUrl?: string;
    rarity?: string;
  } | null;
  sellPrice: number;
  close: () => void;
  action: () => void;
  isLoading?: boolean;
};

const SellEggModal: React.FC<SellEggModalProps> = ({
  opened,
  egg,
  sellPrice,
  close,
  action,
  isLoading,
}) => {
  const imageItem = eggsList.find((i) => i.id === Number(egg?.imageUrl));

  return (
    <Modal animationType="fade" transparent={true} visible={opened}>
      <TouchableWithoutFeedback onPress={() => close()}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalView}>
              <Text style={styles.title}>Sell Egg?</Text>

              <View style={styles.imageContainer}>
                <Image
                  source={imageItem?.image}
                  style={styles.eggImage}
                />
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>You will receive:</Text>
                <View style={styles.priceRow}>
                  <GlimIcon width={24} height={24} />
                  <Text style={styles.priceValue}>{sellPrice}</Text>
                </View>
              </View>

              <View style={styles.buttonsContainer}>
                <Button
                  onPress={action}
                  title={isLoading ? "Selling..." : "Sell"}
                  variant="primary"
                  disabled={isLoading}
                />
                <Button
                  onPress={close}
                  title="Cancel"
                  variant="ghost"
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 16,
    minWidth: "90%",
    gap: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  imageContainer: {
    alignItems: "center",
  },
  eggImage: {
    height: 150,
    width: 150,
    resizeMode: "contain",
  },
  priceContainer: {
    alignItems: "center",
    gap: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: "#666",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: "600",
    color: "#6AC3CE",
  },
  buttonsContainer: {
    alignSelf: "stretch",
  },
});

export default SellEggModal;
