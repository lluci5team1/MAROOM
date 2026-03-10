import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabs } from "../../widgets/main-bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";

export function MainLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <Slot />
        </SafeAreaView>
        <BottomTabs />
      </View>
    </GestureHandlerRootView>
  );
}
