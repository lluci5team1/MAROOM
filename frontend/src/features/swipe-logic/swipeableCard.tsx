// features/swipe-behavior/ui/SwipeableCard.tsx
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useState } from "react";
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  index: number;
  currentIndex: number;
  animatedValues: SharedValue<number>;
  maxVisibleItem: number;
  dataLength: number;
  onSwiped: () => void;
  front: React.ReactNode;
  back: React.ReactNode;
};

export function SwipeableCard({
  index,
  currentIndex,
  animatedValues,
  maxVisibleItem,
  dataLength,
  onSwiped,
  front,
  back,
}: Props) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const direction = useSharedValue(1);
  const [isFlipped, setIsFilpped] = useState(false);
  const flipAnimation = useSharedValue(0);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(250)
    .onEnd(() => {
      if (index !== currentIndex) return;

      flipAnimation.value = withTiming(isFlipped ? 0 : 180, { duration: 300 });

      runOnJS(setIsFilpped)(!isFlipped);
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (index !== currentIndex) return;

      direction.value = e.translationX > 0 ? 1 : -1;
      translateX.value = e.translationX;

      animatedValues.value = interpolate(
        Math.abs(e.translationX),
        [0, width],
        [index, index + 1],
      );
    })
    .onEnd((e) => {
      if (index !== currentIndex) return;

      if (Math.abs(e.translationX) > 150) {
        translateX.value = withTiming(width * direction.value, {}, () => {
          runOnJS(onSwiped)();
        });
        animatedValues.value = withTiming(currentIndex + 1);
      } else {
        translateX.value = withTiming(0);
        animatedValues.value = withTiming(currentIndex);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const currentItem = index === currentIndex;

    const rotateZ = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [0, 30],
    );

    const scale = interpolate(
      animatedValues.value,
      [index - 1, index],
      [0.9, 1],
    );

    const translateY = interpolate(
      animatedValues.value,
      [index - 1, index],
      [-50, 0],
    );
    const opacity = interpolate(
      animatedValues.value + maxVisibleItem,
      [index, index + 1],
      [0, 1],
    );

    return {
      transform: [
        { perspective: 1000 },
        { translateX: translateX.value },
        { scale: currentItem ? 1 : scale },
        { translateY: currentItem ? 0 : translateY },
        { rotateZ: currentItem ? `${direction.value * rotateZ}deg` : `0deg` },
      ],
      opacity: index < maxVisibleItem + currentIndex ? 1 : opacity,
    };
  });

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnimation.value, [0, 180], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnimation.value, [0, 180], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
    };
  });

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pan, doubleTap)}>
      <Animated.View
        style={[
          styles.container,
          { zIndex: dataLength - index },
          animatedStyle,
        ]}
      >
        {/* FRONT */}
        <Animated.View style={[frontStyle]}>{front}</Animated.View>

        {/* BACK */}
        <Animated.View style={[styles.back, styles.card, backStyle]}>
          {back}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = {
  container: {
    position: "absolute" as const,
    width: 300,
    height: 450,
  },

  card: {
    position: "absolute" as const,
    backfaceVisibility: "hidden" as const,
  },
  back: { transform: [{ rotateY: "180deg" }] },
};
