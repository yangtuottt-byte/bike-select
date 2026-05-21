"use client";

import { useState } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { GarageProvider } from "@/lib/garage-store";
import Navbar from "@/components/layout/navbar";
import GarageSheet from "@/components/garage/garage-sheet";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [garageOpen, setGarageOpen] = useState(false);

  return (
    <ToastProvider>
      <GarageProvider>
        <Navbar onGarageClick={() => setGarageOpen(true)} />
        {children}
        <GarageSheet open={garageOpen} onClose={() => setGarageOpen(false)} />
      </GarageProvider>
    </ToastProvider>
  );
}
