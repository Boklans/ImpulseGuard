import { ReactElement, useEffect, useRef } from "react";
import { UserResource } from "@clerk/types";
import * as Notifications from "expo-notifications";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { createApiClient } from "@/utils/api";

// Set notification handler globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Setup Android notification channel
async function setupAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6AC3CE",
    });
  }
}

// Helper to check if error is transient (server overload, network issues)
function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("503") ||
      message.includes("no healthy upstream") ||
      message.includes("service_unavailable") ||
      message.includes("temporarily unavailable") ||
      message.includes("network") ||
      message.includes("timeout")
    );
  }
  return false;
}

// Get Expo push token with retry logic for transient errors
async function getExpoPushTokenWithRetry(
  projectId: string,
  maxRetries = 3
): Promise<string | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const token = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;
      return token;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;

      if (isTransientError(error) && !isLastAttempt) {
        const delayMs = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
        console.warn(
          `Push token fetch failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delayMs}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
  return null;
}

export default function NotificationProvider(): ReactElement {
  const notificationListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );
  const responseListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );
  const { getToken } = useAuth();
  const { user } = useUser();

  async function registerForPushNotificationsAsync(user: UserResource) {
    try {
      // Setup Android channel first
      await setupAndroidChannel();

      // Request permissions using expo-notifications API
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Failed to get push notification permissions");
        return;
      }

      // Get Expo push token with projectId for Expo SDK 54+
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        console.error(
          "Missing EAS projectId - cannot register for push notifications"
        );
        return;
      }

      const pushToken = await getExpoPushTokenWithRetry(projectId);

      if (!pushToken) {
        console.error("Failed to get push token after retries");
        return;
      }

      console.log("Expo push token:", pushToken);

      // Register token with backend using authenticated client
      const api = createApiClient(getToken);
      await api.post("/notifications/settings", {
        userId: user.id,
        pushToken: pushToken,
      });
      console.log(
        "Successfully registered push notifications for user:",
        user.id
      );
    } catch (error) {
      console.error("Error registering for push notifications:", error);
    }
  }

  useEffect(() => {
    if (!user) {
      console.log("No user found, skipping notification registration");
      return;
    }

    // Register for push notifications
    registerForPushNotificationsAsync(user);

    // Set up notification listeners
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
      });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]);

  return <></>;
}
