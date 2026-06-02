import React from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import CheckBox from "@/components/ui/CheckBox";
import TrashIcon from "@/assets/icons/Trash.svg";
import PencilIcon from "@/assets/icons/Pencil.svg";

export function TextContainer({
                             title,
                             description,
                             icon,
                             onTaskEdit,
                             onTaskDelete
                         }: TaskCardProps) {
    return (
        <View style={styles.root}>
            <View style={{ flexDirection: "row", gap: 14, width: "100%" }}>
                <View style={{ alignSelf: "flex-start", marginTop: 2.5 }}>
                    {icon}
                </View>
                <View style={styles.content}>
                    <ScrollView nestedScrollEnabled bounces={false} style={styles.scrollContainer}>

                    </ScrollView>
                </View>
            </View>
            <View style={styles.actions}>
                <Pressable onPress={onTaskEdit}>
                    <PencilIcon width={25} height={25} color={"#C3C3C3"} />
                </Pressable>
                <Pressable onPress={onTaskDelete}>
                    <TrashIcon width={25} height={25} color={"#C3C3C3"} />
                </Pressable>
            </View>
        </View>
    );
}

export interface TaskCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onComplete: (newValue: boolean) => void;
    onTaskEdit: () => void;
    onTaskDelete: () => void;
}

const styles = StyleSheet.create({
    root: {
        borderRadius: 10,
        backgroundColor: "white",
        padding: 15,
        marginVertical: 8,
        alignItems: "center",
    },
    content: {
        flex: 1,
    },
    scrollContainer: {
        maxHeight: 120,
    },
    title: {
        fontSize: 24,
        fontWeight: "500",
        marginBottom: 8,
    },
    completedTitle: {
        textDecorationLine: "line-through",
        color: "#6C6C6C",
    },
    descriptionLabel: {
        fontSize: 14,
        color: "#6C6C6C",
        marginBottom: 4,
    },
    description: {
        fontSize: 18,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        width: "100%",
        gap: 18,
        marginTop: 10,
    },
});
