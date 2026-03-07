import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { SwipeCardDeck } from "../../widgets/swipe-card-stack";
import { fetchFurnitureItems } from "../../entities/product/api";
import { Product } from "../../entities/product/type";

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchFurnitureItems();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch furniture:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: "#3A86C8" }}>
          MAROOM
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1, width: "100%", maxHeight: 600, top: 50 }}>
          <SwipeCardDeck products={products} />
        </View>
      </View>
    </>
  );
}
