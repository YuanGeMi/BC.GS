"use client";

import { useTranslations } from "next-intl";
import { useEffect, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

type ToastKind = "success" | "error";
type ToastItem = { id: number; kind: ToastKind; message: string };

const DURATION: Record<ToastKind, number> = { success: 4000, error: 8000 };
const MAX_VISIBLE = 4;
const EMPTY: ToastItem[] = [];

let items: ToastItem[] = EMPTY;
let nextId = 0;
const listeners = new Set<() => void>();

function emit(next: ToastItem[]) {
  items = next;
  for (const listener of listeners) listener();
}

function push(kind: ToastKind, message: string) {
  const rest = items.filter(
    (item) => !(item.kind === kind && item.message === message),
  );
  emit([...rest, { id: nextId++, kind, message }].slice(-MAX_VISIBLE));
}

function dismiss(id: number) {
  emit(items.filter((item) => item.id !== id));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const toast = {
  success: (message: string) => push("success", message),
  error: (message: string) => push("error", message),
};

export function AdminToaster() {
  const t = useTranslations("Admin");
  const toasts = useSyncExternalStore(
    subscribe,
    () => items,
    () => EMPTY,
  );

  return (
    <div
      aria-label={t("shell.notifications")}
      className="pointer-events-none fixed inset-x-4 bottom-4 z-80 flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96"
    >
      {toasts.map((item) => (
        <Toast key={item.id} item={item} closeLabel={t("actions.close")} />
      ))}
    </div>
  );
}

function Toast({ item, closeLabel }: { item: ToastItem; closeLabel: string }) {
  useEffect(() => {
    const timer = window.setTimeout(
      () => dismiss(item.id),
      DURATION[item.kind],
    );
    return () => window.clearTimeout(timer);
  }, [item.id, item.kind]);

  const isError = item.kind === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "bg-card pointer-events-auto flex items-start gap-3 rounded-lg py-3 pr-3 pl-4 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.65)] ring-1 motion-safe:animate-[hero-fade_0.25s_ease-out_both]",
        isError ? "ring-accent/60" : "ring-text/12",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-1.5 size-1.5 shrink-0 rounded-full",
          isError ? "bg-accent" : "bg-text/45",
        )}
      />
      <p
        className={cn(
          "min-w-0 flex-1 text-sm leading-relaxed break-words",
          isError ? "text-accent" : "text-text",
        )}
      >
        {item.message}
      </p>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        aria-label={closeLabel}
        className="text-text/40 hover:text-text -my-0.5 shrink-0 px-1 text-base leading-none"
      >
        ×
      </button>
    </div>
  );
}
