export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    ios: {
      ...config.ios,
    },
    eas: {
      projectId: "0af6ef47-f633-4dc0-935b-1d9071092df9",
    },
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    API_URL: process.env.EXPO_PUBLIC_API_URL,
    POSTHOG_API_KEY: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
  },
  plugins: [
    "expo-web-browser",
    "expo-font",
    "expo-router",
    "expo-secure-store",
    "expo-localization",
    [
      "expo-notifications",
      {
        icon: "./assets/images/icon.png",
        color: "#ffffff",
        sounds: [],
      },
    ],
  ],
});
