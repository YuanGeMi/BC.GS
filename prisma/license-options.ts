import type { LicenseId } from "../data/mock-casinos";

export type LicenseSeed = {
  slug: LicenseId;
  name: string;
};

/** Canonical license types used by the casino directory filter. */
export const licenseOptions: LicenseSeed[] = [
  { slug: "mga", name: "Malta Gaming Authority" },
  { slug: "curacao", name: "Curaçao eGaming" },
  { slug: "gibraltar", name: "Gibraltar Gambling Commissioner" },
  { slug: "ukgc", name: "UK Gambling Commission" },
  { slug: "kahnawake", name: "Kahnawake Gaming Commission" },
];
