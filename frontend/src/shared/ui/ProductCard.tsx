import { View, Text, Image, StyleSheet } from "react-native";
import { Product } from "../../entities/product/type";

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
            <Text style={styles.price}>${product.price}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    width: 332,
    height: 460,
    borderRadius: 32,
    shadowColor: "#173B63",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 26,
    elevation: 10,
  },
  card: {
    flex: 1,
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 374,
    alignSelf: "flex-start",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  category: {
    fontSize: 12,
    lineHeight: 14,
    color: "#7B8798",
    fontFamily: "Inter_400Regular",
  },
  bottomRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    lineHeight: 28,
    color: "#14233C",
    fontFamily: "Manrope_800ExtraBold",
  },
  price: {
    fontSize: 20,
    lineHeight: 24,
    color: "#1399E5",
    fontFamily: "Manrope_700Bold",
  },
});
