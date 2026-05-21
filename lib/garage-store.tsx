"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────

export interface GarageBike {
  id: string;
  model: string;
  brand: { name: string };
  price: number;
  image: string | null;
}

interface GarageContextType {
  bikes: GarageBike[];
  addBike: (bike: GarageBike) => void;
  removeBike: (id: string) => void;
  isInGarage: (id: string) => boolean;
  toggleBike: (bike: GarageBike) => void;
  clearAll: () => void;
  totalBudget: number;
}

const STORAGE_KEY = "velox-garage";

// ─── Context ──────────────────────────────────────────────────

const GarageContext = createContext<GarageContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────

export function GarageProvider({ children }: { children: ReactNode }) {
  const [bikes, setBikes] = useState<GarageBike[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setBikes(JSON.parse(stored));
    } catch {
      /* corrupted data — start fresh */
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage on change (skip initial empty write)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bikes));
  }, [bikes, hydrated]);

  const addBike = useCallback((bike: GarageBike) => {
    setBikes((prev) => {
      if (prev.some((b) => b.id === bike.id)) return prev;
      return [...prev, bike];
    });
  }, []);

  const removeBike = useCallback((id: string) => {
    setBikes((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const isInGarage = useCallback(
    (id: string) => bikes.some((b) => b.id === id),
    [bikes]
  );

  const toggleBike = useCallback((bike: GarageBike) => {
    setBikes((prev) => {
      if (prev.some((b) => b.id === bike.id)) {
        return prev.filter((b) => b.id !== bike.id);
      }
      return [...prev, bike];
    });
  }, []);

  const clearAll = useCallback(() => setBikes([]), []);

  const totalBudget = bikes.reduce((sum, b) => sum + b.price, 0);

  return (
    <GarageContext.Provider
      value={{ bikes, addBike, removeBike, isInGarage, toggleBike, clearAll, totalBudget }}
    >
      {children}
    </GarageContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────

export function useGarage(): GarageContextType {
  const ctx = useContext(GarageContext);
  if (!ctx) throw new Error("useGarage must be used inside <GarageProvider>");
  return ctx;
}
