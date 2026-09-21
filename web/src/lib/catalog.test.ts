import { describe, expect, it } from "vitest";
import { catalogData } from "@/data/catalog";
import { catalog, formatPrice, getMeal, validateCatalog } from "@/lib/catalog";

function editableCopy() {
  return structuredClone(catalogData);
}

describe("editable catalog", () => {
  it("publishes six explicitly illustrative meals, three sample plans and five sample days", () => {
    expect(catalog.isPreview).toBe(true);
    expect(catalog.meals).toHaveLength(6);
    expect(catalog.plans).toHaveLength(3);
    expect(catalog.weeklyMenu.isSample).toBe(true);
    expect(catalog.weeklyMenu.label).toMatch(/sample/i);
    expect(catalog.weeklyMenu.days).toHaveLength(5);
    expect(catalog.meals.map((meal) => meal.featured)).toEqual([
      true, true, true, false, false, false,
    ]);
    expect(catalog.meals.map((meal) => meal.name)).toEqual([
      "Harissa chicken bowl",
      "Paneer garden bowl",
      "Lemon herb chickpea bowl",
      "Oats & berry pot",
      "Sesame tofu crunch bowl",
      "Green goddess wrap",
    ]);
    for (const entry of [...catalog.meals, ...catalog.plans]) {
      expect(entry.isSample).toBe(true);
      expect(entry.price).toBeNull();
      expect(entry.description).toMatch(/sample/i);
    }
    for (const meal of catalog.meals) {
      for (const description of [...meal.ingredients, ...meal.allergens, meal.portion]) {
        expect(description).toMatch(/illustrative/i);
        expect(description).toMatch(/confirm.*team/i);
      }
      expect(meal.currency).toBe("INR");
      expect(meal.options).toContain("Standard");
    }
  });

  it("validates without mutating editable data or sharing nested references", () => {
    const original = editableCopy();
    const result = validateCatalog(original);
    expect(result).toEqual(catalog);
    expect(result).not.toBe(original);
    expect(result.meals[0]).not.toBe(original.meals[0]);
  });

  it("requires globally unique catalog IDs", () => {
    const input = editableCopy();
    input.plans[0].id = input.meals[0].id;
    expect(() => validateCatalog(input)).toThrow(/plans\.0\.id: Duplicate catalog ID/);
  });

  it.each(["meals", "plans", "faqs"] as const)("rejects repeated IDs in %s", (collection) => {
    const input = editableCopy();
    input[collection][1].id = input[collection][0].id;
    expect(() => validateCatalog(input)).toThrow(/Duplicate catalog ID/);
  });

  it("rejects duplicate slugs", () => {
    const input = editableCopy();
    input.meals[1].slug = input.meals[0].slug;
    expect(() => validateCatalog(input)).toThrow(/meals\.1\.slug: Duplicate meal slug/);
  });

  it("rejects unknown weekly-menu references with the field location", () => {
    const input = editableCopy();
    input.weeklyMenu.days[1].mealId = "missing-meal";
    expect(() => validateCatalog(input)).toThrow(
      /weeklyMenu\.days\.1\.mealId: Unknown weekly menu meal ID "missing-meal"/,
    );
  });

  it("rejects repeated weekly-menu days", () => {
    const input = editableCopy();
    input.weeklyMenu.days[1].day = input.weeklyMenu.days[0].day;
    expect(() => validateCatalog(input)).toThrow(/Duplicate weekly menu day/);
  });

  it("rejects duplicate options after whitespace normalization", () => {
    const input = editableCopy();
    input.meals[0].options.push(" Standard ");
    expect(() => validateCatalog(input)).toThrow(/Meal options must be unique/);
  });

  it.each(["name", "description", "portion"] as const)("rejects a blank meal %s", (field) => {
    const input = editableCopy();
    input.meals[0][field] = "  ";
    expect(() => validateCatalog(input)).toThrow(`meals.0.${field}: Must not be blank`);
  });

  it.each(["ingredients", "allergens", "options"] as const)(
    "requires nonempty meal %s",
    (field) => {
      const input = editableCopy();
      input.meals[0][field] = [];
      expect(() => validateCatalog(input)).toThrow(`meals.0.${field}`);
    },
  );

  it("rejects missing required fields rather than silently supplying defaults", () => {
    const input: Partial<typeof catalogData> = editableCopy();
    delete input.weeklyMenu;
    expect(() => validateCatalog(input)).toThrow(/Invalid catalog: weeklyMenu/);
  });

  it.each(["currency", "category", "diet", "art", "accent", "slug"] as const)(
    "rejects unsupported meal %s",
    (field) => {
      const input = editableCopy();
      input.meals[0][field] = "Not a supported value";
      expect(() => validateCatalog(input)).toThrow(`meals.0.${field}`);
    },
  );

  it("rejects unknown fields rather than publishing them", () => {
    expect(() => validateCatalog({ ...editableCopy(), internalNotes: "not public" })).toThrow(
      /Unrecognized key/,
    );
    const input = editableCopy();
    Object.assign(input.meals[0], { internalNotes: "not public" });
    expect(() => validateCatalog(input)).toThrow(/Unrecognized key/);
  });

  it.each(["meals", "plans"] as const)("rejects invented sample prices in %s", (collection) => {
    const input = editableCopy();
    Object.assign(input[collection][0], { price: 100 });
    expect(() => validateCatalog(input)).toThrow(/Sample content must have a null/);
  });

  it("allows an explicitly non-sample numeric price", () => {
    const input = editableCopy();
    Object.assign(input.meals[0], { isSample: false, price: 100.5 });
    expect(validateCatalog(input).meals[0].price).toBe(100.5);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])("rejects invalid price %s", (value) => {
    const input = editableCopy();
    Object.assign(input.meals[0], { isSample: false, price: value });
    expect(() => validateCatalog(input)).toThrow(/meals\.0\.price/);
  });

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid plan counts %s",
    (value) => {
      const input = editableCopy();
      input.plans[0].days = value;
      expect(() => validateCatalog(input)).toThrow(/plans\.0\.days/);
    },
  );
});

describe("catalog lookups and prices", () => {
  it("resolves every meal and every weekly-menu reference", () => {
    for (const meal of catalog.meals) {
      expect(getMeal(meal.slug)).toBe(meal);
    }
    for (const day of catalog.weeklyMenu.days) {
      expect(catalog.meals.some((meal) => meal.id === day.mealId)).toBe(true);
    }
  });

  it.each(["", "missing-meal", "HARISSA-CHICKEN-BOWL", "../catalog", "toString"])(
    "does not invent a fallback for %s",
    (slug) => {
      expect(getMeal(slug)).toBeUndefined();
    },
  );

  it("shows unconfirmed pricing without suggesting a free meal", () => {
    expect(formatPrice(null)).toBe("Price to be confirmed");
    expect(formatPrice(0)).toBe("₹0.00");
  });

  it("formats numeric prices as Indian rupees with Indian grouping", () => {
    expect(formatPrice(123456.5)).toBe("₹1,23,456.50");
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    "refuses invalid price formatting for %s",
    (value) => {
      expect(() => formatPrice(value)).toThrow(/finite, non-negative/);
    },
  );
});
