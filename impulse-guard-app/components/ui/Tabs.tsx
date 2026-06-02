import React from "react";
import { View, Pressable, Text, StyleSheet, Image, ViewStyle } from "react-native";
import {Colors} from "@/constants/Colors";

type TabIcon = React.ReactNode | number;

type TabItem = {
  label: string;
  icon?: TabIcon;
  onPress: () => void;
};

interface TabsProps {
  tabs: TabItem[];
  activeIndex: number;
  layout?: "horizontal" | "vertical";
  style?: ViewStyle;
}

export default function Tabs({ tabs, activeIndex, style, layout = "horizontal" }: TabsProps) {
  return (
    <View style={[styles.container, styles[`${layout}Container`], style]}>
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;

        return (
          <Pressable
            key={index}
            style={[styles.tabButton, isActive && styles.tabButtonActive, styles[`${layout}TabButton`], isActive && styles[`${layout}TabButtonActive`]]}
            onPress={tab.onPress}
          >
            {typeof tab.icon === "object" && !Array.isArray(tab.icon) ? (
              <View style={styles.iconContainer}>
                {React.cloneElement(tab.icon as React.ReactElement, {
                  color: isActive ? Colors.light.primary : "#C7C7C7",
                })}
              </View>
            ) : typeof tab.icon === "number" ? (
              <Image
                source={tab.icon}
                style={[
                  styles.icon,
                  { tintColor: (isActive && layout !== "vertical") ? Colors.light.primary : "#C7C7C7" },
                ]}
              />
            ) : null}

            <Text
              style={[
                styles.label,
                { color: (isActive && layout !== "vertical") ? Colors.light.primary : (layout !== "vertical" ? "#C7C7C7" : "black") },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-around",
    alignItems: "center",
    gap: 16,
  },
  horizontalContainer: {
    flexDirection: "row",
    height: 60,
  },
  verticalContainer: {
    flexDirection: "row",
    height: 90,
  },


  tabButton: {
    flex: 1,
    borderColor: "white",
    borderWidth: 2,
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 7,
  },
  verticalTabButton: {
    borderRadius: 8,
    width: 118,
    height: 89,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "column",
    paddingHorizontal: 10
  },
  horizontalTabButton: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },

  tabButtonActive: {
    backgroundColor: "#fff",
    borderColor: "#6AC3CE",
  },
  verticalTabButtonActive: {},
  horizontalTabButtonActive: {},

  iconContainer: {
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 4,
    resizeMode: "contain",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
});
