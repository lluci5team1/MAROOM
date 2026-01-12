import { useState } from "react";
import { useRouter } from "expo-router";
import { BOTTOM_TABS } from "../../shared/config/bottomTabs";

export function useBottomTabs() {
  const router = useRouter();
  const [activeKey, setActiveKey] = useState("home");

  const tabs = BOTTOM_TABS.map((tab) => ({
    ...tab,
    onPress: () => {
      setActiveKey(tab.key);
    },
  }));

  return {
    tabs,
    activeKey,
  };
}
