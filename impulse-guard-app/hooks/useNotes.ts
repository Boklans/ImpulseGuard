import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Note } from "@/redux/slices/notes/types";
import {
  scheduleNoteReminder,
  cancelNoteNotification,
} from "@/utils/localNotifications";
import { useApi } from "@/hooks/useApi";

const NOTES_STORAGE_KEY = "NOTES_STORAGE";

const fetchNotes = async (): Promise<Note[]> => {
  const raw = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
  const parsed: Note[] = raw ? JSON.parse(raw) : [];

  let patched = false;
  const sanitized = parsed.map((note, idx) => {
    if (note.id == null) {
      patched = true;
      return { ...note, id: idx + 1 };
    }
    return note;
  });

  if (patched) {
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(sanitized));
  }

  return sanitized;
};

const updateNotesStorage = async (notes: Note[]): Promise<void> => {
  await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
};

export const useNotes = () => {
  return useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: fetchNotes,
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  return useMutation<Note, unknown, Note>({
    mutationFn: async (updatedNote: Note) => {
      const notesRaw = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      const notes: Note[] = notesRaw ? JSON.parse(notesRaw) : [];

      const noteIndex = notes.findIndex((note) => note.id === updatedNote.id);
      if (noteIndex === -1) {
        throw new Error(`Note with id ${updatedNote.id} not found`);
      }
      notes[noteIndex] = updatedNote;
      await updateNotesStorage(notes);
      return updatedNote;
    },
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      // Update reminder notification
      if (note.reminderTime) {
        scheduleNoteReminder(note.id, note.title, new Date(note.reminderTime));
      } else {
        cancelNoteNotification(note.id);
      }
    },
    onError: (error) => {
      console.error("Error while updating note:", error);
    },
  });
};

export const useAddNote = () => {
  const queryClient = useQueryClient();
  const api = useApi();

  return useMutation<Note, unknown, Omit<Note, "id">>({
    mutationFn: async (newNote: Omit<Note, "id">) => {
      const notesRaw = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      const notes: Note[] = notesRaw ? JSON.parse(notesRaw) : [];

      const newId = notes.length > 0 ? notes[notes.length - 1].id + 1 : 1;

      const noteWithId: Note = {
        ...newNote,
        id: newId,
      };

      notes.push(noteWithId);
      await updateNotesStorage(notes);
      return noteWithId;
    },
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      // Schedule reminder notification if reminderTime is set
      if (note.reminderTime) {
        scheduleNoteReminder(note.id, note.title, new Date(note.reminderTime));
      }
      // Track note creation for achievements
      api.post("/statistics/createNotes", null, { params: { notes: 1 } })
        .catch((error) => console.error("Failed to track note creation:", error));
    },
    onError: (error) => {
      console.error("Error while adding note:", error);
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, string>({
    mutationFn: async (noteId) => {
      const notes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      const updatedNotes: Note[] = notes ? JSON.parse(notes) : [];
      const filteredNotes = updatedNotes.filter(
        (note) => note.id?.toString() !== noteId
      );
      await updateNotesStorage(filteredNotes);
    },
    onSuccess: (_result, noteId) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      // Cancel any scheduled reminder for this note
      cancelNoteNotification(parseInt(noteId, 10));
    },
  });
};
