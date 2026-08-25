import { bestCategories } from "@/data/best-categories";
import type { LocalizedText } from "@/data/mock-casinos";

export type MockCategory = {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
};

export const mockCategories: MockCategory[] = bestCategories.map((category) => ({
  id: category.slug,
  slug: category.slug,
  title: category.title,
  description: category.summary,
}));
