import React from "react";
import { PostHogProvider as PHProvider } from "posthog-react-native";
import Constants from "expo-constants";

interface PostHogProviderProps {
  children: React.ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const apiKey = Constants.expoConfig?.extra?.POSTHOG_API_KEY;

  if (!apiKey) {
    console.warn("PostHog API key not configured");
    return <>{children}</>;
  }

  return (
    <PHProvider
      apiKey={apiKey}
      options={{
        host: "https://us.posthog.com",
      }}
    >
      {children}
    </PHProvider>
  );
}
