import { useState } from "react";
import { Gesture } from "react-native-gesture-handler";
import {
  runOnJS,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";

export function useFlipGesture(enabled: boolean) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useSharedValue(0);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(250)
    .onEnd(() => {
      if (!enabled) return;

      flipAnimation.value = withTiming(isFlipped ? 0 : 180, { duration: 300 });
      runOnJS(setIsFlipped)(!isFlipped);
    });

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${flipAnimation.value}deg` },
    ],
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${flipAnimation.value + 180}deg` },
    ],
  }));

  return { doubleTap, frontStyle, backStyle };
}
