import "server-only";
import { createHash } from "node:crypto";
import { catalogData } from "@/data/catalog";
import { validateCatalog } from "@/lib/catalog-schema";
import type { Meal, PublicCatalog } from "@/lib/types";

export { validateCatalog };
export type { CatalogContent, Meal, MealPlan, PublicCatalog } from "@/lib/types";

export function getPublicCatalog(): PublicCatalog {
  const content = validateCatalog(catalogData);
  const revision = createHash("sha256").update(JSON.stringify(content)).digest("hex");
  return {
    ...content,
    schemaVersion: 1,
    publication: { ...content.publication, revision },
  };
}

export const catalog: PublicCatalog = getPublicCatalog();

export function getMeal(slug: string): Meal | undefined {
  return catalog.meals.find((meal) => meal.slug === slug);
}
