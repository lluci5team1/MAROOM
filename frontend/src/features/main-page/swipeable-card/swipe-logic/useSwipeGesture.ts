import { Gesture } from "react-native-gesture-handler";
import {
  interpolate,
  runOnJS,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";

type Params = {
  enabled: boolean;
  index: number;
  currentIndex: number;
  width: number;
  animatedValues: any;
  maxVisibleItem: number;
  onSwiped: () => void;
};

export function useSwipeGesture({
  enabled,
  index,
  currentIndex,
  width,
  animatedValues,
  maxVisibleItem,
  onSwiped,
}: Params) {
  const translateX = useSharedValue(0);
  const direction = useSharedValue(1);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (!enabled) return;

      direction.value = e.translationX > 0 ? 1 : -1;
      translateX.value = e.translationX;

      animatedValues.value = interpolate(
        Math.abs(e.translationX),
        [0, width],
        [index, index + 1],
      );
    })
    .onEnd((e) => {
      if (!enabled) return;

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
      opacity,
    };
  });

  const swipeRight = () => {
    translateX.value = withTiming(width, {}, () => {
      if (!enabled) return;
      runOnJS(onSwiped)();
    });
    animatedValues.value = withTiming(currentIndex + 1);
  };

  const swipeLeft = () => {
    translateX.value = withTiming(-width, {}, () => {
      if (!enabled) return;
      runOnJS(onSwiped)();
    });
    animatedValues.value = withTiming(currentIndex + 1);
  };

  return { pan, animatedStyle, swipeRight, swipeLeft };
}
