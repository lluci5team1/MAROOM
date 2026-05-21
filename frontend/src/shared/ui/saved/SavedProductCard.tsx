import { View, Text, Image, StyleSheet, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "../../../entities/product/type";

const SCREEN_W = Dimensions.get("window").width;
const H_PAD = 24;
const GAP = 14;
export const CARD_W = Math.floor((SCREEN_W - H_PAD * 2 - GAP) / 2);

type Props = {
  product: Product;
  onPress?: () => void;
};

export function SavedProductCard({ product, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {!!product.imageUrl && (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <View style={styles.bookmarkBtn}>
          <Ionicons name="bookmark" size={16} color="#018ABD" />
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {product.title}
      </Text>
      <Text style={styles.price}>${product.price.toFixed(2)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
  },
  imageWrapper: {
    width: CARD_W,
    height: Math.floor(CARD_W * 1.3),
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  bookmarkBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
    marginBottom: 2,
  },
  price: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#018ABD",
  },
});
