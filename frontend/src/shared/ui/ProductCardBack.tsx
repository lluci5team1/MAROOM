import { View, Text, StyleSheet, Pressable } from "react-native";
import { Product } from "../../entities/product/type";

export function ProductCardBack({ product }: { product: Product }) {
  const colors = product.color
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 2);

  const firstColor = colors[0] ?? "Beige";
  const secondColor = colors[1] ?? "Charcoal";

  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {product.brand.toUpperCase()}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {product.title}
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionLabel}>Color</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorDot, { backgroundColor: mapColor(firstColor) }]} />
            <View style={[styles.colorDot, { backgroundColor: mapColor(secondColor) }]} />
          </View>

          <Text style={styles.sectionLabel}>Dimensions</Text>
          <Text style={styles.sectionValue}>15.8"W x 12.7"D x 5.7"H</Text>

          <Text style={styles.sectionLabel}>Weight</Text>
          <Text style={styles.sectionValue}>62.2 lbs</Text>

          <Text style={styles.sectionLabel}>Material</Text>
          <Text style={styles.sectionValue}>Melamine, Wood</Text>

          <Pressable style={styles.ctaButton}>
            <Text style={styles.ctaText}>BUY NOW</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function mapColor(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("black") || lower.includes("charcoal")) return "#3A3C3B";
  if (lower.includes("white") || lower.includes("cream")) return "#EFE8E0";
  if (lower.includes("beige") || lower.includes("ivory") || lower.includes("tan")) return "#EBD4BD";
  if (lower.includes("gray") || lower.includes("grey")) return "#929292";
  if (lower.includes("brown")) return "#8B5E3B";
  if (lower.includes("blue") || lower.includes("navy")) return "#3E67A8";
  if (lower.includes("green")) return "#4E7A4C";
  if (lower.includes("red")) return "#A34A45";
  return "#D8D8D8";
}

const styles = StyleSheet.create({
  shadowWrapper: {
    width: 300,
    height: 450,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  card: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#0E8DBE",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 18,
    fontFamily: "Poppins_600SemiBold",
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 8,
    lineHeight: 11,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sectionLabel: {
    marginTop: 4,
    fontSize: 16,
    color: "#111111",
    fontFamily: "Poppins_600SemiBold",
  },
  sectionValue: {
    marginTop: 6,
    marginBottom: 6,
    fontSize: 13,
    color: "#1B1B1B",
    fontFamily: "Inter_400Regular",
  },
  colorRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 8,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  ctaButton: {
    marginTop: "auto",
    marginBottom: 20,
    alignSelf: "center",
    backgroundColor: "#0E8DBE",
    minWidth: 196,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    lineHeight: 20,
  },
});
