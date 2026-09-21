import { test as base, expect } from "@playwright/test";
import businessContent from "../content/business.json";
import { parsePublicCatalog } from "../src/lib/catalog-client";
import { formatPrice } from "../src/lib/format";

const test = base.extend<{ observePage: void }>({
  observePage: [async ({ page, baseURL }, use) => {
    const errors: string[] = [];
    const externalOrigins: string[] = [];
    const origin = new URL(baseURL!).origin;
    page.on("pageerror", error => errors.push(error.message));
    await page.route("**/*", route => {
      const url = new URL(route.request().url());
      if (url.origin === origin) return route.continue();
      externalOrigins.push(url.origin);
      return route.abort();
    });
    await use();
    expect(errors, "The app should not throw browser exceptions").toEqual([]);
    expect(externalOrigins, "Browsing must not automatically contact WhatsApp or other services").toEqual([]);
  }, { auto: true }],
});

test("About page shows the confirmed founder, qualification, and honest portrait placeholder", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.getByRole("heading", { name: "Shivansh Girdhar", exact: true })).toBeVisible();
  await expect(page.getByText("Degree in Culinary Sciences", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: /Portrait placeholder for Shivansh Girdhar/ })).toBeVisible();
  await expect(page.getByRole("main")).toContainText("+91 81049 60748");
  const founderLink = page.getByRole("link", { name: "Message Shivansh" });
  const url = new URL((await founderLink.getAttribute("href"))!);
  expect(url.origin).toBe("https://wa.me");
  expect(url.pathname).toBe(`/${businessContent.contact.phoneNumber}`);
  expect(url.searchParams.get("text")).toContain("Hi Shivansh!");
  await expect(founderLink).toHaveAttribute("target", "_blank");
  await expect(founderLink).toHaveAttribute("rel", /noopener/);
});

test("public contact links use the supplied number without turning samples into orders", async ({ page }) => {
  await page.goto("/");
  const contacts = page.locator('a[href^="https://wa.me/"]');
  expect(await contacts.count()).toBeGreaterThan(0);
  for (const link of await contacts.all()) {
    const url = new URL((await link.getAttribute("href"))!);
    expect(url.pathname).toBe(`/${businessContent.contact.phoneNumber}`);
    expect(url.searchParams.get("text")).not.toMatch(/Meal \d|Selected plan|Harissa chicken|Paneer garden/);
    await expect(link).toHaveAttribute("referrerpolicy", "no-referrer");
  }
  await expect(page.locator("#whatsapp-privacy")).toContainText("Opening a link shares");
});

test("catering prepares a reviewed message and invalidates it when the inputs change", async ({ page }) => {
  await page.goto("/catering/");
  await page.getByLabel("Approximate number of people (optional)").fill("12");
  const year = new Date().getFullYear() + 1;
  await page.getByLabel("Requested event date (optional)").fill(`${year}-06-12`);
  await page.getByRole("button", { name: "Prepare a catering inquiry", exact: true }).click();
  const message = page.getByRole("region", { name: "Your catering message" });
  await expect(message).toBeVisible();
  const text = await message.locator("pre").textContent();
  expect(text).toMatch(/headcount.*12|people.*12/i);
  expect(text).toContain(`${year}-06-12`);
  const url = new URL((await message.getByRole("link", { name: /Open WhatsApp to send/ }).getAttribute("href"))!);
  expect(url.pathname).toBe(`/${businessContent.contact.phoneNumber}`);
  expect(url.searchParams.get("text")).toBe(text);
  expect(text).not.toMatch(/Harissa|Paneer|Sample \/ preview catalog request/);
  await page.getByLabel("Approximate number of people (optional)").fill("15");
  await expect(message).toHaveCount(0);
});

test("a past catering date is rejected without producing a send link", async ({ page }) => {
  await page.goto("/catering/");
  await page.getByLabel("Requested event date (optional)").fill("2000-01-01");
  await page.getByRole("button", { name: "Prepare a catering inquiry", exact: true }).click();
  await expect(page.getByRole("form", { name: "Prepare a catering inquiry" }).getByRole("alert")).toContainText(/past|future|today/i);
  await expect(page.getByRole("link", { name: /Open WhatsApp to send/ })).toHaveCount(0);
});

