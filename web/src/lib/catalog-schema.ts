import "server-only";
import { z } from "zod";
import { catalogIssues } from "@/lib/catalog-rules";
import { isLocalImage } from "@/lib/domain-validation";
import type { CatalogContent } from "@/lib/types";

const text = z.string().trim().min(1, "Must not be blank").max(2000).regex(/^[^\u0000-\u001f\u007f]*$/, "Control characters are not allowed");
const identifier = z
  .string()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase, hyphenated identifier");
const price = z.number().finite().nonnegative().nullable();
const positiveInteger = z.int().positive();

const mealSchema = z.strictObject({
  id: identifier,
  slug: identifier,
  name: text,
  description: text,
  category: z.enum(["Bowls", "Wraps", "Breakfast"]),
  diet: z.enum(["Vegetarian", "Plant-based", "Non-vegetarian"]),
  ingredients: z.array(text).min(1).max(1000),
  allergens: z.array(text).min(1).max(1000),
  tags: z.array(text).max(1000),
  options: z.array(text.max(120)).min(1).max(1000),
  featured: z.boolean(),
  available: z.boolean(),
  price,
  currency: z.literal("INR"),
  portion: text,
  accent: z.enum(["sage", "peach", "lilac", "gold"]),
  art: z.enum(["bowl", "wrap", "oats"]),
  image: z.strictObject({
    src: z.string().max(2000).refine(isLocalImage, "Use a local image path under /images"),
    alt: text,
    kind: z.enum(["illustration", "photo"]),
  }),
  isSample: z.boolean(),
});

const planSchema = z.strictObject({
  id: identifier,
  name: text,
  eyebrow: text,
  description: text,
  meals: positiveInteger,
  days: positiveInteger,
  price,
  inclusions: z.array(text).min(1).max(1000),
  deliverySchedule: text,
  choicePolicy: text,
  deliveryFees: text,
  featured: z.boolean(),
  isSample: z.boolean(),
});

const catalogSchema = z
  .strictObject({
    meals: z.array(mealSchema).min(1).max(1000),
    plans: z.array(planSchema).min(1).max(1000),
    weeklyMenu: z.strictObject({
      label: text,
      isSample: z.boolean(),
      days: z
        .array(
          z.strictObject({
            day: z.enum([
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ]),
            mealId: identifier,
          }),
        )
        .min(1).max(7),
    }),
    faqs: z
      .array(z.strictObject({ id: identifier, question: text, answer: text }))
      .min(1).max(1000),
    isPreview: z.boolean(),
    publication: z.strictObject({
      publishedAt: text,
      validFrom: text.nullable(),
      validUntil: text.nullable(),
    }),
  })
  .superRefine((data, context) => {
    catalogIssues(data).forEach((issue) => context.addIssue({ code: "custom", ...issue }));
  });

export function validateCatalog(input: unknown): CatalogContent {
  const result = catalogSchema.safeParse(input);
  if (!result.success) {
    throw new Error(
      `Invalid catalog: ${result.error.issues
        .map((issue) => `${issue.path.join(".") || "catalog"}: ${issue.message}`)
        .join("; ")}`,
    );
  }
  return result.data;
}
