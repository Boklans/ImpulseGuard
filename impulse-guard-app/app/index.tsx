import React, { useEffect, useRef } from "react";
import { View, Text, SafeAreaView, Image } from "react-native";
import { router } from "expo-router";
import { useDispatch } from "react-redux";

import { setCredentials } from "@/redux/slices/user";
import {
  useSetDidWatch,
  useUserLocalStorage,
} from "@/hooks/useUserLocalStorage";
import { useAuth, useClerk } from "@clerk/clerk-expo";
import { User } from "@/redux/slices/user/types";
import { useApi } from "@/hooks/useApi";

export default function GreetingScreen() {
  const fetchUser = async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data;
  };

  const api = useApi();
  const dispatch = useDispatch();
  const { data: localUser, isLoading: isLocalUserStorageLoading } =
    useUserLocalStorage();
  const { mutateAsync: saveDidWatch } = useSetDidWatch();
  const { signOut } = useClerk();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (isLocalUserStorageLoading) return;
    const bootstrap = async () => {
      try {
        const isFirstEnter = !localUser?.didWatchOnBoarding;
        if (isFirstEnter) {
          await saveDidWatch({ didWatchOnBoarding: true });
          router.replace("/(onboarding)/slide-show");
          return;
        }

        if (!isSignedIn) {
          router.replace("/(auth)/sign-in");
          return;
        }

        const savedToken = await getToken({
          template: "api",
        });

        if (!savedToken) throw new Error("No token found");

        const user = await fetchUser();

        dispatch(setCredentials({ token: savedToken, user }));

        router.replace("/(tabs)/(impulses-flow)/impulses");
      } catch (err) {
        console.log("restore error:", err);
        await signOut();
        router.replace("/(auth)/sign-in");
      }
    };

    bootstrap();
  }, [isLocalUserStorageLoading, localUser, isLoaded, isSignedIn, router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      <Image
        style={{
          width: 280,
          height: 300,
          position: "absolute",
          bottom: 0,
          right: 0,
          zIndex: 2,
        }}
        source={require("@/assets/images/sakura.png")}
      />

      <View
        style={{
          backgroundColor: "#F2F2F7",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <Text style={{ fontSize: 40, fontWeight: "500" }}>
          Nice to meet you!
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "400" }}>
          make life better
        </Text>
        <Image
          style={{
            width: "60%",
            resizeMode: "contain",
          }}
          source={require("@/assets/images/maskot.png")}
        />
      </View>
    </SafeAreaView>
  );
}
