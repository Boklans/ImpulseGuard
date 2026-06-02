import {
  SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, ImageSourcePropType,
} from "react-native";
import React, { useEffect, useCallback, useRef, memo } from "react";
import { SwitchButton } from "@/components/ui/SwitchButton";
import { NotificationSettings } from "@/constants/Config";
import { Colors } from "@/constants/Colors";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  getLocalNotificationPreferences,
  updateLocalNotificationPreferences,
  LocalNotificationPreferences,
} from "@/utils/notificationPreferences";
import BackIcon from "@/assets/icons/back.svg";
import LockIcon from "@/assets/icons/lock.svg";
import { router } from "expo-router";
import {
  useNotificationsSettings,
  usePatchNotifSettings,
} from "@/hooks/useUser";
import { usePaywall, usePremium } from "@/hooks/usePaywall";

// Tags that are stored locally (not on backend)
const LOCAL_NOTIFICATION_TAGS = [
  "onEggReady",
  "onTaskReminder",
  "onNoteReminder",
  "onTaskMilestone",
  "onNoteMilestone",
];

type OptionProps = {
  icon: ImageSourcePropType;
  title: string;
  description: string;
  tag: string;
  initState: boolean | undefined;
  onToggle: (tag: string, state: boolean) => void;
  isPremium: boolean;
  isPremiumFeature: boolean;
  onPremiumTap: () => void;
};

const Option = memo(({
  icon,
  title,
  description,
  tag,
  initState,
  onToggle,
  isPremium,
  isPremiumFeature,
  onPremiumTap,
}: OptionProps) => {
  const isLocked = isPremiumFeature && !isPremium;

  const handlePress = useCallback((state: boolean) => {
    if (isLocked) {
      onPremiumTap();
      return;
    }
    onToggle(tag, state);
  }, [tag, onToggle, isLocked, onPremiumTap]);

  return (
    <View style={[styles.optionBox, isLocked && styles.optionLocked]}>
      <Image source={icon} style={[styles.optionIcon, isLocked && styles.optionIconLocked]} />
      <View style={styles.optionTextBox}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={[styles.optionTitle, isLocked && styles.optionTextLocked]}>{title}</Text>
          {isLocked && (
            <LockIcon width={14} height={14} color="#6AC3CE" />
          )}
        </View>
        <Text style={[styles.optionDescription, isLocked && styles.optionTextLocked]}>{description}</Text>
      </View>
      {initState !== undefined && (
        <SwitchButton
          onPress={handlePress}
          initialValue={isLocked ? false : initState}
          style={styles.switch}
          disabled={isLocked}
        />
      )}
    </View>
  );
});

type OptionsGroupProps = {
  title: string;
  settings: Array<{
    icon: ImageSourcePropType;
    tag: string;
    name: string;
    description: string;
    premium?: boolean;
  }>;
  getSettingValue: (tag: string) => boolean | undefined;
  onToggle: (tag: string, state: boolean) => void;
  isPremium: boolean;
  onPremiumTap: () => void;
};

const OptionsGroup = memo(({ title, settings, getSettingValue, onToggle, isPremium, onPremiumTap }: OptionsGroupProps) => (
  <View>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.optionsGroup}>
      {settings.map((setting, index) => (
        <View key={setting.tag}>
          <Option
            icon={setting.icon}
            title={setting.name}
            description={setting.description}
            tag={setting.tag}
            initState={getSettingValue(setting.tag)}
            onToggle={onToggle}
            isPremium={isPremium}
            isPremiumFeature={setting.premium || false}
            onPremiumTap={onPremiumTap}
          />
          {index < settings.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  </View>
));

export default function notificationsScreen() {
  const user = useSelector((state: RootState) => state.user).user;
  const { data } = useNotificationsSettings(user?._id!);
  const { mutateAsync: postNotificationsSettings } = usePatchNotifSettings();
  const { isPremium } = usePremium();
  const { openPaywall } = usePaywall();

  // Track if initial load is complete (to avoid syncing on mount)
  const isInitialLoad = useRef(true);

  // Backend settings (push notifications)
  const [backendSettings, setBackendSettings] = React.useState<Map<string, boolean>>(
    new Map()
  );
  // Local settings (local notifications)
  const [localSettings, setLocalSettings] = React.useState<LocalNotificationPreferences | null>(
    null
  );

  // Combined settings for display
  const getSettingValue = useCallback((tag: string): boolean | undefined => {
    if (LOCAL_NOTIFICATION_TAGS.includes(tag)) {
      return localSettings?.[tag as keyof LocalNotificationPreferences];
    }
    return backendSettings.get(tag);
  }, [localSettings, backendSettings]);

  // Handle setting change
  const handleToggle = useCallback((tag: string, state: boolean) => {
    if (LOCAL_NOTIFICATION_TAGS.includes(tag)) {
      // Update local settings
      setLocalSettings(prev => ({ ...prev, [tag]: state } as LocalNotificationPreferences));
      updateLocalNotificationPreferences({ [tag]: state });
    } else {
      // Update backend settings
      setBackendSettings(prev => {
        const newSettings = new Map(prev);
        newSettings.set(tag, state);
        return newSettings;
      });
    }
  }, []);

  // Load backend settings from API
  useEffect(() => {
    if (data?.settings) {
      setBackendSettings(new Map(Object.entries(data.settings)) as Map<string, boolean>);
    }
  }, [data]);

  // Load local settings on mount
  useEffect(() => {
    getLocalNotificationPreferences().then(setLocalSettings);
  }, []);

  // Sync backend settings to server (skip initial load)
  useEffect(() => {
    if (isInitialLoad.current) {
      if (backendSettings.size > 0) {
        isInitialLoad.current = false;
      }
      return;
    }

    if (!user?._id || backendSettings.size === 0) return;

    const settingsObject = Object.fromEntries(backendSettings);
    postNotificationsSettings({
      userId: user._id,
      settings: settingsObject,
    }).catch(error => {
      console.error("Error updating settings:", error);
    });
  }, [backendSettings, user?._id, postNotificationsSettings]);

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={styles.root}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/settings")}
          >
            <BackIcon />
          </TouchableOpacity>
          <Text style={[styles.description, { flex: 1 }]}>
            Control which notifications you want to receive. You can change this
            at any time.
          </Text>
        </View>
        <View style={styles.options}>
          {NotificationSettings.map(({ group, settings }) => (
            <OptionsGroup
              key={group}
              title={group}
              settings={settings}
              getSettingValue={getSettingValue}
              onToggle={handleToggle}
              isPremium={isPremium}
              onPremiumTap={openPaywall}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    gap: 16,
  },
  backButton: {
    backgroundColor: "white",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: Colors.light.neutralText,
    fontSize: 20,
  },
  description: {
    color: Colors.light.neutralText,
    fontSize: 16,
    marginBottom: 14,
  },
  options: {
    flexDirection: "column",
    gap: 12,
  },
  optionsGroup: {
    flexDirection: "column",
    marginTop: 12,
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  optionBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  optionIcon: {
    width: 48,
    aspectRatio: 1,
  },
  optionTextBox: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionDescription: {
    color: Colors.light.neutralText,
    fontSize: 14,
    fontWeight: "light",
  },
  switch: {
    marginLeft: "auto",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.paleText,
    marginVertical: 8,
  },
  optionLocked: {
    opacity: 0.6,
  },
  optionIconLocked: {
    opacity: 0.5,
  },
  optionTextLocked: {
    color: Colors.light.paleText,
  },
});
