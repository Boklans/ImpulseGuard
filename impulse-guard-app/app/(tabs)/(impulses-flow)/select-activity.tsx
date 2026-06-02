import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  Image,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useAppSelector } from "@/hooks/reduxHooks";
import { usePets } from "@/hooks/usePets";
import { useUserLocalStorage } from "@/hooks/useUserLocalStorage";
import SelectTimeAmountModal from "@/components/modals/SelectTimeAmountModal";
import { SessionGuidLineModal } from "@/components/modals/SessionGuidLineModal";
import {
  backgroundSounds,
  TabID,
} from "@/constants/configs/background-sounds.config";
import LockIcon from "@/assets/icons/lock.svg";
import { PetsList } from "@/constants/configs/pets.config";
import { useAnalytics, AnalyticsEvents } from "@/hooks/useAnalytics";
import { usePaywall, usePremium } from "@/hooks/usePaywall";

interface ActivityCardProps {
  activityId: string;
  onPress: () => void;
}

interface PetCardForSelectProps {
  pet: any;
  onPress: () => void;
  isSelected: boolean;
}

interface SoundCardProps {
  item: any;
  onPress: () => void;
  isSelected: boolean;
  isMix?: boolean;
  isPremium?: boolean;
}

interface BackgroundSoundsSelectorProps {
  selectedSounds: string[];
  selectedMusic: string | null;
  selectedMix: string | null;
  onSelectionChange: (type: TabID, id: string) => void;
  isPremium: boolean;
  openPaywall: () => void;
}

const activityImages: { [key: string]: any } = {
  "1": require("@/assets/images/activities/1.png"),
  "2": require("@/assets/images/activities/2.png"),
  "3": require("@/assets/images/activities/3.png"),
  "4": require("@/assets/images/activities/4.png"),
  "5": require("@/assets/images/activities/5.png"),
  "6": require("@/assets/images/activities/6.png"),
  "7": require("@/assets/images/activities/7.png"),
  "8": require("@/assets/images/activities/8.png"),
  "9": require("@/assets/images/activities/9.png"),
};

const ActivityCard: React.FC<ActivityCardProps> = ({ activityId, onPress }) => (
  <Pressable style={styles.card} onPress={onPress}>
    <Image source={activityImages[activityId]} style={styles.cardImage} />
  </Pressable>
);

const PetCardForSelect: React.FC<PetCardForSelectProps> = ({
  pet,
  onPress,
  isSelected,
}) => {
  const imageItem = PetsList.find((i) => i.id === Number(pet.imageUrl));

  if (!imageItem) return null;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.petCard, isSelected && styles.cardSelected]}
    >
      <Image
        source={imageItem.image}
        style={{
          ...styles.petCardImage,
          height: imageItem.height || 128,
          margin: imageItem.padding || 24,
        }}
      />
    </Pressable>
  );
};

const SoundCard: React.FC<SoundCardProps> = ({
  item,
  onPress,
  isSelected,
  isMix = false,
  isPremium = false,
}) => {
  const isLocked = item.locked && !isPremium;

  return (
  <Pressable
    onPress={onPress}
    style={[
      styles.card,
      isMix && styles.mixCard,
      isSelected && styles.cardSelected,
      isLocked && styles.cardLocked,
    ]}
  >
    {"iconSequence" in item && Array.isArray(item.iconSequence) ? (
      <View style={styles.iconSequenceContainer}>
        {item.iconSequence.map((icon: string) => (
          <Text key={icon} style={styles.iconText}>
            {icon}
          </Text>
        ))}
      </View>
    ) : "icon" in item ? (
      <Text style={styles.iconText}>{item.icon}</Text>
    ) : null}

    {isLocked && (
      <View style={styles.lockBadge}>
        <LockIcon width={14} height={14} color="#6AC3CE" />
      </View>
    )}

    <Text
      style={[
        styles.cardLabel,
        isMix && styles.mixCardLabel,
        isSelected && styles.cardLabelSelected,
      ]}
      numberOfLines={2}
    >
      {item.label}
    </Text>
  </Pressable>
  );
};

