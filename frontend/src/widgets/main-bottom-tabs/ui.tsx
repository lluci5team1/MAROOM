import { View, Image, Pressable, StyleSheet, Text } from "react-native";

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
            <Text
              style={[
                styles.label,
                tab.key === activeKey && styles.activeLabel,
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
    paddingTop: 12,
    paddingHorizontal: 18,
    paddingBottom: 22,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    flex: 1,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  contents: {
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    alignSelf: "stretch",
    paddingVertical: 6,
    borderRadius: 18,
  },
  activeContents: {
    backgroundColor: "#F8FCFF",
    marginHorizontal: 2,
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    fontFamily: "NotoSans_400Regular",
    fontSize: 12,
    color: "#7E8B9A",
  },
  activeLabel: {
    color: "#0EA5E9",
    fontFamily: "NotoSans_700Bold",
  },
});
