import { useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { PriceRange, PRICE_MIN, PRICE_MAX } from "../model/type";

const THUMB = 22;
const TRACK_H = 6;
const TRACK_TOP = (THUMB - TRACK_H) / 2;

type Props = {
  onChange?: (range: PriceRange) => void;
};

export function PriceSlider({ onChange }: Props) {
  const containerWidth = useSharedValue(0);
  const minX = useSharedValue(0);
  const maxX = useSharedValue(0);
  const [layoutDone, setLayoutDone] = useState(false);

  const [minPrice, setMinPrice] = useState(PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);

  const latestMin = useRef(PRICE_MIN);
  const latestMax = useRef(PRICE_MAX);

  // Store gesture start positions to use translationX (avoids stale SharedValue reads)
  const minStartX = useRef(0);
  const maxStartX = useRef(0);

  const minPan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-2, 2])
    .failOffsetY([-5, 5])
    .onBegin(() => {
      minStartX.current = minX.value;
    })
    .onChange((e) => {
      const effective = containerWidth.value - THUMB;
      const newX = Math.max(
        0,
        Math.min(minStartX.current + e.translationX, maxX.value - THUMB)
      );
      minX.value = newX;
      const price = Math.round(PRICE_MIN + (newX / Math.max(effective, 1)) * (PRICE_MAX - PRICE_MIN));
      latestMin.current = price;
      setMinPrice(price);
      onChange?.({ min: price, max: latestMax.current });
    });

  const maxPan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-2, 2])
    .failOffsetY([-5, 5])
    .onBegin(() => {
      maxStartX.current = maxX.value;
    })
    .onChange((e) => {
      const effective = containerWidth.value - THUMB;
      const newX = Math.min(
        effective,
        Math.max(maxStartX.current + e.translationX, minX.value + THUMB)
      );
      maxX.value = newX;
      const price = Math.round(PRICE_MIN + (newX / Math.max(effective, 1)) * (PRICE_MAX - PRICE_MIN));
      latestMax.current = price;
      setMaxPrice(price);
      onChange?.({ min: latestMin.current, max: price });
    });

  const minThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: minX.value }],
  }));

  const maxThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: maxX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    left: minX.value + THUMB / 2,
    width: Math.max(0, maxX.value - minX.value),
  }));

  const maxLabel = maxPrice >= PRICE_MAX ? "$5000+" : `$${maxPrice}`;

  return (
    <View style={styles.container}>
      <View style={styles.priceRow}>
        <Text style={styles.priceText}>${minPrice}</Text>
        <Text style={styles.priceText}>{maxLabel}</Text>
      </View>

      <View
        style={styles.sliderContainer}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          containerWidth.value = w;
          maxX.value = w - THUMB;
          maxStartX.current = w - THUMB;
          setLayoutDone(true);
        }}
      >
        <View style={styles.trackBg} />
        <Animated.View style={[styles.fill, fillStyle]} />

        {layoutDone && (
          <>
            <GestureDetector gesture={minPan}>
              <Animated.View style={[styles.thumb, minThumbStyle]} />
            </GestureDetector>

            <GestureDetector gesture={maxPan}>
              <Animated.View style={[styles.thumb, maxThumbStyle]} />
            </GestureDetector>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceText: {
    fontSize: 13,
    color: "#444",
    fontFamily: "Sansation_400Regular",
  },
  sliderContainer: {
    height: THUMB,
    marginVertical: 8,
  },
  trackBg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: TRACK_TOP,
    height: TRACK_H,
    backgroundColor: "#D6EAF5",
    borderRadius: TRACK_H / 2,
  },
  fill: {
    position: "absolute",
    top: TRACK_TOP,
    height: TRACK_H,
    backgroundColor: "#018ABD",
    borderRadius: TRACK_H / 2,
  },
  thumb: {
    position: "absolute",
    top: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: "#018ABD",
  },
});
