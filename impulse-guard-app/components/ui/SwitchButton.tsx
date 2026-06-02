import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "@/constants/Colors";
import Animated, {
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from "react-native-reanimated";

type SwitchButtonProps = {
    onPress: (state: boolean) => void;
    initialValue: boolean;
    isDisabled?: boolean;
    style?: ViewStyle;
};

export const SwitchButton: React.FC<SwitchButtonProps> = ({
                                                              onPress,
                                                              initialValue,
                                                              isDisabled,
                                                              style,
                                                          }) => {
    const xCord = useSharedValue(initialValue ? 20 : 0);
    const [isAnimated, setIsAnimated] = React.useState(false);

    const handlePress = () => {
        if (isDisabled || isAnimated) return;
        setIsAnimated(true);
        const nextPosition = xCord.value === 0 ? 20 : 0;
        xCord.value = withTiming(nextPosition, { duration: 300 }, () => {
            runOnJS(setIsAnimated)(false);
        });
        onPress(nextPosition == 20);
    };

    const animatedButtonStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            xCord.value,
            [0, 20],
            [Colors.light.neutral, Colors.light.primary]
        ),
    }));

    const animatedCircleStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: xCord.value }],
    }));

    return (
        <Animated.View style={[style, styles.button, animatedButtonStyle]}>
            <Pressable
                onPress={handlePress}
                style={({ pressed }) => [
                    isDisabled && styles.disabledButton,
                    pressed && !isDisabled && styles.pressedButton,
                ]}
            >
                <Animated.View style={[styles.circle, animatedCircleStyle]} />
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 30,
        width: 50,
        borderRadius: 99,
        padding: 2,
    },
    circle: {
        backgroundColor: "white",
        borderRadius: 99,
        aspectRatio: 1,
        height: "100%",
    },
    disabledButton: {
        opacity: 0.5,
    },
    pressedButton: {
        opacity: 0.7,
    },
});
