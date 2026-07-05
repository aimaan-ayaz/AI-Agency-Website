import { Suspense } from "react";
import App from "@/components/App";

export default function Page() {
  // Suspense is required because App reads the ?table= query param.
  return (
    <Suspense>
      <App />
    </Suspense>
  );
}
