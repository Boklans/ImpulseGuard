import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Alert, Platform } from "react-native";
import Constants from "expo-constants";
import { useApi } from "./useApi";
import { useAuth } from "@clerk/clerk-expo";
import { useAnalytics, AnalyticsEvents } from "./useAnalytics";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

// Check if running in Expo Go (not a development or production build)
// executionEnvironment is "bare" in dev/prod builds
const isExpoGo = Constants.executionEnvironment === "storeClient";

export interface SubscriptionInfo {
  isPremium: boolean;
  status: "none" | "active" | "expired" | "cancelled" | "grace_period";
  productId?: string;
  expiresAt?: string;
  willRenew?: boolean;
  periodType?: "trial" | "intro" | "normal";
  isOnTrial?: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
  trialDaysRemaining?: number;
}

export interface PaywallPackage {
  identifier: string;
  packageType: string;
  product: {
    title: string;
    description: string;
    price: number;
    priceString: string;
    currencyCode: string;
    introPrice?: {
      price: number;
      priceString: string;
      periodNumberOfUnits: number;
      periodUnit: string;
    };
  };
}

interface PaywallContextType {
  isPaywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  isSubscriptionInfoOpen: boolean;
  openSubscriptionInfo: () => void;
  closeSubscriptionInfo: () => void;
  subscriptionInfo: SubscriptionInfo;
  packages: PaywallPackage[];
  isLoading: boolean;
  isPurchasing: boolean;
  purchase: (packageId: string) => Promise<boolean>;
  restore: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
}

const defaultSubscriptionInfo: SubscriptionInfo = {
  isPremium: false,
  status: "none",
};

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

