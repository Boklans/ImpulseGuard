import {
  Animated,
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback, Dimensions
} from "react-native";
import PencilIcon from "@/assets/icons/Pencil.svg";
import TrashIcon from "@/assets/icons/Trash.svg";
import React, { useEffect, useRef, useState } from "react";
import CheckBox from "@/components/ui/CheckBox";
import {ExpandableView} from "@/components/ExpandableView";
import ArrowDownIcon from "@/assets/icons/ArrowDown.svg";
import BluredModal from "@/components/ui/BluredModal";
import { Note } from "@/redux/slices/notes/types";
import ModalWithBlur from "@/components/ui/BluredModal";

export enum MoodType {
  HAPPY,
  CONTENT,
  NEUTRAL,
  SAD,
  VERY_SAD,
}

export function getMoodImage(mood: MoodType): any {
  switch (mood) {
    case MoodType.HAPPY:
      return require("@/assets/images/emotion-stickers/happy.png");
    case MoodType.CONTENT:
      return require("@/assets/images/emotion-stickers/content.png");
    case MoodType.NEUTRAL:
      return require("@/assets/images/emotion-stickers/neutral.png");
    case MoodType.SAD:
      return require("@/assets/images/emotion-stickers/sad.png");
    case MoodType.VERY_SAD:
      return require("@/assets/images/emotion-stickers/very_sad.png");
    default:
      throw new Error("Unknown mood type");
  }
}

export interface NoteCardProps {
  note: Note;
  onCardEdit: (id: number) => void;
  onCardDelete: (id: number) => void;
  onToggleCard?: () => void;
}

function formatDateFromTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}.${month}`;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export function NoteCard(props: NoteCardProps) {
  const { note, onCardEdit, onCardDelete } = props;

  const [isTextExpanded, setIsTextExpanded] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const iconRef = useRef<View>(null);

  const handleArrowPress = () => {
    iconRef.current?.measure((fx, fy, width, height, px, py) => {
      let modalX = px;
      let modalY = py + height;

      if (modalX + 150 > screenWidth) modalX = screenWidth - 120;
      if (modalY + 100 > screenHeight) modalY = screenHeight - 120;

      setModalPosition({ x: modalX, y: modalY });
      setIsModalVisible(true);
    });
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
      <View>
        <ExpandableView minHeight={100} style={styles.root} onToggle={(x) => setIsTextExpanded(x)}>
          <View style={{ flexDirection: "row", gap: 10, width: "100%", paddingRight: note.date ? 20 : undefined }}>
            <Image source={getMoodImage(note.mood)} style={styles.image} />
            <View style={{ flex: 1, gap: 9 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Text style={[styles.title, { paddingRight: 10, maxWidth: "100%" }]} ellipsizeMode="tail" numberOfLines={isTextExpanded ? undefined : 1}>
                  {note.title.trim()}
                </Text>
                {note.date  && (
                    <Text style={[styles.createdAt, { marginTop: 4 }]}>
                      {formatDateFromTimestamp(note.date )}
                    </Text>
                )}
              </View>
              {note.description && (
                  <Text
                      style={[styles.description, { paddingRight: 10, maxWidth: "100%" }]}
                      ellipsizeMode="tail"
                      numberOfLines={isTextExpanded ? undefined : 1}
                  >
                    {note.description.trim()}
                  </Text>
              )}
            </View>
          </View>
          <Pressable ref={iconRef} onPress={handleArrowPress} style={{ position: "absolute", top: 4, right: 4 }}>
            <ArrowDownIcon color={"#E1E3E4"} width={24} height={24} />
          </Pressable>
        </ExpandableView>
          <ModalWithBlur opened={isModalVisible} close={closeModal} style={{
            width: 100,
            marginTop: modalPosition.y,
            marginRight: 15,
            marginLeft: "auto",
          }}>
              <Pressable style={styles.modalButton} onPress={() => {
                closeModal();
                onCardEdit(note.id)
              }}>
                <Text style={styles.modalButtonText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={() => {
                closeModal();
                onCardDelete(note.id)
              }}>
                <Text style={styles.modalButtonText}>Delete</Text>
              </Pressable>
          </ModalWithBlur>
      </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 10,
    backgroundColor: "white",
    paddingVertical: 18,
    paddingHorizontal: 21,
    marginBottom: 15,
    alignItems: "center",
  },
  image: {
    width: 64,
    height: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: "medium",
  },
  description: {
    fontSize: 14,
    fontWeight: "light",
    flexShrink: 1,
    maxWidth: "100%",
  },
  createdAt: {
    fontSize: 12,
    fontWeight: "medium",
    color: "#E1E3E4",
  },
  modalOverlay: {

  },
  modalContent: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    width: "100%",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
