// shared/config/bottomTabs.ts
import { icons } from "../assets/icons";

export const BOTTOM_TABS = [
  /*{ key: "rooms", label: "Rooms", icon: icons.rooms, route: "/rooms" },*/
  { key: "explore", label: "Explore", icon: icons.explore, route: "/explore" },
  { key: "home", label: "Home", icon: icons.home, route: "/" },
  { key: "saved", label: "Saved", icon: icons.heart_bottom, route: "/saved" },
  { key: "profile", label: "Profile", icon: icons.profile, route: "/profile" },
] as const;
