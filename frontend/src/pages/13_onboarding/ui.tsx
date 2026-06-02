import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  PanResponder,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { icons } from "../../shared/assets/icons";
import { getUserId } from "../../shared/api/token";

import { s as sc, vs, ms } from "../../shared/utils/scale";

const { width: W } = Dimensions.get("window");
const BLUE = "#018ABD";
const SLIDER_W = W - sc(64);
const MIN_BUDGET = 0;
const MAX_BUDGET = 4000;
const TOTAL = 5;
const CARD_W = Math.floor((W - sc(48) - sc(14)) / 2);

// ── Data ──────────────────────────────────────────────────────────────────────

const SPACE_TYPES = [
  { label: "Single Family Home", icon: "home-outline" },
  { label: "1 Bedroom",          icon: "bed-outline" },
  { label: "2 Bedroom",          icon: "business-outline" },
  { label: "Dorm / Studio",      icon: "grid-outline" },
];

const SPACE_SIZES = [
  { label: "Small",  sub: "under 300 sq ft", icon: "contract-outline" },
  { label: "Medium", sub: "300–700 sq ft",   icon: "square-outline" },
  { label: "Large",  sub: "700+ sq ft",       icon: "expand-outline" },
];

const STYLE_ITEMS = [
  { label: "Minimalist",          image: require("../../shared/assets/image/onboarding_style1.png") },
  { label: "Scandinavian",        image: require("../../shared/assets/image/onboarding_style2.png") },
  { label: "Modern",              image: require("../../shared/assets/image/onboarding_style3.png") },
  { label: "Japandi",             image: require("../../shared/assets/image/onboarding_style4.png") },
  { label: "Boho",                image: require("../../shared/assets/image/onboarding_style5.png") },
  { label: "Industrial",          image: require("../../shared/assets/image/onboarding_style6.png") },
  { label: "Mid-Century\nModern", image: require("../../shared/assets/image/onboarding_style7.png") },
];

const COLOR_PALETTES = [
  { label: "Warm Neutral",  sub: "COZY & TIMELESS",      swatches: ["#E8D8C0", "#C9A87C", "#7A5230"] },
  { label: "Cool Neutral",  sub: "MODERN & CLEAN",       swatches: ["#D4D9DE", "#9BAAB4", "#4A5568"] },
  { label: "Earthy Tones",  sub: "ORGANIC & GROUNDED",   swatches: ["#6B7C5E", "#8B6349", "#C4849A"] },
  { label: "Black & White", sub: "SLEEK & BOLD",         swatches: ["#1A1A1A", "#686868", "#E8E8E8"] },
  { label: "Vibrant",       sub: "ENERGETIC & PLAYFUL",  swatches: ["#FF4500", "#018ABD", "#FFD700"] },
  { label: "Pastel",        sub: "SOFT & SERENE",        swatches: ["#FFB3C6", "#87CEEB", "#D8B4FE"] },
];

// ── Shared primitives ─────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${(step / TOTAL) * 100}%` as any }]} />
    </View>
  );
}

function Radio({ on }: { on: boolean }) {
  return (
    <View style={[s.radioOuter, on && s.radioOuterOn]}>
      {on && <View style={s.radioInner} />}
    </View>
  );
}

function StepLabel({ step }: { step: number }) {
  return (
    <Text style={s.stepLabel}>STEP {step} OF {TOTAL}</Text>
  );
}

