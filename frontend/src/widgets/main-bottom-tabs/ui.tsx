import { View, Image, Pressable, StyleSheet, Text } from "react-native";
import { s, vs, ms } from "../../shared/utils/scale";

type TabItem = {
  key: string;
  label: string;
  icon: any;
  iconSize?: number;
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
          <View style={[styles.contents, tab.key === activeKey && styles.activeContents]}>
            <Image
              source={tab.icon}
              style={[
                styles.icon,
                tab.iconSize ? { width: tab.iconSize, height: tab.iconSize } : undefined,
                { tintColor: tab.key === activeKey ? "#2C84C6" : "#8B98A9" },
              ]}
              resizeMode="contain"
            />
            <Text style={[styles.label, tab.key === activeKey && styles.activeLabel]}>
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
    paddingTop: vs(12),
    paddingHorizontal: s(18),
    paddingBottom: vs(22),
    backgroundColor: "#fff",
    borderTopLeftRadius: ms(28),
    borderTopRightRadius: ms(28),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.25,
    shadowRadius: ms(4),
    elevation: 5,
  },
  button: {
    flex: 1,
    height: vs(60),
    justifyContent: "center",
    alignItems: "center",
  },
  contents: {
    alignItems: "center",
    justifyContent: "center",
    gap: vs(5),
    alignSelf: "stretch",
    paddingVertical: vs(6),
    borderRadius: ms(18),
  },
  activeContents: {
    backgroundColor: "#F8FCFF",
    marginHorizontal: s(2),
  },
  icon: {
    width: s(24),
    height: s(24),
  },
  label: {
    fontFamily: "NotoSans_400Regular",
    fontSize: ms(12),
    color: "#7E8B9A",
  },
  activeLabel: {
    color: "#0EA5E9",
    fontFamily: "NotoSans_700Bold",
  },
});
