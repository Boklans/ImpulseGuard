import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import ModalWithBlur from "@/components/ui/BluredModal";
import React, { useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import { UnlockedIcons } from "@/constants/Config";
import EventSource from "react-native-sse";
import { router } from "expo-router";
import { useAnalytics, AnalyticsEvents } from "@/hooks/useAnalytics";
import ConfettiCannon from "react-native-confetti-cannon";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withSequence,
} from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("window");

type NewAchievementModalProps = {
    isOpened: boolean;
    onClose: () => void;
}

interface AchievementData {
    icon: string;
    title: string;
    description: string;
}

export function NewAchievementModal(props: NewAchievementModalProps) {
    const { onClose, isOpened } = props;
    const { track } = useAnalytics();
    const [showConfetti, setShowConfetti] = React.useState(false);
    const confettiRef = useRef<any>(null);

    // Animation values
    const titleScale = useSharedValue(0);
    const iconScale = useSharedValue(0);
    const contentOpacity = useSharedValue(0);

    const [achievementData, setAchievementData] = React.useState<AchievementData | undefined>();

    // Start animations when modal opens
    useEffect(() => {
        if (isOpened && achievementData) {
            setShowConfetti(true);
            titleScale.value = withSpring(1, { damping: 8, stiffness: 100 });
            iconScale.value = withDelay(
                150,
                withSequence(
                    withSpring(1.2, { damping: 8, stiffness: 200 }),
                    withSpring(1, { damping: 10, stiffness: 200 })
                )
            );
            contentOpacity.value = withDelay(300, withSpring(1));
        } else {
            titleScale.value = 0;
            iconScale.value = 0;
            contentOpacity.value = 0;
            setShowConfetti(false);
        }
    }, [isOpened, achievementData]);

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: titleScale.value }],
    }));

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: iconScale.value }],
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: (1 - contentOpacity.value) * 15 }],
    }));

    useEffect(() => {
        const eventSource = new EventSource("/achievements/stream");

        eventSource.addEventListener("message", (event) => {
            if( event?.data != null ) {
                const data = JSON.parse(event.data);
                setAchievementData(data);
                track(AnalyticsEvents.ACHIEVEMENT_UNLOCKED, {
                    achievement_title: data.title,
                    achievement_icon: data.icon,
                });
            }
            onClose()
        });

        return () => {
            eventSource.close();
        };
    }, [track]);

    const handleGoToNotes = () => {
        router.push({
            pathname: "/(tabs)/(task-flow)/notes",
            params: {
                openModal: 1,
            },
        })
    }



    return (
        <>
            {showConfetti && (
                <ConfettiCannon
                    ref={confettiRef}
                    count={60}
                    origin={{ x: screenWidth / 2, y: -10 }}
                    autoStart={true}
                    fadeOut={true}
                    fallSpeed={2500}
                    explosionSpeed={300}
                    colors={["#FFD700", "#FFA500", "#6AC3CE", "#FF6B6B", "#4ECDC4"]}
                />
            )}
            <ModalWithBlur
                opened={isOpened}
                close={onClose}
                style={styles.root}
            >
                <Animated.Text style={[styles.title, titleAnimatedStyle]}>
                    Achievement unlocked!
                </Animated.Text>
                <View style={styles.achievementBox}>
                    <Animated.Image
                        style={[styles.achievementImage, iconAnimatedStyle]}
                        source={UnlockedIcons.get(achievementData?.icon!)}
                    />
                    <Animated.View style={contentAnimatedStyle}>
                        <Text style={styles.achievementTitle}>
                            {achievementData?.title}
                        </Text>
                        <Text style={styles.achievementDescription}>
                            {achievementData?.description}
                        </Text>
                    </Animated.View>
                </View>
                <Animated.View style={contentAnimatedStyle}>
                    <Button title={"Write your victory note"} onPress={handleGoToNotes} />
                    <View style={{ height: 8 }} />
                    <Button title={"Close"} onPress={onClose} variant={"ghost"} />
                </Animated.View>
            </ModalWithBlur>
        </>
    )
}


const styles = StyleSheet.create({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        marginVertical: "auto",
        marginHorizontal: "auto",
        paddingTop: 16,
        paddingBottom: 10,
        paddingHorizontal: 10,
    },
    title: {
        textAlign: "center",
        fontSize: 32,
        fontWeight: "medium",
    },
    achievementBox: {
        alignItems: "center",
        justifyContent: "center",
    },
    achievementImage: {
        objectFit: "contain",
        width: 154,
        height: 120,
    },
    achievementTitle: {
        fontSize: 24,
        fontWeight: "medium",
    },
    achievementDescription: {
        fontSize: 14,
        fontWeight: "light",
    }
});