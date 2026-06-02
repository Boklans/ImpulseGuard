import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ToysImages } from "@/constants/Config";
import FoodIcon from "@/assets/icons/cooking-pot.svg";
import { useAppSelector } from "@/hooks/reduxHooks";
import { useItems, useUseItem } from "@/hooks/useItems";
import { EmptyView } from "@/components/ui/EmptyView";
import { ItemCard } from "@/components/screens/items/ItemCard";
import { ToastOverlay } from "@/components/screens/pets/ToastOverlay";

export default function PetPlayScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { user } = useAppSelector((state) => state.user);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useItems(user?._id);
  const { mutate: useItem } = useUseItem();

  const [pill, setPill] = React.useState<{
    visible: boolean;
    icon: any;
    title: string;
    friendship?: number;
  }>({ visible: false, icon: null, title: "" });

  const items =
    data?.pages
      .flatMap((page) => page.items)
      .filter((i) => i.item.type === "toy" && i.amount > 0) ?? [];

  function handleUseItem(itemRef: string) {
    if (!user?._id || !petId) return;
    const entry = items.find((i) => i.itemRef === itemRef);
    const info = entry?.item;
    if (!info) return;

    useItem(
      { userId: user._id, petId, itemRef },
      {
        onSuccess: () => {
          setPill({
            visible: true,
            icon: ToysImages.get(info.imageId.toString()),
            title: `${info.name ?? itemRef} x 1`,
            friendship: info.addFriendship,
          });
        },
        onError: (e: any) => {
          Alert.alert("Sorry", "You cannot play with your pet right now. It already has full friendship.");
        },
      }
    );
  }

  const renderItem = ({ item }: any) => {
    const info = item.item;
    if (item.amount === 0) return null;

    return (
      <ItemCard
        addFriendship={info.addFriendship}
        rarity={info.rarity.toUpperCase()}
        count={item.amount}
        image={ToysImages.get(info.imageId.toString())}
        onPress={() => handleUseItem(item.itemRef)}
      />
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6AC3CE" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ToastOverlay
        visible={pill.visible}
        icon={pill.icon}
        title={pill.title}
        friendship={pill.friendship}
        onHide={() => setPill((p) => ({ ...p, visible: false }))}
      />

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(i) => i.itemRef}
        numColumns={2}
        columnWrapperStyle={styles.gridContainer}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
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
            title={"No toys"}
            description={"You will get one in battle with your impulse"}
            icon={FoodIcon}
            style={{ marginTop: "auto" }}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "space-between",
  },
});
