import { Stack, usePathname, router } from "expo-router";
import Tabs from "@/components/ui/Tabs";
import StatsIcon from "@/assets/icons/chart-no-axes-combined.svg";
import NotesIcon from "@/assets/icons/notebook.svg";
import TasksIcon from "@/assets/icons/layout-list.svg";
import { View } from "react-native";

export default function CollectionLayout() {
    const pathname = usePathname();
    const active = ["/notes", "/tasks", "/stats"].indexOf(pathname);

    const tabs = [
        {
            label: "Notes",
            icon: <NotesIcon />,
            onPress: () => router.replace("/notes"),
        },
        {
            label: "Tasks",
            icon: <TasksIcon/>,
            onPress: () => router.replace("/tasks"),
        },
        {
            label: "Stats",
            icon: <StatsIcon />,
            onPress: () => router.replace("/stats"),
        },
    ];

    return (
        <View
            style={{ flex: 1, backgroundColor: "#F2F2F7", paddingHorizontal: 16 }}
        >
            <Tabs tabs={tabs} activeIndex={active} />
            <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
        </View>
    );
}
