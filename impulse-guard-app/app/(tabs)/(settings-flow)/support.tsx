import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { router } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import BackIcon from "@/assets/icons/back.svg";
import { Colors } from "@/constants/Colors";

const SUPPORT_EMAIL = "support@impulseguard.app";

type FAQItem = {
  question: string;
  answer: string;
};

const FAQ_DATA: FAQItem[] = [
  {
    question: "How do I start a session?",
    answer:
      "Go to the main screen and tap on 'I feel an impulse' button. Choose an activity and follow the guided session to help manage your impulse.",
  },
  {
    question: "How do I hatch my eggs?",
    answer:
      "Eggs hatch automatically after you complete enough sessions. Keep tracking your impulses and you'll see your eggs hatch into adorable pets!",
  },
  {
    question: "How do I take care of my pets?",
    answer:
      "Visit the Pets tab to see your collection. Tap on a pet to feed or play with it. Make sure to check on them regularly to keep them happy!",
  },
  {
    question: "What are Glims?",
    answer:
      "Glims are the in-app currency you earn by completing sessions and achieving goals. Use them in the shop to buy items for your pets.",
  },
  {
    question: "How do streaks work?",
    answer:
      "Streaks track consecutive days of successfully managing impulses. The longer your streak, the bigger the rewards!",
  },
  {
    question: "Can I change my impulse categories?",
    answer:
      "Yes! Go to Settings > Profile to update your tracked impulse categories at any time.",
  },
];

const FAQItemComponent = ({ item }: { item: FAQItem }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <FontAwesome6
          name={expanded ? "angle-up" : "angle-down"}
          size={16}
          color={Colors.light.neutralText}
        />
      </View>
      {expanded && <Text style={styles.faqAnswer}>{item.answer}</Text>}
    </TouchableOpacity>
  );
};

export default function SupportScreen() {
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
          <Text style={styles.headerTitle}>Help Center</Text>
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
          {FAQ_DATA.map((item, index) => (
            <View key={index}>
              <FAQItemComponent item={item} />
              {index < FAQ_DATA.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Contact Info */}
        <View style={styles.contactContainer}>
          <Text style={styles.contactText}>Still need help? Contact us at:</Text>
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
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "400",
    marginTop: 8,
    marginBottom: 12,
    color: Colors.light.neutralText,
  },
  faqContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  faqItem: {
    paddingVertical: 12,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.light.neutralText,
    marginTop: 8,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.paleText,
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
