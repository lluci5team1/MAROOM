import { View, Text, Image, StyleSheet } from "react-native";
//import { Dimensions } from "react-native";
import { Product } from "../../../entities/product/type";
import { icons } from "../../assets/icons";

export function SavedProductCard({ product }: { product: Product }) {
  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.card}>
        {/*<View style={styles.backButtonContainer}>
          <Image source={icons.backButton} style={styles.backButton} />
        </View>*/}
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
    width: 160,
    height: 250,
    borderColor: "#f8f8f8", // <- 추가함
    borderWidth: 1,
    borderRadius: 20, // <-- 추가함
    marginHorizontal: 16,
    marginVertical: 3,

    //shadowColor: "#000",
    //shadowOffset: { width: 0, height: 4 },
    //shadowOpacity: 0.5,
    //shadowRadius: 20,
    //elevation: 3,
  },
  card: {
    flex: 1,
    position: "relative",
    backgroundColor: "#f8f8f8",
    borderRadius: 20,
    overflow: "hidden", // safe here
  },
  image: {
    width: "100%",
    aspectRatio: 1, // tweak until it looks right
    alignSelf: "flex-start",
  },
  content: { flex: 1, padding: 12, gap: 1 },
  title: { 
    fontSize: 10, fontFamily: "Poppins_400SemiBold", 
    textOverflow: "ellipsis", width: "100%",
  },
  space: { fontSize: 7, fontFamily: "Poppins_400Regular" },
  price: { fontSize: 8, fontFamily: "Poppins_400SemiBold" },
});
