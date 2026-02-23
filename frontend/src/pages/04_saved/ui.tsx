import React, { useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { Product } from "../../entities/product/type";
import { fetchSavedProductsSample } from "../../shared/api/fetchSavedProductsSample";
import CategoryButton from "../../shared/ui/saved/CategoryButton";
import { SavedProductCard } from "../../shared/ui/saved/SavedProductCard";
import { SavedProductCardDummy } from "../../shared/ui/saved/SavedProductCardDummy";

export function SavedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [curCategory, setCurCategory] = useState("All furniture");

  const furnitureTypes = ["All furniture", "Chair", "Step", "Lamp", "Bed", "Storage"];


  // saved products 불러오기
  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchSavedProductsSample();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);




  const filteredProducts = useMemo(() => {
    if (curCategory === "All furniture") return products;

    return products.filter((product) =>
      product.furnitureType.includes(curCategory)
    );
  }, [curCategory, products]);

  // dummy 추가 (filtered 기준)
  const displayProducts = [...filteredProducts];
  if (displayProducts.length % 2 !== 0) {
    displayProducts.push({ id: "dummy" } as any);
  }





  return (
    <View style={{ flex: 1, alignItems: "center" }} >
      {loading ?
        <Text>Loading...</Text> :

        <>
          {/* 상단 */}
          <View style={{ width: "100%" }}>
            <View style={styles.topBar}>
              <Text style={{ fontSize: 18, letterSpacing: 0.1, fontFamily: "NotoSans_700Bold" }}> Saved </Text>
            </View>
          </View>

          {/* 선 */}
          <View style={styles.line}></View>

          {/* 본문 */}
          <View style={{ flex: 1, width: "100%" }}>
            {/* 태그 필터 */}
            <ScrollView
             horizontal
             showsHorizontalScrollIndicator={false}
             contentContainerStyle={styles.categoryBar}>
              {
                furnitureTypes.map((type) => (
                  <CategoryButton key={type} text={type} isSelected={curCategory === type} onPress={()=>setCurCategory(type)}/>
                ))
              }
            </ScrollView>

            {/* 저장된 항목들 */}
            <FlatList
              data={displayProducts}
              keyExtractor={(item, index) => item.id?.toString() ?? `dummy-${index}`}
              renderItem={({ item }) =>
                item.id === "dummy" ? <SavedProductCardDummy /> : <SavedProductCard product={item} />
              }
              numColumns={2}
              contentContainerStyle={styles.savedProductHolder}
            />
          </View>
        </>
      }


    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 75,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    marginHorizontal: 35,
  },
  line: {
    width: "90%",
    height: 0.5,
    borderBottomColor: "#D9D9D9",
    borderBottomWidth: 0.5,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryBar: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginVertical: 10,
    paddingTop: 5,
  },
  savedProductHolder: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-evenly",
    gap: 20,
    paddingVertical: 10,
  }
});