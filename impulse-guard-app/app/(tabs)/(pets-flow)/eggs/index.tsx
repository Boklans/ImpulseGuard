import StartEggHatchingModal from "@/components/modals/StartEggHatchingModal";
import EggCard from "@/components/screens/eggs/EggCard";
import EggIcon from "@/assets/icons/egg.svg";
import PlusIcon from "@/assets/icons/plus.svg";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
  useEggs,
  useFinishEggHatching,
  useQuickHatch,
  useStartEggHatching,
} from "@/hooks/useEggs";
import React, { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Pressable,
  Text,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import ReadyToOpenModal from "@/components/modals/ReadyToOpenModal";
import NewPetModal from "@/components/modals/NewPetModal";
import { useUpdatePet } from "@/hooks/usePets";
import { ErrorEggHatchingModal } from "@/components/modals/ErrorEggHatchingModal";
import { EmptyView } from "@/components/ui/EmptyView";
import SellEggModal from "@/components/modals/SellEggModal";
import BuyEggModal from "@/components/modals/BuyEggModal";
import { useEggPrices, useSellEgg, useBuyEgg } from "@/hooks/useShop";
import { updateUser } from "@/redux/slices/user";

export default function EggsScreen() {
  const { user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useEggs(user?._id);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [currentEgg, setCurrentEgg] = useState<any>(null);
  const [isReadyToOpenModal, setIsReadyToOpenModal] = useState(false);
  const [newPetModalVisible, setNewPetModalVisible] = useState(false);
  const [newPet, setNewPet] = useState<any>(null);
  const [isSellModalVisible, setIsSellModalVisible] = useState(false);
  const [isBuyModalVisible, setIsBuyModalVisible] = useState(false);

  const { mutate: finishHatching } = useFinishEggHatching();
  const { mutate: startHatching } = useStartEggHatching();
  const { mutate: renamePet } = useUpdatePet();
  const { mutate: quickHatch } = useQuickHatch();
  const { data: prices } = useEggPrices();
  const { mutate: sellEgg, isPending: isSelling } = useSellEgg();
  const { mutate: buyEgg, isPending: isBuying } = useBuyEgg();

  const getSellPrice = () => {
    return prices?.common?.sell ?? 0;
  };

  const handlePressEggCard = (egg: any) => {
    setCurrentEgg(egg);

    const now = new Date();
    const hatchEnd = egg.hatchEndTime ? new Date(egg.hatchEndTime) : null;

    if (hatchEnd && now >= hatchEnd && !egg.isHatched) {
      setIsReadyToOpenModal(true);
    } else if (!egg.hatchStartTime && !egg.isHatched) {
      setIsModalVisible(true);
    }
  };

  const handleStartHatching = () => {
    if (!currentEgg) return;
    startHatching(currentEgg._id, {
      onSuccess: () => {
        setIsModalVisible(false);
      },
      onError: (err: any) => {
        setIsModalVisible(false);
        if (
          err?.response?.data?.message ===
          "Another egg is already being hatched."
        ) {
          setIsErrorModalVisible(true);
        } else {
          alert("Failed to start hatching");
        }
      },
    });
  };

  const handleFinishHatching = () => {
    if (!currentEgg) return;
    finishHatching(currentEgg._id, {
      onSuccess: (data) => {
        setNewPet(data);
        setIsReadyToOpenModal(false);
        setNewPetModalVisible(true);
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message ?? "Failed to finish hatching");
      },
    });
  };

  const handleQuickHatching = () => {
    if (!currentEgg) return;

    quickHatch(currentEgg._id, {
      onSuccess: (data) => {
        setIsErrorModalVisible(false);
        setNewPet(data.pet);
        setNewPetModalVisible(true);
      },
      onError: (err: any) => {
        setIsErrorModalVisible(false);
        alert(err?.response?.data?.message ?? "Failed to quick hatch the egg.");
      },
    });
  };

  const handleOpenSellModal = () => {
    setIsModalVisible(false);
    setIsSellModalVisible(true);
  };

  const handleSellEgg = () => {
    if (!currentEgg) return;
    sellEgg(currentEgg._id, {
      onSuccess: (data) => {
        setIsSellModalVisible(false);
        dispatch(updateUser(data.user));
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message ?? "Failed to sell the egg.");
      },
    });
  };

  const handleBuyEgg = () => {
    buyEgg(undefined, {
      onSuccess: (data) => {
        setIsBuyModalVisible(false);
        dispatch(updateUser(data.user));
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message ?? "Failed to buy the egg.");
      },
    });
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
      <FlatList
        data={data?.pages.flatMap((page) => page.eggs)}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 80).duration(400).springify()}
            style={{ width: "48%" }}
          >
            <EggCard egg={item} handlePress={() => handlePressEggCard(item)} />
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
            title={"No eggs"}
            description={"You will get one in battle with your impulse"}
            icon={EggIcon}
          />
        }
      />

      <ErrorEggHatchingModal
        close={() => setIsErrorModalVisible(false)}
        opened={isErrorModalVisible}
        action={handleQuickHatching}
        costToHatch={50}
      />
      <StartEggHatchingModal
        opened={isModalVisible}
        close={() => setIsModalVisible(false)}
        action={handleStartHatching}
        image={currentEgg?.imageUrl}
        timeToHatch={currentEgg?.hatchDurationMs}
        onSell={handleOpenSellModal}
        sellPrice={getSellPrice()}
      />
      <ReadyToOpenModal
        opened={isReadyToOpenModal}
        close={() => setIsReadyToOpenModal(false)}
        action={handleFinishHatching}
        image={currentEgg?.imageUrl}
      />
      <NewPetModal
        pet={newPet}
        opened={newPetModalVisible}
        close={() => setNewPetModalVisible(false)}
        action={(name) => {
          if (newPet?._id) {
            renamePet({ petId: newPet._id, data: { name } });
          }
        }}
      />
      <SellEggModal
        opened={isSellModalVisible}
        egg={currentEgg}
        sellPrice={getSellPrice()}
        close={() => setIsSellModalVisible(false)}
        action={handleSellEgg}
        isLoading={isSelling}
      />
      <BuyEggModal
        opened={isBuyModalVisible}
        prices={prices}
        userGlims={user?.glims || 0}
        close={() => setIsBuyModalVisible(false)}
        action={handleBuyEgg}
        isLoading={isBuying}
      />

      <Pressable
        style={styles.buyButton}
        onPress={() => setIsBuyModalVisible(true)}
      >
        <PlusIcon width={24} height={24} color="white" />
        <Text style={styles.buyButtonText}>Buy Egg</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: "100%",
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
  buyButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#6AC3CE",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
