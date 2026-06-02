import {
    KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";
import React, { useMemo, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import axios from "axios";
import { BASE_URL } from "@/constants/Config";
import { setCredentials } from "@/redux/slices/user";
import { saveToken } from "@/utils/secureStorage";
import { router } from "expo-router";
import { useAuth, useSignIn } from "@clerk/clerk-expo";
import OtpInput from "@/components/ui/OtpInput";
import { useDispatch } from "react-redux";

const emailValidationSchema = Yup.object().shape({
    email: Yup.string()
        .email("Invalid email address")
        .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Invalid domain in email address"
        )
        .required("Email is required"),
});

const codeValidationSchema = Yup.object().shape({
    verificationCode: Yup.string()
        .required("provide verification Code")
        .min(6, "Must be at least 6 characters"),
})

const passwordValidationSchema = Yup.object().shape({
    password: Yup.string()
        .required("Password is required")
        .min(6, "Must be at least 6 characters"),
    verifyPassword: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref('password')], "Passwords must match"),
});


enum RecoveringState {
    EMAIL,
    VERIFICATION,
    PASSWORD,
}


const buttonTexts: Record<RecoveringState, string> = {
    [RecoveringState.EMAIL]: "Recover password",
    [RecoveringState.VERIFICATION]: "Verify code",
    [RecoveringState.PASSWORD]: "Set new password",
};

export default function ForgotPasswordScreen() {
    const dispatch = useDispatch();
    const [recoverStatus, setRecoverStatus] = useState<RecoveringState>(RecoveringState.VERIFICATION);
    const [formError, setFormError] = useState<string | null>(null);
    const { isLoaded, signIn, setActive } = useSignIn()
    const { getToken } = useAuth();
    const [ successfulCreation, setSuccessfulCreation ] = useState(false)

    const handleSubmit = () => {
        switch (recoverStatus) {
            case RecoveringState.EMAIL:
                emailForm.submitForm();
                break;
            case RecoveringState.VERIFICATION:
                verificationCodeForm.submitForm();
                break;
            case RecoveringState.PASSWORD:
                passwordForm.submitForm();
                break;
            default:
                break;
        }
    };


    const emailForm = useFormik({
        initialValues: { email: ""},
        validationSchema: emailValidationSchema,
        onSubmit: async (formValues) => {
            await signIn
                ?.create({
                    strategy: 'reset_password_email_code',
                    identifier: formValues.email,
                })
                .then((_) => {
                    setRecoverStatus(RecoveringState.VERIFICATION)
                    setSuccessfulCreation(true)
                    setFormError('')
                })
                .catch((err) => {
                    console.error('error', err.errors[0].longMessage)
                    setFormError(err.errors[0].longMessage)
                })
        },
    });

    const verificationCodeForm = useFormik({
        initialValues: { verificationCode: "" },
        validationSchema: codeValidationSchema,
        onSubmit: async (formValues) => {
            setRecoverStatus(RecoveringState.PASSWORD)
        },
    });

    const passwordForm = useFormik({
        initialValues: { password: "", verifyPassword: "" },
        validationSchema: passwordValidationSchema,
        onSubmit: async (formValues) => {
            if (!isLoaded) {
                console.error("Clerk is not loaded");
                return;
            }
            try {
                const result = await signIn.attemptFirstFactor({
                    strategy: 'reset_password_email_code',
                    code: verificationCodeForm.values.verificationCode,
                    password: formValues.password,
                });

                if (result.status === 'complete') {
                    await setActive({ session: result.createdSessionId });

                    const jwt = await getToken({ template: "api" });
                    if (!jwt) {
                        throw new Error("Log in failed");
                    }

                    const { data: user } = await axios.get(`${BASE_URL}/auth/me`, {
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
                    router.push("/(tabs)/(impulses-flow)/impulses");
                    setFormError('');
                } else {
                    console.log("Incomplete login attempt:", result);
                }
            } catch (err) {
                console.error('error', err)
            }
        }
    });

    const isSubmitting = useMemo(
        () => emailForm.isSubmitting || verificationCodeForm.isSubmitting || passwordForm.isSubmitting,
        [emailForm, verificationCodeForm, passwordForm]
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
                <SafeAreaView style={styles.root}>
                    <View style={{ flex: 1, justifyContent: "center", padding: 20}}>
                        <View style={{ flex: 1, justifyContent: "center" }}>
                            <Text style={styles.title}>Forgot password?</Text>
                        </View>

                        {
                            recoverStatus === RecoveringState.EMAIL ?
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    value={emailForm.values.email}
                                    onChangeText={emailForm.handleChange("email")}
                                    onBlur={emailForm.handleBlur("email")}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                {emailForm.touched.email && emailForm.errors.email && (
                                    <Text style={styles.errorText}>{emailForm.errors.email}</Text>
                                )}
                            </View> : null
                        }

                        {
                            recoverStatus === RecoveringState.VERIFICATION ?
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Enter code we sent to your email</Text>
                                    <OtpInput onChange={(val) => verificationCodeForm.setFieldValue("verificationCode", val)} />
                                    {verificationCodeForm.touched.verificationCode && verificationCodeForm.errors.verificationCode && (
                                        <Text style={styles.errorText}>{verificationCodeForm.errors.verificationCode}</Text>
                                    )}
                                </View> : null
                        }

                        {
                            recoverStatus === RecoveringState.PASSWORD ?
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>New password</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="New password"
                                        value={passwordForm.values.password}
                                        onChangeText={passwordForm.handleChange("password")}
                                        onBlur={passwordForm.handleBlur("password")}
                                        autoCapitalize="none"
                                        secureTextEntry
                                    />
                                    {passwordForm.touched.password && passwordForm.errors.password && (
                                        <Text style={styles.errorText}>{passwordForm.errors.password}</Text>
                                    )}
                                    <Text style={styles.label}>Verify password</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Verify password"
                                        value={passwordForm.values.verifyPassword}
                                        onChangeText={passwordForm.handleChange("verifyPassword")}
                                        onBlur={passwordForm.handleBlur("verifyPassword")}
                                        autoCapitalize="none"
                                        secureTextEntry
                                    />
                                    {passwordForm.touched.verifyPassword && passwordForm.errors.verifyPassword && (
                                        <Text style={styles.errorText}>{passwordForm.errors.verifyPassword}</Text>
                                    )}
                                </View> : null
                        }

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
                                {isSubmitting ? "Loading…" : (buttonTexts[recoverStatus])}
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
    )
}

const styles = StyleSheet.create({
    root: {
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