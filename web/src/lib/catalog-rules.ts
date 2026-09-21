import type { CatalogContent } from "@/lib/types";
import { isUtcTimestamp } from "@/lib/domain-validation";

export type CatalogIssue = { path: (string | number)[]; message: string };

export function catalogIssues(data: CatalogContent): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  const add = (path: CatalogIssue["path"], message: string) => issues.push({ path, message });
  const ids = new Set<string>();
  for (const collection of ["meals", "plans", "faqs"] as const) {
    data[collection].forEach((entry, index) => {
      if (ids.has(entry.id)) add([collection, index, "id"], `Duplicate catalog ID "${entry.id}"`);
      ids.add(entry.id);
    });
  }
  const slugs = new Set<string>();
  data.meals.forEach((meal, index) => {
    if (slugs.has(meal.slug)) add(["meals", index, "slug"], `Duplicate meal slug "${meal.slug}"`);
    slugs.add(meal.slug);
    if (new Set(meal.options.map((option) => option.trim())).size !== meal.options.length) {
      add(["meals", index, "options"], "Meal options must be unique");
    }
  });
  for (const collection of ["meals", "plans"] as const) {
    data[collection].forEach((entry, index) => {
      if (entry.isSample && entry.price !== null) {
        add([collection, index, "price"], "Sample content must have a null, unconfirmed price");
      }
      if (!data.isPreview && !entry.isSample && entry.price === null) {
        add([collection, index], "Live offers require non-sample content and an approved non-null price");
      }
    });
  }
  const mealIds = new Set(data.meals.map((meal) => meal.id));
  const days = new Set<string>();
  data.weeklyMenu.days.forEach((entry, index) => {
    if (!mealIds.has(entry.mealId)) {
      add(["weeklyMenu", "days", index, "mealId"], `Unknown weekly menu meal ID "${entry.mealId}"`);
    }
    if (days.has(entry.day)) add(["weeklyMenu", "days", index, "day"], `Duplicate weekly menu day "${entry.day}"`);
    days.add(entry.day);
  });
  if (!data.weeklyMenu.isSample && data.weeklyMenu.days.length === 0) {
    add(["weeklyMenu", "days"], "A published weekly menu requires at least one day");
  }
  if (!data.isPreview && !data.meals.some((meal) => !meal.isSample) && !data.plans.some((plan) => !plan.isSample)) {
    add(["isPreview"], "A live publication requires at least one non-sample offer");
  }
  const { publishedAt, validFrom, validUntil } = data.publication;
  for (const [key, value] of Object.entries({ publishedAt, validFrom, validUntil })) {
    if (value !== null && !isUtcTimestamp(value)) {
      add(["publication", key], "Use a valid UTC timestamp ending in Z");
    }
  }
  if (!isUtcTimestamp(publishedAt)) {
    add(["publication", "publishedAt"], "A valid UTC publication timestamp is required");
  }
  if (data.isPreview) {
    if (validFrom !== null || validUntil !== null) {
      add(["publication"], "Preview publication validity must be null");
    }
  } else if (validFrom === null) {
    add(["publication"], "Live publication requires a validFrom UTC timestamp");
  } else if (
    Date.parse(publishedAt) > Date.parse(validFrom) ||
    (validUntil !== null && Date.parse(validFrom) >= Date.parse(validUntil))
  ) {
    add(["publication"], "Publication timestamps must be ordered: publishedAt <= validFrom < validUntil (when an expiry is provided)");
  }
  return issues;
}
