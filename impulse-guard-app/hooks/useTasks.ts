import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Task} from "@/redux/slices/tasks/types";
import {
  scheduleTaskReminder,
  cancelTaskNotification,
} from "@/utils/localNotifications";
import { useApi } from "@/hooks/useApi";

const TASKS_STORAGE_KEY = "TASKS_STORAGE";

const fetchTasks = async (): Promise<Task[]> => {
    const tasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    return tasks ? JSON.parse(tasks) as Task[]: [];
};

const updateTasksStorage = async (tasks: Task[]): Promise<void> => {
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
};

export const useTasks = () => {
    return useQuery<Task[]>({
        queryKey: ["tasks"],
        queryFn: fetchTasks,
    });
};

export const useAddTask = () => {
    const queryClient = useQueryClient();

    return useMutation<Task, unknown, Task>({
        mutationFn: async (newTask) => {
            try {
                const tasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
                const updatedTasks: Task[] = tasks ? JSON.parse(tasks) : [];

                const lastTask = updatedTasks[updatedTasks.length - 1];
                newTask.id = lastTask ? lastTask.id! + 1 : 0;

                updatedTasks.push(newTask);

                await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
                return newTask;
            } catch (error) {
                console.error("Failed to add task:", error);
                throw error;
            }
        },
        onSuccess: (task) => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            // Schedule reminder notification if reminderTime is set
            if (task.reminderTime && task.id !== undefined) {
                scheduleTaskReminder(task.id, task.title, new Date(task.reminderTime));
            }
        }
    });
};


export const useUpdateTasks = () => {
    const queryClient = useQueryClient();
    const api = useApi();

    return useMutation<{ task: Task; wasCompleted: boolean }, unknown, Task>({
        mutationFn: async (updatedTask) => {
            const raw = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
            const all: Task[] = raw ? JSON.parse(raw) : [];
            const oldTask = all[updatedTask.id!];
            const wasCompleted = !oldTask?.completeness && updatedTask.completeness;
            all[updatedTask.id!] = updatedTask;
            await updateTasksStorage(all);
            return { task: updatedTask, wasCompleted };
        },
        onSuccess: ({ task, wasCompleted }) => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            // Update reminder notification
            if (task.id !== undefined) {
                if (task.reminderTime) {
                    scheduleTaskReminder(task.id, task.title, new Date(task.reminderTime));
                } else {
                    cancelTaskNotification(task.id);
                }
            }
            // Track task completion for achievements
            if (wasCompleted) {
                api.post("/statistics/completeTasks", null, { params: { tasks: 1 } })
                    .catch((error) => console.error("Failed to track task completion:", error));
            }
        },
    });
};


export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    return useMutation<void, unknown, number>({
        mutationFn: async (taskId: number) => {
            const tasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
            const updatedTasks: Task[] = tasks ? JSON.parse(tasks) : [];
            const filteredTasks = updatedTasks.filter((task) => task.id?.toString() !== taskId.toString());
            await updateTasksStorage(filteredTasks);
        },
        onSuccess: (_result, taskId) => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            // Cancel any scheduled reminder for this task
            cancelTaskNotification(taskId);
        },
    });
};
