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
import GlimIcon from "@/assets/icons/glim.svg";
import { EggPrices } from "@/hooks/useShop";
import { eggsList } from "@/constants/Config";

type BuyEggModalProps = {
  opened: boolean;
  prices: EggPrices | undefined;
  userGlims: number;
  close: () => void;
  action: () => void;
  isLoading?: boolean;
};

const BuyEggModal: React.FC<BuyEggModalProps> = ({
  opened,
  prices,
  userGlims,
  close,
  action,
  isLoading,
}) => {
  const price = prices?.common?.buy ?? 0;
  const canAfford = userGlims >= price;
  const eggImage = eggsList[0]?.image;

  return (
    <Modal animationType="fade" transparent={true} visible={opened}>
      <TouchableWithoutFeedback onPress={close}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalView}>
              <Text style={styles.title}>Buy Egg</Text>

              <View style={styles.imageContainer}>
                <Image source={eggImage} style={styles.eggImage} />
              </View>

              <View style={styles.priceRow}>
                <GlimIcon width={24} height={24} />
                <Text style={styles.priceValue}>{price}</Text>
              </View>

              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Your balance:</Text>
                <View style={styles.balanceRow}>
                  <GlimIcon width={18} height={18} />
                  <Text style={styles.balanceValue}>{userGlims}</Text>
                </View>
              </View>

              <View style={styles.buttonsContainer}>
                <Button
                  onPress={action}
                  title={
                    isLoading
                      ? "Buying..."
                      : canAfford
                      ? `Buy for ${price}`
                      : "Not enough glims"
                  }
                  variant="primary"
                  disabled={isLoading || !canAfford}
                />
                <Button onPress={close} title="Cancel" variant="ghost" />
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
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    width: "100%",
    alignItems: "center",
  },
  eggImage: {
    height: 150,
    width: 150,
    resizeMode: "contain",
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
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6AC3CE",
  },
  buttonsContainer: {
    alignSelf: "stretch",
  },
});

export default BuyEggModal;
