import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAppSelector } from "@/hooks/reduxHooks";
import { useDeleteUser, useUpdateUser } from "@/hooks/useUser";
import { logout } from "@/redux/slices/user";
import { removeToken } from "@/utils/secureStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useDispatch } from "react-redux";

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const { mutate: deleteAccount } = useDeleteUser();
  const { mutate: updateUser } = useUpdateUser();
  const { user } = useAppSelector((s) => s.user);

  const [username, setUsername] = useState(user?.username || "");
  const [hasChanges, setHasChanges] = useState(false);

  const handleNameChange = (text: string) => {
    setUsername(text);
    setHasChanges(text !== (user?.username || ""));
  };

  const handleSave = () => {
    if (!hasChanges || !user?._id) return;
    updateUser({ userId: user._id, data: { username } });
    setHasChanges(false);
    Keyboard.dismiss();
    Alert.alert("Success", "Profile updated successfully");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone. All your pets, progress, and data will be permanently lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "This is your last chance. Are you absolutely sure?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Delete My Account",
                  style: "destructive",
                  onPress: () => {
                    deleteAccount(user?._id!);
                    dispatch(logout());
                    removeToken();
                    AsyncStorage.clear();
                    router.replace("/(auth)/sign-in");
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Name</Text>
              <Input
                placeholder="Name"
                keyboardType="default"
                value={username}
                onChangeText={handleNameChange}
              />
              <Text style={styles.label}>Email</Text>
              <Input
                placeholder="Email"
                keyboardType="email-address"
                value={user?.email || ""}
                onChangeText={() => {}}
              />
            </View>

            {hasChanges && (
              <Button
                style={{ marginTop: 24 }}
                title="Save Changes"
                onPress={handleSave}
              />
            )}

            <Button
              style={{ marginTop: hasChanges ? 12 : 48 }}
              variant="danger"
              title="DELETE ACCOUNT"
              onPress={handleDeleteAccount}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
});
