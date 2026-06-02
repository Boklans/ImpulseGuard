import PetCard from "@/components/screens/pets/PetCard";
import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { usePets } from "@/hooks/usePets";
import { useAppSelector } from "@/hooks/reduxHooks";
import { EmptyView } from "@/components/ui/EmptyView";
import PawIcon from "@/assets/icons/paw.svg";

export default function PetsScreen() {
  const { user } = useAppSelector((state) => state.user);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePets(user?._id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6AC3CE" />
      </SafeAreaView>
    );
  }

  const pets = data?.pages.flatMap((page) => page.pets) ?? [];
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={pets}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 80).duration(400).springify()}
            style={{ width: "48%" }}
          >
            <PetCard pet={item} />
          </Animated.View>
        )}
        keyExtractor={(item) => item._id}
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
            title={"It’s a bit empty here…"}
            description={"But every egg is a chance to meet a new friend!"}
            icon={PawIcon}
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
    gap: 8,
  },
});
