import type { CatalogContent, Meal, MealPlan, PublicCatalog } from "@/lib/types";
import { catalogIssues } from "@/lib/catalog-rules";
import {
  array, boolean, choice, identifier, isLocalImage, positiveInteger, price, record,
  REVISION, text,
} from "@/lib/domain-validation";

function strings(input: unknown, path: string, min = 0): string[] {
  return array(input, path, (entry, field) => text(entry, field), min);
}

function meal(input: unknown, path: string): Meal {
  const value = record(input, path, [
    "id", "slug", "name", "description", "category", "diet", "ingredients", "allergens",
    "tags", "options", "featured", "available", "price", "currency", "portion", "accent",
    "art", "image", "isSample",
  ]);
  let image: Meal["image"] = null;
  if (value.image !== null) {
    const fields = record(value.image, `${path}.image`, ["src", "alt", "kind"]);
    const src = text(fields.src, `${path}.image.src`);
    if (!isLocalImage(src)) throw new Error(`${path}.image.src: Use a local image path under /images`);
    image = {
      src,
      alt: text(fields.alt, `${path}.image.alt`),
      kind: choice(fields.kind, `${path}.image.kind`, ["illustration", "photo"]),
    };
  }
  return {
    id: identifier(value.id, `${path}.id`),
    slug: identifier(value.slug, `${path}.slug`),
    name: text(value.name, `${path}.name`),
    description: text(value.description, `${path}.description`, 2000, true),
    category: text(value.category, `${path}.category`, 100),
    diet: choice(value.diet, `${path}.diet`, ["Vegetarian", "Plant-based", "Non-vegetarian", "Not specified"]),
    ingredients: strings(value.ingredients, `${path}.ingredients`),
    allergens: strings(value.allergens, `${path}.allergens`),
    tags: strings(value.tags, `${path}.tags`),
    options: array(value.options, `${path}.options`, (entry, field) => text(entry, field, 120), 1),
    featured: boolean(value.featured, `${path}.featured`),
    available: boolean(value.available, `${path}.available`),
    price: price(value.price, `${path}.price`),
    currency: choice(value.currency, `${path}.currency`, ["INR"]),
    portion: text(value.portion, `${path}.portion`),
    accent: choice(value.accent, `${path}.accent`, ["sage", "peach", "lilac", "gold"]),
    art: choice(value.art, `${path}.art`, ["bowl", "wrap", "oats"]),
    image,
    isSample: boolean(value.isSample, `${path}.isSample`),
  };
}

function plan(input: unknown, path: string): MealPlan {
  const value = record(input, path, [
    "id", "name", "eyebrow", "description", "meals", "days", "price", "inclusions",
    "deliverySchedule", "choicePolicy", "deliveryFees", "featured", "isSample",
  ]);
  return {
    id: identifier(value.id, `${path}.id`),
    name: text(value.name, `${path}.name`),
    eyebrow: text(value.eyebrow, `${path}.eyebrow`),
    description: text(value.description, `${path}.description`),
    meals: positiveInteger(value.meals, `${path}.meals`),
    days: positiveInteger(value.days, `${path}.days`),
    price: price(value.price, `${path}.price`),
    inclusions: strings(value.inclusions, `${path}.inclusions`, 1),
    deliverySchedule: text(value.deliverySchedule, `${path}.deliverySchedule`),
    choicePolicy: text(value.choicePolicy, `${path}.choicePolicy`),
    deliveryFees: text(value.deliveryFees, `${path}.deliveryFees`),
    featured: boolean(value.featured, `${path}.featured`),
    isSample: boolean(value.isSample, `${path}.isSample`),
  };
}

export function parsePublicCatalog(input: unknown): PublicCatalog {
  try {
    const value = record(input, "catalog", [
      "schemaVersion", "publication", "isPreview", "meals", "plans", "weeklyMenu", "faqs",
    ]);
    if (value.schemaVersion !== 1) throw new Error("schemaVersion: Unsupported public catalog version");
    const publication = record(value.publication, "publication", ["revision", "publishedAt", "validFrom", "validUntil"]);
    const revision = text(publication.revision, "publication.revision", 64);
    if (!REVISION.test(revision)) throw new Error("publication.revision: Expected a SHA256 revision");
    const weekly = record(value.weeklyMenu, "weeklyMenu", ["label", "isSample", "days"]);
    const content: CatalogContent = {
      isPreview: boolean(value.isPreview, "isPreview"),
      meals: array(value.meals, "meals", meal, 1),
      plans: array(value.plans, "plans", plan, 1),
      weeklyMenu: {
        label: text(weekly.label, "weeklyMenu.label"),
        isSample: boolean(weekly.isSample, "weeklyMenu.isSample"),
        days: array(weekly.days, "weeklyMenu.days", (entry, path) => {
          const day = record(entry, path, ["day", "mealId"]);
          return {
            day: choice(day.day, `${path}.day`, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
            mealId: identifier(day.mealId, `${path}.mealId`),
          };
        }),
      },
      faqs: array(value.faqs, "faqs", (entry, path) => {
        const faq = record(entry, path, ["id", "question", "answer"]);
        return {
          id: identifier(faq.id, `${path}.id`),
          question: text(faq.question, `${path}.question`),
          answer: text(faq.answer, `${path}.answer`),
        };
      }, 1),
      publication: {
        publishedAt: text(publication.publishedAt, "publication.publishedAt"),
        validFrom: publication.validFrom === null ? null : text(publication.validFrom, "publication.validFrom"),
        validUntil: publication.validUntil === null ? null : text(publication.validUntil, "publication.validUntil"),
      },
    };
    const issues = catalogIssues(content);
    if (issues.length) throw new Error(issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "));
    return { ...content, schemaVersion: 1, publication: { ...content.publication, revision } };
  } catch (error) {
    throw new Error(`Invalid public catalog: ${error instanceof Error ? error.message : "Refresh the catalog and try again"}`);
  }
}
