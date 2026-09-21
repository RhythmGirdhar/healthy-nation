import { describe, expect, it } from "vitest";
import { catalogData } from "@/data/catalog";
import { getPublicCatalog, validateCatalog } from "@/lib/catalog";
import { parsePublicCatalog } from "@/lib/catalog-client";
import { business } from "@/data/business";
import { EMPTY_DRAFT, getHandoffDecision } from "@/lib/inquiry";

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
});
