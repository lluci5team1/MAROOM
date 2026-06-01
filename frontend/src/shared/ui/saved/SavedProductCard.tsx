import { View, Text, Image, StyleSheet, Pressable, Dimensions, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "../../../entities/product/type";
import { s, vs, ms } from "../../utils/scale";

const SCREEN_W = Dimensions.get("window").width;
const H_PAD = s(24);
const GAP = s(14);
export const CARD_W = Math.floor((SCREEN_W - H_PAD * 2 - GAP) / 2);

type Props = {
  product: Product;
  onPress?: () => void;
  onUnsave?: () => void;
};

export function SavedProductCard({ product, onPress, onUnsave }: Props) {
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
        <Pressable
          style={styles.bookmarkBtn}
          hitSlop={8}
          onPress={() =>
            Alert.alert(
              "Remove Item",
              "Are you sure you want to remove this from your saved items?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: "destructive", onPress: onUnsave },
              ]
            )
          }
        >
          <Ionicons name="bookmark" size={ms(16)} color="#018ABD" />
        </Pressable>
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
    borderRadius: ms(16),
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    marginBottom: vs(10),
  },
  image: {
    width: "100%",
    height: "100%",
  },
  bookmarkBtn: {
    position: "absolute",
    top: vs(10),
    right: s(10),
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: ms(3),
    elevation: 2,
  },
  title: {
    fontSize: ms(14),
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
    marginBottom: vs(2),
  },
  price: {
    fontSize: ms(13),
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#018ABD",
  },
});
