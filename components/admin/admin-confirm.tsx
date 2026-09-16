"use client";

import { cn } from "@/lib/utils";

export function AdminConfirm({
  title,
  body,
  confirmLabel,
  pending = false,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center"
      role="presentation"
      onClick={() => !pending && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        className="bg-card ring-text/10 w-full max-w-md p-6 shadow-2xl ring-1"
        onClick={(event) => event.stopPropagation()}
      >
        <p
          id="admin-confirm-title"
          className="font-display text-2xl tracking-tight"
        >
          {title}
        </p>
        <p className="text-text/60 mt-3 text-sm leading-relaxed">{body}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="text-text/50 hover:text-text px-3 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={cn(
              "bg-accent text-background hover:bg-accent-highlight px-4 py-2 text-sm font-medium",
              pending && "opacity-60",
            )}
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
