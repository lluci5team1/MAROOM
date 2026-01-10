import { MainBottomTabs } from "./ui";
import { useBottomTabs } from "./model";

export function BottomTabs() {
  const state = useBottomTabs();
  return <MainBottomTabs {...state} />;
}