function Footer({
  onBack,
  onNext,
  nextLabel = "CONTINUE",
  disabled = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  disabled?: boolean;
}) {
  return (
    <View style={s.footer}>
      {onBack ? (
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={15} color="#6B7280" />
          <Text style={s.backText}>BACK</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      <TouchableOpacity
        style={[s.continueBtn, disabled && s.continueBtnOff]}
        onPress={onNext}
        disabled={disabled}
      >
        <Text style={s.continueText}>{nextLabel}</Text>
        <Ionicons name="chevron-forward" size={15} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// ── Welcome ───────────────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View style={s.welcome}>
      <View style={s.logoRow}>
        <Image source={icons.LOGO2} style={s.logoImg} resizeMode="contain" />
        <Text style={s.logoText}>MAROOM</Text>
      </View>
      <Image source={icons.onboarding_image} style={s.illustration} resizeMode="contain" />
      <View style={s.welcomeBlock}>
        <Text style={s.welcomeTitle}>Find Your Style!</Text>
        <Text style={s.welcomeSub}>
          Take a quick quiz so we can learn{"\n"}your interior taste
        </Text>
      </View>
      <TouchableOpacity style={s.getStartedBtn} onPress={onNext}>
        <Text style={s.getStartedText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Step 1: Space type ────────────────────────────────────────────────────────

function SpaceTypeStep({ sel, onSel, onNext, onBack }: { sel: string | null; onSel: (v: string) => void; onNext: () => void; onBack: () => void }) {
  return (
    <View style={s.screen}>
      <ProgressBar step={1} />
      <StepLabel step={1} />
      <Text style={s.question}>What kind of space are{"\n"}you furnishing?</Text>
      <ScrollView style={s.scrollView} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {SPACE_TYPES.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={s.optionRow}
            onPress={() => onSel(item.label)}
            activeOpacity={0.8}
          >
            <View style={s.iconCircle}>
              <Ionicons name={item.icon as any} size={22} color={BLUE} />
            </View>
            <Text style={s.optionLabel}>{item.label}</Text>
            <Radio on={sel === item.label} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Footer onBack={onBack} onNext={onNext} disabled={!sel} />
    </View>
  );
}

// ── Step 2: Space size ────────────────────────────────────────────────────────

function SpaceSizeStep({ sel, onSel, onNext, onBack }: { sel: string | null; onSel: (v: string) => void; onNext: () => void; onBack: () => void }) {
  return (
    <View style={s.screen}>
      <ProgressBar step={2} />
      <StepLabel step={2} />
      <Text style={s.question}>How would you describe{"\n"}your space?</Text>
      <ScrollView style={s.scrollView} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {SPACE_SIZES.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={s.optionRow}
            onPress={() => onSel(item.label)}
            activeOpacity={0.8}
          >
            <View style={s.iconCircle}>
              <Ionicons name={item.icon as any} size={22} color={BLUE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.optionLabel}>{item.label}</Text>
              <Text style={s.optionSub}>{item.sub}</Text>
            </View>
            <Radio on={sel === item.label} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Footer onBack={onBack} onNext={onNext} disabled={!sel} />
    </View>
  );
}

// ── Step 3: Styles ────────────────────────────────────────────────────────────

function StyleStep({
  selected,
  onToggle,
  onNext,
  onBack,
}: {
  selected: string[];
  onToggle: (l: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <View style={s.screen}>
      <ProgressBar step={3} />
      <StepLabel step={3} />
      <Text style={s.question}>What styles speak to you?</Text>
      <ScrollView style={s.scrollView} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        <View style={s.grid}>
          {STYLE_ITEMS.map((item) => {
            const on = selected.includes(item.label);
            return (
              <TouchableOpacity
                key={item.label}
                style={[s.styleCard, on && s.styleCardOn]}
                onPress={() => onToggle(item.label)}
                activeOpacity={0.85}
              >
                <Image source={item.image} style={s.styleImg} resizeMode="cover" />
                <View style={s.styleFooter}>
                  <Text style={s.styleLabel} numberOfLines={2}>{item.label}</Text>
                  <Radio on={on} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <Footer onBack={onBack} onNext={onNext} disabled={selected.length === 0} />
    </View>
  );
}

// ── Step 4: Colors ────────────────────────────────────────────────────────────

function ColorStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: string | null;
  onSelect: (l: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <View style={s.screen}>
      <ProgressBar step={4} />
      <StepLabel step={4} />
      <Text style={s.question}>What colors feel like{"\n"}home to you?</Text>
      <ScrollView style={s.scrollView} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        <View style={s.grid}>
          {COLOR_PALETTES.map((p) => {
            const on = selected === p.label;
            return (
              <TouchableOpacity
                key={p.label}
                style={[s.colorCard, on && s.colorCardOn]}
                onPress={() => onSelect(p.label)}
                activeOpacity={0.85}
              >
                <View style={s.swatchContainer}>
                  <View style={s.swatchClip}>
                    <View style={s.swatchRow}>
                      {p.swatches.map((c) => (
                        <View key={c} style={[s.swatch, { backgroundColor: c }]} />
                      ))}
                    </View>
                  </View>
                  <View style={s.colorRadioOverlay}>
                    <Radio on={on} />
                  </View>
                </View>
                <Text style={s.paletteName}>{p.label}</Text>
                <Text style={s.paletteSub}>{p.sub}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <Footer onBack={onBack} onNext={onNext} disabled={!selected} />
    </View>
  );
}

// ── Step 5: Budget ────────────────────────────────────────────────────────────

function BudgetStep({
  min,
  max,
  onChangeMin,
  onChangeMax,
  onNext,
  onBack,
}: {
  min: number;
  max: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const toPercent = (v: number) => (v - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET);
  const toVal = (px: number) =>
    Math.round(
      Math.min(MAX_BUDGET, Math.max(MIN_BUDGET, (px / SLIDER_W) * (MAX_BUDGET - MIN_BUDGET))) / 100
    ) * 100;

  const minPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const v = toVal(g.moveX - (W - SLIDER_W) / 2);
        if (v < max - 100) onChangeMin(v);
      },
    })
  ).current;

  const maxPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const v = toVal(g.moveX - (W - SLIDER_W) / 2);
        if (v > min + 100) onChangeMax(v);
      },
    })
  ).current;

  const minLeft = toPercent(min) * SLIDER_W;
  const maxLeft = toPercent(max) * SLIDER_W;

  return (
    <View style={s.screen}>
      <ProgressBar step={5} />
      <StepLabel step={5} />
      <Text style={s.question}>{"What's your typical budget\nper furniture piece?"}</Text>
      <View style={s.list}>
        <Text style={s.rangeLabel}>Price Range</Text>
        <View style={s.sliderWrap}>
          <View style={s.sliderTrack}>
            <View style={[s.sliderFill, { left: minLeft, width: maxLeft - minLeft }]} />
            <View {...minPan.panHandlers} style={[s.thumb, { left: minLeft - 10 }]} />
            <View {...maxPan.panHandlers} style={[s.thumb, { left: maxLeft - 10 }]} />
          </View>
          <View style={s.sliderLabels}>
            <Text style={s.sliderVal}>${min.toLocaleString()}</Text>
            <Text style={s.sliderVal}>${max.toLocaleString()}</Text>
          </View>
        </View>
      </View>
      <Footer onBack={onBack} onNext={onNext} nextLabel="VIEW YOUR PICKS" />
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const HOME_TYPE_MAP: Record<string, string> = {
  "Single Family Home": "SINGLE_FAMILY_HOME",
  "1 Bedroom": "1_BEDROOM",
  "2 Bedroom": "2_BEDROOM",
  "Dorm / Studio": "DORM_STUDIO",
};
const ROOM_SIZE_MAP: Record<string, string> = {
  Small: "SMALL", Medium: "MEDIUM", Large: "LARGE",
};
const STYLE_MAP: Record<string, string> = {
  Minimalist: "MINIMALIST", Modern: "MODERN", Scandinavian: "SCANDINAVIAN",
  "Mid-Century\nModern": "MID_CENTURY", Japandi: "JAPANDI", Boho: "BOHO", Industrial: "INDUSTRIAL",
};
const COLOR_MAP: Record<string, string> = {
  "Warm Neutral": "WARM_NEUTRAL", "Cool Neutral": "COOL_NEUTRAL",
  "Earthy Tones": "EARTHY_TONES", "Black & White": "BLACK_WHITE",
  Vibrant: "VIBRANT", Pastel: "PASTEL",
};

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [spaceType, setSpaceType] = useState<string | null>(null);
  const [spaceSize, setSpaceSize] = useState<string | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(4000);

  const next = async () => {
    if (step < 5) { setStep(step + 1); return; }
    const userId = await getUserId().catch(() => null);
    router.replace({
      pathname: "/analyzing",
      params: {
        userId: userId ?? "",
        homeType: HOME_TYPE_MAP[spaceType ?? ""] ?? "1_BEDROOM",
        roomSize: ROOM_SIZE_MAP[spaceSize ?? ""] ?? "MEDIUM",
        styles: JSON.stringify(selectedStyles.map((st) => STYLE_MAP[st] ?? st.toUpperCase())),
        colorPalette: JSON.stringify(selectedColor ? [COLOR_MAP[selectedColor] ?? selectedColor.toUpperCase()] : ["WARM_NEUTRAL"]),
        minBudget: String(budgetMin),
        maxBudget: String(budgetMax),
      },
    } as any);
  };
  const back = () => setStep(step - 1);

  const toggleStyle = (label: string) => {
    setSelectedStyles((prev) =>
      prev.includes(label)
        ? prev.filter((s) => s !== label)
        : prev.length < 3
        ? [...prev, label]
        : prev
    );
  };

  if (step === 0) return <WelcomeStep onNext={next} />;
  if (step === 1) return <SpaceTypeStep sel={spaceType} onSel={setSpaceType} onNext={next} onBack={back} />;
  if (step === 2) return <SpaceSizeStep sel={spaceSize} onSel={setSpaceSize} onNext={next} onBack={back} />;
  if (step === 3)
    return <StyleStep selected={selectedStyles} onToggle={toggleStyle} onNext={next} onBack={back} />;
  if (step === 4)
    return (
      <ColorStep
        selected={selectedColor}
        onSelect={setSelectedColor}
        onNext={next}
        onBack={back}
      />
    );
  return (
    <BudgetStep
      min={budgetMin}
      max={budgetMax}
      onChangeMin={setBudgetMin}
      onChangeMax={setBudgetMax}
      onNext={next}
      onBack={back}
    />
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Welcome
  welcome: {
    flex: 1,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: sc(28),
    paddingBottom: vs(140),
  },
  logoRow: {
    position: "absolute",
    top: vs(72),
    left: sc(24),
    flexDirection: "row",
    alignItems: "center",
    gap: sc(8),
  },
  logoImg: { width: sc(36), height: sc(36), tintColor: "#fff" },
  logoText: {
    fontSize: ms(20),
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#fff",
    letterSpacing: 1.5,
  },
  illustration: {
    position: "absolute",
    top: vs(110),
    width: "100%",
    height: "52%",
  },
  welcomeBlock: { alignItems: "center", marginBottom: vs(32) },
  welcomeTitle: {
    fontSize: ms(28),
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#fff",
    marginBottom: vs(12),
    textAlign: "center",
  },
  welcomeSub: {
    fontSize: ms(15),
    fontFamily: "PlusJakartaSans_400Regular",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: ms(22),
  },
  getStartedBtn: {
    backgroundColor: "#fff",
    paddingVertical: vs(16),
    paddingHorizontal: sc(60),
    borderRadius: 999,
  },
  getStartedText: {
    fontSize: ms(16),
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: BLUE,
  },

  // Quiz screen shell
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: vs(56),
  },
  progressTrack: {
    height: vs(4),
    backgroundColor: "#E5E7EB",
  },
  progressFill: {
    height: vs(4),
    backgroundColor: BLUE,
    borderRadius: ms(2),
  },
  stepLabel: {
    fontSize: ms(11),
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: vs(16),
    marginBottom: vs(4),
  },
  question: {
    fontSize: ms(26),
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
    lineHeight: ms(34),
    paddingHorizontal: sc(24),
    marginTop: vs(12),
    marginBottom: vs(28),
  },
  // ScrollView itself must flex to fill the space between header + footer.
  scrollView: {
    flex: 1,
  },
  // Content container must NOT use flex:1 — that pins content to the viewport
  // height and disables scrolling (breaks the 7-item style grid on step 3).
  listContent: {
    paddingHorizontal: sc(24),
    gap: vs(18),
    paddingBottom: vs(16),
  },
  list: {
    flex: 1,
    paddingHorizontal: sc(24),
    gap: vs(18),
  },

  // Option rows (step 1 & 2)
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: vs(22),
    paddingHorizontal: sc(20),
    gap: sc(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.08,
    shadowRadius: ms(8),
    elevation: 3,
  },
  iconCircle: {
    width: sc(48),
    height: sc(48),
    borderRadius: ms(24),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    flex: 1,
    fontSize: ms(17),
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
  },
  optionSub: {
    fontSize: ms(13),
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#6B7280",
    marginTop: vs(2),
  },

  // Style grid (step 3)
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: sc(14),
  },
  styleCard: {
    width: CARD_W,
    backgroundColor: "#F9FAFB",
    borderRadius: ms(16),
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  styleCardOn: {
    borderColor: BLUE,
  },
  styleImg: {
    width: CARD_W,
    height: CARD_W * 0.75,
  },
  styleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sc(10),
    paddingVertical: vs(10),
  },
  styleLabel: {
    flex: 1,
    fontSize: ms(13),
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
    lineHeight: ms(18),
  },

  // Color grid (step 4)
  colorCard: {
    width: CARD_W,
    backgroundColor: "#F3F4F6",
    borderRadius: ms(40),
    padding: sc(20),
    borderWidth: 2,
    borderColor: "transparent",
    gap: vs(6),
  },
  colorCardOn: {
    borderColor: BLUE,
  },
  swatchContainer: {
    position: "relative",
  },
  swatchClip: {
    height: vs(63),
    overflow: "hidden",
  },
  colorRadioOverlay: {
    position: "absolute",
    top: vs(6),
    right: sc(6),
    alignItems: "center",
    justifyContent: "center",
  },
  swatchRow: {
    flexDirection: "row",
    borderRadius: 999,
    overflow: "hidden",
    height: vs(80),
    gap: sc(3),
    backgroundColor: "#F3F4F6",
  },
  swatch: { flex: 1 },
  paletteName: {
    fontSize: ms(13),
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
    marginTop: vs(2),
  },
  paletteSub: {
    fontSize: ms(10),
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },

  // Budget slider (step 5)
  rangeLabel: {
    fontSize: ms(14),
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#9CA3AF",
    marginBottom: vs(12),
  },
  sliderWrap: { gap: vs(12) },
  sliderTrack: {
    height: vs(4),
    backgroundColor: "#E5E7EB",
    borderRadius: ms(2),
    position: "relative",
  },
  sliderFill: {
    position: "absolute",
    top: 0,
    height: vs(4),
    backgroundColor: BLUE,
    borderRadius: ms(2),
  },
  thumb: {
    position: "absolute",
    top: -vs(8),
    width: sc(20),
    height: sc(20),
    borderRadius: ms(10),
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: BLUE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.15,
    shadowRadius: ms(4),
    elevation: 3,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderVal: {
    fontSize: ms(12),
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#9CA3AF",
  },

  // Radio
  radioOuter: {
    width: sc(22),
    height: sc(22),
    borderRadius: ms(11),
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioOuterOn: {
    borderColor: BLUE,
  },
  radioInner: {
    width: sc(12),
    height: sc(12),
    borderRadius: ms(6),
    backgroundColor: BLUE,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sc(24),
    paddingVertical: vs(16),
    paddingBottom: vs(32),
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#fff",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: sc(4),
    flex: 1,
  },
  backText: {
    fontSize: ms(13),
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: sc(4),
    backgroundColor: BLUE,
    paddingHorizontal: sc(24),
    paddingVertical: vs(14),
    borderRadius: 999,
  },
  continueBtnOff: {
    opacity: 0.4,
  },
  continueText: {
    fontSize: ms(13),
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#fff",
    letterSpacing: 0.5,
  },
});
