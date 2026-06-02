import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { PetInfo } from "@/components/screens/pets/PetInfo";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { useLocalSearchParams } from "expo-router";
import { usePets } from "@/hooks/usePets";
import { useAppSelector } from "@/hooks/reduxHooks";
import { getNextEvolutionLevel } from "@/utils/petEvolution";

export default function PetScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();

  const { user } = useAppSelector((state) => state.user);
  const { data, isLoading } = usePets(user?._id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6AC3CE" />
      </SafeAreaView>
    );
  }

  const pets = data?.pages.flatMap((page) => page.pets) ?? [];
  const pet = pets?.find((pet) => pet._id === petId);
  const nextEvolutionLevel = getNextEvolutionLevel(pet?.stage);

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.evolutionText}>Pet not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ width: "100%", alignItems: "center" }}>
        <PetInfo
          pet={{
            health: pet.currentHealth,
            energy: pet.currentEnergy,
            level: pet.level,
            stage: pet.stage ?? 1,
            friendship: pet.friendship,
          }}
        />

        <View
          style={{
            paddingVertical: 11,
            paddingHorizontal: 14,
            gap: 13,
            flexDirection: "column",
            width: "100%",
            borderRadius: 8,
            backgroundColor: "#FFFFFF",
            marginTop: 11,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.lvlText}>EXP to next lvl</Text>
            <Text style={styles.lvlText}>
              {pet.currentXP}/{pet.xpForNextLevel}
            </Text>
          </View>
          <ProgressBar
            progress={Math.min(
              100,
              (pet.currentXP / Math.max(pet.xpForNextLevel, 1)) * 100
            )}
            level={0}
            type="leveless"
          />
          <Text style={styles.evolutionText}>
            {nextEvolutionLevel
              ? `Next evolution at level ${nextEvolutionLevel}`
              : "Final stage"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "space-between",
    gap: 8,
  },
  lvlText: {
    fontWeight: "600",
  },
  evolutionText: {
    color: "#6C6C6C",
    fontSize: 13,
    fontWeight: "500",
  },
});
