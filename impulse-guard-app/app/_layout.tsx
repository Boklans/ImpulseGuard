import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Provider } from "react-redux";

import { store } from "@/redux/store";
import Constants from "expo-constants";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NewAchievementModal } from "@/components/modals/NewAchievementModal";
import { LevelUpModal } from "@/components/modals/LevelUpModal";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import ShopModal from "@/components/modals/ShopModal";
import PayWallModal from "@/components/modals/PayWallModal";
import SubscriptionInfoModal from "@/components/modals/SubscriptionInfoModal";
import NotificationProvider from "@/components/NotificationProvider";
import { BASE_URL } from "@/constants/Config";
import { PaywallProvider } from "@/hooks/usePaywall";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { useAnalytics, AnalyticsEvents } from "@/hooks/useAnalytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isLoaded: isAuthLoaded, isSignedIn, userId } = useAuth();
  const { identify, track } = useAnalytics();
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (fontsLoaded && isAuthLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthLoaded]);

  useEffect(() => {
    if (isSignedIn && userId) {
      identify();
    }
  }, [isSignedIn, userId, identify]);

  // Track app_opened on launch and when returning from background
  useEffect(() => {
    track(AnalyticsEvents.APP_OPENED);

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          track(AnalyticsEvents.APP_OPENED);
        }
        appState.current = nextAppState;
      }
    );

    return () => subscription.remove();
  }, [track]);

  if (!fontsLoaded || !isAuthLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PaywallProvider>
            {isSignedIn && <NotificationProvider />}
            <PayWallModal />
            <SubscriptionInfoModal />
            <ShopModal />
            <LevelUpModal />
            <NewAchievementModal
              isOpened={isAchievementModalOpen}
              onClose={() => setIsAchievementModalOpen(false)}
            />
            <Stack
              screenOptions={{
                animation: "fade",
                headerShown: false,
              }}
            >
              {isSignedIn ? (
                <>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(onboarding)"
                    options={{ headerShown: false }}
                  />
                </>
              ) : (
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              )}
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </PaywallProvider>
        </Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  // TODO Ask designer (Kristina) to add dark theme
  //const colorScheme = useColorScheme();

  const publishableKey =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error("Clerk Publishable Key is not set in app.json extra!");
    return null;
  }

  return (
    <PostHogProvider>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <AppContent />
        </ClerkLoaded>
      </ClerkProvider>
    </PostHogProvider>
  );
}
