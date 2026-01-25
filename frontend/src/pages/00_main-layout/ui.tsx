import React from "react";
import { View, Text, Image, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabs } from "../../widgets/main-bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";

export function MainLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {/* Header */}
        <SafeAreaView style={{ flex: 1 }}>
          {/* 하위 페이지 렌더링 */}
          <Slot />
        </SafeAreaView>
        <BottomTabs /> {/*SafeAreaView 에서 분리 호환성 문제*/}
      </View>
    </GestureHandlerRootView>
  );
}
