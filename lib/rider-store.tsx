"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type Flexibility = "excellent" | "normal" | "poor";
export type RidingStyle = "aggressive-race" | "all-around" | "endurance";

export interface RiderProfile {
  height: number;
  inseam: number;
  armSpan: number;
  flexibility: Flexibility;
  ridingStyle: RidingStyle;
}

interface RiderContextType {
  profile: RiderProfile | null;
  setProfile: (profile: RiderProfile) => void;
  clearProfile: () => void;
  hasProfile: boolean;
}

const STORAGE_KEY = "velox-rider-profile";

const RiderContext = createContext<RiderContextType | null>(null);

export function RiderProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<RiderProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setProfileState(JSON.parse(stored));
    } catch {
      /* corrupted data */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [profile, hydrated]);

  const setProfile = useCallback((p: RiderProfile) => {
    setProfileState(p);
  }, []);

  const clearProfile = useCallback(() => {
    setProfileState(null);
  }, []);

  return (
    <RiderContext.Provider
      value={{ profile, setProfile, clearProfile, hasProfile: !!profile }}
    >
      {children}
    </RiderContext.Provider>
  );
}

export function useRider(): RiderContextType {
  const ctx = useContext(RiderContext);
  if (!ctx) throw new Error("useRider must be used inside <RiderProvider>");
  return ctx;
}
