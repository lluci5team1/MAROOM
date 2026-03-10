import { ProductDetailPage } from "../../pages/06_product-detail";
import { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";

export default function ProductDetailRoute() {
  const params = useLocalSearchParams<{ id?: string }>();

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7401/ingest/2fe98e00-895c-40f0-a2aa-b86b1918cc6a",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"1e43da"},body:JSON.stringify({sessionId:"1e43da",runId:"route-debug-1",hypothesisId:"H2",location:"app/(main)/[id].tsx:mount",message:"dynamic id route mounted",data:{id:params?.id ?? null,rawParams:params},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [params]);

  return <ProductDetailPage />;
}