const BackgroundSoundsSelector: React.FC<BackgroundSoundsSelectorProps> = ({
  selectedSounds,
  selectedMusic,
  selectedMix,
  onSelectionChange,
  isPremium,
  openPaywall,
}) => {
  const [activeTab, setActiveTab] = useState<TabID>("sounds");
  const isMixTab = activeTab === "mixes";

  const tabMeta: { id: TabID; label: string }[] = [
    { id: "sounds", label: "Sounds" },
    { id: "music", label: "Music" },
    { id: "mixes", label: "Mixes" },
  ];

  const currentList = backgroundSounds[activeTab];

  const handleSelect = (item: any) => {
    if (item.locked) {
      if (!isPremium) {
        openPaywall();
        return;
      }
      // Premium user can select locked sounds
    }
    onSelectionChange(activeTab, item.id);
  };

  return (
    <>
      <Text style={styles.headerText}>Background sounds</Text>

      <View style={styles.tabsRow}>
        {tabMeta.map((tab) => (
          <Pressable
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.gridContainer}>
        {currentList.map((item) => {
          const isSelected =
            activeTab === "sounds"
              ? selectedSounds.includes(item.id)
              : activeTab === "music"
              ? selectedMusic === item.id
              : selectedMix === item.id;

          return (
            <SoundCard
              isMix={isMixTab}
              key={item.id}
              item={item}
              isSelected={isSelected}
              onPress={() => handleSelect(item)}
              isPremium={isPremium}
            />
          );
        })}
      </View>
    </>
  );
};

export default function SelectActivityScreen() {
  const [isTimeModalVisible, setTimeModalVisible] = useState(false);
  const [isGuidelineModalVisible, setGuidelineModalVisible] = useState(false);

  const { user } = useAppSelector((state) => state.user);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePets(user?._id, true);
  const { data: userLocalData } = useUserLocalStorage();
  const { track } = useAnalytics();
  const { isPremium } = usePremium();
  const { openPaywall } = usePaywall();

  const pets = useMemo(
    () => data?.pages.flatMap((page) => page.pets) ?? [],
    [data]
  );

  // Auto-fetch all pets for selection
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [selectedSounds, setSelectedSounds] = useState<string[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [selectedMix, setSelectedMix] = useState<string | null>(null);

  useEffect(() => {
    if (userLocalData?.didWatchSessionGuid === false) {
      setGuidelineModalVisible(true);
    }
  }, [userLocalData]);

  const handleActivityPress = () => {
    if (pets.length > 0 && selectedPetId === null) {
      Alert.alert("Select a Pet", "Please select a pet to start the session.");
      return;
    }

    setTimeModalVisible(true);
  };

  const handleSelectTimeAmount = (timeAmount: string) => {
    setTimeModalVisible(false);

    track(AnalyticsEvents.SESSION_STARTED, {
      duration: Number(timeAmount),
      has_pet: selectedPetId !== null,
      has_sounds: selectedSounds.length > 0,
      has_music: selectedMusic !== null,
      has_mix: selectedMix !== null,
    });

    router.push({
      pathname: "/(tabs)/(impulses-flow)/session",
      params: {
        timeAmount: timeAmount,
        petId: selectedPetId,
        sounds: JSON.stringify(selectedSounds),
        music: selectedMusic,
        mix: selectedMix,
      },
    });
  };

  const handleSoundSelection = useCallback((type: TabID, id: string) => {
    switch (type) {
      case "sounds":
        setSelectedSounds((prev) => {
          if (prev.includes(id)) {
            return prev.filter((soundId) => soundId !== id);
          }
          return prev.length < 4 ? [...prev, id] : prev;
        });
        break;
      case "music":
        setSelectedMusic((prev) => (prev === id ? null : id));
        break;
      case "mixes":
        setSelectedMix((prev) => (prev === id ? null : id));
        break;
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.headerText}>Activities</Text>
          <View style={styles.gridContainer}>
            {Object.keys(activityImages).map((activityId) => (
              <ActivityCard
                key={activityId}
                activityId={activityId}
                onPress={handleActivityPress}
              />
            ))}
          </View>

          <BackgroundSoundsSelector
            selectedSounds={selectedSounds}
            selectedMusic={selectedMusic}
            selectedMix={selectedMix}
            onSelectionChange={handleSoundSelection}
            isPremium={isPremium}
            openPaywall={openPaywall}
          />

          {pets.length > 0 && (
            <>
              <Text style={styles.headerText}>Select pet</Text>
              <View style={styles.gridContainer}>
                {pets.map((pet) => (
                  <PetCardForSelect
                    key={pet._id}
                    pet={pet}
                    onPress={() => setSelectedPetId(pet._id)}
                    isSelected={selectedPetId === pet._id}
                  />
                ))}
              </View>
              {isFetchingNextPage && (
                <ActivityIndicator size="small" color="#6AC3CE" style={{ marginBottom: 16 }} />
              )}
            </>
          )}
        </View>
      </ScrollView>

      <SelectTimeAmountModal
        opened={isTimeModalVisible}
        close={() => setTimeModalVisible(false)}
        action={handleSelectTimeAmount}
      />
      <SessionGuidLineModal
        isOpened={isGuidelineModalVisible}
        onClose={() => setGuidelineModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  container: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 0,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "400",
    marginBottom: 16,
    color: "#6C6C6C",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "32%",
    height: 120,
    aspectRatio: 1,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: "#6AC3CE",
  },
  cardLocked: {
    opacity: 0.5,
  },
  cardImage: {
    width: "40%",
    height: "40%",
    resizeMode: "contain",
  },
  cardLabel: {
    fontSize: 14,
    marginTop: 6,
    color: "#004040",
    fontWeight: "500",
  },
  cardLabelSelected: {
    color: "#6AC3CE",
  },
  iconText: {
    fontSize: 32,
  },
  iconSequenceContainer: {
    flexDirection: "row",
    gap: 2,
  },
  lockBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    padding: 2,
  },
  mixCard: {
    width: "100%",
    aspectRatio: undefined,
    height: "auto",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  mixCardLabel: {
    marginTop: 0,
    textAlign: "left",
    flex: 1,
    marginLeft: 16,
  },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  tabActive: {
    borderColor: "#6AC3CE",
  },
  tabLabel: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#6AC3CE",
  },
  petCard: {
    backgroundColor: "white",
    borderRadius: 10,
    width: "48%",
    aspectRatio: 1,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  petCardImage: {
    flex: 1,
    width: "100%",
    resizeMode: "contain",
  },
});
