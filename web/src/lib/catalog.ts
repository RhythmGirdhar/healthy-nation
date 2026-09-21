import { z } from "zod";
import { catalogData } from "@/data/catalog";

const text = z.string().trim().min(1, "Must not be blank");
const identifier = z
  .string()
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
  ingredients: z.array(text).min(1),
  allergens: z.array(text).min(1),
  tags: z.array(text),
  options: z.array(text).min(1),
  featured: z.boolean(),
  available: z.boolean(),
  price,
  currency: z.literal("INR"),
  portion: text,
  accent: z.enum(["sage", "peach", "lilac", "gold"]),
  art: z.enum(["bowl", "wrap", "oats"]),
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
  inclusions: z.array(text).min(1),
  featured: z.boolean(),
  isSample: z.boolean(),
});

const catalogSchema = z
  .strictObject({
    meals: z.array(mealSchema).min(1),
    plans: z.array(planSchema).min(1),
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
        .min(1),
    }),
    faqs: z
      .array(z.strictObject({ id: identifier, question: text, answer: text }))
      .min(1),
    isPreview: z.boolean(),
  })
  .superRefine((data, context) => {
    const ids = new Set<string>();
    for (const collection of ["meals", "plans", "faqs"] as const) {
      data[collection].forEach((entry, index) => {
        if (ids.has(entry.id)) {
          context.addIssue({
            code: "custom",
            path: [collection, index, "id"],
            message: `Duplicate catalog ID "${entry.id}"`,
          });
        }
        ids.add(entry.id);
      });
    }

    const slugs = new Set<string>();
    data.meals.forEach((meal, index) => {
      if (slugs.has(meal.slug)) {
        context.addIssue({
          code: "custom",
          path: ["meals", index, "slug"],
          message: `Duplicate meal slug "${meal.slug}"`,
        });
      }
      slugs.add(meal.slug);
      if (new Set(meal.options).size !== meal.options.length) {
        context.addIssue({
          code: "custom",
          path: ["meals", index, "options"],
          message: "Meal options must be unique",
        });
      }
    });

    for (const collection of ["meals", "plans"] as const) {
      data[collection].forEach((entry, index) => {
        if (entry.isSample && entry.price !== null) {
          context.addIssue({
            code: "custom",
            path: [collection, index, "price"],
            message: "Sample content must have a null, unconfirmed price",
          });
        }
      });
    }

    const mealIds = new Set(data.meals.map((meal) => meal.id));
    const days = new Set<string>();
    data.weeklyMenu.days.forEach((entry, index) => {
      if (!mealIds.has(entry.mealId)) {
        context.addIssue({
          code: "custom",
          path: ["weeklyMenu", "days", index, "mealId"],
          message: `Unknown weekly menu meal ID "${entry.mealId}"`,
        });
      }
      if (days.has(entry.day)) {
        context.addIssue({
          code: "custom",
          path: ["weeklyMenu", "days", index, "day"],
          message: `Duplicate weekly menu day "${entry.day}"`,
        });
      }
      days.add(entry.day);
    });
  });

export type Meal = z.infer<typeof mealSchema>;
export type MealPlan = z.infer<typeof planSchema>;
export type Catalog = z.infer<typeof catalogSchema>;

export function validateCatalog(input: unknown): Catalog {
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

export const catalog = validateCatalog(catalogData);

export function getMeal(slug: string): Meal | undefined {
  return catalog.meals.find((meal) => meal.slug === slug);
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatPrice(value: number | null): string {
  if (value === null) return "Price to be confirmed";
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Price must be null or a finite, non-negative number");
  }
  return inrFormatter.format(value);
}
