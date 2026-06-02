import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Linking,
  ScrollView,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import ChartIcon from "@/assets/icons/chart.svg";
import InfinityIcon from "@/assets/icons/infinity.svg";
import PawIcon from "@/assets/icons/paw.svg";
import SwordsIcon from "@/assets/icons/swords.svg";
import NextIcon from "@/assets/icons/next.svg";
import { Colors } from "@/constants/Colors";
import CheckBox from "@/components/ui/CheckBox";
import CloseButtonWithTimer from "@/components/ui/CloseButtonWithTimer";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePaywall, PaywallPackage } from "@/hooks/usePaywall";

const PayWallTags: Array<{ Icon: React.ElementType; text: string }> = [
  { Icon: InfinityIcon, text: "Create more impulses and stay in control" },
  { Icon: SwordsIcon, text: "Get rewards, & faster progress" },
  { Icon: PawIcon, text: "Hatch more pets and unlock legendary pets" },
  { Icon: ChartIcon, text: "See progress and feel proud of your journey" },
];

type TagComponentProps = {
  icon: React.ElementType;
  text: string;
};

function TagComponent({ icon: Icon, text }: TagComponentProps) {
  return (
    <View style={styles.tagRoot}>
      <Icon width={24} height={24} color={"#000"} />
      <Text style={styles.tagTitle}>{text}</Text>
    </View>
  );
}

// Package types for identifying annual vs monthly
const ANNUAL_IDENTIFIERS = ["$rc_annual", "annual", "yearly"];
const MONTHLY_IDENTIFIERS = ["$rc_monthly", "monthly"];

function isAnnualPackage(pkg: PaywallPackage): boolean {
  return (
    ANNUAL_IDENTIFIERS.some((id) =>
      pkg.identifier.toLowerCase().includes(id.toLowerCase())
    ) || pkg.packageType === "ANNUAL"
  );
}

function isMonthlyPackage(pkg: PaywallPackage): boolean {
  return (
    MONTHLY_IDENTIFIERS.some((id) =>
      pkg.identifier.toLowerCase().includes(id.toLowerCase())
    ) || pkg.packageType === "MONTHLY"
  );
}

