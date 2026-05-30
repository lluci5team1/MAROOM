import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "../../entities/product/type";
import { s, vs, ms } from "../utils/scale";

export function ProductCardBack({ product }: { product: Product }) {
  async function handleBuyNow() {
    if (!product.productUrl) return;
    const canOpen = await Linking.canOpenURL(product.productUrl);
    if (canOpen) await Linking.openURL(product.productUrl);
  }

  const specs = [
    { label: "Dimensions", value: "N/A" },
    { label: "Weight", value: "N/A" },
    { label: "Material", value: "N/A" },
  ];

  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.card}>
        <View style={styles.specRow}>
          <Text style={styles.specKey}>Color</Text>
          <Text style={styles.specValue}>{product.color.toUpperCase()}</Text>
        </View>

        {specs.map((spec) => (
          <View key={spec.label}>
            <View style={styles.divider} />
            <View style={styles.specRow}>
              <Text style={styles.specKey}>{spec.label}</Text>
              <Text style={styles.specValue}>{spec.value.toUpperCase()}</Text>
            </View>
          </View>
        ))}

        <Pressable style={styles.buyButton} onPress={handleBuyNow}>
          <Text style={styles.buyButtonText}>Buy Now</Text>
          <Ionicons name="open-outline" size={ms(18)} color="#fff" style={{ marginLeft: s(8) }} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    width: s(332),
    height: s(460),
    borderRadius: ms(32),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.08,
    shadowRadius: ms(12),
    elevation: 4,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: ms(32),
    paddingHorizontal: s(28),
    paddingTop: s(60),
    paddingBottom: s(28),
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: s(18),
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  specKey: {
    fontSize: ms(16),
    color: "#111827",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  specValue: {
    fontSize: ms(14),
    color: "#374151",
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "right",
    flex: 1,
    marginLeft: s(16),
  },
  buyButton: {
    marginTop: "auto" as any,
    height: s(54),
    borderRadius: ms(30),
    backgroundColor: "#018ABD",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#018ABD",
    shadowOffset: { width: 0, height: vs(6) },
    shadowOpacity: 0.4,
    shadowRadius: ms(12),
    elevation: 8,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: ms(17),
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
});
