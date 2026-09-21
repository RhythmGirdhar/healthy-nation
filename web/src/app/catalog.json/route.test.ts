import { describe, expect, it, vi } from "vitest";
import { catalog } from "@/lib/catalog";
import { parsePublicCatalog } from "@/lib/catalog-client";
import * as route from "./route";

vi.mock("@/data/catalog", async () => ({
  catalogData: (await import("@/lib/catalog-fixture")).catalogFixtureData,
}));

describe("static /catalog.json artifact", () => {
  it("exports only a static GET handler, not a runtime or mutation API", () => {
    expect(route.dynamic).toBe("force-static");
    expect(Object.keys(route).sort()).toEqual(["GET", "dynamic"]);
  });

  it("returns the same validated, versioned public snapshot as the pages", async () => {
    const response = route.GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    const body = parsePublicCatalog(await response.json());
    expect(body).toEqual(catalog);
    expect(Object.keys(body).sort()).toEqual([
      "faqs", "isPreview", "meals", "plans", "publication", "schemaVersion", "weeklyMenu",
    ]);
    expect(body.meals.every((meal) => meal.isSample && meal.price === null)).toBe(true);
    for (const key of ["draft", "phone", "customers", "credentials", "orders"]) {
      expect(body).not.toHaveProperty(key);
    }
  });

  it("keeps the revision stable across repeated artifact generation", async () => {
    expect(await route.GET().json()).toEqual(await route.GET().json());
  });
});
