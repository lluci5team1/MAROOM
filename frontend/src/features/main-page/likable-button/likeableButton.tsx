import Animated, { runOnJS } from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  Pressable,
} from "react-native-gesture-handler";

type Props = {
  children: React.ReactNode;
  handlePress: () => void;
  handleLongPress: () => void;
  variant: "like" | "dislike";
};

export function LikeableButton({
  children,
  handlePress,
  handleLongPress,
  variant,
}: Props) {
  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={250}
      pressRetentionOffset={20}
      hitSlop={10}
      style={({ pressed }) => [
        {
          transform: [{ scale: pressed ? 0.95 : 1 }],
          opacity: pressed ? 0.9 : 1,
          backgroundColor:
            pressed && variant === "like"
              ? "#ff4d4f" // red
              : pressed && variant === "dislike"
                ? "#222" // dark
                : "transparent",
          borderRadius: 999,
          padding: 6,
        },
      ]}
    >
      {children}
    </Pressable>
  );
}
