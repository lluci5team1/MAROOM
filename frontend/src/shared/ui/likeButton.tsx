import {
  View,
  StyleSheet,
  ImageSourcePropType,
  Pressable,
} from "react-native";
import { useState } from "react";
import { icons } from "../assets/icons";
import Animated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  SharedValue,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

type RoundButtonProps = {
  icon: ImageSourcePropType;
  variant: "like" | "dislike";
  isActive?: boolean;
  translateX?: SharedValue<number>;
  onPress?: () => void;
  onLongPress?: () => void;
};

const COLORS = {
  like: "#F06292",
  dislike: "#0C7CA8",
};

const BORDER_COLORS = {
  like: "#F06292",
  dislike: "#0C7CA8",
};

const ICON_COLORS = {
  like: "#5B6C76",
  dislike: "#4C5D67",
};

export function RoundButton({
  icon,
  variant,
  isActive = false,
  translateX,
  onPress,
  onLongPress,
}: RoundButtonProps) {
  const pressScale = useSharedValue(1);
  const pressActive = useSharedValue(0);
  const RELEASE_MS = 180;
  const PRESS_IN_MS = 110;
  const [isTouching, setIsTouching] = useState(false);

  const animatedButtonScaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pressScale.value }],
    };
  });

  const animatedFillStyle = useAnimatedStyle(() => {
    const swipeProgress = translateX
      ? variant === "like"
        ? interpolate(translateX.value, [0, 150], [0, 1], "clamp")
        : interpolate(translateX.value, [-150, 0], [1, 0], "clamp")
      : 0;
    const activeProgress = Math.max(swipeProgress, isActive ? 1 : 0, pressActive.value);

    return {
      backgroundColor: interpolateColor(
        activeProgress,
        [0, 1],
        ["#EEF0F3", COLORS[variant]],
      ),
      borderColor: interpolateColor(
        activeProgress,
        [0, 1],
        [BORDER_COLORS[variant], COLORS[variant]],
      ),
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const swipeProgress = translateX
      ? variant === "like"
        ? interpolate(translateX.value, [0, 150], [0, 1], "clamp")
        : interpolate(translateX.value, [-150, 0], [1, 0], "clamp")
      : 0;
    const activeProgress = Math.max(swipeProgress, isActive ? 1 : 0, pressActive.value);

    return {
      tintColor: interpolateColor(
        activeProgress,
        [0, 1],
        [ICON_COLORS[variant], "#FFFFFF"],
      ) as unknown as string,
    };
  });

  const animatedOuterShadowStyle = useAnimatedStyle(() => {
    const swipeProgress = translateX
      ? variant === "like"
        ? interpolate(translateX.value, [0, 150], [0, 1], "clamp")
        : interpolate(translateX.value, [-150, 0], [1, 0], "clamp")
      : 0;
    const activeProgress = Math.max(swipeProgress, isActive ? 1 : 0, pressActive.value);

    return {
      shadowColor: activeProgress > 0 ? COLORS[variant] : "#173B63",
      shadowOffset: {
        width: 0,
        height: interpolate(activeProgress, [0, 1], [12, 18], "clamp"),
      },
      shadowOpacity: interpolate(activeProgress, [0, 1], [0.22, 0.7], "clamp"),
      shadowRadius: interpolate(activeProgress, [0, 1], [16, 28], "clamp"),
      elevation: interpolate(activeProgress, [0, 1], [12, 24], "clamp"),
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        setIsTouching(true);
        pressActive.value = withTiming(1, {
          duration: PRESS_IN_MS,
          easing: Easing.out(Easing.cubic),
        });
        pressScale.value = withTiming(variant === "dislike" ? 0.92 : 0.94, {
          duration: PRESS_IN_MS,
          easing: Easing.out(Easing.cubic),
        });
      }}
      onPressOut={() => {
        setIsTouching(false);
        pressActive.value = withTiming(0, {
          duration: RELEASE_MS,
          easing: Easing.out(Easing.cubic),
        });
        pressScale.value = withTiming(1, {
          duration: RELEASE_MS,
          easing: Easing.out(Easing.cubic),
        });
      }}
    >
      {() => (
        <View style={styles.shadowWrapper}>
          <Animated.View
            style={[
              styles.buttonOuter,
              animatedOuterShadowStyle,
              isTouching && styles.buttonOuterPressed,
              isTouching && { shadowColor: COLORS[variant] },
            ]}
          >
            <Animated.View
              style={[
                styles.buttonInner,
                animatedFillStyle,
                animatedButtonScaleStyle,
              ]}
            >
              <View style={styles.iconWrapper}>
                <Animated.Image
                  source={icon}
                  style={[
                    styles.image,
                    variant === "dislike" ? styles.xIcon : styles.heartIcon,
                    iconAnimatedStyle,
                  ]}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>
          </Animated.View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    width: 90,
    height: 90,
    borderRadius: 46,
    overflow: "visible",
  },
  buttonOuter: {
    flex: 1,
    borderRadius: 46,
    shadowColor: "#173B63",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonOuterPressed: {
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.95,
    shadowRadius: 24,
    elevation: 24,
  },
  buttonInner: {
    flex: 1,
    borderRadius: 46,
    overflow: "hidden",
    backgroundColor: "#EEF0F3",
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    width: "44%",
    height: "44%",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  xIcon: {
    width: "70%",
    height: "70%",
  },
  heartIcon: {
    width: "82%",
    height: "82%",
  },
});
