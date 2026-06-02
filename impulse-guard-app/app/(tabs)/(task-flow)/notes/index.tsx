import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TextInput,
  Dimensions,
  FlatList,
} from "react-native";

import {
  getMoodImage,
  MoodType,
  NoteCard,
} from "@/components/screens/notes/NoteCard";
import { SearchBar } from "@/components/screens/notes/SearchBar";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";

import RoundButton from "@/components/ui/RoundButton";
import Button from "@/components/ui/Button";
import CrossIcon from "@/assets/icons/x.svg";
import ActionSelectorModal from "@/components/modals/ActionSelectorModal";
import BluredModal from "@/components/ui/BluredModal";

import {
  useAddNote,
  useDeleteNote,
  useNotes,
  useUpdateNote,
} from "@/hooks/useNotes";
import { Note } from "@/redux/slices/notes/types";
import { EmptyView } from "@/components/ui/EmptyView";
import FoodIcon from "@/assets/icons/cooking-pot.svg";
import { AnalyticsEvents, useAnalytics } from "@/hooks/useAnalytics";

type NewNoteModalProps = {
  isOpened: boolean;
  onClose: () => void;
  noteToEdit?: Note | null;
};

function NewNoteModal({ isOpened, onClose, noteToEdit }: NewNoteModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const { track } = useAnalytics();

  const addNoteMutation = useAddNote();
  const updateNoteMutation = useUpdateNote();

  const screenHeight = Dimensions.get("window").height;

  // Заповнюємо поля, якщо редагуємо нотатку
  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setDescription(noteToEdit.description);
      setSelectedMood(noteToEdit.mood);
    } else {
      clearInputs();
    }
  }, [noteToEdit]);

  const clearInputs = () => {
    setTitle("");
    setDescription("");
    setSelectedMood(null);
  };

  const handleSave = () => {
    if (!selectedMood) return;

    if (noteToEdit) {
      updateNoteMutation.mutate({
        id: noteToEdit.id,
        title,
        description,
        mood: selectedMood,
        date: Date.now(),
      });
      track(AnalyticsEvents.DIARY_ENTRY_UPDATED, {
        mood: selectedMood,
        has_title: title.trim().length > 0,
        has_description: description.trim().length > 0,
        description_length: description.trim().length,
      });
    } else {
      addNoteMutation.mutate({
        title,
        description,
        mood: selectedMood,
        date: Date.now(),
      });
      track(AnalyticsEvents.DIARY_ENTRY_CREATED, {
        mood: selectedMood,
        has_title: title.trim().length > 0,
        has_description: description.trim().length > 0,
        description_length: description.trim().length,
      });
    }

    clearInputs();
    onClose();
  };

  return (
    <BluredModal
      opened={isOpened}
      close={onClose}
      style={{ marginTop: "auto" }}
    >
      <View style={{ marginVertical: "auto", alignItems: "center" }}>
        <View style={styles.modalView}>
          {/* Close */}
          <Pressable
            style={{ position: "absolute", right: 12, top: 10 }}
            onPress={onClose}
          >
            <CrossIcon
              width={25}
              height={25}
              color={Colors.light.neutralText}
            />
          </Pressable>

          {/* Title */}
          <Text
            style={{
              fontSize: 42,
              fontWeight: "500",
              textAlign: "center",
              marginTop: 29,
            }}
          >
            How are you?
          </Text>

          {/* Mood selector */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 23,
            }}
          >
            {Object.values(MoodType)
              .filter((v) => typeof v === "number")
              .map((mood) => (
                <Pressable
                  key={mood}
                  onPress={() => setSelectedMood(mood as MoodType)}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 32,
                    shadowColor:
                      selectedMood === mood
                        ? Colors.light.primary
                        : "transparent",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: selectedMood === mood ? 1 : 0,
                    shadowRadius: selectedMood === mood ? 10 : 0,
                    elevation: selectedMood === mood ? 10 : 0,
                  }}
                >
                  <Image
                    source={getMoodImage(mood as MoodType)}
                    style={{ height: 64, width: 64, borderRadius: 32 }}
                  />
                </Pressable>
              ))}
          </View>

          {/* Text fields */}
          <View style={{ gap: 9, marginTop: 40, marginBottom: 81 }}>
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

          {/* Buttons */}
          <Button
            title={noteToEdit ? "Save" : "Confirm"}
            disabled={title.trim() === "" || selectedMood === null}
            style={styles.button}
            onPress={handleSave}
          />
          <Button
            title="Cancel"
            variant="ghost"
            style={styles.button}
            onPress={onClose}
          />
        </View>
      </View>
    </BluredModal>
  );
}

export default function NotesScreen() {
  const { data: notes } = useNotes();
  const deleteNoteMutation = useDeleteNote();

  const { openModal } = useLocalSearchParams<{ openModal?: string }>();

  const [modalVisible, setModalVisible] = useState(Number(openModal) === 1);
  const [actionModalState, setActionModalState] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);

  // Пошук
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (Array.isArray(notes)) {
      setFilteredNotes(
        notes.filter((n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [notes, searchQuery]);

  // CRUD helpers
  const handleDeleteNote = (id: number) => {
    deleteNoteMutation.mutate(id.toString());
  };

  const handleEditNote = (id: number) => {
    const note = notes?.find((n) => n.id === id);
    if (!note) return;
    setNoteToEdit(note);
    setModalVisible(true);
  };

  const handleOpenNewModal = () => {
    setNoteToEdit(null);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setNoteToEdit(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      <View style={{ gap: 5, flex: 1 }}>
        <SearchBar onChange={setSearchQuery} />

        <FlatList
          data={filteredNotes}
          keyExtractor={(item, index) =>
            item?.id != null ? item.id.toString() : `note-${index}`
          }
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onCardDelete={handleDeleteNote}
              onCardEdit={handleEditNote}
            />
          )}
          contentContainerStyle={{ paddingTop: 25, flexGrow: 1 }}
          ListEmptyComponent={
            <EmptyView
              title="No notes"
              description="Try to add notes to start your journey"
              icon={FoodIcon}
            />
          }
        />
      </View>

      {/* Floating add button */}
      <RoundButton
        icon={require("@/assets/icons/add-note.png")}
        onPress={() => setActionModalState(true)}
        style={styles.roundButtonPosition}
      />

      {/* Choose action */}
      <ActionSelectorModal
        opened={actionModalState}
        close={() => setActionModalState(false)}
        // onAddNote={handleOpenNewModal} // припустимо, такий проп є
      />

      {/* New / Edit note modal */}
      <NewNoteModal
        isOpened={modalVisible}
        onClose={handleCloseModal}
        noteToEdit={noteToEdit}
      />
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
