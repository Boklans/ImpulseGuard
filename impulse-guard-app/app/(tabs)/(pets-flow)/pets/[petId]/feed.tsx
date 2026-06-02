import React from "react";
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  View,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import { FoodImages, PotionsImages } from "@/constants/Config";
import { useItems, useUseItem } from "@/hooks/useItems";
import { useAppSelector } from "@/hooks/reduxHooks";
import FoodIcon from "@/assets/icons/cooking-pot.svg";
import { EmptyView } from "@/components/ui/EmptyView";
import { ItemCard } from "@/components/screens/items/ItemCard";
import { ToastPill } from "@/components/ui/ToastPill";
import { ToastOverlay } from "@/components/screens/pets/ToastOverlay";

export default function PetFeedScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { user } = useAppSelector((state) => state.user);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useItems(user?._id);
  const { mutate: useItem, isPending } = useUseItem();
  const [pill, setPill] = React.useState<{
    visible: boolean;
    icon: any;
    title: string;
    hp?: number;
    energy?: number;
  }>({ visible: false, icon: null, title: "" });

  const items = data?.pages
    .flatMap((page) => page.items)
    .filter(
      (item) =>
        (item.item.type === "food" || item.item.type === "potion") &&
        item.amount > 0
    );

  const renderItem = (item: any) => {
    const itemInfo = { ...item.item, itemRef: item.itemRef };

    if (item.amount == 0) return null;

    if (itemInfo.type === "food")
      return (
        <ItemCard
          recoverEnergy={itemInfo.recoverEnergy}
          recoverHealth={itemInfo.recoverHealth}
          count={item.amount}
          rarity={itemInfo.rarity.toUpperCase()}
          image={FoodImages.get(itemInfo.imageId.toString())}
          onPress={() => handleUseItem(itemInfo.itemRef)}
        />
      );
    else if (itemInfo.type === "potion")
      return (
        <ItemCard
          recoverEnergy={itemInfo.recoverEnergy}
          recoverHealth={itemInfo.recoverHealth}
          count={item.amount}
          rarity={itemInfo.rarity.toUpperCase()}
          image={PotionsImages.get(itemInfo.imageId.toString())}
          onPress={() => handleUseItem(itemInfo.itemRef)}
        />
      );
    else return null;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6AC3CE" />
      </SafeAreaView>
    );
  }

  function handleUseItem(itemRef: string) {
    if (!user?._id || !petId) return;

    const entry = items?.find((i) => i.itemRef === itemRef);
    const info = entry?.item;
    if (!info) return;

    useItem(
      { userId: user._id, petId, itemRef },
      {
        onSuccess: () => {
          showPill({
            icon:
              info.type === "food"
                ? FoodImages.get(info.imageId.toString())
                : PotionsImages.get(info.imageId.toString()),
            title: `${info.name ?? itemRef} x 1`,
            hp: info.recoverHealth,
            energy: info.recoverEnergy,
          });
        },
        onError: (e: any) => {
          Alert.alert("Sorry", "You cannot feed your pet right now. It already has full health.");
        },
      }
    );
  }

  function showPill(opts: {
    icon: any;
    title: string;
    hp?: number;
    energy?: number;
  }) {
    setPill({ visible: true, ...opts });
  }

  return (
    <View style={styles.container}>
      <ToastOverlay
        visible={pill.visible}
        icon={pill.icon}
        title={pill.title}
        hp={pill.hp}
        energy={pill.energy}
        onHide={() => setPill((p) => ({ ...p, visible: false }))}
      />
      <FlatList
        data={items}
        renderItem={(item) => renderItem(item.item)}
        keyExtractor={(item, index) => item.itemRef}
        numColumns={2}
        columnWrapperStyle={styles.gridContainer}
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
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyView
            title={"No food"}
            description={"You will get one in battle with your impulse"}
            icon={FoodIcon}
            style={{ marginTop: "auto" }}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "space-between",
  },
});
