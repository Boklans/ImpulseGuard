import {
  SafeAreaView,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Pressable,
} from "react-native";
import ModalWithBlur from "@/components/ui/BluredModal";
import { Colors } from "@/constants/Colors";
import { ShopImages } from "@/constants/Config";
import CrossIcon from "@/assets/icons/x.svg";
import { useState } from "react";

type ShopModalProps = {};

type OptionProps = {
  value: number;
  price: number;
  image: string;
};

const OptionCard = ({ value, price, image }: OptionProps) => {
  return (
    <View style={styles.optionRoot}>
      <View style={styles.priceLabel}>
        <Image source={require("@/assets/icons/glim.png")} />
        <Text style={styles.priceText}>{value}</Text>
      </View>
      <Image style={styles.optionImage} source={ShopImages.get(image)} />
      <TouchableOpacity style={styles.optionButton}>
        <Text style={styles.optionButtonText}>{price} $</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function ShopModal({}: ShopModalProps) {
  const [isOpened, setIsOpened] = useState(false);

  const options = [
    { value: 100, price: 234, image: "1" },
    { value: 200, price: 23.44, image: "2" },
    { value: 300, price: 323, image: "3" },
    { value: 400, price: 43.33, image: "4" },
    { value: 500, price: 533, image: "5" },
    { value: 500, price: 523, image: "6" },
  ];

  return (
    <ModalWithBlur style={styles.root} opened={isOpened} close={() => {}}>
      <Pressable
        style={styles.crossPosition}
        onPress={() => {
          setIsOpened(false);
        }}
      >
        <CrossIcon color={"#E1E3E4"} />
      </Pressable>
      <Image
        style={styles.shopImage}
        source={require("@/assets/images/shopImage.png")}
      />
      <Text style={styles.title}>Buy Currency</Text>
      <Text style={styles.description}>Get more in-game currency</Text>
      <FlatList
        style={{ width: "100%" }}
        data={options}
        renderItem={({ item }) => (
          <OptionCard
            value={item.value}
            price={item.price}
            image={item.image}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContainer}
      />
    </ModalWithBlur>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    marginVertical: "auto",
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  crossPosition: {
    position: "absolute",
    top: 16,
    right: 13,
  },
  cross: {
    color: "",
  },
  title: {
    fontSize: 32,
    fontWeight: "medium",
  },
  description: {
    fontSize: 16,
    fontWeight: "light",
  },
  shopImage: {
    height: 64,
    aspectRatio: 1,
  },
  optionRoot: {
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    flex: 1,
    backgroundColor: "white",
  },
  priceLabel: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "semibold",
    color: Colors.light.primary,
  },
  optionImage: {
    height: 72,
    aspectRatio: 1,
  },
  optionButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 3,
    width: "100%",
  },
  optionButtonText: {
    fontSize: 20,
    fontWeight: "regular",
    color: "white",
  },
  flatListContainer: {
    marginTop: 16,
    gap: 10,
  },
  row: {
    justifyContent: "space-around",
    gap: 4,
  },
});
