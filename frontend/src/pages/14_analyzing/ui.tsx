import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

const LOOP = 10000;

const BLUE = "#13A8D8";
const PALE_BLUE = "#EAF3FF";
const LINE = "#DDE9F7";
const TEXT = "#111111";
const SUBTEXT = "#9AA0A6";

function clamp(v: number, input: number[], output: number[]) {
  "worklet";
  return interpolate(v, input, output, Extrapolation.CLAMP);
}

function windowOpacity(t: number, start: number, end: number, fade = 180) {
  "worklet";
  const fadeIn = clamp(t, [start, start + fade], [0, 1]);
  const fadeOut = clamp(t, [end - fade, end], [1, 0]);
  return Math.min(fadeIn, fadeOut);
}

function SuccessCheck({ size = 56 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      <Circle cx="28" cy="28" r="28" fill={BLUE} />
      <Path
        d="M17 28.5L25 36L40 20"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function HandPointer({ size = 28 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      <Path
        d="M10.8 2.5C12 2.5 13 3.5 13 4.7V12L14.1 10.8C15 9.9 16.5 10 17.3 11L17.8 11.7L18.5 11.1C19.4 10.3 20.8 10.5 21.5 11.5L22 12.2L22.5 11.8C23.5 11.1 24.9 11.5 25.4 12.6C25.7 13.1 25.7 13.7 25.6 14.3L24.1 22.2C23.7 24.2 22 25.5 20 25.5H13.2C11.8 25.5 10.5 24.8 9.7 23.7L4.4 16.5C3.8 15.7 4 14.5 4.8 13.9C5.6 13.3 6.8 13.5 7.4 14.3L8.7 16V4.7C8.7 3.5 9.6 2.5 10.8 2.5Z"
        fill={BLUE}
      />
    </Svg>
  );
}

// ─── Coordinate notes ────────────────────────────────────────────────────────
// circleShadow in phone: left=64, top=202  (182×182)
// Document, focusBox, cursor are inside `circle` — clipped to circular boundary.
// All coords are relative to the circle view origin (0,0 = top-left of circle).
// Document:  left=34, top=52
// FocusBox:  left=47, top=80
// Cursor:    left=97, top=98
// ─────────────────────────────────────────────────────────────────────────────

function AnalysisAnimation() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: LOOP, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const t = useDerivedValue(() => progress.value * LOOP);

  // ─── Phase timeline ───────────────────────────────────────────────────────
  // 0–850    : All set
  // 850–1050 : fade out success
  // 1050–2200: Phase 1 – cursor on row 1 (big input)
  // 2200–2500: scroll 1 – content −38 px, cursor follows row 1 up
  // 2500–2700: cursor jumps down to row 2
  // 2700–3800: Phase 2 – cursor on row 2 (big block)
  // 3800–4100: scroll 2 – content −76 px total, cursor follows row 2 up
  // 4100–4300: cursor jumps down to small row
  // 4300–5400: Phase 3 – cursor on small row
  // 5400–5900: exit – card slides down, all fades
  // 5900–7250: bottom plate pause
  // 7250–7600: fade in success
  // 7600–10000: All set
  // ─────────────────────────────────────────────────────────────────────────

  const successIconStyle = useAnimatedStyle(() => {
    const firstSuccess = clamp(t.value, [0, 850, 1050], [1, 1, 0]);
    const finalSuccess = clamp(t.value, [7250, 7600, 10000], [0, 1, 1]);
    const opacity = Math.max(firstSuccess, finalSuccess);
    const scale = clamp(t.value, [0, 850, 7250, 7600], [1, 1, 0.88, 1]);
    return { opacity, transform: [{ scale }] };
  });

  // Dots only (clipped inside circle)
  const processingDotsStyle = useAnimatedStyle(() => ({
    opacity: windowOpacity(t.value, 900, 5900, 220),
  }));

  const bottomPlateStyle = useAnimatedStyle(() => ({
    opacity: windowOpacity(t.value, 5900, 7350, 250),
    transform: [{ translateY: clamp(t.value, [5700, 5900], [16, 0]) }],
  }));

  const successTextStyle = useAnimatedStyle(() => {
    const firstSuccess = clamp(t.value, [0, 850, 1050], [1, 1, 0]);
    const finalSuccess = clamp(t.value, [7250, 7650, 10000], [0, 1, 1]);
    return {
      opacity: Math.max(firstSuccess, finalSuccess),
      transform: [{ translateY: clamp(t.value, [0, 850, 7250, 7650], [0, 0, 6, 0]) }],
    };
  });

  const processingTextStyle = useAnimatedStyle(() => ({
    opacity: windowOpacity(t.value, 900, 5900, 220),
    transform: [
      { translateY: clamp(t.value, [900, 1100, 5700, 5900], [8, 0, 0, -4]) },
    ],
  }));

  // Document card: content scrolls inside fixed card; card slides down on exit
  const docScrollStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: clamp(
          t.value,
          [1050, 2200, 2500, 3800, 4100, 5400],
          [0,    0,    -38,  -38,  -76,  -76],
        ),
      },
    ],
  }));

  const docAnimStyle = useAnimatedStyle(() => ({
    opacity: windowOpacity(t.value, 900, 5900, 220),
    transform: [
      { translateY: clamp(t.value, [5400, 5900], [0, 40]) },
    ],
  }));

  // Focus box — appears ONLY when cursor is settled on a row.
  // Row centers in phone coords:
  //   Phase 1 (scroll 0):   254+40 = 294  → focusBox top=284  → ty=284-282=2
  //   Phase 2 (scroll -38): 254+49 = 303  → focusBox top=293  → ty=11
  //   Phase 3 (scroll -76): 254+82 = 336  → focusBox top=330  → ty=48  (h=12)
  const focusStyle = useAnimatedStyle(() => {
    const p1 = windowOpacity(t.value, 1100, 2200, 150);
    const p2 = windowOpacity(t.value, 2700, 3800, 150);
    const p3 = windowOpacity(t.value, 4300, 5400, 150);
    const opacity = Math.max(p1, Math.max(p2, p3));

    const ty = clamp(
      t.value,
      [1050, 2200, 2700, 3800, 4300, 5400],
      [2,    2,    11,   11,   48,   48],
    );
    const w = clamp(t.value, [4200, 4400], [89, 58]);
    const h = clamp(t.value, [4200, 4400], [20, 12]);

    return { opacity, width: w, height: h, transform: [{ translateY: ty }] };
  });

  // Cursor follows rows during scroll, jumps between rows on transition.
  // Cursor centers ~2 px below focus box center.
  //   Phase 1: ty=-4   scroll1-end: ty=-42   Phase 2: ty=5
  //   scroll2-end: ty=-33   Phase 3: ty=38
  const cursorStyle = useAnimatedStyle(() => ({
    opacity: windowOpacity(t.value, 1000, 5700, 160),
    transform: [
      { translateX: -17 },
      {
        translateY: clamp(
          t.value,
          [1050, 2200, 2500, 2700, 3800, 4100, 4300, 5400, 5900],
          [-4,   -4,   -42,  5,    5,    -33,  38,   38,   70],
        ),
      },
    ],
  }));

  // Dots sequence
  const dot1Style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      t.value,
      [900, 1100, 2000, 2200],
      ["#FFFFFF", BLUE, BLUE, "#FFFFFF"],
    ),
    opacity: clamp(t.value, [900, 1100, 2000, 2200], [0.55, 1, 1, 0.55]),
  }));

  const dot2Style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      t.value,
      [2700, 2900, 3700, 3900],
      ["#FFFFFF", BLUE, BLUE, "#FFFFFF"],
    ),
    opacity: clamp(t.value, [2700, 2900, 3700, 3900], [0.55, 1, 1, 0.55]),
  }));

  const dot3Style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      t.value,
      [4300, 4500, 5300, 5500],
      ["#FFFFFF", BLUE, BLUE, "#FFFFFF"],
    ),
    opacity: clamp(t.value, [4300, 4500, 5300, 5500], [0.55, 1, 1, 0.55]),
  }));

  return (
    <View style={anim.phone}>
      {/* Circle — all children clipped to circular boundary */}
      <View style={anim.circleShadow}>
        <View style={anim.circle}>
          <Animated.View style={[anim.successCard, successIconStyle]}>
            <SuccessCheck size={56} />
            <View style={anim.successLineSmall} />
            <View style={anim.successLineLarge} />
          </Animated.View>

          <Animated.View style={[StyleSheet.absoluteFillObject, processingDotsStyle]}>
            <Animated.View style={[anim.dot, anim.dotLeft, dot1Style]} />
            <Animated.View style={[anim.dot, anim.dotMiddle, dot2Style]} />
            <Animated.View style={[anim.dot, anim.dotRight, dot3Style]} />
          </Animated.View>

          <Animated.View style={[anim.document, docAnimStyle]}>
            <Animated.View style={[anim.docContent, docScrollStyle]}>
              <View style={anim.docLineShort} />
              <View style={anim.docInput} />
              <View style={anim.docLineShort2} />
              <View style={anim.docBlock} />
              <View style={anim.docLineShort3} />
              <View style={anim.docSmallLabel} />
              <View style={anim.docSmallRow} />
            </Animated.View>
          </Animated.View>

          <Animated.View style={[anim.focusBox, focusStyle]} />

          <Animated.View style={[anim.cursor, cursorStyle]}>
            <HandPointer size={28} />
          </Animated.View>

          <Animated.View style={[anim.bottomPlate, bottomPlateStyle]} />
        </View>
      </View>

      {/* Text layers */}
      <Animated.View style={[anim.textLayer, successTextStyle]}>
        <Text style={anim.title}>All set!</Text>
      </Animated.View>

      <Animated.View style={[anim.textLayer, processingTextStyle]}>
        <Text style={anim.title}>Just a moment...</Text>
        <Text style={anim.subtitle}>Analyzing your style preferences...</Text>
      </Animated.View>
    </View>
  );
}

