import { View, Image, Pressable, StyleSheet, Text } from "react-native";
import { BOTTOM_TABS } from "../../shared/config/bottomTabs";
import { useFonts, NotoSans_400Regular } from "@expo-google-fonts/noto-sans";
/*import { Dimensions } from "react-native";



const { width, height } = Dimensions.get("window");
const iconWidth = width / 6;
const iconHeight = height / 12;*/

type TabItem = {
  key: string;
  label: string;
  icon: any;
  onPress: () => void;
};

type Props = {
  tabs: TabItem[];
  activeKey: string;
};

export function MainBottomTabs({ tabs, activeKey }: Props) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Pressable key={tab.key} style={styles.button} onPress={tab.onPress}>
          <View style={styles.contents}>
            <Image
              source={tab.icon}
              style={[
                styles.icon,
                { tintColor: tab.key === activeKey ? "#2F80ED" : "black" },
              ]}
            />
            <Text
              style={[
                styles.label,
                tab.key === activeKey && { color: "#2F80ED" },
              ]}
            >
              {tab.label}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#D9EDF5",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    width: 30,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  contents: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  label: { fontFamily: "NotoSans_400Regular", fontSize: 12, color: "black" },
});
