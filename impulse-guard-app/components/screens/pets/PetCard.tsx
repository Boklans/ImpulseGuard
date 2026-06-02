import { ProgressBar } from "@/components/ui/ProgressBar";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  FadeIn,
} from "react-native-reanimated";
import { useRevivePet } from "@/hooks/usePets";
import GlimSVG from "@/assets/icons/glim.svg";
import { PetsList } from "@/constants/configs/pets.config";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { updateUserPartially } from "@/redux/slices/user";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";

function PetCard({ pet }: any) {
  const dispatch = useAppDispatch();
  const imageItem = PetsList.find((i) => i.id === Number(pet.imageUrl));
  const { mutateAsync: revivePetMutation } = useRevivePet();

  // Pulse animation for revive button
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (pet.currentHealth === 0) {
      pulseScale.value = withRepeat(
        withSequence(
          withSpring(1.05, { damping: 10, stiffness: 100 }),
          withSpring(1, { damping: 10, stiffness: 100 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
    }
  }, [pet.currentHealth]);

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (!imageItem) return null;

  function handlePress() {
    if (pet.currentHealth === 0) return;
    router.replace(`/(tabs)/(pets-flow)/pets/${pet._id}`);
  }

  async function handleRevive() {
    try {
      const result = await revivePetMutation(pet._id);

      if (result?.glims !== undefined) {
        dispatch(updateUserPartially({ glims: result.glims }));
      }
    } catch (error) {
      console.log("Revive failed:", error);
    }
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.card, { position: "relative" }]}
      disabled={pet.currentHealth === 0}
    >
      <Image
        source={imageItem.image}
        style={{
          ...styles.cardImage,
          height: imageItem?.height || 128,
          margin: imageItem?.padding || 24,
        }}
      />

      {pet.currentEnergy === 0 && (
        <Image
          source={require("@/assets/images/zero_energy.png")}
          style={styles.energyIcon}
        />
      )}

      {pet.currentHealth === 0 && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.deadOverlay}>
          <Image
            source={require("@/assets/images/zero_health.png")}
            style={styles.deadImage}
          />
          <AnimatedPressable
            onPress={handleRevive}
            style={[styles.reviveButton, pulseAnimatedStyle]}
            scaleValue={0.95}
          >
            <GlimSVG style={styles.glimIcon} />
            <Text style={styles.reviveText}>Revive for 500</Text>
          </AnimatedPressable>
        </Animated.View>
      )}

      <View
        style={[styles.infoContainer, { position: "absolute", padding: 4 }]}
      >
        <ProgressBar
          style={{
            width: 80,
            overflow: "hidden",
            display: pet.currentHealth === 0 ? "none" : "flex",
          }}
          level={pet.level}
          progress={(pet.currentXP / pet.xpForNextLevel) * 100}
          type="thin"
        />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    aspectRatio: 1,
    width: "100%",
    marginBottom: 16,
    overflow: "hidden",
  },
  cardImage: {
    flex: 1,
    width: "auto",
    resizeMode: "contain",
  },
  infoContainer: {
    width: "50%",
  },
  deadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  deadImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  reviveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F7FA",
    paddingRight: 8,
    borderRadius: 6,
  },
  reviveText: {
    color: "#00796B",
    fontWeight: "600",
    fontSize: 16,
  },
  glimIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  energyIcon: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
});

export default PetCard;
