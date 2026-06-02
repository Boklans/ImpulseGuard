import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  Image,
  ActivityIndicator,
  FlatList,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { useImpulses } from "@/hooks/useImpulses";
import SelectStreakGoalModal from "@/components/modals/SelectStreakGoalModal";
import { useCheckUserStreak, useSetStreakGoal } from "@/hooks/useUser";
import StreakSuccessModal from "@/components/modals/StreakSuccesModal";

import { updateUser } from "@/redux/slices/user";
import PlusIcon from "@/assets/icons/plus.svg";
import LockIcon from "@/assets/icons/lock.svg";
import { ImpulsesList } from "@/constants/configs/impulses.config";
import { usePaywall, usePremium } from "@/hooks/usePaywall";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";

const FREE_IMPULSE_LIMIT = 3;

export default function ImpulsesScreen() {
  const { user } = useAppSelector((state) => state.user);
  const { data, isLoading, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useImpulses(user?._id);

  const impulses = data?.pages?.flatMap((page) => page.impulses) || [];
  const showLoading = !user?._id || isLoading || (isFetching && impulses.length === 0);
  const { mutate: setGoal } = useSetStreakGoal();
  const { mutateAsync: checkStreak } = useCheckUserStreak();
  const dispatch = useAppDispatch();

  const userGoal = user?.streakInfo?.goal;
  const userDeclined = user?.streakInfo?.declined;
  const userNextPromptDate = user?.streakInfo?.nextPromptDate;

  const noGoalAndNotDeclined = userGoal === 0 && !userDeclined;
  const isPromptDue =
    userNextPromptDate && new Date(userNextPromptDate) < new Date();
  const isGoalUndefined = userGoal === undefined;

  const initialIsModalOpen =
    (noGoalAndNotDeclined || isPromptDue || isGoalUndefined) &&
    (user?.experience ?? 0) > 0;

  const [isModalOpen, setIsModalOpen] = useState(initialIsModalOpen);

  const [isRewardModal, setIsRewardModal] = useState(false);
  const [awardedXp, setAwardedXp] = useState(0);

  async function onCompleteImpulse() {
    if (!user?._id) return;

    try {
      const data = await checkStreak({
        userId: user._id,
      });
      if (data.streakReached) {
        dispatch(updateUser(data.user));
        setIsRewardModal(true);
        setAwardedXp(data.xpAwarded);
      }
    } catch (err) {
      console.log("checkStreak error:", err);
    }
  }

  useEffect(() => {
    onCompleteImpulse();
  }, [user?._id]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Impulses</Text>
      {showLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6AC3CE" />
        </View>
      ) : (
        <FlatList
        data={[
          ...impulses,
          { _id: "new", isPlaceholder: true },
        ]}
        renderItem={({ item, index }) =>
          item.isPlaceholder ? (
            <Animated.View
              entering={FadeInUp.delay(index * 80).duration(400).springify()}
              style={{ width: "48%" }}
            >
              <NewImpulseCard impulseCount={impulses.length} />
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeInUp.delay(index * 80).duration(400).springify()}
              style={{ width: "48%" }}
            >
              <ImpulseCard impulse={item} />
            </Animated.View>
          )
        }
        keyExtractor={(item) => item._id}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#6AC3CE" />
          ) : null
        }
        numColumns={2}
        columnWrapperStyle={styles.gridContainer}
      />
      )}
      <SelectStreakGoalModal
        opened={isModalOpen}
        close={() => {
          setIsModalOpen(false);
        }}
        action={(amount: string) => {
          setIsModalOpen(false);
          setGoal({
            userId: user?._id!,
            goal: parseInt(amount),
          });
        }}
      />
      <StreakSuccessModal
        opened={isRewardModal}
        close={() => setIsRewardModal(false)}
        rewardXP={awardedXp}
        onAction={() => {
          setIsRewardModal(false);
        }}
      />
    </SafeAreaView>
  );
}

function NewImpulseCard({ impulseCount }: { impulseCount: number }) {
  const { isPremium } = usePremium();
  const { openPaywall } = usePaywall();

  const isLocked = !isPremium && impulseCount >= FREE_IMPULSE_LIMIT;

  function handlePress() {
    if (isLocked) {
      openPaywall();
      return;
    }
    router.push({
      pathname: "/(onboarding)/select-impulse",
    });
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.card,
        styles.cardFullWidth,
        {
          borderWidth: 2,
          borderColor: isLocked ? "#A0A0A0" : "#6AC3CE",
          borderStyle: "dashed",
          alignItems: "center",
          justifyContent: "center",
          minHeight: styles.cardImage.height + styles.cardTitle.fontSize + 32,
          opacity: isLocked ? 0.6 : 1,
        },
      ]}
    >
      {isLocked ? (
        <View style={{ alignItems: "center", gap: 8 }}>
          <LockIcon width={32} height={32} color="#A0A0A0" />
          <Text style={{ color: "#A0A0A0", fontSize: 12, textAlign: "center" }}>
            Upgrade to add{"\n"}more impulses
          </Text>
        </View>
      ) : (
        <PlusIcon width={48} height={48} color="#6AC3CE" />
      )}
    </AnimatedPressable>
  );
}

function ImpulseCard({ impulse }: { impulse: any }) {
  const imageItem = ImpulsesList.find(
    (i) => i.id === Number(impulse.avatarUrl)
  );

  function handlePress() {
    router.push(`/(tabs)/(impulses-flow)/${impulse._id}` as any);
  }

  if (!imageItem) {
    return (
      <AnimatedPressable onPress={handlePress} style={[styles.card, styles.cardFullWidth]}>
        <Text style={styles.cardTitle}>{impulse.name}</Text>
        <Text style={styles.cardSubtitle}>
          Sessions: {impulse.sessionsCount}
        </Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable onPress={handlePress} style={[styles.card, styles.cardFullWidth]}>
      <Image source={imageItem.image} style={styles.cardImage} />
      <Text style={styles.cardTitle}>{impulse.name}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "400",
    marginTop: 16,
    marginBottom: 8,
    color: "#6C6C6C",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingBottom: 16,
    marginBottom: 16,
    padding: 8,
  },
  cardFullWidth: {
    width: "100%",
  },
  cardImage: {
    height: 195,
    width: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#808080",
    textAlign: "center",
    marginTop: 4,
  },
});
