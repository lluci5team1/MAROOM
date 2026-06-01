import { View, Text, Image, StyleSheet } from "react-native";
import { Product } from "../../entities/product/type";
import { s, vs, ms } from "../utils/scale";

export function ProductCard({ product }: { product: Product }) {
  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.card}>
        {!!product.imageUrl && (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <View style={styles.content}>
          <Text style={styles.category} numberOfLines={1} ellipsizeMode="tail">
            {product.category.toUpperCase()}
          </Text>
          <View style={styles.bottomRow}>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {product.title}
            </Text>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    width: s(332),
    height: s(460),
    borderRadius: ms(32),
    shadowColor: "#173B63",
    shadowOffset: { width: 0, height: vs(18) },
    shadowOpacity: 0.16,
    shadowRadius: ms(26),
    elevation: 10,
  },
  card: {
    flex: 1,
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: ms(32),
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: s(374),
    alignSelf: "flex-start",
  },
  content: {
    paddingHorizontal: s(20),
    paddingTop: vs(10),
    paddingBottom: vs(20),
  },
  category: {
    fontSize: ms(12),
    lineHeight: ms(14),
    color: "#7B8798",
    fontFamily: "Inter_400Regular",
  },
  bottomRow: {
    marginTop: vs(3),
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: s(12),
  },
  title: {
    flex: 1,
    fontSize: ms(24),
    lineHeight: ms(28),
    color: "#14233C",
    fontFamily: "Manrope_800ExtraBold",
  },
  price: {
    fontSize: ms(20),
    lineHeight: ms(24),
    color: "#1399E5",
    fontFamily: "Manrope_700Bold",
  },
});
