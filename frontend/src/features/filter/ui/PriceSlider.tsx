import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";

const MIN = 100;
const MAX = 5000;
const THUMB = 24;

export function PriceSlider() {
  // shared values (UI thread)
  const trackWidth = useSharedValue(0);
  const x = useSharedValue(0);

  // React state (JS thread)
  const [displayPrice, setDisplayPrice] = useState(MIN);

  // gesture
  const pan = Gesture.Pan().onChange((e) => {
    const maxX = Math.max(trackWidth.value - THUMB, 1);

    // move thumb
    x.value = Math.max(0, Math.min(x.value + e.changeX, maxX));

    // calculate price
    const ratio = x.value / maxX;
    const newPrice = Math.round(MIN + ratio * (MAX - MIN));

    // sync to React state
    runOnJS(setDisplayPrice)(newPrice);
  });

  // animated thumb style
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Price text */}
      <Text style={styles.price}>${displayPrice}</Text>

      {/* Track */}
      <View
        style={styles.track}
        onLayout={(e) => {
          trackWidth.value = e.nativeEvent.layout.width;
        }}
      >
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  price: {
    marginBottom: 8,
    fontSize: 14,
    color: "#666",
  },
  track: {
    height: 6,
    backgroundColor: "#D6EAF5",
    borderRadius: 3,
    marginTop: 10,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: "#018ABD",
    position: "absolute",
    top: -9,
  },
});
