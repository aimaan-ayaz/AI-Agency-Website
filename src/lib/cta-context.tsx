"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type CTAContextValue = {
  isCTAInView: boolean;
  setIsCTAInView: (v: boolean) => void;
};

const CTAContext = createContext<CTAContextValue>({
  isCTAInView: false,
  setIsCTAInView: () => {},
});

export function CTAProvider({ children }: { children: ReactNode }) {
  const [isCTAInView, setIsCTAInView] = useState(false);
  return (
    <CTAContext.Provider value={{ isCTAInView, setIsCTAInView }}>
      {children}
    </CTAContext.Provider>
  );
}

export function useCTA() {
  return useContext(CTAContext);
}
