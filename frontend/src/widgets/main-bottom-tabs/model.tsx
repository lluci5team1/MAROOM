import { useRouter, usePathname } from "expo-router";
import { BOTTOM_TABS } from "../../shared/config/bottomTabs";

export function useBottomTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const activeKey =
    BOTTOM_TABS.find((tab) =>
      tab.route === "/"
        ? pathname === "/" || pathname === "/home"
        : pathname.startsWith(tab.route),
    )?.key ?? "home";

  const tabs = BOTTOM_TABS.map((tab) => ({
    ...tab,
    onPress: () => {
      router.push(tab.route === "/" ? "/home" : tab.route);
    },
  }));

  return {
    tabs,
    activeKey,
  };
}
