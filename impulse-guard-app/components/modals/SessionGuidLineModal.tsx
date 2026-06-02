import ModalWithBlur from "@/components/ui/BluredModal";
import React, { useRef, useState } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import { Slider, SliderRef } from "@/components/Slider";
import Button from "@/components/ui/Button";
import CheckBox from "@/components/ui/CheckBox";
import { useSetDidWatch } from "@/hooks/useUserLocalStorage";

type SessionGuidLineModalProps = {
  isOpened: boolean;
  onClose: () => void;
};

export function SessionGuidLineModal({
  isOpened,
  onClose,
}: SessionGuidLineModalProps) {
  const { mutate: setDidWatch } = useSetDidWatch();

  const [slide, setSlide] = useState(0);

  const buttonText = ["Next", "Next", "Start your journey"];

  const sliderRef = useRef<SliderRef>(null);

  const handleNextSlide = () => {
    setSlide(slide + 1);
    sliderRef.current?.goToNextSlide();
  };

  const [isChecked, setIsChecked] = React.useState(false);

  return (
    <ModalWithBlur
      style={styles.root}
      opened={isOpened}
      close={() => onClose()}
    >
      <View style={{ alignItems: "center" }}>
        <Text style={styles.title}>Session setup</Text>
        <Text style={styles.description}>Get quick guidance</Text>
      </View>

      <Slider
        ref={sliderRef}
        style={{ gap: 16 }}
        onChangeSlide={(slide) => setSlide(slide)}
      >
        <View style={styles.slide}>
          <Text style={styles.slideTitle}>Choose an activity</Text>
          <Image
            style={styles.slideImage}
            source={require("@/assets/images/chooseActivity.png")}
          />
          <Text style={styles.textSlide}>
            🎯 Tap on an activity you enjoy — it will help reduce your impulse
            faster.
          </Text>
        </View>
        <View style={styles.slide}>
          <Text style={styles.slideTitle}>Choose an activity</Text>
          <Image
            style={styles.slideImage}
            source={require("@/assets/images/setMood.png")}
          />
          <Text style={styles.textSlide}>
            🎧 Tap up to 4 relaxing sounds — they’ll play during your session.
          </Text>
        </View>
        <View style={styles.slide}>
          <Text style={styles.slideTitle}>Choose an activity</Text>
          <Image
            style={styles.slideImage}
            source={require("@/assets/images/bringPet.png")}
          />
          <Text style={styles.textSlide}>
            🐾 Choose a pet — it joins your session and grows stronger with you.
          </Text>
        </View>
      </Slider>
      <View style={{ width: "100%", alignItems: "center" }}>
        <Button
          style={{ width: "100%" }}
          title={buttonText[slide]}
          onPress={
            slide === 2
              ? () => {
                  onClose();
                }
              : () => {
                  handleNextSlide();
                }
          }
        />
        {slide === 2 && (
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 16,
              alignItems: "center",
            }}
          >
            <CheckBox
              value={isChecked}
              onToggle={() => {
                setIsChecked(!isChecked);
                setDidWatch({ didWatchSessionGuid: true });
              }}
            />
            <Text>Don’t show this again</Text>
          </View>
        )}
      </View>
    </ModalWithBlur>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 500,
  },
  description: {
    color: "#6C6C6C",
    fontSize: 16,
    fontWeight: 300,
  },
  slide: {
    width: "100%",
    padding: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    gap: 32,
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: 500,
  },
  slideImage: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
  },
  textSlide: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: 400,
  },
});
