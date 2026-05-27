import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "../../entities/product/type";

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
        {/* Color row */}
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
          <Ionicons name="open-outline" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    width: 332,
    height: 460,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 28,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  specKey: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  specValue: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  buyButton: {
    marginTop: "auto" as any,
    height: 54,
    borderRadius: 30,
    backgroundColor: "#018ABD",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#018ABD",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
});
