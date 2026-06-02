import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import Button from "../ui/Button";
import { Colors } from "@/constants/Colors";
import { AvatarImages, DEFAULT_AVATAR } from "@/constants/Config";
import { useAppSelector } from "@/hooks/reduxHooks";
import { usePaywall, usePremium } from "@/hooks/usePaywall";
import LockIcon from "@/assets/icons/lock.svg";

type SelectAvatarModalProps = {
  opened: boolean;
  close: () => void;
  onSave: (avatarId: string) => Promise<void>;
  isLoading?: boolean;
};

const AVATAR_IDS = Array.from(AvatarImages.keys());

const SelectAvatarModal: React.FC<SelectAvatarModalProps> = ({
  opened,
  close,
  onSave,
  isLoading = false,
}) => {
  const { user } = useAppSelector((state) => state.user);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    user?.avatar || DEFAULT_AVATAR
  );
  const { isPremium } = usePremium();
  const { openPaywall } = usePaywall();

  const handleSave = async () => {
    await onSave(selectedAvatar);
  };

  const handleAvatarPress = (avatarId: string) => {
    const avatarData = AvatarImages.get(avatarId);
    if (avatarData?.locked && !isPremium) {
      openPaywall();
      return;
    }
    setSelectedAvatar(avatarId);
  };

  return (
    <Modal animationType="fade" transparent={true} visible={opened}>
      <TouchableWithoutFeedback onPress={close}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalView}>
              <TouchableOpacity style={styles.closeButton} onPress={close}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Choose your avatar</Text>
              <Text style={styles.subtitle}>Pick the look you like</Text>

              <View style={styles.avatarsGrid}>
                {AVATAR_IDS.map((avatarId) => {
                  const avatarData = AvatarImages.get(avatarId);
                  const isLocked = avatarData?.locked && !isPremium;

                  return (
                    <TouchableOpacity
                      key={avatarId}
                      style={[
                        styles.avatarContainer,
                        selectedAvatar === avatarId && styles.avatarSelected,
                        isLocked && styles.avatarLocked,
                      ]}
                      onPress={() => handleAvatarPress(avatarId)}
                    >
                      <Image
                        source={avatarData?.image}
                        style={[
                          styles.avatarImage,
                          isLocked && styles.avatarImageLocked,
                        ]}
                      />
                      {isLocked && (
                        <View style={styles.lockBadge}>
                          <LockIcon width={16} height={16} color="#6AC3CE" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {isLoading ? (
                <View style={[styles.saveButton, styles.loadingButton]}>
                  <ActivityIndicator color="white" />
                </View>
              ) : (
                <Button
                  onPress={handleSave}
                  title="Save avatar"
                  variant="primary"
                  style={styles.saveButton}
                />
              )}
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 28,
    color: "#999",
    lineHeight: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    marginBottom: 20,
  },
  avatarsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },
  avatarSelected: {
    borderColor: Colors.light.primary,
  },
  avatarLocked: {
    opacity: 0.6,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarImageLocked: {
    opacity: 0.7,
  },
  lockBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 2,
  },
  saveButton: {
    width: "100%",
  },
  loadingButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SelectAvatarModal;
