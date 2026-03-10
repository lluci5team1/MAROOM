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
const BLUE = "#3A86C8";
const SLIDER_WIDTH = W - 80;
const MIN_BUDGET = 0;
const MAX_BUDGET = 2000;

const SPACE_TYPES = [
  "Single Family Home",
  "1 Bedroom",
  "2 Bedroom",
  "Dorm / Studio",
];

const SPACE_SIZES = [
  "Small (under 300 sq ft)",
  "Medium (300-700 sq ft)",
  "Large (700+ sq ft)",
];

const STYLE_ITEMS = [
  { label: "Style 1", image: require("../../shared/assets/image/onboarding_style1.png") },
  { label: "Style 2", image: require("../../shared/assets/image/onboarding_style2.png") },
  { label: "Style 3", image: require("../../shared/assets/image/onboarding_style3.png") },
  { label: "Style 4", image: require("../../shared/assets/image/onboarding_style4.png") },
  { label: "Style 5", image: require("../../shared/assets/image/onboarding_style5.png") },
  { label: "Style 6", image: require("../../shared/assets/image/onboarding_style6.png") },
  { label: "Style 7", image: require("../../shared/assets/image/onboarding_style7.png") },
];

const COLOR_PALETTES = [
  {
    label: "Warm Neutral",
    swatches: ["#E8D9C0", "#D4B896", "#C49A6C", "#8B6914"],
  },
  {
    label: "Cool Neutral",
    swatches: ["#E8EAEC", "#C5CAD0", "#8B97A4", "#4A5568"],
  },
  {
    label: "Earthy Tones",
    swatches: ["#6B7C5E", "#8FAF7E", "#C4956A", "#C4849A"],
  },
  {
    label: "Black & White",
    swatches: ["#E8E8E8", "#B0B0B0", "#686868", "#1A1A1A"],
  },
];

// ─── Step Wrapper ────────────────────────────────────────────────────────────

function StepWrapper({
  question,
  subtext,
  onBack,
  children,
}: {
  question: string;
  subtext?: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.stepContainer}>
      {/* Back button */}
      {onBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Question header */}
      <View style={styles.questionArea}>
        <Text style={styles.questionText}>{question}</Text>
        {subtext && <Text style={styles.subText}>{subtext}</Text>}
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentArea}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

// ─── Step 0: Welcome ─────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.welcomeContainer}>
      {/* Logo top-left */}
      <View style={styles.logoRow}>
        <Image
          source={icons.maroon_onboarding}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>MAROOM</Text>
      </View>

      {/* Illustration */}
      <Image
        source={icons.onboarding_image}
        style={styles.illustrationImage}
        resizeMode="contain"
      />

      {/* Text block */}
      <View style={styles.welcomeTextBlock}>
        <Text style={styles.welcomeTitle}>Find Your Style!</Text>
        <Text style={styles.welcomeSubtitle}>
          Take a quick quiz so we can learn{"\n"}your interior taste
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.getStartedBtn} onPress={onNext}>
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 1: Space Type ───────────────────────────────────────────────────────

function SpaceTypeStep({
  onSelect,
  onBack,
}: {
  onSelect: () => void;
  onBack: () => void;
}) {
  return (
    <StepWrapper
      question="What kind of space are you furnishing?"
      onBack={onBack}
    >
      {SPACE_TYPES.map((type) => (
        <TouchableOpacity
          key={type}
          style={styles.optionBtn}
          onPress={onSelect}
        >
          <Text style={styles.optionText}>{type}</Text>
        </TouchableOpacity>
      ))}
    </StepWrapper>
  );
}

// ─── Step 2: Space Size ───────────────────────────────────────────────────────

function SpaceSizeStep({
  onSelect,
  onBack,
}: {
  onSelect: () => void;
  onBack: () => void;
}) {
  return (
    <StepWrapper
      question="How would you describe your space?"
      onBack={onBack}
    >
      {SPACE_SIZES.map((size) => (
        <TouchableOpacity
          key={size}
          style={styles.optionBtn}
          onPress={onSelect}
        >
          <Text style={styles.optionText}>{size}</Text>
        </TouchableOpacity>
      ))}
    </StepWrapper>
  );
}

