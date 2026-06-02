import { ImpulseProvider } from "@/contexts/impulseContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ImpulseProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "simple_push",
        }}
      >
        <Stack.Screen name="impulses" />
        <Stack.Screen name="select-activity" />
        <Stack.Screen
          options={{
            gestureEnabled: false,
          }}
          name="session"
        />
        <Stack.Screen
          options={{
            gestureEnabled: false,
          }}
          name="after-dialog"
        />
      </Stack>
    </ImpulseProvider>
  );
}
