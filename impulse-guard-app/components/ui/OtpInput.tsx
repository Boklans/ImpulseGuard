import React, { useEffect, useRef, useState } from "react";
import { TextInput, View, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

type OTPInputProps = {
    onChange: (val: string) => void;
};

export default function OTPInput({ onChange }: OTPInputProps) {
    const inputsRef = useRef<(TextInput | null)[]>([]);
    const [otpValues, setOtpValues] = useState(Array(6).fill(""));

    const handleChange = (text: string, index: number) => {
        const filteredText = text.replace(/[^0-9]/g, "");
        const updatedOtp = [...otpValues];

        if (text.length > 1) {
            for (let i = 0; i < filteredText.length && index + i < updatedOtp.length; i++) {
                updatedOtp[index + i] = filteredText[i];
            }
            setOtpValues(updatedOtp);

            const nextIndex = Math.min(index + filteredText.length, updatedOtp.length - 1);
            inputsRef.current[nextIndex]?.focus();
        } else {
            updatedOtp[index] = filteredText;
            setOtpValues(updatedOtp);

            if (filteredText && index < updatedOtp.length - 1) {
                inputsRef.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (event: any, index: number) => {
        const updatedOtp = [...otpValues];
        if (event.nativeEvent.key !== "Backspace") return;

        if (otpValues[index] === "") {
            if (index > 0) {
                inputsRef.current[index - 1]?.focus();
                updatedOtp[index - 1] = "";
            }
        } else {
            updatedOtp[index] = "";
        }
        setOtpValues(updatedOtp);
    };

    useEffect(() => {
        onChange(otpValues.join(""));
    }, [otpValues]);

    return (
        <View style={styles.container}>
            {otpValues.map((value, index) => (
                <TextInput
                    key={index}
                    ref={(el) => {
                        inputsRef.current[index] = el;
                    }}
                    style={styles.input}
                    keyboardType="numeric"
                    value={value}
                    onChangeText={(text) => handleChange(text.trim(), index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    input: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderRadius: 11,
        borderColor: Colors.light.primary,
        textAlign: "center",
        fontSize: 18,
    },
});
