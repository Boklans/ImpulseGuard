import { usePostHog } from "posthog-react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useCallback } from "react";

// Event name constants for consistency
export const AnalyticsEvents = {
  // App Lifecycle
  APP_OPENED: "app_opened",

  // User Journey
  USER_SIGNED_UP: "user_signed_up",
  USER_SIGNED_IN: "user_signed_in",
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_NAME_ADDED: "onboarding_name_added",
  ONBOARDING_IMPULSE_SELECTED: "onboarding_impulse_selected",
  ONBOARDING_COMPLETED: "onboarding_completed",

  // Core Features
  SESSION_STARTED: "session_started",
  SESSION_COMPLETED: "session_completed",
  SESSION_NOTE_PROMPT_CLICKED: "session_note_prompt_clicked",
  SESSION_NOTE_PROMPT_SKIPPED: "session_note_prompt_skipped",
  IMPULSE_CREATED: "impulse_created",
  TASK_CREATED: "task_created",
  TASK_COMPLETED: "task_completed",
  DIARY_ENTRY_CREATED: "diary_entry_created",
  DIARY_ENTRY_UPDATED: "diary_entry_updated",
  PET_REWARD_VIEWED: "pet_reward_viewed",
  PET_FED: "pet_fed",
  EGG_HATCHED: "egg_hatched",
  ACHIEVEMENT_UNLOCKED: "achievement_unlocked",
  LEVEL_UP: "level_up",

  // Monetization
  PAYWALL_VIEWED: "paywall_viewed",
  PAYWALL_CLOSED: "paywall_closed",
  PURCHASE_STARTED: "purchase_started",
  PURCHASE_COMPLETED: "purchase_completed",
  PURCHASE_FAILED: "purchase_failed",
  RESTORE_STARTED: "restore_started",
  RESTORE_COMPLETED: "restore_completed",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

export function useAnalytics() {
  const posthog = usePostHog();
  const { userId } = useAuth();

  const identify = useCallback(
    (properties?: Record<string, any>) => {
      if (userId && posthog) {
        posthog.identify(userId, properties);
      }
    },
    [userId, posthog]
  );

  const track = useCallback(
    (event: AnalyticsEventName | string, properties?: Record<string, any>) => {
      if (posthog) {
        posthog.capture(event, properties);
      }
    },
    [posthog]
  );

  const screen = useCallback(
    (screenName: string, properties?: Record<string, any>) => {
      if (posthog) {
        posthog.screen(screenName, properties);
      }
    },
    [posthog]
  );

  const reset = useCallback(() => {
    if (posthog) {
      posthog.reset();
    }
  }, [posthog]);

  return { identify, track, screen, reset, posthog };
}
