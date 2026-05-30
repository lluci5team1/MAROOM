import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const BASE_W = 390; // iPhone 14/15 logical width
const BASE_H = 844; // iPhone 14/15 logical height

/** Scale based on screen width — use for horizontal values (width, paddingHorizontal, gap, etc.) */
export const s = (n: number) => Math.round((width / BASE_W) * n);

/** Scale based on screen height — use for vertical values (height, paddingVertical, marginTop, etc.) */
export const vs = (n: number) => Math.round((height / BASE_H) * n);

/** Moderate scale — use for font sizes and border radii (scales gently, avoids extremes) */
export const ms = (n: number, factor = 0.45) => Math.round(n + (s(n) - n) * factor);
