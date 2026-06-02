import ModalWithBlur from "@/components/ui/BluredModal";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { usePaywall } from "@/hooks/usePaywall";
import CrossIcon from "@/assets/icons/x.svg";
import Button from "@/components/ui/Button";

function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPlanName(productId?: string, isOnTrial?: boolean): string {
  if (!productId) return "Premium";
  const id = productId.toLowerCase();
  let planName = "Premium";
  if (id.includes("annual") || id.includes("yearly")) planName = "Yearly Plan";
  else if (id.includes("monthly")) planName = "Monthly Plan";

  return isOnTrial ? `${planName} (Trial)` : planName;
}

function getStatusColor(status: string, isOnTrial?: boolean): string {
  if (isOnTrial) return "#FF9800"; // Orange for trial
  switch (status) {
    case "active":
      return Colors.light.primary;
    case "grace_period":
      return "#FF9800";
    case "cancelled":
    case "expired":
      return "#E73700";
    default:
      return Colors.light.neutralText;
  }
}

function getStatusLabel(status: string, isOnTrial?: boolean): string {
  if (isOnTrial) return "Trial";
  switch (status) {
    case "active":
      return "Active";
    case "grace_period":
      return "Grace Period";
    case "cancelled":
      return "Cancelled";
    case "expired":
      return "Expired";
    default:
      return status;
  }
}

export default function SubscriptionInfoModal() {
  const {
    isSubscriptionInfoOpen,
    closeSubscriptionInfo,
    subscriptionInfo,
  } = usePaywall();

  const handleManageSubscription = () => {
    const url = Platform.select({
      ios: "itms-apps://apps.apple.com/account/subscriptions",
      android: "https://play.google.com/store/account/subscriptions",
    });
    if (url) {
      Linking.openURL(url);
    }
  };

  if (!isSubscriptionInfoOpen) {
    return null;
  }

  const isOnTrial = subscriptionInfo.isOnTrial;
  const trialDaysRemaining = subscriptionInfo.trialDaysRemaining;

  return (
    <ModalWithBlur
      style={styles.root}
      opened={isSubscriptionInfoOpen}
      close={closeSubscriptionInfo}
    >
      <Pressable style={styles.crossPosition} onPress={closeSubscriptionInfo}>
        <CrossIcon color={"#E1E3E4"} />
      </Pressable>

      <Text style={styles.title}>Your Subscription</Text>
      <Text style={styles.description}>Premium membership details</Text>

      {isOnTrial && trialDaysRemaining !== undefined && (
        <View style={styles.trialBanner}>
          <Text style={styles.trialBannerText}>
            {trialDaysRemaining > 0
              ? `${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""} left in your free trial`
              : "Your trial ends today"}
          </Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Plan</Text>
          <Text style={styles.value}>
            {getPlanName(subscriptionInfo.productId, isOnTrial)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Status</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(subscriptionInfo.status, isOnTrial) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusLabel(subscriptionInfo.status, isOnTrial)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            {isOnTrial
              ? "Trial ends on"
              : subscriptionInfo.willRenew
              ? "Renews on"
              : "Expires on"}
          </Text>
          <Text style={styles.value}>
            {formatDate(isOnTrial ? subscriptionInfo.trialEndDate : subscriptionInfo.expiresAt)}
          </Text>
        </View>

        {!isOnTrial && (
          <>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>Auto-renewal</Text>
              <Text
                style={[
                  styles.value,
                  {
                    color: subscriptionInfo.willRenew
                      ? Colors.light.primary
                      : "#E73700",
                  },
                ]}
              >
                {subscriptionInfo.willRenew ? "Enabled" : "Disabled"}
              </Text>
            </View>
          </>
        )}
      </View>

      <Button
        title="Done"
        onPress={closeSubscriptionInfo}
        style={{ marginTop: 16 }}
      />

      <Text style={styles.footerText}>
        {isOnTrial
          ? "Your subscription will start automatically when the trial ends. "
          : ""}
        To cancel or change your plan,{" "}
        <Text style={styles.footerLink} onPress={handleManageSubscription}>
          manage in App Store
        </Text>
      </Text>
    </ModalWithBlur>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    marginVertical: "auto",
    marginHorizontal: "auto",
    padding: 16,
    minWidth: 350,
    width: "90%",
  },
  crossPosition: {
    position: "absolute",
    top: 4,
    right: 4,
    zIndex: 10,
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "500",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    fontWeight: "300",
    textAlign: "center",
    color: Colors.light.neutralText,
    marginBottom: 16,
  },
  trialBanner: {
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  trialBannerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E65100",
    textAlign: "center",
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    color: Colors.light.neutralText,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.paleText,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.neutralText,
    textAlign: "center",
    marginTop: 12,
  },
  footerLink: {
    color: Colors.light.primary,
    textDecorationLine: "underline",
  },
});
