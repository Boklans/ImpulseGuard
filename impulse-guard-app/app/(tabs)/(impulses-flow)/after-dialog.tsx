import { Colors } from "@/constants/Colors";
import { useImpulse } from "@/contexts/impulseContext";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  BackHandler,
  Image,
  ActivityIndicator,
} from "react-native";
import { useFinishSession } from "@/hooks/useImpulses";
import { setLastSessionRewards, updateUser } from "@/redux/slices/user";
import { useQueryClient } from "@tanstack/react-query";
import { SessionDialogues } from "@/constants/Config";
import { useAnalytics, AnalyticsEvents } from "@/hooks/useAnalytics";

export default function AfterSessionDialogPage() {
  const { petId, duration } = useLocalSearchParams<{
    petId: string;
    duration: string;
  }>();
  const { selectedImpulseId } = useImpulse();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { mutateAsync } = useFinishSession();
  const { track } = useAnalytics();
  const [selectedDialogue, setSelectedDialogue] = useState<
    (typeof SessionDialogues)[0] | null
  >(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SessionDialogues.length);
    setSelectedDialogue(SessionDialogues[randomIndex]);

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );

    return () => backHandler.remove();
  }, []);

  const [locked, setLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReportResult = useCallback(
    async (status: boolean) => {
      if (locked) return;
      setLocked(true);
      setIsLoading(true);

      try {
        const response: any = await mutateAsync({
          impulseId: selectedImpulseId!,
          userId: user?._id!,
          selectedPetId: petId as string,
          status,
          duration: Number(duration) || 300,
        });

        track(AnalyticsEvents.SESSION_COMPLETED, {
          status: status ? "success" : "failure",
          duration: Number(duration) || 300,
          has_pet: !!petId,
        });

        const rewardsMap = new Map(
          (response?.rewards ?? []).map(
            (r: {
              type: string;
              kind?: string;
              amount: number;
              id?: number;
            }) => [r.kind ?? r.type, { amount: r.amount, id: r.id }]
          )
        );

        dispatch(updateUser(response.user));
        queryClient.invalidateQueries({ queryKey: ["eggs", user?._id] });
        dispatch(setLastSessionRewards(Object.fromEntries(rewardsMap)));

        router.replace({
          pathname: "/(tabs)/(impulses-flow)/congratulations",
          params: { status: status ? "success" : "failure" },
        });
      } catch (err) {
        console.error("finishSession error:", err);
        setIsLoading(false);
      } finally {
        setLocked(false);
      }
    },
    [
      locked,
      mutateAsync,
      selectedImpulseId,
      user,
      petId,
      duration,
      queryClient,
      dispatch,
      track,
    ]
  );

  return (
    <View style={styles.container}>
      {selectedDialogue && (
        <>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              gap: 9,
              height: 64,
            }}
          >
            <View style={[styles.textContainer, { flexGrow: 0 }]}>
              <Image
                source={require("@/assets/images/maskot.png")}
                style={styles.image}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.header}>{selectedDialogue.prompt[0]}</Text>
            </View>
          </View>
          <View style={[styles.textContainer, { width: "100%", flexGrow: 0 }]}>
            <Text style={styles.header}>{selectedDialogue.prompt[1]}</Text>
          </View>

          <View style={{ gap: 16, width: "100%", marginTop: "auto" }}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={Colors.light.tabIconSelected}
                />
                <Text style={styles.loadingText}>Getting your rewards...</Text>
              </View>
            ) : (
              <>
                <Pressable
                  disabled={locked}
                  onPress={() => {
                    handleReportResult(true);
                  }}
                  style={{
                    backgroundColor: Colors.light.tabIconSelected,
                    width: "100%",
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 20,
                    }}
                  >
                    {selectedDialogue.success}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={locked}
                  onPress={() => {
                    handleReportResult(false);
                  }}
                  style={{
                    backgroundColor: Colors.light.tabIconSelected,
                    width: "100%",
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 20,
                    }}
                  >
                    {selectedDialogue.failure}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 27,
    gap: 6,
  },
  textContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    flexGrow: 1,
    justifyContent: "center",
  },
  image: {
    aspectRatio: 1,
    objectFit: "contain",
    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: "regular",
  },
  timerText: {
    fontSize: 48,
    fontWeight: "light",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  loadingText: {
    color: "#666",
    fontSize: 16,
    marginTop: 12,
  },
});
