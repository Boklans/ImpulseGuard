import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Animated,
} from "react-native";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import { useAuth, useClerk, useSignUp } from "@clerk/clerk-expo";
import { setCredentials } from "@/redux/slices/user";
import { router } from "expo-router";
import axios from "axios";
import { BASE_URL } from "@/constants/Config";
import { saveToken } from "@/utils/secureStorage";
import { GoogleAuthView } from "@/components/ui/GoogleAuthView";
import { AppleAuthView } from "@/components/ui/AppleAuthView";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSSO } from "@clerk/clerk-expo";
import { useWarmUpBrowser } from "./sign-in";
import { useAnalytics, AnalyticsEvents } from "@/hooks/useAnalytics";

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required("Name is required")
    .min(2, "Must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid domain in email address"
    )
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .matches(/^[\x00-\x7F]*$/, "Password must not contain Cyrillic characters")
    .min(8, "Must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[^a-zA-Z0-9]/, "Must contain at least one special character")
    .matches(/\d/, "Must contain at least one number"),
});

export default function RegisterScreen() {
  const dispatch = useDispatch();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { track } = useAnalytics();

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const {
    isValid,
    handleChange,
    handleSubmit,
    handleBlur,
    values,
    errors,
    touched,
    isSubmitting,
    setSubmitting,
  } = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (formValues, { setSubmitting }) => {
      if (!isLoaded) {
        setSubmitting(false);
        return;
      }
      try {
        await signUp.create({
          emailAddress: formValues.email,
          password: formValues.password,
          firstName: formValues.username.trim(),
        });

        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setPendingVerification(true);
      } catch (err) {
        console.error("Register error:", JSON.stringify(err, null, 2));
        await signOut();
      } finally {
        setSubmitting(false);
      }
    },
  });

  useWarmUpBrowser();
  WebBrowser.maybeCompleteAuthSession();

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });

        const jwt = await getToken({ template: "api" });

        if (jwt === null) {
          throw new Error("Sing up failed");
        }

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

        track(AnalyticsEvents.USER_SIGNED_UP, { provider: "email" });

        router.replace("/(onboarding)/select-impulse");
      } else {
        console.error("Verification not complete:", signUpAttempt);
      }
    } catch (err) {
      console.error("Verification error:", JSON.stringify(err, null, 2));
    }
  };

  const glowAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (values.email.trim() === "") return;
    const animation = Animated.timing(glowAnim, {
      toValue: isValid ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    });

    animation.start();

    return () => animation.stop();
  }, [isValid]);

  const glowingStyle = {
    shadowOpacity: glowAnim,
    shadowColor: "#6AC3CE",
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 7],
    }),
  };

  const { startSSOFlow } = useSSO();

  const onGooglePress = useCallback(async () => {
    if (!isLoaded) return;
    try {
      const { createdSessionId, signIn, signUp } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "myapp",
          path: "redirect",
        }),
      });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        await new Promise((resolve) => setTimeout(resolve, 500));

        const jwt = await getToken({ template: "api", skipCache: true });
        if (!jwt) throw new Error("JWT template 'api' is missing");

        const { data: user } = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        dispatch(setCredentials({ token: jwt, user }));
        await saveToken(jwt);

        if (!user.isOnboardingCompleted) {
          track(AnalyticsEvents.USER_SIGNED_UP, { provider: "google" });
        } else {
          track(AnalyticsEvents.USER_SIGNED_IN, { provider: "google" });
        }

        router.replace(
          user.isOnboardingCompleted
            ? "/(tabs)/(impulses-flow)/impulses"
            : "/(onboarding)/select-impulse"
        );
      }
    } catch (err) {
      console.error("Google SSO error:", err);
    }
  }, [isLoaded, startSSOFlow, setActive, getToken, dispatch]);

  const onApplePress = useCallback(async () => {
    if (!isLoaded) return;
    try {
      const { createdSessionId, signIn, signUp } = await startSSOFlow({
        strategy: "oauth_apple",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "myapp",
          path: "redirect",
        }),
      });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        await new Promise((resolve) => setTimeout(resolve, 500));

        const jwt = await getToken({ template: "api", skipCache: true });
        if (!jwt) throw new Error("JWT template 'api' is missing");

        const { data: user } = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        dispatch(setCredentials({ token: jwt, user }));
        await saveToken(jwt);

        if (!user.isOnboardingCompleted) {
          track(AnalyticsEvents.USER_SIGNED_UP, { provider: "apple" });
        } else {
          track(AnalyticsEvents.USER_SIGNED_IN, { provider: "apple" });
        }

        router.replace(
          user.isOnboardingCompleted
            ? "/(tabs)/(impulses-flow)/impulses"
            : "/(onboarding)/select-impulse"
        );
      }
    } catch (err) {
      console.error("Apple SSO error:", err);
    }
  }, [isLoaded, startSSOFlow, setActive, getToken, dispatch]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <SafeAreaView style={styles.container}>
          <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={styles.title}>Let's start your journey!</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={values.username}
                onChangeText={handleChange("username")}
                onBlur={handleBlur("username")}
              />
              {touched.username && errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}

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
              {values.password.length > 0 && (
                <View style={styles.passwordRequirements}>
                  <Text style={[
                    styles.requirementText,
                    values.password.length >= 8 && styles.requirementMet
                  ]}>
                    {values.password.length >= 8 ? "✓" : "○"} At least 8 characters
                  </Text>
                  <Text style={[
                    styles.requirementText,
                    /[A-Z]/.test(values.password) && styles.requirementMet
                  ]}>
                    {/[A-Z]/.test(values.password) ? "✓" : "○"} One uppercase letter
                  </Text>
                  <Text style={[
                    styles.requirementText,
                    /[a-z]/.test(values.password) && styles.requirementMet
                  ]}>
                    {/[a-z]/.test(values.password) ? "✓" : "○"} One lowercase letter
                  </Text>
                  <Text style={[
                    styles.requirementText,
                    /\d/.test(values.password) && styles.requirementMet
                  ]}>
                    {/\d/.test(values.password) ? "✓" : "○"} One number
                  </Text>
                  <Text style={[
                    styles.requirementText,
                    /[^a-zA-Z0-9]/.test(values.password) && styles.requirementMet
                  ]}>
                    {/[^a-zA-Z0-9]/.test(values.password) ? "✓" : "○"} One special character
                  </Text>
                </View>
              )}
              {touched.password && errors.password && values.password.length === 0 && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
              <GoogleAuthView
                onPress={onGooglePress}
                style={{ marginTop: 15 }}
              />
              <AppleAuthView
                onPress={onApplePress}
                style={{ marginTop: 10 }}
              />
            </View>

            {!pendingVerification ? (
              <Animated.View style={glowingStyle} pointerEvents="box-none">
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    isSubmitting && styles.startButtonDisabled,
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                >
                  <Text style={styles.startButtonText}>
                    {isSubmitting ? "Loading..." : "Sign up"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <>
                <Text style={styles.label}>Verification Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter the code"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={onVerifyPress}
                >
                  <Text style={styles.startButtonText}>Verify</Text>
                </TouchableOpacity>
              </>
            )}

            <Text
              style={{ textAlign: "center", color: "#555", marginBottom: 12 }}
              onPress={() => router.replace("/(auth)/sign-in")}
            >
              Already have an account? Log in
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
  passwordRequirements: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  requirementText: {
    fontSize: 13,
    color: "#888",
    marginBottom: 2,
  },
  requirementMet: {
    color: "#4CAF50",
  },
  startButton: {
    backgroundColor: "#6AC3CE",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 10,
  },
  startButtonDisabled: {
    backgroundColor: "#A0D8DE",
    opacity: 0.7,
  },
  glowingEffect: {
    shadowColor: "#6AC3CE",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "500",
  },
});
