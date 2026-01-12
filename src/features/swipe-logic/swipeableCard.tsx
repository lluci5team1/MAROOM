import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const THRESHOLD = 120;

export function SwipeableCard({
  onSwipeLeft,
  onSwipeRight,
  children,
}: {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  children: React.ReactNode;
}) {
  const x = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
    })
    .onEnd(() => {
      if (x.value > THRESHOLD) {
        x.value = withSpring(500, {}, () => {
          runOnJS(onSwipeRight)();
        });
      } else if (x.value < -THRESHOLD) {
        x.value = withSpring(-500, {}, () => {
          runOnJS(onSwipeLeft)();
        });
      } else {
        x.value = withSpring(0);
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { rotateZ: `${x.value / 20}deg` }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>{children}</Animated.View>
    </GestureDetector>
  );
}
