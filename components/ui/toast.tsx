"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────

export type ToastVariant = "default" | "success" | "destructive";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toast: (opts: { title: string; description?: string; variant?: ToastVariant }) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (opts: { title: string; description?: string; variant?: ToastVariant }) => {
      const id = Math.random().toString(36).slice(2, 10);
      const item: ToastItem = { id, ...opts, variant: opts.variant ?? "default" };
      setToasts((prev) => [...prev, item]);

      const timer = setTimeout(() => dismiss(id), 3500);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 w-80 max-w-[calc(100vw-2rem)]"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Card ─────────────────────────────────────────────────────

const iconMap: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  default: Info,
  success: CheckCircle2,
  destructive: AlertTriangle,
};

const borderMap: Record<ToastVariant, string> = {
  default: "border-neutral-600",
  success: "border-lime-500/40",
  destructive: "border-red-500/40",
};

const accentMap: Record<ToastVariant, string> = {
  default: "text-neutral-300",
  success: "text-lime-400",
  destructive: "text-red-400",
};

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [exiting, setExiting] = useState(false);
  const Icon = iconMap[item.variant];

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 200);
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-neutral-900/95 backdrop-blur-lg p-4 shadow-2xl shadow-black/50",
        "animate-slide-up transition-all duration-200",
        exiting && "opacity-0 translate-x-4",
        borderMap[item.variant]
      )}
    >
      <Icon className={cn("size-4 shrink-0 mt-0.5", accentMap[item.variant])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-100 leading-tight">{item.title}</p>
        {item.description && (
          <p className="text-[12px] text-neutral-400 mt-0.5 leading-tight">{item.description}</p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="shrink-0 text-neutral-600 hover:text-neutral-300 transition-colors"
      >
        <X className="size-3.5" />
      </button>
      {/* Auto-dismiss progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden bg-neutral-800">
        <div
          className={cn(
            "h-full rounded-full animate-[shrink_3.5s_linear_forwards]",
            item.variant === "success"
              ? "bg-lime-400"
              : item.variant === "destructive"
                ? "bg-red-400"
                : "bg-neutral-500"
          )}
        />
      </div>
    </div>
  );
}
