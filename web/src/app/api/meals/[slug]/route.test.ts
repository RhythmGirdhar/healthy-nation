import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import * as route from "./route";

function get(slug: string) {
  return route.GET(new Request(`https://example.test/api/meals/${encodeURIComponent(slug)}`), {
    params: Promise.resolve({ slug }),
  });
}

describe("GET /api/meals/[slug]", () => {
  it.each(catalog.meals)("returns the validated meal for $slug", async (meal) => {
    const response = await get(meal.slug);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toEqual(meal);
  });

  it.each(["unknown-meal", "", "../catalog", "toString", "HARISSA-CHICKEN-BOWL"])(
    "returns an explicit JSON 404 for %s",
    async (slug) => {
      const response = await get(slug);
      expect(response.status).toBe(404);
      expect(response.headers.get("content-type")).toContain("application/json");
      expect(await response.json()).toEqual({ error: "Meal not found" });
    },
  );

  it("pre-generates all known slugs but permits unknown slugs to reach the JSON 404", () => {
    expect(route.dynamic).toBe("force-static");
    expect(route.dynamicParams).toBe(true);
    expect(route.generateStaticParams()).toEqual(
      catalog.meals.map((meal) => ({ slug: meal.slug })),
    );
  });

  it("exposes only a read handler and static generation configuration", () => {
    expect(Object.keys(route).sort()).toEqual([
      "GET", "dynamic", "dynamicParams", "generateStaticParams",
    ]);
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      expect(route).not.toHaveProperty(method);
    }
  });
});
