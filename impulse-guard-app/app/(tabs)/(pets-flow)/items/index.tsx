import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";

import FoodIcon from "@/assets/icons/cooking-pot.svg";
import { useItems } from "@/hooks/useItems";
import { useAppSelector } from "@/hooks/reduxHooks";
import { ItemCard } from "@/components/screens/items/ItemCard";
import { EmptyView } from "@/components/ui/EmptyView";
import { FoodImages, PotionsImages, ToysImages } from "@/constants/Config";

export default function ItemsScreen() {
  const { user } = useAppSelector((state) => state.user);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useItems(user?._id);
  const items = data?.pages
    .flatMap((page) => page.items)
    .filter((i) => i.amount > 0);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6AC3CE" />
      </SafeAreaView>
    );
  }

  const renderItem = (item: any) => {
    const itemInfo = item.item;

    if (item.amount == 0) return null;

    if (itemInfo.type === "food")
      return (
        <ItemCard
          recoverEnergy={itemInfo.recoverEnergy}
          recoverHealth={itemInfo.recoverHealth}
          count={item.amount}
          rarity={itemInfo.rarity.toUpperCase()}
          image={FoodImages.get(itemInfo.imageId.toString())}
        />
      );
    else if (itemInfo.type === "toy")
      return (
        <ItemCard
          addFriendship={itemInfo.addFriendship}
          rarity={itemInfo.rarity.toUpperCase()}
          count={item.amount}
          image={ToysImages.get(itemInfo.imageId.toString())}
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
        />
      );
    else return null;
  };

  return (
    <SafeAreaView style={styles.container}>
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
            title={"Your backpack is empty"}
            description={
              "Complete focus sessions to earn items and care for your pets!"
            }
            icon={FoodIcon}
          />
        }
      />
    </SafeAreaView>
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
