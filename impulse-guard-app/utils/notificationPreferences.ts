import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_NOTIFICATION_PREFS_KEY = "LOCAL_NOTIFICATION_PREFS";

/**
 * Local notification preferences that are stored on device only.
 * These complement the server-side push notification settings.
 */
export interface LocalNotificationPreferences {
  // Egg ready notification (local)
  onEggReady: boolean;
  // Task reminder notifications (local)
  onTaskReminder: boolean;
  // Note reminder notifications (local)
  onNoteReminder: boolean;
  // Task milestone notifications (local)
  onTaskMilestone: boolean;
  // Note milestone notifications (local)
  onNoteMilestone: boolean;
}

const DEFAULT_PREFERENCES: LocalNotificationPreferences = {
  onEggReady: true,
  onTaskReminder: true,
  onNoteReminder: true,
  onTaskMilestone: true,
  onNoteMilestone: true,
};

/**
 * Get local notification preferences
 */
export async function getLocalNotificationPreferences(): Promise<LocalNotificationPreferences> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_NOTIFICATION_PREFS_KEY);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch (error) {
    console.error("Failed to get local notification preferences:", error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Update local notification preferences
 */
export async function updateLocalNotificationPreferences(
  updates: Partial<LocalNotificationPreferences>
): Promise<LocalNotificationPreferences> {
  try {
    const current = await getLocalNotificationPreferences();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(
      LOCAL_NOTIFICATION_PREFS_KEY,
      JSON.stringify(updated)
    );
    return updated;
  } catch (error) {
    console.error("Failed to update local notification preferences:", error);
    throw error;
  }
}

/**
 * Check if a specific local notification type is enabled
 */
export async function isLocalNotificationEnabled(
  type: keyof LocalNotificationPreferences
): Promise<boolean> {
  const prefs = await getLocalNotificationPreferences();
  return prefs[type] ?? true;
}

/**
 * Reset local notification preferences to defaults
 */
export async function resetLocalNotificationPreferences(): Promise<void> {
  await AsyncStorage.setItem(
    LOCAL_NOTIFICATION_PREFS_KEY,
    JSON.stringify(DEFAULT_PREFERENCES)
  );
}
