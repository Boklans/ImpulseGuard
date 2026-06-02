import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHooks";
import GlimSVG from "@/assets/icons/glim.svg";
import { computeXpProgress } from "@/utils/xp";
import { AvatarImages, DEFAULT_AVATAR } from "@/constants/Config";
import SelectAvatarModal from "@/components/modals/SelectAvatarModal";
import { useSetAvatar } from "@/hooks/useUser";
import { updateUserPartially } from "@/redux/slices/user";
import { usePremium } from "@/hooks/usePaywall";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function Header() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <ProfileInfo />
        <Streak />
      </View>
    </SafeAreaView>
  );
}

function useAnimatedCounter(targetValue: number, duration: number = 800) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const animationRef = useRef<number | null>(null);
  const startValueRef = useRef(targetValue);
  const startTimeRef = useRef<number | null>(null);

  const easeOutQuad = (t: number): number => t * (2 - t);

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startValue = displayValue;
    startValueRef.current = startValue;
    startTimeRef.current = null;

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);

      const currentValue = startValue + (targetValue - startValue) * easedProgress;
      setDisplayValue(Math.round(currentValue));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration]);

  return displayValue;
}

function Streak() {
  const { user } = useAppSelector((state) => state.user);
  const displayValue = useAnimatedCounter(user?.glims ?? 0, 800);

  return (
    <View style={styles.streakRoot}>
      <GlimSVG />
      <Text style={{ fontSize: 24, color: "#6AC3CE", fontWeight: "600" }}>
        {displayValue}
      </Text>
    </View>
  );
}

function ProfileInfo() {
  const { user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const { mutateAsync: setAvatar, isPending } = useSetAvatar();
  const { isPremium } = usePremium();

  const streakDays = useAnimatedCounter(user?.streakInfo?.daysInRow ?? 0, 800);

  const progress = React.useMemo(() => {
    if (!user) return { percent: 0 };
    return computeXpProgress(user.level, user.experience);
  }, [user?.level, user?.experience]);

  const currentAvatar = user?.avatar || DEFAULT_AVATAR;
  const avatarData = AvatarImages.get(currentAvatar) || AvatarImages.get(DEFAULT_AVATAR);
  const avatarSource = avatarData?.image;

  const handleSaveAvatar = async (avatarId: string) => {
    if (!user?._id) return;
    await setAvatar({ userId: user._id, avatar: avatarId });
    dispatch(updateUserPartially({ avatar: avatarId }));
    setIsAvatarModalOpen(false);
  };

  console.log(isPremium);

  return (
    <View style={styles.avatarInfo}>
      <TouchableOpacity onPress={() => setIsAvatarModalOpen(true)}>
        <View>
          <Image
            source={avatarSource}
            style={{
              height: 64,
              width: 64,
              borderColor: isPremium ? "#FFD700" : "#6AC3CE",
              borderWidth: isPremium ? 2 : 1,
              borderRadius: 99,
            }}
          />
          {isPremium && (
            <View style={styles.premiumBadge}>
              <FontAwesome6 name="crown" size={12} color="#FFD700" solid />
            </View>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.avatarChildContainer}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("@/assets/icons/fire.png")}
            style={{ height: 24, width: 24 }}
          />
          <Text style={styles.pointText}>{streakDays}</Text>
        </View>
        <ProgressBar
          progress={progress.percent}
          level={user?.level ?? 1}
          type="normal"
          style={{ width: 128 }}
        />
      </View>

      <SelectAvatarModal
        opened={isAvatarModalOpen}
        close={() => setIsAvatarModalOpen(false)}
        onSave={handleSaveAvatar}
        isLoading={isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: Platform.OS === "android" ? 60 : 0,
    backgroundColor: "#F2F2F7",
  },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },

  avatarInfo: {
    flexDirection: "row",
    gap: 9,
  },

  avatarChildContainer: {
    flexDirection: "column",
    gap: 6,
  },

  pointText: {
    fontSize: 16,
    fontWeight: "medium",
  },

  streakRoot: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },

  premiumBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FFF",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
