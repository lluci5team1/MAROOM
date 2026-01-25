import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Product } from "../../entities/product/type";
import { fetchSavedProductsSample } from "../../shared/api/fetchSavedProductsSample";
import CategoryButton from "../../shared/ui/CategoryButton";

export function SavedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchSavedProductsSample();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} >
      {loading ?
        <Text>Loading...</Text> :

        <>
          {/* 상단 */}
          <View style={{ width: "100%" }}>
            <View style={styles.topBar}>
              <Text style={{ fontSize: 24, letterSpacing: 0.5 }}> Saved </Text>
            </View>
          </View>

          {/* 본문 */}
          <View style={{ flex: 1, width: "100%" }}>
            {/* 태그 필터 */}
            <View style={styles.categoryBar}>
              <CategoryButton text="All Furniture" isSelected={true} />
              <CategoryButton text="Table" isSelected={false} />
              <CategoryButton text="Storage" isSelected={false} />
            </View>

            {/* 저장된 항목들 */}
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text>hi</Text>
            </View>
          </View>
        </>
      }


    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 15,
    marginHorizontal: 40,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
  },
  categoryBar: { 
    height: 90, 
    flexDirection: "row", 
    alignItems: "center",
    gap: 12, 
    paddingHorizontal: 20, 
    marginVertical: 10 
  },
});