import React, { useEffect } from "react";
import CheckIcon from "@/assets/icons/check.svg";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "@/constants/Colors";
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

type CheckBoxProps = {
    value: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    onToggle: () => void;
};

const CheckBox: React.FC<CheckBoxProps> = ({
    value,
    disabled = false,
    style,
    onToggle,
}) => {
    const scale = useSharedValue(1);
    const checked = useSharedValue(value ? 1 : 0);
    const checkmarkScale = useSharedValue(value ? 1 : 0);

    useEffect(() => {
        checked.value = withTiming(value ? 1 : 0, { duration: 200 });
        checkmarkScale.value = withSpring(value ? 1 : 0, {
            damping: 12,
            stiffness: 300,
        });
    }, [value]);

    const handlePress = () => {
        scale.value = withSpring(0.85, { damping: 15, stiffness: 400 }, () => {
            scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        });
        onToggle();
    };

    const animatedBoxStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        backgroundColor: interpolateColor(
            checked.value,
            [0, 1],
            ["#fff", "#6AC3CE"]
        ),
    }));

    const animatedCheckStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkmarkScale.value }],
        opacity: checkmarkScale.value,
    }));

    return (
        <Pressable onPress={handlePress} disabled={disabled}>
            <Animated.View style={[styles.checkbox, style, animatedBoxStyle]}>
                <Animated.View style={[styles.iconContainer, animatedCheckStyle]}>
                    <CheckIcon color={"#fff"} width={20} height={20} />
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    checkbox: {
        borderRadius: 4,
        height: 20,
        width: 20,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: Colors.light.primary,
    },
    iconContainer: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
    },
});

export default CheckBox;
