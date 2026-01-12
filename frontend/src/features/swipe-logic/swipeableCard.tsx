// features/swipe-behavior/ui/SwipeableCard.tsx
import { useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
  children: React.ReactNode;
};

export function SwipeableCard({
  index,
  currentIndex,
  animatedValues,
  maxVisibleItem,
  dataLength,
  onSwiped,
  children,
}: Props) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const direction = useSharedValue(1);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (index !== currentIndex) return;

      direction.value = e.translationX > 0 ? 1 : -1;
      translateX.value = e.translationX;

      animatedValues.value = interpolate(
        Math.abs(e.translationX),
        [0, width],
        [index, index + 1]
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
      [0, 30]
    );

    const scale = interpolate(
      animatedValues.value,
      [index - 1, index],
      [0.9, 1]
    );

    const translateY = interpolate(
      animatedValues.value,
      [index - 1, index],
      [-50, 0]
    );
    const opacity = interpolate(
      animatedValues.value + maxVisibleItem,
      [index, index + 1],
      [0, 1]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { scale: currentItem ? 1 : scale },
        { translateY: currentItem ? 0 : translateY },
        { rotateZ: currentItem ? `${direction.value * rotateZ}deg` : `0deg` },
      ],
      opacity: index < maxVisibleItem + currentIndex ? 1 : opacity,
    };
  });
  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          { position: "absolute", zIndex: dataLength - index },
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
