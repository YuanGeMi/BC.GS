"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { updateSiteSettings } from "@/lib/admin/static-pages";
import { adminInputClass } from "@/lib/admin/fields";

export function SiteSettingsForm({
  telegramChannelUrl,
}: {
  telegramChannelUrl: string;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(telegramChannelUrl);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-6 max-w-xl space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setNotice(null);
        startTransition(async () => {
          const result = await updateSiteSettings(url);
          if (!result.ok) {
            setError("Use an https URL, or leave the field empty to hide the footer link.");
            return;
          }
          setNotice("Saved. The footer will pick this up on the next load.");
          router.refresh();
        });
      }}
    >
      <label className="block">
        <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
          Telegram channel URL
        </span>
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className={adminInputClass}
          placeholder="https://t.me/…"
          autoCapitalize="none"
          spellCheck={false}
        />
      </label>
      <p className="text-text/40 text-xs">
        Must start with https://. Leave empty to hide the footer link.
      </p>
      {error ? <p className="text-accent text-sm">{error}</p> : null}
      {notice ? <p className="text-text/55 text-sm">{notice}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="bg-accent text-background hover:bg-accent-highlight h-10 px-4 text-sm font-medium disabled:opacity-40"
      >
        {isPending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
