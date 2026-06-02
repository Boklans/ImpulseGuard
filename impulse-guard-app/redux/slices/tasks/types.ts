
export interface Task {
    id: number | undefined;
    completeness: boolean;
    createdAt: number;
    title: string;
    description: string;
    reminderTime?: number;
}
