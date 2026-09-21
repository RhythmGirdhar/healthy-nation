import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import { parsePublicCatalog } from "@/lib/catalog-client";

describe("untrusted public catalog snapshots", () => {
  it("parses a JSON response into a detached validated snapshot", () => {
    const parsed = parsePublicCatalog(JSON.parse(JSON.stringify(catalog)));
    expect(parsed).toEqual(catalog);
    expect(parsed.meals[0]).not.toBe(catalog.meals[0]);
    parsed.meals[0].available = false;
    expect(catalog.meals[0].available).toBe(true);
  });

  it.each([null, undefined, [], "catalog", 1, true])("rejects non-object %s", (input) => {
    expect(() => parsePublicCatalog(input)).toThrow(/Invalid public catalog/);
  });

  it.each(["schemaVersion", "publication", "isPreview", "meals", "plans", "weeklyMenu", "faqs"])(
    "rejects missing %s",
    (key) => {
      const input = { ...catalog };
      Reflect.deleteProperty(input, key);
      expect(() => parsePublicCatalog(input)).toThrow(/Required field/);
    },
  );

  it.each([0, 2, "1", null])("rejects unsupported schema version %s", (schemaVersion) => {
    expect(() => parsePublicCatalog({ ...catalog, schemaVersion })).toThrow(/schemaVersion/);
  });

  it.each(["", "old-version", "a".repeat(63), "g".repeat(64), "A".repeat(64)])(
    "rejects malformed revision %s", (revision) => {
      const input = structuredClone(catalog);
      input.publication.revision = revision;
      expect(() => parsePublicCatalog(input)).toThrow(/revision/);
    },
  );

  it.each(["credentials", "customer", "draft", "internalNotes"])("rejects unexpected %s", (key) => {
    expect(() => parsePublicCatalog({ ...catalog, [key]: "not public" })).toThrow(/Unrecognized key/);
  });

  it("rejects unexpected nested fields", () => {
    const input = structuredClone(catalog);
    Object.assign(input.meals[0].image, { token: "private" });
    expect(() => parsePublicCatalog(input)).toThrow(/Unrecognized key/);
  });

  it.each(["name", "description", "portion"] as const)("requires meal %s", (key) => {
    const input = structuredClone(catalog);
    input.meals[0][key] = "";
    expect(() => parsePublicCatalog(input)).toThrow(key);
  });

  it.each(["ingredients", "allergens", "options"] as const)("requires nonempty %s", (key) => {
    const input = structuredClone(catalog);
    input.meals[0][key] = [];
    expect(() => parsePublicCatalog(input)).toThrow(key);
  });

  it.each([
    ["category", "unsupported"], ["diet", "unsupported"], ["currency", "USD"],
    ["art", "unsupported"], ["accent", "unsupported"], ["available", "yes"],
    ["featured", 1], ["isSample", "true"], ["price", -1],
  ])("rejects invalid meal field %s", (key, value) => {
    const input = structuredClone(catalog);
    Object.assign(input.meals[0], { [key]: value });
    expect(() => parsePublicCatalog(input)).toThrow(String(key));
  });

  it("checks cross-entity identity and references", () => {
    const input = structuredClone(catalog);
    input.plans[0].id = input.meals[0].id;
    input.meals[1].slug = input.meals[0].slug;
    input.meals[0].options.push("Standard");
    input.weeklyMenu.days[0].mealId = "removed";
    input.weeklyMenu.days[1].day = input.weeklyMenu.days[0].day;
    expect(() => parsePublicCatalog(input)).toThrow(/Duplicate catalog ID/);
    expect(() => parsePublicCatalog(input)).toThrow(/Duplicate meal slug/);
    expect(() => parsePublicCatalog(input)).toThrow(/Meal options must be unique/);
    expect(() => parsePublicCatalog(input)).toThrow(/Unknown weekly menu meal/);
    expect(() => parsePublicCatalog(input)).toThrow(/Duplicate weekly menu day/);
  });

  it("rejects malformed publication dates and live sample content", () => {
    const input = structuredClone(catalog);
    input.publication.publishedAt = "2030-02-30T00:00:00Z";
    expect(() => parsePublicCatalog(input)).toThrow(/UTC/);
    input.publication.publishedAt = catalog.publication.publishedAt;
    input.isPreview = false;
    expect(() => parsePublicCatalog(input)).toThrow(/non-sample/);
    expect(() => parsePublicCatalog(input)).toThrow(/Live publication requires/);
  });

  it("rejects untrusted image URLs and empty alt text", () => {
    const input = structuredClone(catalog);
    input.meals[0].image.src = "https://example.test/tracker";
    expect(() => parsePublicCatalog(input)).toThrow(/local image path/);
    input.meals[0].image.src = catalog.meals[0].image.src;
    input.meals[0].image.alt = "";
    expect(() => parsePublicCatalog(input)).toThrow(/image.alt/);
  });

  it.each(["deliverySchedule", "choicePolicy", "deliveryFees"] as const)("requires plan %s", (field) => {
    const input = structuredClone(catalog);
    input.plans[0][field] = "";
    expect(() => parsePublicCatalog(input)).toThrow(field);
  });
});
