import { Stack, usePathname, router, useLocalSearchParams } from "expo-router";
import Tabs from "@/components/ui/Tabs";
import {
  ActivityIndicator,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  TextInput,
  TextInputSubmitEditingEventData,
  View,
} from "react-native";
import InfoSvg from "@/assets/icons/info.svg";
import FeedSvg from "@/assets/icons/feed.svg";
import PlaySvg from "@/assets/icons/play.svg";
import PencilSvg from "@/assets/icons/Pencil.svg";
import StarMutedSvg from "@/assets/icons/star_muted.svg";
import StarSvg from "@/assets/icons/star.svg";
import { Image, Text, StyleSheet } from "react-native";
import { useAppSelector } from "@/hooks/reduxHooks";
import { usePets, useUpdatePet } from "@/hooks/usePets";
import React from "react";

import { Colors } from "@/constants/Colors";

import { Slot } from "expo-router";
import { PetsList } from "@/constants/configs/pets.config";

export default function PetLayout({ children }: { children: React.ReactNode }) {
  const { petId } = useLocalSearchParams<{ petId: string }>();

  const pathname = usePathname();
  const active = [
    `/pets/${petId}`,
    `/pets/${petId}/feed`,
    `/pets/${petId}/play`,
  ].indexOf(pathname);

  const { user } = useAppSelector((state) => state.user);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePets(user?._id);
  const { mutate: updatePet } = useUpdatePet();

  const pets = data?.pages.flatMap((page) => page.pets) ?? [];
  const pet = pets?.find((pet) => pet._id === petId);
  const imageItem = PetsList.find((i) => i.id === Number(pet.imageUrl));

  const [isChangeable, setIsChangeable] = React.useState(false);
  const [nameInputValue, setNameInputValue] = React.useState(pet.name);
  const tabs = [
    {
      label: "Info",
      icon: <InfoSvg />,
      onPress: () => {
        router.push(`/pets/${petId}`);
      },
    },
    {
      label: "Feed",
      icon: <FeedSvg />,
      onPress: () => {
        router.push(`/pets/${petId}/feed`);
      },
    },
    {
      label: "Play",
      icon: <PlaySvg />,
      onPress: () => {
        router.push(`/pets/${petId}/play`);
      },
    },
  ];

  const handleChangeName = (
    event: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => {
    const newName: string = event.nativeEvent.text;
    if (newName === "" || newName === pet.name) {
      setIsChangeable(false);
      setNameInputValue(pet.name);
      return;
    }
    pet.name = newName;
    updatePet({ petId: petId, data: { name: newName } });
    setIsChangeable(false);
  };

  const handleStar = () => {
    pet.isFavorite = !pet.isFavorite;
    updatePet({ petId: petId, data: { isFavorite: pet.isFavorite } });
  };

  return (
    <ScrollView
      contentContainerStyle={{ backgroundColor: "#F2F2F7", paddingTop: 24 }}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View
        style={{
          gap: 8,
          padding: 13,
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: 10,
          marginBottom: 12,
          width: "100%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <View>{/* Don't touch that! */}</View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {isChangeable ? (
              <TextInput
                style={styles.title}
                defaultValue={pet.name}
                value={nameInputValue}
                onChangeText={setNameInputValue}
                onSubmitEditing={handleChangeName}
                autoFocus={true}
              />
            ) : (
              <Text style={styles.title}>{pet.name}</Text>
            )}
            <Pressable onPress={() => setIsChangeable(true)}>
              <PencilSvg width={20} height={20} color={Colors.light.primary} />
            </Pressable>
          </View>
          <Pressable onPress={handleStar}>
            {pet.isFavorite ? (
              <StarSvg height={32} width={32} />
            ) : (
              <StarMutedSvg height={32} width={32} />
            )}
          </Pressable>
        </View>
        {isLoading ? (
          <SafeAreaView style={{ height: 256 }}>
            <ActivityIndicator size="large" color="#6AC3CE" />
          </SafeAreaView>
        ) : (
          <Image
            source={imageItem?.image}
            style={{ height: 256, resizeMode: "contain" }}
          />
        )}
      </View>
      <Tabs
        tabs={tabs}
        layout="vertical"
        activeIndex={active}
        style={{
          marginBottom: 11,
        }}
      />
      <Stack.Screen options={{ headerShown: false, animation: "fade" }} />
      <Slot />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
});
