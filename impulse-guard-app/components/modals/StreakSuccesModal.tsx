import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withSequence,
} from "react-native-reanimated";
import ConfettiCannon from "react-native-confetti-cannon";

import Button from "../ui/Button";
import { Colors } from "@/constants/Colors";
import { useAppSelector } from "@/hooks/reduxHooks";

const { width: screenWidth } = Dimensions.get("window");

type StreakSuccessModalProps = {
  opened: boolean;
  close: () => void;
  rewardXP: number;
  onAction: () => void;
};

const StreakSuccessModal: React.FC<StreakSuccessModalProps> = ({
  opened,
  close,
  rewardXP,
  onAction,
}) => {
  const { user } = useAppSelector((state) => state.user);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const confettiRef = useRef<any>(null);

  // Animation values
  const iconScale = useSharedValue(0);
  const titleScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const rewardScale = useSharedValue(0);

  useEffect(() => {
    if (opened) {
      setShowConfetti(true);
      iconScale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
      titleScale.value = withDelay(150, withSpring(1, { damping: 8, stiffness: 100 }));
      contentOpacity.value = withDelay(250, withSpring(1));
      rewardScale.value = withDelay(350, withSequence(
        withSpring(1.15, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      ));
    } else {
      iconScale.value = 0;
      titleScale.value = 0;
      contentOpacity.value = 0;
      rewardScale.value = 0;
      setShowConfetti(false);
    }
  }, [opened]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const rewardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rewardScale.value }],
  }));

  return (
    <>
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={70}
          origin={{ x: screenWidth / 2, y: -10 }}
          autoStart={true}
          fadeOut={true}
          fallSpeed={2800}
          explosionSpeed={320}
          colors={["#FFD700", "#FFA500", "#6AC3CE", "#FF6B6B", "#4ECDC4"]}
        />
      )}
      <Modal animationType="fade" transparent={true} visible={opened}>
        <TouchableWithoutFeedback onPress={close}>
          <View style={styles.overlay}>
            <View style={styles.modalView}>
              <Animated.Image
                source={require("@/assets/icons/gift.png")}
                style={[
                  {
                    width: 148,
                    height: 148,
                  },
                  iconAnimatedStyle,
                ]}
              />

              <Animated.Text style={[styles.title, titleAnimatedStyle]}>
                Great job, {user?.username}!
              </Animated.Text>
              <Animated.Text
                style={[
                  {
                    fontSize: 20,
                    fontWeight: "400",
                    maxWidth: "100%",
                    textAlign: "center",
                    marginTop: 8,
                  },
                  contentAnimatedStyle,
                ]}
              >
                You have resisted impulse
              </Animated.Text>
              {user?.streakInfo?.goal && (
                <Animated.Text
                  style={[
                    {
                      fontSize: 20,
                      fontWeight: "400",
                      maxWidth: "100%",
                      textAlign: "center",
                    },
                    contentAnimatedStyle,
                  ]}
                >
                  for {user.streakInfo.goal} days!
                </Animated.Text>
              )}
              <Animated.Text style={[styles.rewardText, rewardAnimatedStyle]}>
                {rewardXP} <Text>XP</Text>
              </Animated.Text>

              <Button
                style={{ width: "100%" }}
                title="Write your victory note"
                variant="primary"
                onPress={onAction}
              />
              <Button title="Close" variant="ghost" onPress={close} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingBottom: 12,
    paddingHorizontal: 24,
    width: "85%",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "500",
    textAlign: "center",
  },
  rewardText: {
    fontSize: 48,
    fontWeight: "600",
    marginVertical: 18,
    textAlign: "center",
    color: "#47B3BD",
  },
});

export default StreakSuccessModal;
