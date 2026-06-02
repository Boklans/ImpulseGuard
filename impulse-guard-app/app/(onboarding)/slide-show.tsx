import { SafeAreaView, View, Text, StyleSheet, Image } from "react-native";
import PawIcon from "@/assets/icons/paw.svg";
import BrainIcon from "@/assets/icons/brain.svg";
import ClockIcon from "@/assets/icons/clock.svg";
import React, { useRef, useState } from "react";
import { router } from "expo-router";
import Button from "@/components/ui/Button";
import { Slider } from "@/components/Slider";
import { SliderRef } from "@/components/Slider";

export default function slideShow() {
  const Icons = (
    <View style={styles.iconsContainer}>
      <View style={styles.iconBlock}>
        <BrainIcon width={80} />
        <ClockIcon width={80} />
        <PawIcon width={80} />
      </View>
      <View style={styles.iconBlock}>
        <Text style={styles.iconDescription}>Better habits</Text>
        <Text style={styles.iconDescription}>10-minutes sessions</Text>
        <Text style={styles.iconDescription}>Virtual pets</Text>
      </View>
    </View>
  );

  const [slide, setSlide] = useState(0);

  const buttonText = ["Next", "Next", "Start your journey"];

  const sliderRef = useRef<SliderRef>(null);

  const handleNextSlide = () => {
    sliderRef.current?.goToNextSlide();
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F2F2F7", alignItems: "center" }}
    >
      <View style={styles.container}>
        <Slider ref={sliderRef} onChangeSlide={setSlide}>
          <View style={styles.slide}>
            <Image
              source={require("@/assets/images/onBoarding/onBoarding1.png")}
              alt="onBoarding1"
              style={styles.slideImage}
            />
            <View style={styles.textBox}>
              <Text style={styles.title}>Impulses steal your time</Text>
              <Text style={styles.description}>Pause before you act</Text>
            </View>
            {Icons}
          </View>
          <View style={styles.slide}>
            <Image
              source={require("@/assets/images/onBoarding/onBoarding2.png")}
              alt="onBoarding2"
              style={styles.slideImage}
            />
            <View style={styles.textBox}>
              <Text style={styles.title}>Build winning streaks</Text>
              <Text style={styles.description}>
                Keep going, one day at a time
              </Text>
            </View>
            {Icons}
          </View>
          <View style={styles.slide}>
            <Image
              source={require("@/assets/images/onBoarding/onBoarding3.png")}
              alt="onBoarding3"
              style={styles.slideImage}
            />
            <View style={styles.textBox}>
              <Text style={styles.title}>Hatch a loyal friend </Text>
              <Text style={styles.description}>
                Your progress gives it life
              </Text>
            </View>
            {Icons}
          </View>
        </Slider>
        <Button
          title={buttonText[slide]}
          onPress={
            slide === 2
              ? () => router.push("/(auth)/sign-in")
              : () => {
                  handleNextSlide();
                }
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "medium",
  },
  container: {
    display: "flex",
    flex: 1,
    width: "100%",
    maxWidth: 500,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    backgroundColor: "#F2F2F7",
    gap: 16,
  },
  description: {
    fontSize: 16,
  },
  iconsContainer: {
    display: "flex",
    flexDirection: "column",
    marginTop: 17,
    width: "100%",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  iconBlock: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
  },
  iconDescription: {
    fontSize: 12,
    width: 80,
    textAlign: "center",
  },
  textBox: {
    alignItems: "center",
    gap: 8,
  },
  slideImage: {
    flexShrink: 0,
    width: "100%",
    resizeMode: "contain",
  },
  slide: {
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 19,
    alignItems: "center",
    backgroundColor: "white",
  },
});
