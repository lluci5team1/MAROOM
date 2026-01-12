import { View, Text, Image, StyleSheet } from "react-native";
//import { Dimensions } from "react-native";
import { Product } from "../../entities/product/type";

export function ProductCard({ product }: { product: Product }) {
  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.card}>
        <Image
          source={{
            uri: product.image,
          }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {product.name}
          </Text>
          <Text style={styles.space}>{product.brand}</Text>
          <Text style={styles.price}>${product.price}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    width: 300,
    height: 450,

    // shadow lives here
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden", // safe here
  },
  image: {
    width: "100%",
    aspectRatio: 1, // tweak until it looks right
    alignSelf: "flex-start",
  },
  content: { flex: 1, padding: 15, gap: 8 },
  title: { fontSize: 20, fontFamily: "Poppins_400Medium" },
  space: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  price: { fontSize: 27, fontFamily: "Poppins_400SemiBold" },
});
