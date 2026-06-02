import { Stack, usePathname, router } from "expo-router";
import Tabs from "@/components/ui/Tabs";
import EggIcon from "@/assets/icons/egg.svg";
import PetsIcon from "@/assets/icons/paw-print.svg";
import FoodIcon from "@/assets/icons/cooking-pot.svg";
import { View } from "react-native";

export default function CollectionLayout() {
  const pathname = usePathname();

  const normalizedPathname = pathname === "/" ? "/eggs" : pathname;

  const active = ["/eggs", "/pets", "/items"].indexOf(normalizedPathname);

  const tabs = [
    {
      label: "Eggs",
      icon: <EggIcon />,
      onPress: () => router.replace("/eggs"),
    },
    {
      label: "Pets",
      icon: <PetsIcon />,
      onPress: () => router.replace("/pets"),
    },
    {
      label: "Items",
      icon: <FoodIcon />,
      onPress: () => router.replace("/items"),
    },
  ];

  return (
      <View
          style={{ flex: 1, backgroundColor: "#F2F2F7", paddingHorizontal: 16 }}
      >
        {active >= 0 && <Tabs tabs={tabs} activeIndex={active} layout="horizontal" />}
        <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      </View>
  );
}
