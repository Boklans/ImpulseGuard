import { Colors } from "@/constants/Colors";
import { useLocalSearchParams, router } from "expo-router";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, StyleSheet, Modal, Pressable, BackHandler, AppState, AppStateStatus } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Audio } from "expo-av";
import { Feather } from "@expo/vector-icons";
import { backgroundSounds } from "@/constants/configs/background-sounds.config";
import * as Notifications from "expo-notifications";
import { useKeepAwake } from "expo-keep-awake";

export default function CircularTimer() {
  useKeepAwake();

  const { timeAmount, petId, sounds, music, mix } = useLocalSearchParams<{
    timeAmount: string;
    petId: string;
    sounds?: string;
    music?: string;
    mix?: string;
  }>();

  const totalSeconds = Number(timeAmount) || 300;
  const [seconds, setSeconds] = useState(totalSeconds);
  const [isOpen, setIsOpen] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const soundsRef = useRef<Audio.Sound[]>([]);
  const notificationIdRef = useRef<string | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const isSessionFinishedRef = useRef(false);

  const handleMuteToggle = async () => {
    const muted = !isMuted;
    setIsMuted(muted);
    await Promise.all(soundsRef.current.map((s) => s.setIsMutedAsync(muted)));
  };

  const setupAndPlaySounds = useCallback(async () => {
    const audioFiles: any[] = [];

    const soundIds = sounds ? JSON.parse(sounds) : [];
    soundIds.forEach((id: string) => {
      const src = backgroundSounds.sounds.find((s) => s.id === id)?.file;
      if (src) audioFiles.push(src);
    });

    if (music) {
      const src = backgroundSounds.music.find((m) => m.id === music)?.file;
      if (src) audioFiles.push(src);
    }

    if (mix) {
      const src = backgroundSounds.mixes.find((m) => m.id === mix)?.file;
      if (src) audioFiles.push(src);
    }

    for (const file of audioFiles) {
      const { sound } = await Audio.Sound.createAsync(file, {
        shouldPlay: true,
        isLooping: true,
      });
      soundsRef.current.push(sound);
    }
  }, [sounds, music, mix]);

  const stopAllSounds = useCallback(async () => {
    await Promise.all(soundsRef.current.map((s) => s.unloadAsync()));
    soundsRef.current = [];
  }, []);

  const cancelScheduledNotification = useCallback(async () => {
    if (notificationIdRef.current) {
      await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  }, []);

  const scheduleReturnNotification = useCallback(async () => {
    await cancelScheduledNotification();
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Come back!",
        body: "Your session is still running. Return now or your progress will be lost!",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 10,
      },
    });
    notificationIdRef.current = id;
  }, [cancelScheduledNotification]);

  const handleAppStateChange = useCallback(async (nextAppState: AppStateStatus) => {
    if (isSessionFinishedRef.current) return;

    if (appStateRef.current === "active" && nextAppState.match(/inactive|background/)) {
      await scheduleReturnNotification();
    } else if (appStateRef.current.match(/inactive|background/) && nextAppState === "active") {
      await cancelScheduledNotification();
    }
    appStateRef.current = nextAppState;
  }, [scheduleReturnNotification, cancelScheduledNotification]);

  const handleFinish = useCallback(async () => {
    isSessionFinishedRef.current = true;
    await stopAllSounds();
    await cancelScheduledNotification();
    router.push({
      pathname: "/(tabs)/(impulses-flow)/after-dialog",
      params: { petId, duration: String(totalSeconds) },
    });
    setTimeout(() => setIsOpen(false), 50);
  }, [petId, totalSeconds, stopAllSounds, cancelScheduledNotification]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      subscription.remove();
      cancelScheduledNotification();
    };
  }, [handleAppStateChange, cancelScheduledNotification]);

  useEffect(() => {
    setupAndPlaySounds();

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      stopAllSounds(); // страховка, якщо екран знімуть іншим шляхом
    };
  }, [setupAndPlaySounds, handleFinish, stopAllSounds]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="fullScreen"
      transparent={false}
      visible={isOpen}
      onRequestClose={() => {}} // Block Android back button
    >
      <View style={styles.container}>
        <Text style={styles.header}>You can do it!</Text>

        <AnimatedCircularProgress
          size={250}
          width={8}
          fill={(seconds / totalSeconds) * 100}
          tintColor={Colors.light.tabIconSelected}
          backgroundColor="#e0e0e0"
          rotation={0}
          lineCap="round"
        >
          {() => <Text style={styles.timerText}>{formatTime(seconds)}</Text>}
        </AnimatedCircularProgress>

        <Pressable onPress={handleMuteToggle} style={styles.muteButton}>
          {isMuted ? (
            <Feather name="volume-x" size={32} color="#6C6C6C" />
          ) : (
            <Feather name="volume-2" size={32} color="#6C6C6C" />
          )}
        </Pressable>

        {__DEV__ && (
          <Pressable onPress={handleFinish} style={styles.devSkipButton}>
            <Text style={styles.devSkipText}>DEV: Skip</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  muteButton: {
    marginTop: 40,
    padding: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  header: {
    fontSize: 48,
    fontWeight: "400",
    marginBottom: 32,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "300",
  },
  devSkipButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#ff6b6b",
    borderRadius: 8,
  },
  devSkipText: {
    color: "white",
    fontWeight: "600",
  },
});
