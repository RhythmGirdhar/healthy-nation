import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import * as route from "./route";

describe("GET /api/catalog", () => {
  it("returns the validated public catalog as JSON with explicit preview markers", async () => {
    const response = route.GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    const body = await response.json();
    expect(body).toEqual(catalog);
    expect(Object.keys(body).sort()).toEqual([
      "faqs", "isPreview", "meals", "plans", "weeklyMenu",
    ]);
    expect(body.isPreview).toBe(true);
    expect(body.meals.every((meal: { price: unknown }) => meal.price === null)).toBe(true);
    expect(body).not.toHaveProperty("draft");
    expect(body).not.toHaveProperty("phone");
  });

  it("is statically cacheable and exposes no mutation handlers", () => {
    expect(route.dynamic).toBe("force-static");
    expect(Object.keys(route).sort()).toEqual(["GET", "dynamic"]);
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      expect(route).not.toHaveProperty(method);
    }
  });
});