// ─── Step 3: Styles ───────────────────────────────────────────────────────────

function StyleStep({
  selected,
  onToggle,
  onNext,
  onBack,
}: {
  selected: string[];
  onToggle: (label: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <StepWrapper
      question="What styles speak to you?"
      subtext="Pick up to 2"
      onBack={onBack}
    >
      <View style={styles.styleGrid}>
        {STYLE_ITEMS.map((item) => {
          const isSelected = selected.includes(item.label);
          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.styleCard, isSelected && styles.styleCardSelected]}
              onPress={() => onToggle(item.label)}
              activeOpacity={0.85}
            >
              <Image source={item.image} style={styles.styleImage} resizeMode="cover" />
              {isSelected && (
                <View style={styles.styleCheck}>
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.nextBtn, selected.length === 0 && styles.nextBtnDisabled]}
        onPress={onNext}
        disabled={selected.length === 0}
      >
        <Text style={styles.nextBtnText}>Next</Text>
      </TouchableOpacity>
    </StepWrapper>
  );
}

// ─── Step 4: Colors ───────────────────────────────────────────────────────────

function ColorStep({
  selected,
  onSelect,
  onBack,
}: {
  selected: string | null;
  onSelect: (label: string) => void;
  onBack: () => void;
}) {
  return (
    <StepWrapper
      question="What colors feel like home to you?"
      onBack={onBack}
    >
      {COLOR_PALETTES.map((palette) => {
        const isSelected = selected === palette.label;
        return (
          <TouchableOpacity
            key={palette.label}
            style={[styles.paletteCard, isSelected && styles.paletteCardSelected]}
            onPress={() => onSelect(palette.label)}
            activeOpacity={0.85}
          >
            <View style={styles.swatchRow}>
              {palette.swatches.map((color) => (
                <View
                  key={color}
                  style={[styles.swatch, { backgroundColor: color }]}
                />
              ))}
            </View>
            <Text style={styles.paletteLabel}>{palette.label}</Text>
          </TouchableOpacity>
        );
      })}
    </StepWrapper>
  );
}

// ─── Step 5: Budget ───────────────────────────────────────────────────────────

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
  const trackX = useRef(0);

  const toPercent = (val: number) => (val - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET);
  const toValue = (px: number) =>
    Math.round(
      Math.min(MAX_BUDGET, Math.max(MIN_BUDGET, (px / SLIDER_WIDTH) * (MAX_BUDGET - MIN_BUDGET) + MIN_BUDGET)) / 50
    ) * 50;

  const minPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        const newMin = toValue(trackX.current + gs.moveX - (W - SLIDER_WIDTH) / 2);
        if (newMin < max - 50) onChangeMin(newMin);
      },
    })
  ).current;

  const maxPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        const newMax = toValue(trackX.current + gs.moveX - (W - SLIDER_WIDTH) / 2);
        if (newMax > min + 50) onChangeMax(newMax);
      },
    })
  ).current;

  const minLeft = toPercent(min) * SLIDER_WIDTH;
  const maxLeft = toPercent(max) * SLIDER_WIDTH;

  return (
    <StepWrapper
      question={`What's your typical budget\nper furniture piece?`}
      subtext="Select your budget range"
      onBack={onBack}
    >
      <View style={styles.sliderContainer}>
        {/* Track background */}
        <View style={styles.sliderTrack}>
          {/* Active fill */}
          <View
            style={[
              styles.sliderFill,
              { left: minLeft, width: maxLeft - minLeft },
            ]}
          />
          {/* Min handle */}
          <View
            {...minPanResponder.panHandlers}
            style={[styles.sliderHandle, { left: minLeft - 12 }]}
          />
          {/* Max handle */}
          <View
            {...maxPanResponder.panHandlers}
            style={[styles.sliderHandle, { left: maxLeft - 12 }]}
          />
        </View>

        {/* Labels */}
        <View style={styles.budgetLabels}>
          <Text style={styles.budgetValue}>${min.toLocaleString()}</Text>
          <Text style={styles.budgetValue}>${max.toLocaleString()}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
        <Text style={styles.nextBtnText}>Finish</Text>
      </TouchableOpacity>
    </StepWrapper>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [budgetMin, setBudgetMin] = useState(50);
  const [budgetMax, setBudgetMax] = useState(200);

  const next = () => {
    if (step < 5) setStep(step + 1);
    else router.replace("/home");
  };
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
  if (step === 1) return <SpaceTypeStep onSelect={next} onBack={back} />;
  if (step === 2) return <SpaceSizeStep onSelect={next} onBack={back} />;
  if (step === 3)
    return (
      <StyleStep
        selected={selectedStyles}
        onToggle={toggleStyle}
        onNext={next}
        onBack={back}
      />
    );
  if (step === 4)
    return (
      <ColorStep
        selected={selectedColor}
        onSelect={(c) => {
          setSelectedColor(c);
          next();
        }}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Welcome
  welcomeContainer: {
    flex: 1,
    backgroundColor: "#7EC8E3",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  logoRow: {
    position: "absolute",
    top: 80,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoImage: {
    width: 44,
    height: 44,
  },
  logoText: {
    fontSize: 22,
    fontFamily: "NotoSans_700Bold",
    color: "white",
    letterSpacing: 1,
  },
  illustrationImage: {
    position: "absolute",
    top: 120,
    width: "100%",
    height: "52%",
  },
  welcomeTextBlock: {
    alignItems: "center",
    marginBottom: 28,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: "NotoSans_700Bold",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontFamily: "NotoSans_400Regular",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 50,
  },
  getStartedBtn: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 80,
    borderRadius: 30,
  },
  getStartedText: {
    fontSize: 16,
    fontFamily: "NotoSans_600SemiBold",
    color: BLUE,
  },

  // ── Step wrapper
  stepContainer: {
    flex: 1,
    backgroundColor: BLUE,
  },
  backBtn: {
    position: "absolute",
    top: 52,
    left: 20,
    zIndex: 10,
    padding: 4,
  },
  questionArea: {
    paddingTop: 150,
    paddingHorizontal: 28,
    paddingBottom: 30,
  },
  questionText: {
    fontSize: 24,
    fontFamily: "NotoSans_700Bold",
    color: "white",
    lineHeight: 32,
    marginBottom: 6,
  },
  subText: {
    fontSize: 14,
    fontFamily: "NotoSans_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  contentArea: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 14,
  },

  // ── Option buttons (step 1 & 2)
  optionBtn: {
    backgroundColor: "white",
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  optionText: {
    fontSize: 16,
    fontFamily: "NotoSans_600SemiBold",
    color: "#1F2937",
  },

  // ── Style grid (step 3)
  styleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "space-between",
    marginBottom: 8,
  },
  styleCard: {
    width: (W - 62) / 2,
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
  },
  styleImage: {
    width: "100%",
    height: "100%",
  },
  styleCardSelected: {
    borderWidth: 3,
    borderColor: "white",
  },
  styleCheck: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Color palettes (step 4)
  paletteCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  paletteCardSelected: {
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  swatchRow: {
    flexDirection: "row",
    gap: 6,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  paletteLabel: {
    fontSize: 15,
    fontFamily: "NotoSans_600SemiBold",
    color: "#1F2937",
    flex: 1,
  },

  // ── Budget slider (step 5)
  sliderContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 28,
    marginBottom: 8,
    gap: 24,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    position: "relative",
  },
  sliderFill: {
    position: "absolute",
    top: 0,
    height: 6,
    backgroundColor: BLUE,
    borderRadius: 3,
  },
  sliderHandle: {
    position: "absolute",
    top: -11,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BLUE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  budgetLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  budgetValue: {
    fontSize: 16,
    fontFamily: "NotoSans_700Bold",
    color: "#1F2937",
  },

  // ── Next / Finish button
  nextBtn: {
    backgroundColor: "white",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: "NotoSans_600SemiBold",
    color: BLUE,
  },
});