export default function PayWallModal() {
  const {
    isPaywallOpen,
    closePaywall,
    packages,
    isLoading,
    isPurchasing,
    purchase,
    restore,
  } = usePaywall();

  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Find annual and monthly packages
  const annualPackage = packages.find(isAnnualPackage);
  const monthlyPackage = packages.find(isMonthlyPackage);

  // Debug logs for trial
  console.log("📦 PayWall packages:", packages.length);
  console.log(
    "📦 Annual package:",
    annualPackage?.identifier,
    annualPackage?.product
  );
  console.log(
    "📦 Monthly package:",
    monthlyPackage?.identifier,
    monthlyPackage?.product
  );
  console.log("📦 Monthly introPrice:", monthlyPackage?.product?.introPrice);

  // Auto-select annual/yearly package when packages load
  useEffect(() => {
    if (!selectedPackage && packages.length > 0) {
      const annual = packages.find(isAnnualPackage);
      if (annual) {
        setSelectedPackage(annual.identifier);
      } else if (packages[0]) {
        setSelectedPackage(packages[0].identifier);
      }
    }
  }, [packages, selectedPackage]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    await purchase(selectedPackage);
  };

  const handleRestore = async () => {
    await restore();
  };

  const handleTermsPress = () => {
    Linking.openURL("https://impulseguard.app/docs/terms");
  };

  const handlePrivacyPress = () => {
    Linking.openURL("https://impulseguard.app/docs/policy");
  };

  if (!isPaywallOpen) {
    return null;
  }

  // Calculate savings for annual plan
  const calculateSavings = () => {
    if (!annualPackage || !monthlyPackage) return null;
    const annualPrice = annualPackage.product.price;
    const monthlyAnnualized = monthlyPackage.product.price * 12;
    const savings = Math.round(
      ((monthlyAnnualized - annualPrice) / monthlyAnnualized) * 100
    );
    return savings > 0 ? savings : null;
  };

  const savings = calculateSavings();

  return (
    <Modal
      visible={isPaywallOpen}
      animationType="fade"
      transparent={false}
      presentationStyle="fullScreen"
      onRequestClose={closePaywall}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.crossPosition}>
          <CloseButtonWithTimer timerMs={5000} onClose={closePaywall} />
        </View>
        <ScrollView contentContainerStyle={styles.root}>
          <Image
            source={require("@/assets/images/megaBrain.png")}
            style={styles.image}
          />

          <Text style={styles.title}>
            Everything you need to win your impulse battles
          </Text>

          <View style={styles.tagsContainer}>
            {PayWallTags.map((tag, index) => (
              <TagComponent icon={tag.Icon} text={tag.text} key={index} />
            ))}
          </View>

          {isLoading || packages.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              {!isLoading && packages.length === 0 && (
                <Text
                  style={{
                    marginTop: 12,
                    color: "#52585B",
                    textAlign: "center",
                  }}
                >
                  Loading plans...
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.plansContainer}>
              {/* Annual Plan */}
              {annualPackage && (
                <Pressable
                  style={[
                    styles.planRoot,
                    selectedPackage === annualPackage.identifier &&
                      styles.planSelected,
                  ]}
                  onPress={() => setSelectedPackage(annualPackage.identifier)}
                >
                  <View style={styles.planTextBox}>
                    <Text style={styles.planTitle}>Yearly Plan</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text style={styles.planDescription}>
                        {annualPackage.product.priceString} per year
                      </Text>
                    </View>
                  </View>
                  <View style={styles.planContentBox}>
                    {savings && (
                      <View style={styles.bargainTag}>
                        <Text style={styles.bargainTagTitle}>
                          SAVE {savings}%
                        </Text>
                      </View>
                    )}
                    <CheckBox
                      style={{ borderRadius: 9999 }}
                      value={selectedPackage === annualPackage.identifier}
                      onToggle={() =>
                        setSelectedPackage(annualPackage.identifier)
                      }
                    />
                  </View>
                </Pressable>
              )}

              {/* Monthly Plan with Trial */}
              {monthlyPackage && (
                <Pressable
                  style={[
                    styles.planRoot,
                    selectedPackage === monthlyPackage.identifier &&
                      styles.planSelected,
                  ]}
                  onPress={() => setSelectedPackage(monthlyPackage.identifier)}
                >
                  <View style={styles.planTextBox}>
                    <Text style={styles.planTitle}>
                      {monthlyPackage.product.priceString} per month
                    </Text>
                    {monthlyPackage.product.introPrice && (
                      <Text style={styles.trialDescription}>
                        {monthlyPackage.product.introPrice.periodNumberOfUnits}
                        -day free trial included
                      </Text>
                    )}
                  </View>
                  <View style={styles.planContentBox}>
                    <CheckBox
                      style={{ borderRadius: 9999 }}
                      value={selectedPackage === monthlyPackage.identifier}
                      onToggle={() =>
                        setSelectedPackage(monthlyPackage.identifier)
                      }
                    />
                  </View>
                </Pressable>
              )}

              {/* Fallback if no recognizable packages */}
              {!annualPackage && !monthlyPackage && packages.length > 0 && (
                <>
                  {packages.map((pkg) => (
                    <Pressable
                      key={pkg.identifier}
                      style={[
                        styles.planRoot,
                        selectedPackage === pkg.identifier &&
                          styles.planSelected,
                      ]}
                      onPress={() => setSelectedPackage(pkg.identifier)}
                    >
                      <View style={styles.planTextBox}>
                        <Text style={styles.planTitle}>
                          {pkg.product.title}
                        </Text>
                        <Text style={styles.planDescription}>
                          {pkg.product.priceString}
                        </Text>
                      </View>
                      <View style={styles.planContentBox}>
                        <CheckBox
                          style={{ borderRadius: 9999 }}
                          value={selectedPackage === pkg.identifier}
                          onToggle={() => setSelectedPackage(pkg.identifier)}
                        />
                      </View>
                    </Pressable>
                  ))}
                </>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              (isPurchasing || packages.length === 0) && styles.buttonDisabled,
            ]}
            onPress={handlePurchase}
            disabled={isPurchasing || !selectedPackage || packages.length === 0}
          >
            {isPurchasing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text style={styles.buttonTitle}>Level Up My Journey</Text>
                <NextIcon color={"white"} />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footerTextSmall}>
            ⭐ See results in just 3 days • 💬 Join thousands • 🔒 Cancel
            anytime
          </Text>

          <View style={styles.linksContainer}>
            <Pressable onPress={handleRestore} disabled={isPurchasing}>
              <Text style={styles.linkText}>Restore</Text>
            </Pressable>
            <Pressable onPress={handleTermsPress}>
              <Text style={styles.linkText}>Terms</Text>
            </Pressable>
            <Pressable onPress={handlePrivacyPress}>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 16,
  },
  root: {
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 20,
  },
  crossPosition: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
  },
  image: {
    height: 148,
    width: 148,
    resizeMode: "contain",
  },
  tagsContainer: {
    marginTop: 18,
    width: "100%",
    flexDirection: "column",
    gap: 12,
  },
  tagRoot: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  tagTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
    flexShrink: 1,
  },
  plansContainer: {
    marginTop: 18,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: "100%",
  },
  loadingContainer: {
    marginTop: 18,
    padding: 40,
  },
  planRoot: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderWidth: 2,
    borderColor: "#E1E3E4",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#F5F5F5",
  },
  planSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: "#6AC3CE1A",
  },
  planTextBox: {
    display: "flex",
    flexDirection: "column",
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  planDescription: {
    fontSize: 16,
    fontWeight: "400",
    color: "#52585B",
  },
  trialDescription: {
    fontSize: 12,
    fontWeight: "400",
    color: "#888",
    marginTop: 2,
  },
  planContentBox: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  bargainTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#FE5144",
  },
  bargainTagTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    marginTop: 28,
    flexDirection: "row",
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    width: "100%",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },
  footerTextSmall: {
    fontSize: 10,
    fontWeight: "400",
    marginTop: 8,
    color: "#52585B",
    textAlign: "center",
  },
  linksContainer: {
    flexDirection: "row",
    width: "90%",
    marginTop: 15,
    justifyContent: "center",
    gap: 24,
  },
  linkText: {
    textDecorationLine: "underline",
    color: "#A9A9A9",
    fontSize: 12,
  },
});
