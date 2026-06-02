import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="settings" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="support" />
      <Stack.Screen name="feedback" />
    </Stack>
  );
}
