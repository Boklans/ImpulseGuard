import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import BackIcon from "@/assets/icons/back.svg";
import { Colors } from "@/constants/Colors";
import Button from "@/components/ui/Button";
import { useAppSelector } from "@/hooks/reduxHooks";

const SUPPORT_EMAIL = "support@impulseguard.app";

export default function FeedbackScreen() {
  const { user } = useAppSelector((s) => s.user);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "other">(
    "other"
  );
  const [isSending, setIsSending] = useState(false);

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert("Empty feedback", "Please write something before sending.");
      return;
    }

    setIsSending(true);

    const subject = encodeURIComponent(
      `ImpulseGuard Feedback [${feedbackType}]`
    );
    const body = encodeURIComponent(
      `Feedback Type: ${feedbackType}\n\nUser: ${user?.username || "Unknown"}\nEmail: ${user?.email || "Unknown"}\n\n---\n\n${feedbackText}`
    );

    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      await Linking.openURL(mailtoUrl);
      setFeedbackText("");
    } catch (error) {
      // Fallback: copy feedback to clipboard
      const feedbackContent = `Feedback Type: ${feedbackType}\n\n${feedbackText}`;
      await Clipboard.setStringAsync(feedbackContent);
      Alert.alert(
        "Email app not available",
        `Your feedback has been copied to clipboard. Please send it to ${SUPPORT_EMAIL}`,
        [{ text: "OK", onPress: () => setFeedbackText("") }]
      );
    } finally {
      setIsSending(false);
    }
  };

  const FeedbackTypeButton = ({
    type,
    label,
  }: {
    type: "bug" | "feature" | "other";
    label: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.feedbackTypeButton,
        feedbackType === type && styles.feedbackTypeButtonActive,
      ]}
      onPress={() => setFeedbackType(type)}
    >
      <Text
        style={[
          styles.feedbackTypeText,
          feedbackType === type && styles.feedbackTypeTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/settings")}
          >
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Feedback</Text>
        </View>

        <Text style={styles.description}>
          We'd love to hear from you! Let us know if you found a bug, have a
          feature request, or any other feedback.
        </Text>

        {/* Feedback Form */}
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackLabel}>What type of feedback?</Text>
          <View style={styles.feedbackTypeContainer}>
            <FeedbackTypeButton type="bug" label="Bug Report" />
            <FeedbackTypeButton type="feature" label="Feature Request" />
            <FeedbackTypeButton type="other" label="Other" />
          </View>

          <Text style={styles.feedbackLabel}>Your message</Text>
          <TextInput
            style={styles.feedbackInput}
            placeholder="Describe your issue or suggestion..."
            placeholderTextColor={Colors.light.neutralText}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={feedbackText}
            onChangeText={setFeedbackText}
          />

          <Button
            title={isSending ? "Opening email..." : "SEND FEEDBACK"}
            onPress={handleSendFeedback}
            variant="primary"
            disabled={isSending || !feedbackText.trim()}
            style={styles.sendButton}
          />
        </View>

        {/* Contact Info */}
        <View style={styles.contactContainer}>
          <Text style={styles.contactText}>
            You can also reach us directly at:
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          >
            <Text style={styles.contactEmail}>{SUPPORT_EMAIL}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  backButton: {
    backgroundColor: "white",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.light.text,
  },
  description: {
    fontSize: 16,
    color: Colors.light.neutralText,
    marginBottom: 24,
    lineHeight: 22,
  },
  feedbackContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 8,
  },
  feedbackTypeContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  feedbackTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.light.pale,
  },
  feedbackTypeButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  feedbackTypeText: {
    fontSize: 14,
    color: Colors.light.neutralText,
  },
  feedbackTypeTextActive: {
    color: "white",
    fontWeight: "600",
  },
  feedbackInput: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
    color: Colors.light.text,
  },
  sendButton: {
    marginTop: 8,
  },
  contactContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  contactText: {
    fontSize: 14,
    color: Colors.light.neutralText,
  },
  contactEmail: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: "600",
    marginTop: 4,
  },
});
