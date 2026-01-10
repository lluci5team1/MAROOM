import { View, Text, Image, StyleSheet } from "react-native";
//import { Dimensions } from "react-native";

export function ProductCard() {
  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.card}>
        <Image
          source={{
            uri: "https://www.livingspaces.com/globalassets/productassets/200000-299999/210000-219999/216000-216999/216800-216899/216868/216868_0.jpg?w=490&h=330&mode=pad",
          }}
          style={styles.image}
        />
        <View style={styles.content}>
          <Text style={styles.title}>
            Willow Creek II Brown Wood 2-Drawer 25” Nightstand
          </Text>
          <Text style={styles.space}>Living Spaces</Text>
          <Text style={styles.price}>$95.00</Text>
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
  image: { flex: 1 },
  content: { flex: 1, padding: 20, gap: 20 },
  title: { fontSize: 20 },
  space: { fontSize: 10 },
  price: { fontSize: 20 },
});
