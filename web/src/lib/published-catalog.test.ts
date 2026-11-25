import { describe, expect, it } from "vitest";
import { catalogData } from "@/data/catalog";
import { getPublicCatalog, validateCatalog } from "@/lib/catalog";
import { parsePublicCatalog } from "@/lib/catalog-client";
import { business } from "@/data/business";
import { EMPTY_DRAFT, getHandoffDecision } from "@/lib/inquiry";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { kitchenPhotos } from "@/data/kitchen";
import photoSource from "../../content/photo-source.json";

describe("business-editable published configuration", () => {
  it("validates the actual JSON without fixing the menu to demo names or counts", () => {
    const content = validateCatalog(catalogData);
    expect(content.meals.length).toBeGreaterThan(0);
    expect(parsePublicCatalog(getPublicCatalog()).meals).toEqual(content.meals);
    for (const meal of content.meals) {
      if (!content.isPreview && !meal.isSample) expect(meal.price).not.toBeNull();
    }
  });

  it("produces a request for an enabled real meal and blocks an example plan", () => {
    const snapshot = getPublicCatalog();
    const meal = snapshot.meals.find((entry) => !entry.isSample && entry.available && entry.price !== null);
    expect(meal, "The supplied menu should contain a real requestable dish").toBeDefined();
    if (!meal) throw new Error("No real meal is configured.");
    const draft = {
      ...EMPTY_DRAFT,
      catalogRevision: snapshot.publication.revision,
      items: [{ mealId: meal.id, quantity: 2, option: meal.options[0] }],
    };
    const decision = getHandoffDecision(draft, snapshot, business.contact, { fresh: true });
    expect(decision.allowed).toBe(true);
    expect(decision.url).toContain(`https://wa.me/${business.contact.phoneNumber}?text=`);
    expect(decision.message).toContain(`Name: ${meal.name}`);
    expect(decision.message).toContain("Quantity: 2");
    expect(decision.message).not.toContain("Sample / preview");
    const samplePlan = snapshot.plans.find((plan) => plan.isSample);
    if (samplePlan) {
      const planDecision = getHandoffDecision({
        ...draft, purpose: "plan", planId: samplePlan.id,
      }, snapshot, business.contact, { fresh: true });
      expect(planDecision.allowed).toBe(false);
      expect(planDecision.url).toBeNull();
    }
  });

  it("accounts for every supplied photo and ships both local image sizes", () => {
    const ids = new Set(kitchenPhotos.map((photo) => photo.id));
    expect(ids.size).toBe(kitchenPhotos.length);
    expect(photoSource.sourceFiles).toBe(photoSource.files.length);
    expect(photoSource.uniquePhotos).toBe(ids.size);
    expect(new Set(photoSource.files.map((file) => file.sha256)).size).toBe(ids.size);
    expect(new Set(photoSource.files.map((file) => file.photoId || file.duplicateOf))).toEqual(ids);
    for (const file of photoSource.files) {
      if (file.duplicateOf) {
        expect(photoSource.files.find((original) => original.photoId === file.duplicateOf)?.sha256).toBe(file.sha256);
      }
    }
    for (const photo of kitchenPhotos) {
      for (const src of [photo.src, photo.src.replace(".webp", "-480.webp")]) {
        const path = join(process.cwd(), "public", ...src.split("/"));
        expect(statSync(path).size, src).toBeGreaterThan(0);
        const bytes = readFileSync(path);
        expect(bytes.toString("ascii", 0, 4), src).toBe("RIFF");
        expect(bytes.toString("ascii", 8, 12), src).toBe("WEBP");
      }
    }
    for (const meal of catalogData.meals) {
      if (meal.image?.kind === "example-photo") {
        const photo = kitchenPhotos.find((entry) => entry.src === meal.image?.src);
        expect(photo, meal.name).toBeDefined();
        expect(meal.image.width, meal.name).toBe(photo?.width);
      }
    }
  });
});
