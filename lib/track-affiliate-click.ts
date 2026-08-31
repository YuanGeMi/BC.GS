export type TrackAffiliateClickInput = {
  casinoId: string;
  bonusId?: string;
  locale: string;
};

export function trackAffiliateClick(input: TrackAffiliateClickInput): void {
  const payload = JSON.stringify(input);

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/track-click",
      new Blob([payload], { type: "application/json" }),
    );
    return;
  }

  void fetch("/api/track-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  });
}
