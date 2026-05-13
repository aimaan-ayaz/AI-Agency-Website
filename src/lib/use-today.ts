"use client";

import { useEffect, useState } from "react";

export function useToday() {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    setToday(`${dd} / ${mm}`);
  }, []);
  return today;
}
