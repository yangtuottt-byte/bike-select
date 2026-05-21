"use client";

import Link from "next/link";
import { Bike, Warehouse } from "lucide-react";
import { useGarage } from "@/lib/garage-store";

interface NavbarProps {
  onGarageClick: () => void;
}

export default function Navbar({ onGarageClick }: NavbarProps) {
  const { bikes } = useGarage();
  const count = bikes.length;

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full items-center justify-between px-4 lg:px-8 max-w-[1440px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex size-7 items-center justify-center rounded-lg bg-lime-400/10 border border-lime-400/20">
            <Bike className="size-3.5 text-lime-400" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-neutral-100 group-hover:text-lime-400 transition-colors">
            VELOX
          </span>
        </Link>

        {/* Right actions */}
        <button
          onClick={onGarageClick}
          className="relative flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80
            px-3 py-1.5 text-sm font-medium text-neutral-300 hover:border-neutral-600 hover:text-neutral-100
            transition-all hover:bg-neutral-700/80"
        >
          <Warehouse className="size-4" />
          <span className="hidden sm:inline text-xs">车库</span>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center size-4.5 rounded-full
              bg-lime-400 text-[10px] font-bold text-neutral-950 leading-none animate-fade-in">
              {count > 99 ? "99" : count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
