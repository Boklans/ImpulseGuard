import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isLocalNotificationEnabled } from "./notificationPreferences";

const SCHEDULED_NOTIFICATIONS_KEY = "SCHEDULED_NOTIFICATIONS";

interface ScheduledNotification {
  id: string;
  type: "egg" | "task" | "note" | "milestone";
  entityId: string;
  scheduledTime: number;
}

async function getScheduledNotifications(): Promise<ScheduledNotification[]> {
  const raw = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveScheduledNotification(
  notification: ScheduledNotification
): Promise<void> {
  const notifications = await getScheduledNotifications();
  const filtered = notifications.filter((n) => n.id !== notification.id);
  filtered.push(notification);
  await AsyncStorage.setItem(
    SCHEDULED_NOTIFICATIONS_KEY,
    JSON.stringify(filtered)
  );
}

async function removeScheduledNotification(id: string): Promise<void> {
  const notifications = await getScheduledNotifications();
  const filtered = notifications.filter((n) => n.id !== id);
  await AsyncStorage.setItem(
    SCHEDULED_NOTIFICATIONS_KEY,
    JSON.stringify(filtered)
  );
}

/**
 * Schedule a local notification for when an egg is ready to hatch
 */
export async function scheduleEggReadyNotification(
  eggId: string,
  hatchEndTime: Date
): Promise<string | null> {
  try {
    // Check if this notification type is enabled
    if (!(await isLocalNotificationEnabled("onEggReady"))) {
      return null;
    }

    const now = new Date();
    const triggerDate = new Date(hatchEndTime);

    // Don't schedule if the time has already passed
    if (triggerDate <= now) {
      return null;
    }

    const notificationId = `egg-ready-${eggId}`;

    // Cancel any existing notification for this egg
    await cancelScheduledNotification(notificationId);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your Egg is Ready!",
        body: "Time to hatch your new companion!",
        sound: "default",
        data: { id: "notif.egg.ready", eggId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    await saveScheduledNotification({
      id: notificationId,
      type: "egg",
      entityId: eggId,
      scheduledTime: triggerDate.getTime(),
    });

    console.log(`Scheduled egg ready notification for ${triggerDate}`);
    return id;
  } catch (error) {
    console.error("Failed to schedule egg ready notification:", error);
    return null;
  }
}

/**
 * Schedule a local notification for a task reminder
 * Note: Tasks currently don't have due dates in their schema.
 * This function is ready for when due dates are added.
 */
export async function scheduleTaskReminder(
  taskId: number,
  title: string,
  reminderTime: Date
): Promise<string | null> {
  try {
    // Check if this notification type is enabled
    if (!(await isLocalNotificationEnabled("onTaskReminder"))) {
      return null;
    }

    const now = new Date();
    const triggerDate = new Date(reminderTime);

    if (triggerDate <= now) {
      return null;
    }

    const notificationId = `task-reminder-${taskId}`;

    await cancelScheduledNotification(notificationId);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder",
        body: title || "You have a task due!",
        sound: "default",
        data: { id: "notif.task.reminder", taskId: taskId.toString() },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    await saveScheduledNotification({
      id: notificationId,
      type: "task",
      entityId: taskId.toString(),
      scheduledTime: triggerDate.getTime(),
    });

    console.log(`Scheduled task reminder for ${triggerDate}`);
    return id;
  } catch (error) {
    console.error("Failed to schedule task reminder:", error);
    return null;
  }
}

/**
 * Schedule a local notification for a note/journal reminder
 * Note: Notes currently don't have reminder times in their schema.
 * This function is ready for when reminders are added.
 */
export async function scheduleNoteReminder(
  noteId: number,
  title: string,
  reminderTime: Date
): Promise<string | null> {
  try {
    // Check if this notification type is enabled
    if (!(await isLocalNotificationEnabled("onNoteReminder"))) {
      return null;
    }

    const now = new Date();
    const triggerDate = new Date(reminderTime);

    if (triggerDate <= now) {
      return null;
    }

    const notificationId = `note-reminder-${noteId}`;

    await cancelScheduledNotification(notificationId);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Note Reminder",
        body: title || "Time to reflect on your note!",
        sound: "default",
        data: { id: "notif.note.reminder", noteId: noteId.toString() },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    await saveScheduledNotification({
      id: notificationId,
      type: "note",
      entityId: noteId.toString(),
      scheduledTime: triggerDate.getTime(),
    });

    console.log(`Scheduled note reminder for ${triggerDate}`);
    return id;
  } catch (error) {
    console.error("Failed to schedule note reminder:", error);
    return null;
  }
}

/**
 * Cancel a scheduled notification by its identifier
 */
export async function cancelScheduledNotification(
  notificationId: string
): Promise<void> {
  try {
    // Get all scheduled notifications and find matching ones
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const matching = scheduled.filter(
      (n) =>
        n.content.data?.eggId === notificationId.replace("egg-ready-", "") ||
        n.content.data?.taskId === notificationId.replace("task-reminder-", "") ||
        n.content.data?.noteId === notificationId.replace("note-reminder-", "")
    );

    for (const notification of matching) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }

    await removeScheduledNotification(notificationId);
    console.log(`Cancelled notification: ${notificationId}`);
  } catch (error) {
    console.error("Failed to cancel notification:", error);
  }
}

/**
 * Cancel all scheduled notifications for a specific egg
 */
export async function cancelEggNotification(eggId: string): Promise<void> {
  await cancelScheduledNotification(`egg-ready-${eggId}`);
}

/**
 * Cancel all scheduled notifications for a specific task
 */
export async function cancelTaskNotification(taskId: number): Promise<void> {
  await cancelScheduledNotification(`task-reminder-${taskId}`);
}

/**
 * Cancel all scheduled notifications for a specific note
 */
export async function cancelNoteNotification(noteId: number): Promise<void> {
  await cancelScheduledNotification(`note-reminder-${noteId}`);
}

/**
 * Get all currently scheduled notifications (for debugging/display)
 */
export async function getAllScheduledNotifications(): Promise<
  ScheduledNotification[]
> {
  return getScheduledNotifications();
}

/**
 * Clean up expired notifications from storage
 */
export async function cleanupExpiredNotifications(): Promise<void> {
  const notifications = await getScheduledNotifications();
  const now = Date.now();
  const active = notifications.filter((n) => n.scheduledTime > now);
  await AsyncStorage.setItem(
    SCHEDULED_NOTIFICATIONS_KEY,
    JSON.stringify(active)
  );
}
