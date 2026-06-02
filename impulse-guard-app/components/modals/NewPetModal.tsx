import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";

import { PetInfo } from "../screens/pets/PetInfo";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { PetsList } from "@/constants/configs/pets.config";

type NewPetModalProps = {
  pet: any;
  opened: boolean;
  close: () => void;
  action: (name: string) => void;
};

const NewPetModal: React.FC<NewPetModalProps> = ({
  opened,
  close,
  pet,
  action,
}) => {
  const [text, setText] = React.useState("");
  const imageItem = PetsList.find((i) => i.id === Number(pet?.imageUrl));
  if (!imageItem) return null;

  return (
    <Modal animationType="fade" transparent visible={opened}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
        >
          <SafeAreaView style={styles.safe}>
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>New Friend!</Text>

              <View style={styles.petCard}>
                <Image
                  source={imageItem.image}
                  style={{ height: 256, resizeMode: "contain" }}
                />
              </View>

              <PetInfo
                pet={{
                  health: pet.maxHealth,
                  energy: pet.maxEnergy,
                  level: pet.level,
                  stage: pet.stage ?? 1,
                  friendship: pet.friendship,
                }}
              />

              <Input
                style={{ width: "100%", marginTop: 32 }}
                value={text}
                placeholder="Name"
                onChangeText={setText}
              />

              <Button
                style={{ width: "100%", marginTop: 8 }}
                title="Save"
                onPress={() => {
                  action(text);
                  close();
                }}
              />
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  safe: {
    flex: 1,
  },
  content: {
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "500",
    marginTop: 12,
  },
  petCard: {
    gap: 8,
    paddingVertical: 24,
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    marginTop: 24,
    marginBottom: 12,
    width: "100%",
  },
});

export default NewPetModal;
