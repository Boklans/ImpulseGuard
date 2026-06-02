import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAppSelector } from "@/hooks/reduxHooks";
import {
  useImpulses,
  useDeleteImpulse,
  useUpdateImpulse,
} from "@/hooks/useImpulses";
import { useImpulse } from "@/contexts/impulseContext";
import { ImpulsesList } from "@/constants/configs/impulses.config";
import { Colors } from "@/constants/Colors";
import PencilSvg from "@/assets/icons/Pencil.svg";
import TrashSvg from "@/assets/icons/Trash.svg";
import ListSvg from "@/assets/icons/layout-list.svg";
import CheckSvg from "@/assets/icons/check.svg";
import Svg, { Circle } from "react-native-svg";

export default function ImpulseDetailScreen() {
  const { impulseId } = useLocalSearchParams<{ impulseId: string }>();
  const { user } = useAppSelector((state) => state.user);
  const { setSelectedImpulseId } = useImpulse();

  const { data, isLoading } = useImpulses(user?._id);
  const { mutateAsync: deleteImpulse } = useDeleteImpulse(user?._id ?? "");
  const { mutate: updateImpulse } = useUpdateImpulse(user?._id ?? "");

  const impulses = data?.pages.flatMap((page) => page.impulses) ?? [];
  const impulse = impulses.find((imp: any) => imp._id === impulseId);

  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState(impulse?.name ?? "");

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!impulse) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Impulse not found</Text>
      </View>
    );
  }

  const imageItem = ImpulsesList.find(
    (i) => i.id === Number(impulse.avatarUrl)
  );

  const successRate =
    impulse.sessionsCount > 0
      ? Math.round((impulse.successCount / impulse.sessionsCount) * 100)
      : 0;

  const handleStartSession = () => {
    setSelectedImpulseId(impulse._id);
    router.push("/(tabs)/(impulses-flow)/select-activity");
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Impulse?",
      "This will permanently delete this impulse and its history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteImpulse(impulse._id);
            router.back();
          },
        },
      ]
    );
  };

  const handleSaveName = () => {
    if (nameValue.trim() && nameValue !== impulse.name) {
      updateImpulse({ impulseId: impulse._id, data: { name: nameValue.trim() } });
    }
    setIsEditing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      bounces={false}
    >
      {/* Hero Image */}
      <View style={styles.imageCard}>
        {imageItem ? (
          <Image source={imageItem.image} style={styles.heroImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>

      {/* Name with Edit */}
      <View style={styles.nameContainer}>
        {isEditing ? (
          <TextInput
            style={styles.nameInput}
            value={nameValue}
            onChangeText={setNameValue}
            onSubmitEditing={handleSaveName}
            onBlur={handleSaveName}
            autoFocus
          />
        ) : (
          <Text style={styles.name}>{impulse.name}</Text>
        )}
        <Pressable
          onPress={() => {
            setNameValue(impulse.name);
            setIsEditing(true);
          }}
          style={styles.editButton}
        >
          <PencilSvg width={20} height={20} color={Colors.light.primary} />
        </Pressable>
      </View>

      {/* Stats Cards */}
      <Text style={styles.sectionTitle}>Session Overview</Text>
      <View style={styles.statsRow}>
        {/* Total Sessions */}
        <View style={styles.statCard}>
          <ListSvg width={24} height={24} color={Colors.light.primary} />
          <Text style={styles.statNumber}>{impulse.sessionsCount}</Text>
          <Text style={styles.statLabel}>Total{"\n"}Sessions</Text>
        </View>

        {/* Success Rate - Circular Progress */}
        <View style={styles.statCard}>
          <View style={styles.circularProgress}>
            <Svg width={56} height={56}>
              <Circle
                cx={28}
                cy={28}
                r={24}
                stroke="#E5E5E5"
                strokeWidth={4}
                fill="transparent"
              />
              <Circle
                cx={28}
                cy={28}
                r={24}
                stroke={Colors.light.primary}
                strokeWidth={4}
                fill="transparent"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 * (1 - successRate / 100)}
                strokeLinecap="round"
                transform="rotate(-90 28 28)"
              />
            </Svg>
            <Text style={styles.circularText}>{successRate}%</Text>
          </View>
          <Text style={styles.statLabel}>Success{"\n"}Rate</Text>
        </View>

        {/* Successful Sessions */}
        <View style={styles.statCard}>
          <CheckSvg width={24} height={24} color={Colors.light.primary} />
          <Text style={styles.statNumber}>{impulse.successCount}</Text>
          <Text style={styles.statLabel}>Successful{"\n"}Sessions</Text>
        </View>
      </View>

      {/* Start Session Button */}
      <Pressable style={styles.startButton} onPress={handleStartSession}>
        <Text style={styles.startButtonText}>Start Session</Text>
      </Pressable>

      {/* Delete Button */}
      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <TrashSvg width={20} height={20} color="#E73700" />
        <Text style={styles.deleteButtonText}>Delete Impulse</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  imageCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  heroImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#808080",
    fontSize: 16,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "600",
    color: "#333",
  },
  nameInput: {
    fontSize: 28,
    fontWeight: "600",
    color: "#333",
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
    paddingVertical: 4,
    minWidth: 100,
    textAlign: "center",
  },
  editButton: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
  },
  circularProgress: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
  },
  circularText: {
    position: "absolute",
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  startButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  startButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E73700",
    backgroundColor: "white",
  },
  deleteButtonText: {
    color: "#E73700",
    fontSize: 16,
    fontWeight: "500",
  },
});
