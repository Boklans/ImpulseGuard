import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import Button from "@/components/ui/Button";
import { logout } from "@/redux/slices/user";
import { removeToken } from "@/utils/secureStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import { useDispatch } from "react-redux";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useClerk } from "@clerk/clerk-expo";
import * as Notifications from "expo-notifications";
import { usePaywall } from "@/hooks/usePaywall";

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const { signOut } = useClerk();
  const { subscriptionInfo, openPaywall, openSubscriptionInfo, restore, isPurchasing } = usePaywall();

  const sendTestNotification = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        alert("Notification permissions not granted");
        return;
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "If you see this, notifications are working!",
        sound: true,
      },
      trigger: { seconds: 2 },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          onPress={() => {
            router.push("/(tabs)/(settings-flow)/profile");
          }}
          style={styles.listItem}
        >
          <Text style={styles.listItemText}>Profile</Text>
          <FontAwesome6 name="angle-right" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => {
            router.push("/(tabs)/(settings-flow)/notifications");
          }}
        >
          <Text style={styles.listItemText}>Notifications</Text>
          <FontAwesome6 name="angle-right" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <TouchableOpacity style={styles.listItem} onPress={subscriptionInfo.isPremium ? openSubscriptionInfo : openPaywall}>
          <View>
            <Text style={styles.listItemTextBold}>
              {subscriptionInfo.isPremium ? "Manage Subscription" : "Upgrade to Premium"}
            </Text>
            <Text style={styles.listItemSubtext}>
              {subscriptionInfo.isPremium
                ? `Premium${subscriptionInfo.status ? ` • ${subscriptionInfo.status}` : ""}`
                : "Unlock all features"}
            </Text>
          </View>
          <FontAwesome6 name="angle-right" size={20} color="black" />
        </TouchableOpacity>
        <Button
          textStyle={{
            fontSize: 16,
            fontWeight: "700",
          }}
          title={isPurchasing ? "RESTORING..." : "RESTORE SUBSCRIPTION"}
          onPress={restore}
          variant="secondary"
          disabled={isPurchasing}
        />

        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => {
            router.push("/(tabs)/(settings-flow)/support");
          }}
        >
          <Text style={styles.listItemText}>Help center</Text>
          <FontAwesome6 name="angle-right" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => {
            router.push("/(tabs)/(settings-flow)/feedback");
          }}
        >
          <Text style={styles.listItemText}>Feedback</Text>
          <FontAwesome6 name="angle-right" size={20} color="black" />
        </TouchableOpacity>

        {__DEV__ && (
          <>
            <Text style={styles.sectionTitle}>Developer</Text>
            <TouchableOpacity
              style={styles.listItem}
              onPress={sendTestNotification}
            >
              <Text style={styles.listItemText}>Test Notification</Text>
              <FontAwesome6 name="bell" size={20} color="black" />
            </TouchableOpacity>
          </>
        )}

        <Button
          title="SIGN OUT"
          onPress={() => {
            dispatch(logout());
            removeToken();
            signOut();
            router.replace("/(auth)/sign-in");
          }}
          variant="secondary"
          textStyle={{
            fontSize: 16,
            fontWeight: "700",
          }}
          style={{
            marginVertical: 16,
          }}
        />

        <Link
          style={styles.linkText}
          href="https://impulseguard.app/docs/terms"
        >
          <Text>TERMS</Text>
        </Link>
        <Link
          style={styles.linkText}
          href="https://impulseguard.app/docs/policy"
        >
          <Text>PRIVACY POLICY</Text>
        </Link>

        <Text
          style={{
            fontSize: 16,
            color: "#888",
            marginVertical: 16,
          }}
        >
          App Version: 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    marginLeft: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 3,
    marginHorizontal: 8,
  },
  progress: {
    width: "50%",
    height: "100%",
    backgroundColor: "#6AC3CE",
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "400",
    marginTop: 16,
    marginBottom: 8,
    color: "#6C6C6C",
  },
  listItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listItemText: {
    fontSize: 20,
    fontWeight: "600",
  },
  listItemTextBold: {
    fontSize: 16,
    fontWeight: "600",
  },
  listItemSubtext: {
    fontSize: 14,
    color: "#888",
  },

  signOutButton: {
    alignSelf: "center",
    marginVertical: 16,
  },
  linkText: {
    fontSize: 16,
    color: "#6AC3CE",
    marginVertical: 8,
    fontWeight: "700",
  },
});
