import { Redirect, Tabs, useNavigation, useRouter } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";

import { Colors } from "@/constants/Colors";
import Header from "@/components/navigation/Header";

import SettingsIcon from "@/assets/icons/settings.svg";
import HouseIcon from "@/assets/icons/house.svg";
import NoteBook from "@/assets/icons/notebook.svg";
import PetsIcon from "@/assets/icons/paw-print.svg";
import CommunityIcon from "@/assets/icons/users.svg";
import { useAuth } from "@clerk/clerk-expo";

export default function TabLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href={"/"} />;
  }

  return (
    <View style={styles.container}>
      <Header />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#E1E3E4",
          headerShown: false,
          animation: "shift",
        }}
      >
        <Tabs.Screen
          name="(task-flow)"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  padding: 8,
                  backgroundColor: focused ? "#73CAD5" : "",
                  borderRadius: 99,
                  marginTop: 16,
                }}
              >
                <NoteBook color={color} width={24} height={24} />
              </View>
            ),
          }}
        />

        {/* 
        
        commented while 1.1 is in development. Albert i will left it to remind you to add it back later
      
        <Tabs.Screen
          name="community"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  padding: 8,
                  backgroundColor: focused ? "#73CAD5" : "",
                  borderRadius: 99,
                  marginTop: 16,
                }}
              >
                <CommunityIcon width={24} height={24} color={color} />
              </View>
            ),
          }}
        /> */}

        <Tabs.Screen
          name="(impulses-flow)"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  padding: 8,
                  backgroundColor: focused ? "#73CAD5" : "",
                  borderRadius: 99,
                  marginTop: 16,
                }}
              >
                <HouseIcon width={24} height={24} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="(pets-flow)"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ color, focused }) => {
              const navigation = useNavigation();
              const router = useRouter();

              return (
                <View
                  style={{
                    padding: 8,
                    backgroundColor: focused ? "#73CAD5" : "",
                    borderRadius: 99,
                    marginTop: 16,
                  }}
                  onTouchEnd={() => {
                    if (focused) {
                      router.replace("/eggs");
                    }
                  }}
                >
                  <PetsIcon width={24} height={24} color={color} />
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="(settings-flow)"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  padding: 8,
                  backgroundColor: focused ? "#73CAD5" : "",
                  borderRadius: 99,
                  marginTop: 16,
                }}
              >
                <SettingsIcon width={24} height={24} color={color} />
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
});
