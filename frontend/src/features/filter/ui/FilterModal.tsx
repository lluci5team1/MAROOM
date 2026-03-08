import { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "../../../shared/assets/icons";
import { FilterRow } from "./FilterRow";
import { PriceSlider } from "./PriceSlider";
import {
  FilterState,
  DEFAULT_FILTER,
  FILTER_OPTIONS,
  COLOR_GROUPS,
  BRAND_IMAGES,
  SortOption,
  PriceRange,
} from "../model/type";

type Section = "brand" | "category" | "color" | "sortBy" | null;

const SECTION_LABELS: Record<Exclude<Section, null>, string> = {
  brand: "Brand",
  category: "Category",
  color: "Color",
  sortBy: "Sort By",
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (filter: FilterState) => void;
};

// TEMP: brand search until backend search API is connected
function searchBrandTEMP(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return FILTER_OPTIONS.brands;
  return FILTER_OPTIONS.brands.filter((b) => b.toLowerCase().includes(q));
}

function formatMultiSelected(values: string[]): string | undefined {
  if (values.length === 0) return undefined;
  if (values.length === 1) return values[0];
  return `${values.length} selected`;
}

export function FilterModal({ visible, onClose, onApply }: Props) {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [activeSection, setActiveSection] = useState<Section>(null);
  const [brandQuery, setBrandQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  function clearAll() {
    setFilter(DEFAULT_FILTER);
    setBrandQuery("");
  }

  function handleClose() {
    if (activeSection !== null) {
      setActiveSection(null);
    } else {
      onClose();
    }
  }

  function selectBrand(value: string) {
    setFilter((prev) => ({
      ...prev,
      brand: prev.brand === value ? undefined : value,
    }));
  }

  function selectMultiple(key: "category" | "color", value: string) {
    setFilter((prev) => {
      const current = prev[key];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  }

  function selectSort(value: SortOption) {
    setFilter((prev) => ({
      ...prev,
      sortBy: prev.sortBy === value ? undefined : value,
    }));
  }

  function handlePriceChange(range: PriceRange) {
    setFilter((prev) => ({ ...prev, priceRange: range }));
  }

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function getSortLabel(value?: SortOption) {
    return FILTER_OPTIONS.sortOptions.find((s) => s.value === value)?.label;
  }

  const filteredBrands = searchBrandTEMP(brandQuery);
  const { width } = Dimensions.get("window");
  // paddingHorizontal: 20 each side = 40, gaps between 3 cols = 2*8 = 16
  const brandItemWidth = (width - 40 - 16) / 3;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            {activeSection !== null ? (
              <Text style={styles.backText}>‹</Text>
            ) : (
              <Text style={styles.closeText}>✕</Text>
            )}
          </Pressable>

          {/* Centered title - absolutely positioned so it doesn't shift */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.titleCenter}>
              <Text style={styles.title}>Filter</Text>
            </View>
          </View>

          <Pressable onPress={clearAll}>
            <Text style={styles.clear}>Clear All</Text>
          </Pressable>
        </View>

        {/* Main screen */}
        {activeSection === null && (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <FilterRow
              label="Brand"
              selected={filter.brand}
              onPress={() => setActiveSection("brand")}
            />
            <FilterRow
              label="Category"
              selected={formatMultiSelected(filter.category)}
              onPress={() => setActiveSection("category")}
            />
            <FilterRow
              label="Color"
              selected={formatMultiSelected(filter.color)}
              onPress={() => setActiveSection("color")}
            />
            <FilterRow
              label="Sort By"
              selected={getSortLabel(filter.sortBy)}
              onPress={() => setActiveSection("sortBy")}
            />
            <View style={styles.priceSection}>
              <Text style={styles.priceTitle}>Price Range</Text>
              <PriceSlider onChange={handlePriceChange} />
            </View>
          </ScrollView>
        )}

        {/* Brand detail */}
        {activeSection === "brand" && (
          <>
            <Text style={styles.sectionTitle}>
              {SECTION_LABELS.brand}
            </Text>
            <View style={styles.searchBar}>
              <Image source={icons.search} style={styles.searchIconImg} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#999"
                value={brandQuery}
                onChangeText={setBrandQuery}
              />
            </View>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.brandGrid}>
                {filteredBrands.map((brand) => (
                  <Pressable
                    key={brand}
                    style={[
                      styles.brandItem,
                      { width: brandItemWidth },
                      filter.brand === brand && styles.brandItemSelected,
                    ]}
                    onPress={() => selectBrand(brand)}
                  >
                    <View
                      style={[
                        styles.brandImageBox,
                        { width: brandItemWidth, height: brandItemWidth },
                        filter.brand === brand && styles.brandImageBoxSelected,
                      ]}
                    >
                      <Image
                        source={{ uri: BRAND_IMAGES[brand] }}
                        style={styles.brandImage}
                        resizeMode="cover"
                      />
                      {filter.brand === brand && (
                        <View style={styles.brandCheckOverlay}>
                          <Text style={styles.brandCheckMark}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.brandName,
                        filter.brand === brand && styles.brandNameSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {brand}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </>
        )}

        {/* Category detail */}
        {activeSection === "category" && (
          <>
            <Text style={styles.sectionTitle}>{SECTION_LABELS.category}</Text>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {FILTER_OPTIONS.categories.map((cat) => (
                <CheckboxRow
                  key={cat}
                  label={cat}
                  checked={filter.category.includes(cat)}
                  onPress={() => selectMultiple("category", cat)}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Color detail with dropdown groups */}
        {activeSection === "color" && (
          <>
            <Text style={styles.sectionTitle}>{SECTION_LABELS.color}</Text>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {COLOR_GROUPS.map((group) => (
                <View key={group.label}>
                  <Pressable
                    style={groupStyles.header}
                    onPress={() => toggleGroup(group.label)}
                  >
                    <Text style={groupStyles.headerLabel}>{group.label}</Text>
                    <Text style={groupStyles.chevron}>
                      {openGroups[group.label] ? "▲" : "▼"}
                    </Text>
                  </Pressable>
                  {openGroups[group.label] &&
                    group.colors.map((color) => (
                      <CheckboxRow
                        key={color}
                        label={color}
                        checked={filter.color.includes(color)}
                        onPress={() => selectMultiple("color", color)}
                        indent
                      />
                    ))}
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* Sort By detail */}
        {activeSection === "sortBy" && (
          <>
            <Text style={styles.sectionTitle}>{SECTION_LABELS.sortBy}</Text>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {FILTER_OPTIONS.sortOptions.map(({ label, value }) => (
                <CheckboxRow
                  key={value}
                  label={label}
                  checked={filter.sortBy === value}
                  onPress={() => selectSort(value)}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Apply button */}
        <Pressable
          style={styles.applyButton}
          onPress={() => {
            setActiveSection(null);
            onApply(filter);
          }}
        >
          <Text style={styles.applyText}>Show Products</Text>
        </Pressable>
      </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
}

function CheckboxRow({
  label,
  checked,
  onPress,
  indent = false,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
  indent?: boolean;
}) {
  return (
    <Pressable
      style={[checkboxStyles.row, indent && checkboxStyles.rowIndent]}
      onPress={onPress}
    >
      <View style={[checkboxStyles.box, checked && checkboxStyles.boxChecked]}>
        {checked && <Text style={checkboxStyles.checkMark}>✓</Text>}
      </View>
      <Text style={checkboxStyles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    height: 32,
  },
  titleCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 28,
    alignItems: "flex-start",
  },
  closeText: {
    fontSize: 18,
    color: "#000",
  },
  backText: {
    fontSize: 28,
    color: "#000",
    lineHeight: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Sansation_700Bold",
  },
  clear: {
    color: "#000",
    fontWeight: "500",
    fontFamily: "Sansation_400Regular",
  },
  sectionTitle: {
    fontSize: 15,
    color: "#000",
    fontFamily: "Sansation_400Regular",
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
    paddingHorizontal: 14,
    height: 40,
    marginBottom: 16,
  },
  searchIconImg: {
    width: 18,
    height: 18,
    tintColor: "#999",
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },
  priceSection: {
    paddingTop: 20,
    paddingBottom: 8,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Sansation_700Bold",
  },
  applyButton: {
    backgroundColor: "#018ABD",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  applyText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Brand grid
  brandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  brandItem: {
    alignItems: "center",
    gap: 6,
  },
  brandItemSelected: {},
  brandImageBox: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#E8E8E8",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  brandImageBoxSelected: {
    borderColor: "#018ABD",
  },
  brandImage: {
    width: "100%",
    height: "100%",
  },
  brandCheckOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(1,138,189,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandCheckMark: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
  brandName: {
    fontSize: 12,
    color: "#444",
    fontFamily: "Sansation_400Regular",
    textAlign: "center",
  },
  brandNameSelected: {
    color: "#018ABD",
    fontWeight: "600",
  },
});

const groupStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  headerLabel: {
    fontSize: 15,
    color: "#000",
    fontFamily: "Sansation_400Regular",
  },
  chevron: {
    fontSize: 12,
    color: "#666",
  },
});

const checkboxStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  rowIndent: {
    paddingLeft: 16,
  },
  box: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: {
    backgroundColor: "#018ABD",
    borderColor: "#018ABD",
  },
  checkMark: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 14,
  },
  label: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Sansation_400Regular",
  },
});
