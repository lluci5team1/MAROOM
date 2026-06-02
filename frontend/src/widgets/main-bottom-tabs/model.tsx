import { useRouter, usePathname } from "expo-router";
import { BOTTOM_TABS } from "../../shared/config/bottomTabs";

function routeMatches(pathname: string, route: string): boolean {
  if (route === "/") {
    return pathname === "/" || pathname === "/home" || pathname.endsWith("/home");
  }
  // Expo Router may report "/profile" or "/(main)/profile"
  return pathname === route || pathname.endsWith(route);
}

export function useBottomTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const activeKey =
    BOTTOM_TABS.find((tab) => routeMatches(pathname, tab.route))?.key ?? "home";

  const tabs = BOTTOM_TABS.map((tab) => ({
    ...tab,
    onPress: () => {
      // Already on this tab — do nothing. Repeated router.push("/profile")
      // stacked screens and, on Release + New Architecture, contributed to
      // Profile-tab force-closes (NO_CRASH_STACK on the RN JS thread).
      if (activeKey === tab.key) return;
      const href = tab.route === "/" ? "/home" : tab.route;
      router.replace(href as any);
    },
  }));

  return {
    tabs,
    activeKey,
  };
}