export function PaywallProvider({ children }: { children: ReactNode }) {
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isSubscriptionInfoOpen, setIsSubscriptionInfoOpen] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>(
    defaultSubscriptionInfo
  );
  const [packages, setPackages] = useState<PaywallPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  const api = useApi();
  const { userId } = useAuth();
  const { track } = useAnalytics();

  // Configure RevenueCat
  useEffect(() => {
    console.log("📢 usePaywall: Constants.executionEnvironment =", Constants.executionEnvironment);
    console.log("📢 usePaywall: isExpoGo =", isExpoGo);

    if (isExpoGo) {
      console.log("📢 usePaywall: Running in Expo Go, using mock packages");
      // Mock packages for Expo Go testing
      setPackages([
        {
          identifier: "$rc_annual",
          packageType: "ANNUAL",
          product: {
            title: "Yearly Plan",
            description: "Save 33%! Unlock all premium features for a year",
            price: 39.99,
            priceString: "$39.99",
            currencyCode: "USD",
          },
        },
        {
          identifier: "$rc_monthly",
          packageType: "MONTHLY",
          product: {
            title: "Monthly Plan",
            description: "Unlock all premium features",
            price: 4.99,
            priceString: "$4.99",
            currencyCode: "USD",
            introPrice: {
              price: 0,
              priceString: "$0.00",
              periodNumberOfUnits: 3,
              periodUnit: "DAY",
            },
          },
        },
      ]);
      setIsLoading(false);
      return;
    }

    const IOS_RC_KEY = "appl_yDePGFDaBELwYFKorYSZaNInxij";
    const ANDROID_RC_KEY = "goog_xxxxxxxxxxxxxxxxxxxxx";

    console.log("📢 usePaywall: Configuring RevenueCat...");

    try {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

      Purchases.configure({
        apiKey: Platform.select({
          ios: IOS_RC_KEY,
          android: ANDROID_RC_KEY,
        })!,
      });

      console.log("📢 usePaywall: RevenueCat configured successfully");
      setIsConfigured(true);
    } catch (err) {
      console.warn("📢 usePaywall: Failed to configure Purchases:", err);
      setIsLoading(false);
    }
  }, []);

  // Fetch subscription status from backend
  const fetchSubscriptionFromBackend = useCallback(async () => {
    try {
      const { data } = await api.get("/billing/subscription");
      setSubscriptionInfo(data);
    } catch (err) {
      console.warn("Failed to fetch subscription status:", err);
    }
  }, [api]);

  // Sync RevenueCat subscription with backend
  const syncSubscriptionWithBackend = useCallback(
    async (customerInfo: any) => {
      try {
        const activeEntitlements = customerInfo.entitlements?.active || {};
        const hasActiveEntitlement = Object.keys(activeEntitlements).length > 0;

        if (hasActiveEntitlement) {
          const entitlement = Object.values(activeEntitlements)[0] as any;
          await api.post("/billing/subscription/sync", {
            productId: entitlement.productIdentifier,
            expiresAt: entitlement.expirationDate,
            isActive: true,
          });
        }

        await fetchSubscriptionFromBackend();
      } catch (err) {
        console.warn("Failed to sync subscription:", err);
      }
    },
    [api, fetchSubscriptionFromBackend]
  );

  // Initialize offerings (doesn't require userId)
  useEffect(() => {
    if (!isConfigured) return;

    let isMounted = true;

    async function loadOfferings() {
      try {
        // Get available packages - this doesn't require login
        const offerings = await Purchases.getOfferings();
        console.log("📢 offerings loaded:", JSON.stringify(offerings, null, 2));

        if (isMounted && offerings.current) {
          const pkgs = offerings.current.availablePackages.map((pkg: any) => ({
            identifier: pkg.identifier,
            packageType: pkg.packageType,
            product: {
              title: pkg.product.title,
              description: pkg.product.description,
              price: pkg.product.price,
              priceString: pkg.product.priceString,
              currencyCode: pkg.product.currencyCode,
              introPrice: pkg.product.introPrice
                ? {
                    price: pkg.product.introPrice.price,
                    priceString: pkg.product.introPrice.priceString,
                    periodNumberOfUnits:
                      pkg.product.introPrice.periodNumberOfUnits,
                    periodUnit: pkg.product.introPrice.periodUnit,
                  }
                : undefined,
            },
          }));
          setPackages(pkgs);
        }

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("Failed to load offerings:", err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOfferings();

    return () => {
      isMounted = false;
    };
  }, [isConfigured]);

  // Login user and sync subscription (requires userId)
  useEffect(() => {
    if (!isConfigured || !userId) return;

    let isMounted = true;

    async function loginAndSync() {
      try {
        // Set user ID for RevenueCat
        await Purchases.logIn(userId!);

        // Get customer info
        const customerInfo = await Purchases.getCustomerInfo();
        if (isMounted) {
          await syncSubscriptionWithBackend(customerInfo);
        }

        // Set up listener for subscription changes
        Purchases.addCustomerInfoUpdateListener(
          async (info: any) => {
            if (isMounted) {
              await syncSubscriptionWithBackend(info);
            }
          }
        );
      } catch (err) {
        console.warn("Purchases login/sync error:", err);
        if (isMounted) {
          await fetchSubscriptionFromBackend();
        }
      }
    }

    loginAndSync();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured, userId]);

  const openPaywall = useCallback(() => {
    setIsPaywallOpen(true);
    track(AnalyticsEvents.PAYWALL_VIEWED);
  }, [track]);

  const closePaywall = useCallback(() => {
    setIsPaywallOpen(false);
    track(AnalyticsEvents.PAYWALL_CLOSED);
  }, [track]);

  const openSubscriptionInfo = useCallback(() => {
    setIsSubscriptionInfoOpen(true);
  }, []);

  const closeSubscriptionInfo = useCallback(() => {
    setIsSubscriptionInfoOpen(false);
  }, []);

  const purchase = useCallback(
    async (packageId: string): Promise<boolean> => {
      if (!isConfigured) {
        Alert.alert("Error", "Purchases not available");
        return false;
      }

      setIsPurchasing(true);

      try {
        const offerings = await Purchases.getOfferings();
        const pkg = offerings.current?.availablePackages.find(
          (p: any) => p.identifier === packageId
        );

        if (!pkg) {
          Alert.alert("Error", "Package not found");
          setIsPurchasing(false);
          return false;
        }

        track(AnalyticsEvents.PURCHASE_STARTED, {
          package_id: packageId,
          price: pkg.product.price,
          price_string: pkg.product.priceString,
        });

        const { customerInfo } = await Purchases.purchasePackage(pkg);
        await syncSubscriptionWithBackend(customerInfo);

        track(AnalyticsEvents.PURCHASE_COMPLETED, {
          package_id: packageId,
          price: pkg.product.price,
          price_string: pkg.product.priceString,
        });

        setIsPurchasing(false);
        setIsPaywallOpen(false);
        return true;
      } catch (err: any) {
        setIsPurchasing(false);

        if (err.userCancelled) {
          return false;
        }

        track(AnalyticsEvents.PURCHASE_FAILED, {
          package_id: packageId,
          error: err.message || "Unknown error",
        });

        Alert.alert("Purchase Failed", err.message || "An error occurred");
        return false;
      }
    },
    [isConfigured, syncSubscriptionWithBackend, track]
  );

  const restore = useCallback(async (): Promise<boolean> => {
    if (!isConfigured) {
      Alert.alert("Error", "Purchases not available");
      return false;
    }

    setIsPurchasing(true);
    track(AnalyticsEvents.RESTORE_STARTED);

    try {
      const customerInfo = await Purchases.restorePurchases();
      await syncSubscriptionWithBackend(customerInfo);

      const hasEntitlements =
        Object.keys(customerInfo.entitlements?.active || {}).length > 0;

      track(AnalyticsEvents.RESTORE_COMPLETED, {
        has_entitlements: hasEntitlements,
      });

      setIsPurchasing(false);

      if (hasEntitlements) {
        Alert.alert("Success", "Purchases restored successfully!");
        setIsPaywallOpen(false);
        return true;
      } else {
        Alert.alert("No Purchases", "No previous purchases found to restore.");
        return false;
      }
    } catch (err: any) {
      setIsPurchasing(false);
      Alert.alert("Restore Failed", err.message || "An error occurred");
      return false;
    }
  }, [isConfigured, syncSubscriptionWithBackend, track]);

  const refreshSubscription = useCallback(async () => {
    if (isConfigured) {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        await syncSubscriptionWithBackend(customerInfo);
      } catch (err) {
        console.warn("Failed to refresh subscription:", err);
      }
    } else {
      await fetchSubscriptionFromBackend();
    }
  }, [isConfigured, syncSubscriptionWithBackend, fetchSubscriptionFromBackend]);

  return (
    <PaywallContext.Provider
      value={{
        isPaywallOpen,
        openPaywall,
        closePaywall,
        isSubscriptionInfoOpen,
        openSubscriptionInfo,
        closeSubscriptionInfo,
        subscriptionInfo,
        packages,
        isLoading,
        isPurchasing,
        purchase,
        restore,
        refreshSubscription,
      }}
    >
      {children}
    </PaywallContext.Provider>
  );
}

export function usePaywall() {
  const context = useContext(PaywallContext);
  if (context === undefined) {
    throw new Error("usePaywall must be used within a PaywallProvider");
  }
  return context;
}

// Helper hook for checking premium status
export function usePremium() {
  const { subscriptionInfo, isLoading } = usePaywall();
  return {
    isPremium: subscriptionInfo.isPremium,
    isLoading,
    subscriptionInfo,
  };
}
