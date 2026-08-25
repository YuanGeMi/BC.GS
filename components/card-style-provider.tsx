"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CardStyle = "row" | "card";

const STORAGE_KEY = "bcgs.card-style";

type CardStyleContextValue = {
  style: CardStyle;
  setStyle: (style: CardStyle) => void;
};

const CardStyleContext = createContext<CardStyleContextValue | null>(null);

function isCardStyle(value: string | null): value is CardStyle {
  return value === "row" || value === "card";
}

export function CardStyleProvider({ children }: { children: ReactNode }) {
  const [style, setStyleState] = useState<CardStyle>("row");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isCardStyle(stored)) {
      setStyleState(stored);
    }
  }, []);

  function setStyle(next: CardStyle) {
    setStyleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <CardStyleContext.Provider value={{ style, setStyle }}>
      {children}
    </CardStyleContext.Provider>
  );
}

export function useCardStyle() {
  const value = useContext(CardStyleContext);

  if (!value) {
    throw new Error("useCardStyle must be used inside CardStyleProvider");
  }

  return value;
}
