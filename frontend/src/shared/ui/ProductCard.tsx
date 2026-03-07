import { View, Text, Image, StyleSheet } from "react-native";
//import { Dimensions } from "react-native";
import { Product } from "../../entities/product/type";
import { icons } from "../assets/icons";

export function ProductCard({ product }: { product: Product }) {
  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.card}>
        {/*<View style={styles.backButtonContainer}>
          <Image source={icons.backButton} style={styles.backButton} />
        </View>*/}
        <Image
          source={{
            uri: product.productUrl,
          }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {product.title}
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
    borderColor: "#000", // <- 추가함
    borderRadius: 20, // <-- 추가함

    // shadow lives here
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  card: {
    flex: 1,
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden", // safe here
  },
  /*backButtonContainer: {
    position: "absolute",
    width: 40,
    height: 40,
    top: 12,
    right: 12,
    backgroundColor: "white",
    zIndex: 20,
    borderRadius: 100,
  },
  backButton: {
    flex: 0.5,
    paddingTop: 5,
    justifyContent: "center",
    aspectRatio: 1,
    alignSelf: "center",
  },*/
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
