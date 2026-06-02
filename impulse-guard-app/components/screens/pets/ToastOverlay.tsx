import { ToastPill } from "@/components/ui/ToastPill";
import React from "react";
import { Modal, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = React.ComponentProps<typeof ToastPill> & { visible: boolean };

export const ToastOverlay: React.FC<Props> = ({ visible, ...pillProps }) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={{ flex: 1 }} pointerEvents="none">
        <View
          style={{
            position: "absolute",
            top: insets.top + 8,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
          pointerEvents="none"
        >
          <ToastPill visible {...pillProps} />
        </View>
      </View>
    </Modal>
  );
};
