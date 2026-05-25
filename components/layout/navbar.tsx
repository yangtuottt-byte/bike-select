"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Bike, Warehouse, Wrench, User, LogOut, ChevronDown } from "lucide-react";
import { useGarage } from "@/lib/garage-store";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onGarageClick: () => void;
}

export default function Navbar({ onGarageClick }: NavbarProps) {
  const { data: session } = useSession();
  const { bikes } = useGarage();
  const count = bikes.length;
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

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
        <div className="flex items-center gap-2">
          {/* Admin entry — only visible to ADMIN */}
          {isAdmin && (
            <Link
              href="/admin/import"
              className="flex items-center justify-center size-8 rounded-lg border border-neutral-800 bg-neutral-900/60
                text-neutral-500 hover:text-amber-400 hover:border-amber-400/30 hover:bg-amber-400/5
                transition-all"
              title="数据导入工作台"
            >
              <Wrench className="size-3.5" />
            </Link>
          )}

          {/* Garage */}
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

          {/* User menu */}
          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80
                  px-2.5 py-1.5 text-sm font-medium text-neutral-300 hover:border-neutral-600 hover:text-neutral-100
                  transition-all hover:bg-neutral-700/80"
              >
                <div className="flex size-5 items-center justify-center rounded-full bg-lime-400/10 border border-lime-400/20">
                  <User className="size-3 text-lime-400" />
                </div>
                <span className="hidden md:inline text-xs max-w-[80px] truncate">
                  {session.user?.name || session.user?.email}
                </span>
                <ChevronDown className={cn("size-3 transition-transform", menuOpen && "rotate-180")} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl shadow-black/60 z-20 animate-fade-in overflow-hidden">
                    <div className="px-3 py-2.5 border-b border-neutral-800">
                      <p className="text-[11px] text-neutral-400">Logged in as</p>
                      <p className="text-xs text-neutral-200 font-medium truncate">
                        {session.user?.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1 rounded bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 text-[9px] font-mono text-amber-400">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-neutral-400 hover:text-red-400 hover:bg-red-400/5 transition-colors"
                    >
                      <LogOut className="size-3.5" />
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-all"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-xs font-medium text-lime-400
                  hover:bg-lime-400/20 hover:border-lime-400/40 transition-all"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
