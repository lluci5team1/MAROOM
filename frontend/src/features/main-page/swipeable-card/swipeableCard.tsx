// features/swipe-behavior/ui/SwipeableCard.tsx
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSwipeGesture } from "./swipe-logic/useSwipeGesture";
import { useFlipGesture } from "./flip-logic/useFlipGesture";
import { useEffect } from "react";
import Animated, { SharedValue } from "react-native-reanimated";

type SwipeActions = {
  left: () => void;
  right: () => void;
  translateX: SharedValue<number>;
};

type Props = {
  index: number;
  currentIndex: number;
  animatedValues: SharedValue<number>;
  maxVisibleItem: number;
  dataLength: number;
  onSwiped: () => void;
  front: React.ReactNode;
  back: React.ReactNode;
  likeButton?: React.ReactNode;
  diskLikeButton?: React.ReactNode;
  registerActions?: (actions: SwipeActions) => void;
};

export function SwipeableCard(props: Props) {
  const { width } = useWindowDimensions();
  const enabled = props.index === props.currentIndex;

  const { doubleTap, frontStyle, backStyle } = useFlipGesture(enabled);

  const { pan, animatedStyle, swipeRight, swipeLeft, translateX } =
    useSwipeGesture({
      enabled,
      index: props.index,
      currentIndex: props.currentIndex,
      width,
      animatedValues: props.animatedValues,
      maxVisibleItem: props.maxVisibleItem,
      onSwiped: props.onSwiped,
    });

  // 🔑 Register swipe actions when this card becomes active
  useEffect(() => {
    if (enabled) {
      props.registerActions?.({
        left: swipeLeft,
        right: swipeRight,
        translateX,
      });
    }
  }, [enabled, swipeLeft, swipeRight]);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={Gesture.Simultaneous(pan, doubleTap)}>
        <Animated.View
          style={[
            styles.cardContainer,
            { zIndex: props.dataLength - props.index },
            animatedStyle,
          ]}
        >
          <Animated.View style={frontStyle}>{props.front}</Animated.View>

          <Animated.View style={[styles.back, styles.card, backStyle]}>
            {props.back}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = {
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  cardContainer: {
    position: "absolute" as const,
    width: 300,
    height: 450,
    top: 0,
  },
  card: {
    position: "absolute" as const,
    backfaceVisibility: "hidden" as const,
  },
  back: { transform: [{ rotateY: "180deg" }] },
};
