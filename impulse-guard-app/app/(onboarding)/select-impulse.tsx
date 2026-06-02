import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ImpulsesList } from "@/constants/configs/impulses.config";
import { useAnalytics, AnalyticsEvents } from "@/hooks/useAnalytics";

export default function ImpulsesScreen() {
  const [showTopFade, setShowTopFade] = useState(false);
  const { track } = useAnalytics();

  useEffect(() => {
    track(AnalyticsEvents.ONBOARDING_STARTED);
  }, [track]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = e.nativeEvent.contentOffset.y;

    setShowTopFade(yOffset > 5);
  };

  const handleImpulseSelect = (impulseId: number) => {
    track(AnalyticsEvents.ONBOARDING_IMPULSE_SELECTED, { impulse_id: impulseId });
    router.push(`/(onboarding)/add-name?id=${impulseId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require("@/assets/images/maskot.png")}
          style={styles.mascotImage}
        />
        <View style={styles.bubbleContainer}>
          <Text style={styles.bubbleText}>
            Let's start. Select funny picture
            {"\n"}for your impulse!
          </Text>
        </View>
      </View>

      <Text style={styles.title}>Available impulses</Text>

      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.grid}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {ImpulsesList.map((impulse) => (
            <ImpulseCard
              key={impulse.id}
              data={impulse}
              onSelect={handleImpulseSelect}
            />
          ))}
        </ScrollView>

        {showTopFade && (
          <LinearGradient
            colors={["rgba(242,242,247,1)", "rgba(242,242,247,0)"]}
            style={styles.topFade}
            pointerEvents="none"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function ImpulseCard({
  data,
  onSelect,
}: {
  data: { id: number; image: any };
  onSelect: (id: number) => void;
}) {
  return (
    <Pressable style={styles.card} onPress={() => onSelect(data.id)}>
      <Image source={data.image} style={styles.cardImage} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 16,
    alignSelf: "center",
    width: "100%",
    maxWidth: 500,
  },
  headerContainer: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
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
  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 16,
    marginLeft: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
    height: 200,
  },

  // Саме fade/градієнт, що розміщується по нижньому краю
  bottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60, // Висота зони fade, підбери на смак
  },
});
