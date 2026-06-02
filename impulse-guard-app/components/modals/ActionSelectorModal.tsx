import React from "react";
import {StyleSheet, Text, Pressable, View} from "react-native";
import {Colors} from "@/constants/Colors";
import ModalWithBlur from "@/components/ui/BluredModal";
import PlusIcon from "@/assets/icons/plus.svg"
import Pencil from "@/assets/icons/Pencil.svg"
import {router} from "expo-router";
import {root} from "postcss";
import {Color} from "ansi-fragments/build/fragments/Color";

type SpanchBobProps = {
    opened: boolean;
    close: () => void;
};

function openNotes() {
    setTimeout(
        () =>
            router.push({
                pathname: "/(tabs)/(task-flow)/notes",
                params: {
                    openModal: 1,
                },
            }),
        50
    );
}

function openTasks() {
    setTimeout(
        () =>
            router.push({
                pathname: "/(tabs)/(task-flow)/tasks",
                params: {
                    openModal: 1,
                },
            }),
        50
    );
}

const ActionSelectorModal: React.FC<SpanchBobProps> = ({ opened, close}) => {
    return (
        <ModalWithBlur opened={opened} close={close} style={styles.root}>
            <Pressable
                style={styles.button}
                onPress={() => {openTasks(); close()}}
            >
                <PlusIcon color={Colors.light.primary} width={25} height={29}/>
                <View>
                    <Text style={styles.title}>New task</Text>
                    <Text style={styles.description}>Quickly add a task for today</Text>
                </View>
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.button}
                       onPress={() => {openNotes(); close()}}
            >
                <Pencil color={Colors.light.primary} width={25} height={29}/>
                <View>
                    <Text style={styles.title}>New note</Text>
                    <Text style={styles.description}>Capture a memory for your journey</Text>
                </View>
            </Pressable>
        </ModalWithBlur>
    );
};

const styles = StyleSheet.create({
    root: {
        gap:9,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginHorizontal: 24,
        marginTop: "auto",
        marginBottom: 100,
    },
    button: {
        flexDirection: "row",
        gap: 10,
        width: "100%",
    },
    title: {
        fontSize: 24,
        fontWeight: 500,
        color: Colors.light.text,
    },
    description: {
        fontSize: 16,
        fontWeight: 400,
        color: Colors.light.neutralText,
    },
    divider: {
        borderRadius: 10,
        height: 2,
        width: "94%",
        alignSelf: "center",
        backgroundColor: Colors.light.neutralText,
        opacity: 0.2,
    },
});

export default ActionSelectorModal;
