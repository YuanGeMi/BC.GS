"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type HeroStyle = "masthead" | "finder" | "index";

const STORAGE_KEY = "bcgs.hero-style";

type HeroStyleContextValue = {
  style: HeroStyle;
  setStyle: (style: HeroStyle) => void;
};

const HeroStyleContext = createContext<HeroStyleContextValue | null>(null);

function isHeroStyle(value: string | null): value is HeroStyle {
  return value === "masthead" || value === "finder" || value === "index";
}

export function HeroStyleProvider({ children }: { children: ReactNode }) {
  const [style, setStyleState] = useState<HeroStyle>("masthead");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isHeroStyle(stored)) {
      setStyleState(stored);
    }
  }, []);

  function setStyle(next: HeroStyle) {
    setStyleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <HeroStyleContext.Provider value={{ style, setStyle }}>
      {children}
    </HeroStyleContext.Provider>
  );
}

export function useHeroStyle() {
  const value = useContext(HeroStyleContext);

  if (!value) {
    throw new Error("useHeroStyle must be used inside HeroStyleProvider");
  }

  return value;
}
