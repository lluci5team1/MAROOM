import React from "react";
import { View, Text, Image, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SwipeCardDeck } from "../../widgets/swipe-card-stack";
import { RoundButton } from "../../shared/ui/likeButton";
import { BottomTabs } from "../../widgets/main-bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { products } from "../../entities/product/product";

export function HomePage() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {/* Header */}
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            <Text style={{ fontSize: 28, fontWeight: "700", color: "#3A86C8" }}>
              MAROOM
            </Text>
          </View>

          {/* Centered content */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1, width: "100%", maxHeight: 450 }}>
              <SwipeCardDeck products={products} />
            </View>
            <View style={{ height: 50 }} />
            <View style={{ flexDirection: "row", gap: 60 }}>
              <RoundButton icon={require("../../shared/assets/icons/X.png")} />
              <RoundButton
                icon={require("../../shared/assets/icons/heart.png")}
              />
            </View>
          </View>

          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#aee5ffff",
            }}
          >
            <BottomTabs />
          </View>
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
}
