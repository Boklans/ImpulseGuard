import React, { useEffect } from "react";
import {
  Modal,
  StyleSheet,
  View,
  Pressable,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type ModalWithBlurProps = {
  opened: boolean;
  close: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
  fullScreen?: boolean;
};

const ModalWithBlur: React.FC<ModalWithBlurProps> = ({
  opened,
  close,
  children,
  style,
  fullScreen = false,
}) => {
  const translateY = useSharedValue(fullScreen ? 0 : 20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (opened) {
      if (!fullScreen) {
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
      opacity.value = withSpring(1, { damping: 20, stiffness: 200 });
    } else {
      translateY.value = fullScreen ? 0 : 20;
      opacity.value = 0;
    }
  }, [opened, fullScreen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: fullScreen ? [] : [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={opened}
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        pointerEvents="box-none"
      >
        <View style={styles.blurBackground} pointerEvents="none" />
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <Animated.View style={[styles.modalContent, style, animatedStyle]}>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    opacity: 0.7,
  },
  modalContent: {
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    zIndex: 1,
  },
});

export default ModalWithBlur;
