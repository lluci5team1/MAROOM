import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { FilterRow } from "./FilterRow";
import { PriceSlider } from "./PriceSlider";

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
};

export function FilterModal({ visible, onClose, onApply }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose}>
              <Text style={styles.headerText}>✕</Text>
            </Pressable>

            <Text style={styles.title}>Filter</Text>

            <Pressable>
              <Text style={styles.clear}>Clear All</Text>
            </Pressable>
          </View>

          {/* Content (placeholder for now) */}
          <View style={[styles.content]}>
            <FilterRow label="Brand" />
            <FilterRow label="Category" />
            <FilterRow label="Color" />
            <FilterRow label="Style" />
            <FilterRow label="Newest" />
            <FilterRow label="Top Selling" />

            {/* Fake slider (UI only for now) */}
            <View style={styles.priceHeader}>
              <Text style={styles.priceTitle}>Price Range</Text>
              <Text style={styles.priceValue}>$100 – $5000</Text>
            </View>
            <PriceSlider />
          </View>

          {/* Apply button */}
          <Pressable style={styles.applyButton} onPress={onApply}>
            <Text style={styles.applyText}>Apply Filters</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  container: {
    height: "80%",
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Sansation_700Bold",
  },
  clear: {
    color: "#000000",
    fontWeight: "500",
    fontFamily: "Sansation_400Regular",
  },
  content: {
    flex: 1,
  },
  applyButton: {
    backgroundColor: "#018ABD",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  applyText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },

  priceTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Sansation_700Bold",
  },

  priceValue: {
    fontSize: 14,
    color: "#666",
  },

  sliderTrack: {
    marginTop: 16,
    height: 4,
    backgroundColor: "#D6EAF5",
    borderRadius: 2,
    position: "relative",
  },
});
