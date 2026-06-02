import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
    useSharedValue, useAnimatedProps, withTiming, Easing, runOnJS,
} from "react-native-reanimated";

export default function CloseButtonWithTimer({timerMs, onClose}: {timerMs: number, onClose: () => void}) {
    const [isCross, setIsCross] = useState(false);
    const progress = useSharedValue(0);

    const AnimatedCircle = Animated.createAnimatedComponent(Circle);

    const radius = 12;
    const circumference = 2 * Math.PI * radius;

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference - progress.value * circumference;
        return {
            strokeDashoffset,
        };
    });

    React.useEffect(() => {
        progress.value = withTiming(1, {
            duration: timerMs,
            easing: Easing.linear,
        }, () => {
            runOnJS(setIsCross)(true);
        });
    }, []);

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => {
                onClose();
            }}
            disabled={!isCross}
        >
            {!isCross ? (
                <Svg width={30} height={30}>
                    <Circle
                        cx={radius + 1} // трохи відступу для strokeWidth
                        cy={radius + 1}
                        r={radius}
                        strokeWidth={2}
                        stroke="#eee"
                        fill="none"
                    />
                    <AnimatedCircle
                        cx={radius + 1}
                        cy={radius + 1}
                        r={radius}
                        stroke="#888"
                        strokeWidth={2}
                        strokeDasharray={`${circumference} ${circumference}`}
                        animatedProps={animatedProps}
                        fill="none"
                    />
                </Svg>
            ) : (
                <Text style={styles.cross}>✕</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    cross: {
        fontSize: 18,
        color: "#888",
        fontWeight: "bold",
    },
});
