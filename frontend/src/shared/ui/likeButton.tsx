import {
  View,
  Image,
  StyleSheet,
  ImageSourcePropType,
  Pressable,
} from "react-native";
import { icons } from "../assets/icons";
import Animated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  SharedValue,
} from "react-native-reanimated";

type RoundButtonProps = {
  icon: ImageSourcePropType;
  variant: "like" | "dislike";
  translateX?: SharedValue<number>;
  onPress?: () => void;
  onLongPress?: () => void;
};

const COLORS = {
  like: "#f43f5e",
  dislike: "#2a2a2a",
};

export function RoundButton({
  icon,
  variant,
  translateX,
  onPress,
  onLongPress,
}: RoundButtonProps) {
  const threshold = 150;

  // 🎯 Button scale + background animation
  const animatedButtonStyle = useAnimatedStyle(() => {
    if (!translateX) return {};

    const progress =
      variant === "like"
        ? interpolate(translateX.value, [0, threshold], [0, 1], "clamp")
        : interpolate(translateX.value, [-threshold, 0], [1, 0], "clamp");

    return {
      transform: [{ scale: 1 + progress * 0.18 }],
      backgroundColor: interpolateColor(
        progress,
        [0, 1],
        ["#ffffff", COLORS[variant]],
      ),
    };
  });

  // 🎯 White X fade animation (only for dislike)
  const whiteIconStyle = useAnimatedStyle(() => {
    if (!translateX || variant !== "dislike") return {};

    const opacity = interpolate(
      translateX.value,
      [-threshold, 0],
      [1, 0],
      "clamp",
    );

    return { opacity };
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.shadowWrapper}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.button,
            animatedButtonStyle,
            pressed && { backgroundColor: COLORS[variant] },
          ]}
        >
          {/* ICON CONTAINER */}
          <View style={styles.iconWrapper}>
            {/* Default Icon */}
            <Image source={icon} style={styles.image} resizeMode="contain" />

            {/* White X overlay (animated) */}
            {variant === "dislike" && (
              <Animated.Image
                source={icons.X_White}
                style={[styles.image, styles.absoluteIcon, whiteIconStyle]}
                resizeMode="contain"
              />
            )}
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    width: 80,
    height: 80,
    borderRadius: 50,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  button: {
    flex: 1,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    width: "40%",
    height: "40%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  absoluteIcon: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