export function AnalyzingPage() {
  return (
    <View style={styles.container}>
      <AnalysisAnimation />
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/(main)" as any)}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Explore Rooms</Text>
        <Feather name="arrow-right" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    paddingBottom: 40,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#00ADEF",
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 36,
    shadowColor: "#00ADEF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});

const anim = StyleSheet.create({
  phone: {
    width: 311,
    height: 676,
    borderRadius: 32,
    backgroundColor: "white",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  circleShadow: {
    position: "absolute",
    left: 64,
    top: 202,
    width: 182,
    height: 182,
    borderRadius: 91,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  circle: {
    width: 182,
    height: 182,
    borderRadius: 91,
    backgroundColor: PALE_BLUE,
    overflow: "hidden",
  },
  successCard: {
    position: "absolute",
    left: 33,
    top: 50,
    width: 116,
    height: 145,
    borderRadius: 6,
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 18,
  },
  successLineSmall: {
    marginTop: 8,
    width: 36,
    height: 5,
    borderRadius: 4,
    backgroundColor: LINE,
  },
  successLineLarge: {
    marginTop: 9,
    width: 60,
    height: 6,
    borderRadius: 4,
    backgroundColor: LINE,
  },
  dot: {
    position: "absolute",
    top: 28,
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  dotLeft: { left: 60 },
  dotMiddle: { left: 87 },
  dotRight: { left: 114 },

  // Document card — coords relative to circleClip container (left=34, top=52)
  document: {
    position: "absolute",
    left: 34,
    top: 52,
    width: 116,
    height: 145,
    borderRadius: 6,
    backgroundColor: "white",
    overflow: "hidden",
  },
  docContent: {
    paddingTop: 12,
    paddingLeft: 12,
  },
  docLineShort: {
    width: 38,
    height: 6,
    borderRadius: 4,
    backgroundColor: LINE,
    marginBottom: 12,
  },
  // Big row 1 — highlighted in phase 1 (content y=30–50)
  docInput: {
    width: 89,
    height: 20,
    borderRadius: 3,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D7E6F5",
    marginBottom: 10,
  },
  docLineShort2: {
    width: 38,
    height: 6,
    borderRadius: 4,
    backgroundColor: LINE,
    marginBottom: 10,
  },
  // Big row 2 — highlighted in phase 2 (content y=76–98)
  docBlock: {
    width: 92,
    height: 22,
    borderRadius: 4,
    backgroundColor: LINE,
    marginBottom: 10,
  },
  // Extra margin pushes small row below initial card height (145) so it's hidden at scroll=0
  docLineShort3: {
    width: 38,
    height: 6,
    borderRadius: 4,
    backgroundColor: LINE,
    marginBottom: 25,
  },
  docSmallLabel: {
    width: 28,
    height: 5,
    borderRadius: 3,
    backgroundColor: LINE,
    marginBottom: 8,
  },
  // Small row — highlighted in phase 3 (content y=152–164)
  docSmallRow: {
    width: 58,
    height: 12,
    borderRadius: 3,
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#D7E6F5",
  },

  // FocusBox relative to circleClip: left=47, top=80
  focusBox: {
    position: "absolute",
    left: 47,
    top: 80,
    width: 89,
    height: 20,
    borderRadius: 3,
    borderWidth: 1.4,
    borderColor: BLUE,
  },
  // Cursor relative to circleClip: left=97, top=98
  cursor: {
    position: "absolute",
    left: 97,
    top: 98,
  },
  bottomPlate: {
    position: "absolute",
    left: 34,
    top: 132,
    width: 116,
    height: 58,
    borderRadius: 6,
    backgroundColor: "white",
  },
  textLayer: {
    position: "absolute",
    left: 0,
    top: 421,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    color: TEXT,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 14,
    color: SUBTEXT,
    textAlign: "center",
  },
});
