import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    ScrollView,
    Pressable,
    TextInput,
    Dimensions,
    FlatList,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import CrossIcon from "@/assets/icons/x.svg";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";
import { TaskCard } from "@/components/tasks/TaskCard";
import RoundButton from "@/components/ui/RoundButton";
import CheckBox from "@/components/ui/CheckBox";
import Button from "@/components/ui/Button";
import { SearchBar } from "@/components/screens/notes/SearchBar";
import ActionSelectorModal from "@/components/modals/ActionSelectorModal";
import BluredModal from "@/components/ui/BluredModal";
import { useAddTask, useDeleteTask, useTasks, useUpdateTasks } from "@/hooks/useTasks";
import { Task } from "@/redux/slices/tasks/types";
import { EmptyView } from "@/components/ui/EmptyView";
import FoodIcon from "@/assets/icons/cooking-pot.svg";

export default function TasksScreen() {
    const { data: tasks, isLoading, isError } = useTasks();
    const addTaskMutation = useAddTask();
    const updateTaskMutation = useUpdateTasks();
    const deleteTaskMutation = useDeleteTask();
    const { openModal } = useLocalSearchParams();

    const [modalVisible, setModalVisible] = useState(Number(openModal) === 1);
    const [actionModalState, setActionModalState] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [completeness, setCompleteness] = useState<boolean>(false);

    const screenHeight = Dimensions.get("window").height;

    useEffect(() => {
        if (openModal && Number(openModal) === 1) {
            setModalVisible(true);
        }
    }, [openModal]);

    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description);
            setCompleteness(taskToEdit.completeness);
        } else {
            clearTaskInfo();
        }
    }, [taskToEdit]);

    const handleSaveTask = () => {
        if (title.trim() === "") return;

        if (taskToEdit) {
            updateTaskMutation.mutate({
                ...taskToEdit,
                title: title,
                description: description,
                completeness: completeness,
            });
        } else {
            addTaskMutation.mutate({
                id: undefined,
                title: title,
                description: description,
                completeness: completeness,
                createdAt: Date.now(),
            });
        }
        handleCloseModal();
    };

    const clearTaskInfo = () => {
        setCompleteness(false);
        setTitle("");
        setDescription("");
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setTaskToEdit(null);
        clearTaskInfo();
    };

    const handleCompleteTask = (task: Task) => {
        updateTaskMutation.mutate({
            ...task,
            completeness: !task.completeness,
        });
    };

    const handleDeleteTask = (id: number) => {
        deleteTaskMutation.mutate(id);
    };

    const handleEditTask = (task: Task) => {
        setTaskToEdit(task);
        setModalVisible(true);
    };

    const handleOpenNewModal = () => {
        setTaskToEdit(null);
        setModalVisible(true);
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (Array.isArray(tasks)) {
            setFilteredTasks(
                tasks.filter((task) =>
                    task.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setFilteredTasks([]);
        }
    }, [tasks, searchQuery]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
            <View style={{ gap: 5, flex: 1 }}>
                <SearchBar onChange={(query) => setSearchQuery(query)} />
                <FlatList
                    data={filteredTasks}
                    bounces={false}
                    keyExtractor={(item, index) =>
                        item?.id != null ? item.id.toString() : `task-${index}`
                    }
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInUp.delay(index * 60).duration(350).springify()}>
                            <TaskCard
                                title={item.title}
                                description={item.description}
                                completeness={item.completeness}
                                onComplete={() => handleCompleteTask(item)}
                                onCardEdit={() => handleEditTask(item)}
                                onCardDelete={() => handleDeleteTask(item.id!)}
                            />
                        </Animated.View>
                    )}
                    contentContainerStyle={{ paddingTop: 25, flexGrow: 1 }}
                    ListEmptyComponent={
                        <EmptyView
                            title="No tasks"
                            description="Try to add tasks to start your journey"
                            icon={FoodIcon}
                        />
                    }
                />
            </View>

            <RoundButton
                icon={require("@/assets/icons/add-note.png")}
                onPress={() => setActionModalState(true)}
                style={styles.roundButtonPosition}
            />

            <ActionSelectorModal
                opened={actionModalState}
                close={() => setActionModalState(false)}
            />

            <BluredModal
                opened={modalVisible}
                close={handleCloseModal}
                style={{ marginTop: "auto" }}
            >
                <View style={{ marginVertical: "auto", alignItems: "center" }}>
                    <View style={styles.modalView}>
                        <Pressable
                            style={{ position: "absolute", right: 12, top: 10, zIndex: 10 }}
                            onPress={handleCloseModal}
                        >
                            <CrossIcon
                                width={25}
                                height={25}
                                color={Colors.light.neutralText}
                            />
                        </Pressable>

                        <Text style={styles.modalTitle}>
                            {taskToEdit ? "Edit Task" : "New Task"}
                        </Text>

                        <View style={styles.checkboxRow}>
                            <CheckBox
                                value={completeness}
                                onToggle={() => setCompleteness(!completeness)}
                            />
                            <Text style={styles.checkboxLabel}>Mark as completed</Text>
                        </View>

                        <View style={{ gap: 9, marginTop: 20, marginBottom: 20 }}>
                            <ScrollView
                                bounces={false}
                                keyboardShouldPersistTaps="handled"
                                keyboardDismissMode="on-drag"
                                style={styles.input}
                            >
                                <TextInput
                                    placeholder="Title"
                                    placeholderTextColor={Colors.light.neutralText}
                                    value={title}
                                    onChangeText={setTitle}
                                    multiline
                                    style={{ fontSize: 20, fontWeight: "300" }}
                                    textAlignVertical="top"
                                />
                            </ScrollView>

                            <ScrollView
                                bounces={false}
                                keyboardShouldPersistTaps="handled"
                                keyboardDismissMode="on-drag"
                                style={[styles.input, { maxHeight: screenHeight * 0.25 }]}
                            >
                                <TextInput
                                    placeholder="Description"
                                    placeholderTextColor={Colors.light.neutralText}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    style={{ fontSize: 20, fontWeight: "300", minHeight: 75 }}
                                    textAlignVertical="top"
                                />
                            </ScrollView>
                        </View>

                        <Button
                            title={taskToEdit ? "Save" : "Create"}
                            disabled={title.trim() === ""}
                            style={styles.button}
                            onPress={handleSaveTask}
                        />
                        <Button
                            title="Cancel"
                            variant="ghost"
                            style={styles.button}
                            onPress={handleCloseModal}
                        />
                    </View>
                </View>
            </BluredModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    modalView: {
        width: "100%",
        backgroundColor: "white",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        paddingBottom: 13,
        paddingHorizontal: 25,
        paddingTop: 10,
    },
    modalTitle: {
        fontSize: 32,
        fontWeight: "500",
        textAlign: "center",
        marginTop: 20,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 20,
    },
    checkboxLabel: {
        fontSize: 16,
        color: Colors.light.neutralText,
    },
    input: {
        width: "100%",
        padding: 11,
        paddingHorizontal: 12,
        fontSize: 20,
        fontWeight: "300",
        borderWidth: 1,
        borderRadius: 10,
        borderColor: Colors.light.paleText,
    },
    roundButtonPosition: {
        position: "absolute",
        bottom: 16,
        right: 16,
    },
    button: {
        marginTop: 12,
    },
});