test("the exported catalog is public, versioned, and read-only", async ({ request }) => {
  const response = await request.get("/catalog.json");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/json");
  expect(response.headers()["cache-control"]).toContain("no-store");
  const catalog = parsePublicCatalog(await response.json());
  expect(catalog.schemaVersion).toBe(1);
  expect(catalog.isPreview).toBe(false);
  expect(catalog.publication.revision).toMatch(/^[a-f0-9]{64}$/);
  expect(catalog.meals.length).toBeGreaterThan(0);
  expect(catalog.meals.every((meal) => !meal.isSample && meal.price !== null)).toBe(true);
  expect((await request.post("/catalog.json", { data: {} })).status()).toBe(405);
  expect((await request.get("/api/catalog/")).status()).toBe(404);
  expect((await request.get("/menu/not-a-real-meal/")).status()).toBe(404);
});

test("a real meal request opens a correctly addressed WhatsApp draft with quantity and listed price", async ({ page, request }) => {
  const response = await request.get("/catalog.json");
  const catalog = parsePublicCatalog(await response.json());
  const meal = catalog.meals.find((entry) => !entry.isSample && entry.available && entry.price !== null);
  if (!meal) throw new Error("The published menu has no requestable real dish.");
  await page.goto(`/menu/${meal.slug}/`);
  await expect(page.getByRole("heading", { level: 1, name: meal.name })).toBeVisible();
  await page.getByRole("button", { name: /Add to request/ }).click();
  await expect(page).toHaveURL(/\/request\/$/);
  await page.getByRole("button", { name: `Increase quantity of ${meal.name}`, exact: true }).click();
  await page.getByRole("button", { name: "Preview message" }).click();
  const dialog = page.getByRole("dialog", { name: "Review your message" });
  const handoff = dialog.getByRole("link", { name: "Open WhatsApp" });
  await expect(handoff).toBeVisible();
  const url = new URL((await handoff.getAttribute("href"))!);
  const message = url.searchParams.get("text");
  expect(url.origin).toBe("https://wa.me");
  expect(url.pathname).toBe(`/${businessContent.contact.phoneNumber}`);
  expect(message).toBe(await dialog.getByLabel("Your message draft").inputValue());
  expect(message).toContain(`Name: ${meal.name}`);
  expect(message).toContain("Quantity: 2");
  expect(message).toContain(`Unit price: ${formatPrice(meal.price)}`);
  expect(message).not.toContain("Sample / preview");
  await page.getByRole("button", { name: "Close message preview", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("main")).toContainText(meal.name);
  await expect(page.getByLabel("Quantity: 2", { exact: true })).toBeVisible();
});

test("menu categories come from JSON and unprovided food facts are explicit", async ({ page, request }) => {
  const catalog = parsePublicCatalog(await (await request.get("/catalog.json")).json());
  await page.goto("/menu/");
  const category = page.locator("#menu-category");
  await expect(category).toBeVisible();
  for (const name of new Set(catalog.meals.map((meal) => meal.category))) {
    await expect(category.getByRole("option", { name, exact: true })).toHaveCount(1);
  }
  const meal = catalog.meals.find((entry) => !entry.image && !entry.ingredients.length && !entry.allergens.length);
  if (!meal) throw new Error("Expected an imported dish with unprovided photo and ingredients.");
  await page.goto(`/menu/${meal.slug}/`);
  await expect(page.getByRole("img", { name: `${meal.name}: photo not provided` })).toBeVisible();
  await expect(page.getByRole("main")).toContainText("The supplied menu does not list ingredients");
  await expect(page.getByRole("main")).toContainText("does not mean the dish is allergen-free");
});

test("sample meal plans remain local-only despite the live menu and configured phone", async ({ page }) => {
  await page.goto("/plans/");
  await page.getByRole("button", { name: "Explore this sample plan" }).first().click();
  await expect(page).toHaveURL(/\/request\/$/);
  await page.getByRole("button", { name: "Preview message" }).click();
  const dialog = page.getByRole("dialog", { name: "Review your message" });
  await expect(dialog.getByRole("link", { name: "Open WhatsApp" })).toHaveCount(0);
  await expect(dialog).toContainText(/sample|preview/i);
});

test("the main pages, logo and supporting content do not overflow", async ({ page }) => {
  for (const route of ["/", "/menu/", "/plans/", "/request/", "/about/", "/faq/", "/catering/"]) {
    await page.goto(route);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, `Horizontal overflow on ${route}`).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});
