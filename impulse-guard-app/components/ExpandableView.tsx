import {Animated, LayoutChangeEvent, Pressable, StyleSheet, ViewStyle} from "react-native";
import React, { useRef, useState } from "react";
import {StyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";

export interface NoteCardProps {
    children?: React.ReactNode;
    onToggle: (isExpanded: boolean) => void;
    minHeight: number;
    style?: StyleProp<ViewStyle>;
}

export function ExpandableView(props: NoteCardProps) {
    const { children, onToggle, minHeight, style } = props;

    const [isTextExpanded, setIsTextExpanded] = useState(false);
    const [expandedHeight, setExpandedHeight] = useState<number | null>(null);
    const [isMeasured, setIsMeasured] = useState(false);

    const animatedHeight = useRef(new Animated.Value(minHeight)).current;

    const handleOnFirstRender = (event: LayoutChangeEvent) => {
        onToggle(true);
        const height = event.nativeEvent.layout.height;

        setExpandedHeight(height);
        setIsMeasured(true);
        setIsTextExpanded(false);

        onToggle(false);
    };

    const toggleExpand = () => {
        if (expandedHeight === null) return;

        const nextState = !isTextExpanded;
        onToggle(true);

        Animated.timing(animatedHeight, {
            toValue: nextState ? expandedHeight : minHeight,
            duration: 500,
            useNativeDriver: false,
        }).start( () => {
            setIsTextExpanded(nextState);
            onToggle(nextState);
        });
    };

    return (
        <Pressable onPress={toggleExpand}>
            <Animated.View
                style={[
                    styles.root,
                    style,
                    { height: isMeasured ? animatedHeight : undefined },
                ]}
                onLayout={(event) => !isMeasured && handleOnFirstRender(event)}
            >
                {children}
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    root: {
        borderRadius: 10,
        backgroundColor: "white",
        paddingVertical: 18,
        paddingHorizontal: 21,
        marginBottom: 15,
        gap: 4,
        alignItems: "center",
        overflow: "hidden",
    },
});
