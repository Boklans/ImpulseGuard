import React, {useRef, useState, useEffect} from "react";
import CheckBox from "@/components/ui/CheckBox";
import {Animated, Pressable, View, Text, StyleSheet, ViewStyle, Dimensions} from "react-native";
import ReAnimated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import {ExpandableView} from "@/components/ExpandableView";
import ArrowDownIcon from "@/assets/icons/ArrowDown.svg";
import ModalWithBlur from "@/components/ui/BluredModal";
import {Colors} from "@/constants/Colors";

export interface TaskCardProps {
    title: string;
    description: string;
    completeness: boolean;
    createdAt?: number;
    onComplete: () => void;
    onCardEdit?: () => void;
    onCardDelete?: () => void;
    style?: ViewStyle;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export function TaskCard({
    title,
    description,
    onComplete,
    onCardEdit,
    onCardDelete,
    completeness,
    style,
}: TaskCardProps) {
    const [isTextExpanded, setIsTextExpanded] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const iconRef = useRef<View>(null);

    const animatedHeight = useRef(new Animated.Value(1)).current;
    const arrowRotation = useSharedValue(0);

    useEffect(() => {
        arrowRotation.value = withSpring(isTextExpanded ? 180 : 0, {
            damping: 15,
            stiffness: 200,
        });
    }, [isTextExpanded]);

    const arrowAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${arrowRotation.value}deg` }],
    }));

    const handleArrowPress = () => {
        iconRef.current?.measure((fx, fy, width, height, px, py) => {
            let modalX = px;
            let modalY = py + height;

            if (modalX + 150 > screenWidth) modalX = screenWidth - 120;
            if (modalY + 100 > screenHeight) modalY = screenHeight - 120;

            setModalPosition({ x: modalX, y: modalY });
            setIsModalVisible(true);
        });
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const handleDelete = () => {
        closeModal();
        Animated.timing(animatedHeight, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            onCardDelete && onCardDelete();
        });
    };

    const handleEdit = () => {
        closeModal();
        onCardEdit && onCardEdit();
    };

    return (
        <View>
            <ExpandableView
                style={[styles.root, {opacity: animatedHeight}]}
                minHeight={70}
                onToggle={(x) => setIsTextExpanded(x)}
            >
                <View style={{flexDirection: "row", gap: 12, width: "100%", paddingRight: 20}} >
                    <CheckBox
                        value={completeness}
                        onToggle={onComplete}
                    />
                    <View style={{ flex: 1, gap: 6}} >
                        <Text
                            style={[
                                styles.title,
                                completeness && styles.completedTitle,
                                { paddingRight: 10, maxWidth: "100%" },
                            ]}
                            ellipsizeMode="tail"
                            numberOfLines={isTextExpanded ? undefined : 2}
                        >
                            {title.trim()}
                        </Text>
                        {description && (
                            <Text
                                style={[
                                    styles.descriptionText,
                                    completeness && styles.completedDescription,
                                    { paddingRight: 10, maxWidth: "100%" },
                                ]}
                                ellipsizeMode="tail"
                                numberOfLines={isTextExpanded ? undefined : 2}
                            >
                                {description.trim()}
                            </Text>
                        )}
                    </View>
                </View>
                <Pressable
                    ref={iconRef}
                    onPress={handleArrowPress}
                    style={{ position: "absolute", top: 4, right: 4 }}
                >
                    <ReAnimated.View style={arrowAnimatedStyle}>
                        <ArrowDownIcon color={"#E1E3E4"} width={24} height={24} />
                    </ReAnimated.View>
                </Pressable>
            </ExpandableView>
            <ModalWithBlur
                opened={isModalVisible}
                close={closeModal}
                style={{
                    width: 100,
                    marginTop: modalPosition.y,
                    marginRight: 15,
                    marginLeft: "auto",
                }}
            >
                <Pressable style={styles.modalButton} onPress={handleEdit}>
                    <Text style={styles.modalButtonText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.modalButton} onPress={handleDelete}>
                    <Text style={styles.modalButtonText}>Delete</Text>
                </Pressable>
            </ModalWithBlur>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        borderRadius: 10,
        backgroundColor: "white",
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 12,
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "500",
    },
    descriptionText: {
        fontSize: 14,
        fontWeight: "300",
        color: "#6C6C6C",
    },
    completedTitle: {
        textDecorationLine: "line-through",
        color: "#A0A0A0",
    },
    completedDescription: {
        color: "#A0A0A0",
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: "center",
        width: "100%",
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
});