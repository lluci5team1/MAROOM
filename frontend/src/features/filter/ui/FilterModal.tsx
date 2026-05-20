import { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Animated,
} from "react-native";

const SHEET_HEIGHT = Dimensions.get("window").height * (3 / 4);
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PriceSlider } from "./PriceSlider";
import {
  FilterState,
  DEFAULT_FILTER,
  SortOption,
  PriceRange,
  PRICE_MAX,
  FILTER_OPTIONS,
  STYLE_OPTIONS,
  FLAT_COLOR_OPTIONS,
  BRAND_OPTIONS,
} from "../model/type";

type Section = "category" | "style" | "color" | "brand" | null;

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (filter: FilterState) => void;
};

export function FilterModal({ visible, onClose, onApply }: Props) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [activeSection, setActiveSection] = useState<Section>(null);

  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SHEET_HEIGHT, duration: 260, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  function reset() {
    setFilter(DEFAULT_FILTER);
  }

  function handleBack() {
    if (activeSection !== null) setActiveSection(null);
    else onClose();
  }

  function toggleMulti(key: "category" | "style" | "color", val: string) {
    setFilter((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
      };
    });
  }

  function selectBrand(val: string) {
    setFilter((prev) => ({ ...prev, brand: prev.brand === val ? undefined : val }));
  }

  function selectSort(val: SortOption) {
    setFilter((prev) => ({ ...prev, sortBy: prev.sortBy === val ? undefined : val }));
  }

  function handlePriceChange(range: PriceRange) {
    setFilter((prev) => ({ ...prev, priceRange: range }));
  }

  const maxLabel =
    filter.priceRange.max >= PRICE_MAX
      ? "$5,000+"
      : `$${filter.priceRange.max.toLocaleString()}`;
  const priceLabel = `$${filter.priceRange.min} — ${maxLabel}`;

  const sectionCount =
    activeSection === "category" ? filter.category.length
    : activeSection === "style" ? filter.style.length
    : activeSection === "color" ? filter.color.length
    : activeSection === "brand" ? (filter.brand ? 1 : 0)
    : 0;

  const categoryDisplay =
    filter.category.length === 0
      ? "All Categories"
      : filter.category.slice(0, 2).join(", ") + (filter.category.length > 2 ? "..." : "");

  const styleDisplay =
    filter.style.length === 0
      ? "All Styles"
      : filter.style.slice(0, 2).join(", ") + (filter.style.length > 2 ? "..." : "");

  const firstColor = FLAT_COLOR_OPTIONS.find((c) => c.name === filter.color[0]);
  const colorDisplay = filter.color.length === 0 ? "All Colors" : filter.color[0];

  const brandDisplay = filter.brand ?? "All Brands";

  const sectionTitles: Record<Exclude<Section, null>, string> = {
    category: "Category",
    style: "Style",
    color: "Color",
    brand: "Brand",
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={handleBack}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim, backgroundColor: "rgba(0,0,0,0.45)" }]}>
          <Pressable style={{ flex: 1 }} onPress={handleBack} />
        </Animated.View>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }], paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.headerBtn} hitSlop={12}>
              {activeSection !== null ? (
                <Ionicons name="chevron-back" size={22} color="#111" />
              ) : (
                <Ionicons name="close" size={22} color="#111" />
              )}
            </Pressable>
            <Text style={styles.headerTitle}>
              {activeSection !== null ? sectionTitles[activeSection] : "Filter"}
            </Text>
            {activeSection === null ? (
              <Pressable onPress={reset} hitSlop={12}>
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
            ) : (
              <View style={styles.headerBtn} />
            )}
          </View>

          {/* ── Main screen ───────────────────────────────────── */}
          {activeSection === null && (
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollPad}
            >
              {/* Sort By */}
              <Text style={styles.sectionLabel}>Sort By</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {FILTER_OPTIONS.sortOptions.map((opt) => {
                  const active = filter.sortBy === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => selectSort(opt.value)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Price Range */}
              <View style={styles.priceHeader}>
                <Text style={styles.sectionLabel}>Price Range</Text>
                <Text style={styles.priceValue}>{priceLabel}</Text>
              </View>
              <PriceSlider onChange={handlePriceChange} />

              {/* Parameters */}
              <Text style={[styles.sectionLabel, styles.paramsLabel]}>Parameters</Text>
              <ParamRow
                label="Category"
                value={categoryDisplay}
                onPress={() => setActiveSection("category")}
              />
              <Divider />
              <ParamRow
                label="Style"
                value={styleDisplay}
                onPress={() => setActiveSection("style")}
              />
              <Divider />
              <ParamRow
                label="Color"
                value={colorDisplay}
                colorDot={firstColor?.hex}
                onPress={() => setActiveSection("color")}
              />
              <Divider />
              <ParamRow
                label="Brand"
                value={brandDisplay}
                onPress={() => setActiveSection("brand")}
              />
            </ScrollView>
          )}

          {/* ── Category sub-screen ───────────────────────────── */}
          {activeSection === "category" && (
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollPad}
            >
              {FILTER_OPTIONS.categories.map((cat, i) => (
                <View key={cat}>
                  {i > 0 && <Divider />}
                  <Pressable style={styles.checkRow} onPress={() => toggleMulti("category", cat)}>
                    <Text style={styles.checkLabel}>{cat}</Text>
                    <View
                      style={[
                        styles.checkCircle,
                        filter.category.includes(cat) && styles.checkCircleActive,
                      ]}
                    >
                      {filter.category.includes(cat) && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}

          {/* ── Style sub-screen ──────────────────────────────── */}
          {activeSection === "style" && (
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.scrollPad, { gap: 10 }]}
            >
              {STYLE_OPTIONS.map((s) => (
                <ItemCard
                  key={s.name}
                  imageUri={s.imageUrl}
                  name={s.name}
                  subtitle={s.subtitle}
                  selected={filter.style.includes(s.name)}
                  onPress={() => toggleMulti("style", s.name)}
                />
              ))}
            </ScrollView>
          )}

          {/* ── Color sub-screen ──────────────────────────────── */}
          {activeSection === "color" && (
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.scrollPad, { gap: 10 }]}
            >
              {FLAT_COLOR_OPTIONS.map((c) => (
                <ItemCard
                  key={c.name}
                  colorDot={c.hex}
                  name={c.name}
                  subtitle={c.subtitle}
                  selected={filter.color.includes(c.name)}
                  onPress={() => toggleMulti("color", c.name)}
                />
              ))}
            </ScrollView>
          )}

          {/* ── Brand sub-screen ──────────────────────────────── */}
          {activeSection === "brand" && (
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.scrollPad, { gap: 10 }]}
            >
              {BRAND_OPTIONS.map((b) => (
                <ItemCard
                  key={b.name}
                  imageUri={b.logoUrl}
                  name={b.name}
                  selected={filter.brand === b.name}
                  onPress={() => selectBrand(b.name)}
                />
              ))}
            </ScrollView>
          )}

          {/* Apply / Show button */}
          <Pressable
            style={styles.applyButton}
            onPress={() => {
              if (activeSection !== null) {
                setActiveSection(null);
              } else {
                onApply(filter);
              }
            }}
          >
            <Text style={styles.applyText}>
              {activeSection !== null
                ? `Apply Selection${sectionCount > 0 ? ` (${sectionCount})` : ""}`
                : "Show Products"}
            </Text>
          </Pressable>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function ParamRow({
  label,
  value,
  colorDot,
  onPress,
}: {
  label: string;
  value: string;
  colorDot?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.paramRow} onPress={onPress}>
      <Text style={styles.paramLabel}>{label}</Text>
      <View style={styles.paramRight}>
        {colorDot && <View style={[styles.paramColorDot, { backgroundColor: colorDot }]} />}
        <Text style={styles.paramValue}>{value}</Text>
        <Ionicons name="chevron-forward" size={15} color="#018ABD" />
      </View>
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function ItemCard({
  imageUri,
  colorDot,
  name,
  subtitle,
  selected,
  onPress,
}: {
  imageUri?: string;
  colorDot?: string;
  name: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.itemCard} onPress={onPress}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.itemImage} resizeMode="cover" />
      ) : (
        <View style={[styles.itemImage, { backgroundColor: colorDot ?? "#ccc" }]} />
      )}
      <View style={styles.itemText}>
        <Text style={styles.itemName}>{name}</Text>
        {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.radio, selected && styles.radioActive]} />
    </Pressable>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 12,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    marginBottom: 4,
  },
  headerBtn: { width: 32 },
  headerTitle: {
    fontSize: 17,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111",
  },
  resetText: {
    fontSize: 15,
    color: "#018ABD",
    fontFamily: "PlusJakartaSans_600SemiBold",
    textAlign: "right",
    width: 48,
  },

  scroll: { flex: 1 },
  scrollPad: { paddingTop: 8, paddingBottom: 12 },

  // Sort chips
  sectionLabel: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111",
    marginBottom: 12,
    marginTop: 8,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: "#018ABD",
    borderColor: "#018ABD",
  },
  chipText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#374151",
  },
  chipTextActive: {
    color: "#fff",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },

  // Price range
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  priceValue: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#018ABD",
  },

  // Parameters
  paramsLabel: {
    marginTop: 24,
    color: "#6B7280",
    fontSize: 13,
  },
  paramRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  paramLabel: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#111",
  },
  paramRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paramColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  paramValue: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#018ABD",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },

  // Category rows
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
  },
  checkLabel: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#111",
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleActive: {
    backgroundColor: "#018ABD",
    borderColor: "#018ABD",
  },

  // Item cards (style / color / brand)
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F6FA",
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D1D5DB",
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111",
  },
  itemSubtitle: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#6B7280",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  radioActive: {
    backgroundColor: "#018ABD",
    borderColor: "#018ABD",
  },

  // Apply button
  applyButton: {
    marginTop: 12,
    height: 54,
    borderRadius: 30,
    backgroundColor: "#018ABD",
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
});
