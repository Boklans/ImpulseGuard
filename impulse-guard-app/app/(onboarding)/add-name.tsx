import React, { Ref, useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Platform,
  Keyboard,
} from "react-native";
import { router } from "expo-router";

import { useLocalSearchParams } from "expo-router";
import { useAppSelector } from "@/hooks/reduxHooks";
import { client } from "@/utils/client";
import { ImpulsesList } from "@/constants/configs/impulses.config";
import { useAnalytics, AnalyticsEvents } from "@/hooks/useAnalytics";
import { useCreateImpulse } from "@/hooks/useImpulses";

export default function ImpulseNameScreen() {
  const [impulseName, setImpulseName] = useState("");
  const { user } = useAppSelector((state) => state.user);
  const { id } = useLocalSearchParams();
  const { track } = useAnalytics();
  const { mutateAsync: createImpulse } = useCreateImpulse(user?._id || "");

  const handleConfirm = async () => {
    if (!user?._id) return;

    const { _id: userId } = user;

    track(AnalyticsEvents.ONBOARDING_NAME_ADDED);

    try {
      await createImpulse({ name: impulseName, avatarUrl: id as string });

      if (!user.isOnboardingCompleted) {
        await client.patch(`/users/${userId}`, { isOnboardingCompleted: true });
        track(AnalyticsEvents.ONBOARDING_COMPLETED);
      }

      router.navigate("/(tabs)/(impulses-flow)/impulses");
    } catch (error) {
      console.error("Error creating impulse:", error);
    }
  };

  const scrollViewRef: Ref<ScrollView> = useRef(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () =>
        Platform.OS == "ios" &&
        scrollViewRef.current?.scrollToEnd({ animated: true })
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () =>
        Platform.OS == "ios" &&
        scrollViewRef.current?.scrollTo({ y: 0, animated: true })
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          ref={scrollViewRef}
          bounces={false}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Image
              source={require("@/assets/images/maskot.png")}
              style={styles.mascotImage}
            />
            <View style={styles.bubbleContainer}>
              <Text style={styles.bubbleText}>
                Type funny name for your impulse!
              </Text>
            </View>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={ImpulsesList.find((i) => i.id === Number(id))?.image}
              style={styles.impulseImage}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Name"
              style={styles.textInput}
              value={impulseName}
              onChangeText={setImpulseName}
              maxLength={12}
            />
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  scrollContainer: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "flex-start",
  },
  mascotImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  bubbleContainer: {
    marginLeft: 12,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    flexShrink: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  bubbleText: {
    fontSize: 16,
    color: "#333",
  },
  imageContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  impulseImage: {
    width: "100%",
    height: 320,
    aspectRatio: 1,
    borderRadius: 12,
    resizeMode: "cover",
  },
  inputContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: "#333",
    // Можна додати тінь для iOS, але зазвичай полю вводу не потрібна
  },
  confirmButton: {
    backgroundColor: "#6AC3CE",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 16,
    bottom: 20,
    marginHorizontal: 16,
    // але тоді виключте ScrollView, або вирішуйте хитріше
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "500",
  },
});
