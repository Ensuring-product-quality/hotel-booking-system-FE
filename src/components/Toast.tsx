import { useEffect } from "react";
import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  add: (message: string, type?: ToastType) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, type = "info") => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    // auto-dismiss after 3.5s
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helpers — call these anywhere (no hooks needed)
export const toast = {
  success: (msg: string) => useToastStore.getState().add(msg, "success"),
  error:   (msg: string) => useToastStore.getState().add(msg, "error"),
  info:    (msg: string) => useToastStore.getState().add(msg, "info"),
  warning: (msg: string) => useToastStore.getState().add(msg, "warning"),
};

// ── Single Toast item ──────────────────────────────────────────────────────
function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    return () => {};
  }, []);

  const icons: Record<ToastType, string> = {
    success: "fa-solid fa-circle-check",
    error:   "fa-solid fa-circle-xmark",
    warning: "fa-solid fa-triangle-exclamation",
    info:    "fa-solid fa-circle-info",
  };

  const styles: Record<ToastType, { bar: string; icon: string; bg: string; border: string; text: string }> = {
    success: {
      bar:    "bg-emerald-500",
      icon:   "text-emerald-500",
      bg:     "bg-white",
      border: "border-emerald-100",
      text:   "text-slate-700",
    },
    error: {
      bar:    "bg-red-500",
      icon:   "text-red-500",
      bg:     "bg-white",
      border: "border-red-100",
      text:   "text-slate-700",
    },
    warning: {
      bar:    "bg-amber-400",
      icon:   "text-amber-500",
      bg:     "bg-white",
      border: "border-amber-100",
      text:   "text-slate-700",
    },
    info: {
      bar:    "bg-blue-500",
      icon:   "text-blue-500",
      bg:     "bg-white",
      border: "border-blue-100",
      text:   "text-slate-700",
    },
  };

  const s = styles[t.type];

  return (
    <div
      className={`relative flex items-start gap-3 w-full max-w-sm rounded-2xl border shadow-xl shadow-black/8 overflow-hidden px-4 py-3.5 ${s.bg} ${s.border} animate-in slide-in-from-right-8 fade-in duration-300`}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar} rounded-l-2xl`} />

      {/* Icon */}
      <i className={`${icons[t.type]} ${s.icon} text-lg mt-0.5 shrink-0`} />

      {/* Message */}
      <p className={`flex-1 text-sm font-semibold leading-snug ${s.text}`}>{t.message}</p>

      {/* Close button */}
      <button
        onClick={onRemove}
        className="shrink-0 text-slate-400 hover:text-slate-600 transition cursor-pointer -mr-1 -mt-0.5 p-1"
      >
        <i className="fa-solid fa-xmark text-xs" />
      </button>
    </div>
  );
}

// ── Toast Container (mount once in App root) ────────────────────────────────
export function ToastContainer() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto w-full max-w-sm">
          <ToastItem toast={t} onRemove={() => remove(t.id)} />
        </div>
      ))}
    </div>
  );
}
