import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/home" />;
}

/* 네비게이션 시스템 mount 이후에 router가 작동해서 에러 redirect로 바꿈 */
