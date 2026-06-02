import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Button,
} from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSignIn, useUser } from "@clerk/clerk-expo";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/user";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import { BASE_URL } from "@/constants/Config";
import { saveToken } from "@/utils/secureStorage";
import { GoogleAuthView } from "@/components/ui/GoogleAuthView";
import { AppleAuthView } from "@/components/ui/AppleAuthView";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSSO } from "@clerk/clerk-expo";
import { useAnalytics, AnalyticsEvents } from "@/hooks/useAnalytics";

// test account for sign in
// rudenko.albert.n@gmail.com
// 7382134064Rud

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid domain in email address"
    )
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Must be at least 6 characters"),
});

export default function SignInScreen() {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [formError, setFormError] = useState<string | null>(null);
  const { track } = useAnalytics();
  const {
    handleChange,
    handleSubmit,
    handleBlur,
    values,
    errors,
    touched,
    isSubmitting,
    setSubmitting,
  } = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (formValues) => {
      try {
        setFormError(null);

        if (!isLoaded) throw new Error("Clerk is not loaded");

        const result = await signIn.create({
          identifier: formValues.email,
          password: formValues.password,
        });

        if (result.status !== "complete")
          throw new Error(
            "Additional steps required to log in. Please check your email."
          );

        await setActive({ session: result.createdSessionId });

        const jwt = await getToken({ template: "api" });

        if (!jwt) throw new Error("Log in failed");

        const { data: user } = await axios.get(BASE_URL + "/auth/me", {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        dispatch(
          setCredentials({
            token: jwt,
            user,
          })
        );

        await saveToken(jwt);

        track(AnalyticsEvents.USER_SIGNED_IN, { provider: "email" });

        router.replace("/(tabs)/(impulses-flow)/impulses");
      } catch (err: any) {
        const msg = err.message;
        setFormError(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useWarmUpBrowser();

  // Use the `useSSO()` hook to access the `startSSOFlow()` method
  const { startSSOFlow } = useSSO();

  const onGooglePress = useCallback(async () => {
    try {
      const { createdSessionId, signUp } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "myapp",
          path: "redirect",
        }),
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        await new Promise((resolve) => setTimeout(resolve, 500));

        const jwt = await getToken({ template: "api", skipCache: true });
        if (!jwt) throw new Error("Log in failed");

        const { data: user } = await axios.get(BASE_URL + "/auth/me", {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        dispatch(setCredentials({ token: jwt, user }));
        await saveToken(jwt);

        track(AnalyticsEvents.USER_SIGNED_IN, { provider: "google" });

        if (!user.isOnboardingCompleted) {
          router.replace("/(onboarding)/select-impulse");
        } else {
          router.replace("/(tabs)/(impulses-flow)/impulses");
        }
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, [startSSOFlow, setActive, getToken, dispatch]);

  const onApplePress = useCallback(async () => {
    try {
      const { createdSessionId, signUp } = await startSSOFlow({
        strategy: "oauth_apple",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "myapp",
          path: "redirect",
        }),
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        await new Promise((resolve) => setTimeout(resolve, 500));

        const jwt = await getToken({ template: "api", skipCache: true });
        if (!jwt) throw new Error("Log in failed");

        const { data: user } = await axios.get(BASE_URL + "/auth/me", {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        dispatch(setCredentials({ token: jwt, user }));
        await saveToken(jwt);

        track(AnalyticsEvents.USER_SIGNED_IN, { provider: "apple" });

        if (!user.isOnboardingCompleted) {
          router.replace("/(onboarding)/select-impulse");
        } else {
          router.replace("/(tabs)/(impulses-flow)/impulses");
        }
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, [startSSOFlow, setActive, getToken, dispatch]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <SafeAreaView style={styles.container}>
          <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={styles.title}>Welcome back!</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                secureTextEntry
              />
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
              <Text
                style={{ textAlign: "right", color: "#555" }}
                onPress={() => router.replace("/(auth)/forgot-password")}
              >
                Forgot password?
              </Text>

              <GoogleAuthView onPress={onGooglePress} style={{ marginTop: 15 }} />
              <AppleAuthView onPress={onApplePress} style={{ marginTop: 10 }} />
            </View>

            {formError && (
              <Text style={[styles.errorText, { textAlign: "center" }]}>
                {formError}
              </Text>
            )}

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => handleSubmit()}
              disabled={isSubmitting}
            >
              <Text style={styles.startButtonText}>
                {isSubmitting ? "Loading…" : "Log in"}
              </Text>
            </TouchableOpacity>

            <Text
              style={{ textAlign: "center", color: "#555", marginBottom: 12 }}
              onPress={() => router.replace("/(auth)/sign-up")}
            >
              Don't have an account? Sign up
            </Text>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  label: {
    fontSize: 20,
    fontWeight: "400",
    textAlign: "left",
    marginBottom: 4,
  },
  inputContainer: {
    flex: 3,
    marginBottom: 20,
  },
  input: {
    height: 56,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 20,
    fontWeight: "300",
    color: "#555",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: "#6AC3CE",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 10,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "500",
  },
});
