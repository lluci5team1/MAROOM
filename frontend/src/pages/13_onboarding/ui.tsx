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

const { width: W } = Dimensions.get("window");
const BLUE = "#018ABD";
const SLIDER_W = W - 64;
const MIN_BUDGET = 0;
const MAX_BUDGET = 4000;
const TOTAL = 5;
const CARD_W = Math.floor((W - 48 - 14) / 2);

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
        <Image source={icons.maroon_onboarding} style={s.logoImg} resizeMode="contain" />
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

function SpaceTypeStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <View style={s.screen}>
      <ProgressBar step={1} />
      <StepLabel step={1} />
      <Text style={s.question}>What kind of space are{"\n"}you furnishing?</Text>
      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {SPACE_TYPES.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={s.optionRow}
            onPress={() => setSel(item.label)}
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

function SpaceSizeStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <View style={s.screen}>
      <ProgressBar step={2} />
      <StepLabel step={2} />
      <Text style={s.question}>How would you describe{"\n"}your space?</Text>
      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {SPACE_SIZES.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={s.optionRow}
            onPress={() => setSel(item.label)}
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
      <ScrollView contentContainerStyle={[s.list, { paddingBottom: 16 }]} showsVerticalScrollIndicator={false}>
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
      <ScrollView contentContainerStyle={[s.list, { paddingBottom: 16 }]} showsVerticalScrollIndicator={false}>
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

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(4000);

  const next = () => { if (step < 5) setStep(step + 1); else router.replace("/analyzing"); };
  const back = () => setStep(step - 1);

  const toggleStyle = (label: string) => {
    setSelectedStyles((prev) =>
      prev.includes(label)
        ? prev.filter((s) => s !== label)
        : prev.length < 2
        ? [...prev, label]
        : prev
    );
  };

  if (step === 0) return <WelcomeStep onNext={next} />;
  if (step === 1) return <SpaceTypeStep onNext={next} onBack={back} />;
  if (step === 2) return <SpaceSizeStep onNext={next} onBack={back} />;
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
    paddingHorizontal: 28,
    paddingBottom: 52,
  },
  logoRow: {
    position: "absolute",
    top: 72,
    left: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoImg: { width: 36, height: 36 },
  logoText: {
    fontSize: 20,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#fff",
    letterSpacing: 1.5,
  },
  illustration: {
    position: "absolute",
    top: 110,
    width: "100%",
    height: "52%",
  },
  welcomeBlock: { alignItems: "center", marginBottom: 32 },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  welcomeSub: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 22,
  },
  getStartedBtn: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 999,
  },
  getStartedText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: BLUE,
  },

  // Quiz screen shell
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 56,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
  },
  progressFill: {
    height: 4,
    backgroundColor: BLUE,
    borderRadius: 2,
  },
  stepLabel: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  question: {
    fontSize: 26,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
    lineHeight: 34,
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 28,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 18,
  },

  // Option rows (step 1 & 2)
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 22,
    paddingHorizontal: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    flex: 1,
    fontSize: 17,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
  },
  optionSub: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#6B7280",
    marginTop: 2,
  },

  // Style grid (step 3)
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  styleCard: {
    width: CARD_W,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
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
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  styleLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
    lineHeight: 18,
  },

  // Color grid (step 4)
  colorCard: {
    width: CARD_W,
    backgroundColor: "#F3F4F6",
    borderRadius: 40,
    padding: 20,
    borderWidth: 2,
    borderColor: "transparent",
    gap: 6,
  },
  colorCardOn: {
    borderColor: BLUE,
  },
  swatchContainer: {
    position: "relative",
  },
  swatchClip: {
    height: 63,
    overflow: "hidden",
  },
  colorRadioOverlay: {
    position: "absolute",
    top: 6,
    right: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchRow: {
    flexDirection: "row",
    borderRadius: 999,
    overflow: "hidden",
    height: 80,
    gap: 3,
    backgroundColor: "#F3F4F6",
  },
  swatch: { flex: 1 },
  paletteName: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
    marginTop: 2,
  },
  paletteSub: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },

  // Budget slider (step 5)
  rangeLabel: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#9CA3AF",
    marginBottom: 12,
  },
  sliderWrap: { gap: 12 },
  sliderTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    position: "relative",
  },
  sliderFill: {
    position: "absolute",
    top: 0,
    height: 4,
    backgroundColor: BLUE,
    borderRadius: 2,
  },
  thumb: {
    position: "absolute",
    top: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: BLUE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderVal: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#9CA3AF",
  },

  // Radio
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BLUE,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#fff",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  backText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: BLUE,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  continueBtnOff: {
    opacity: 0.4,
  },
  continueText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#fff",
    letterSpacing: 0.5,
  },
});
