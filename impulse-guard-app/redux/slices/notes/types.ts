import { MoodType } from "@/components/screens/notes/NoteCard";

export interface Note {
  id: number;
  mood: MoodType;
  title: string;
  description: string;
  date: number;
  reminderTime?: number;
}
