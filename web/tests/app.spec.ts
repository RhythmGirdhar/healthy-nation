import { test as base, expect } from "@playwright/test";
import businessContent from "../content/business.json";
import kitchenPhotos from "../content/kitchen-photos.json";
import { parsePublicCatalog } from "../src/lib/catalog-client";
import { formatPrice } from "../src/lib/format";
import { EMPTY_DRAFT } from "../src/lib/inquiry";

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

test("About page shows the confirmed founder without an empty portrait block", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.getByRole("heading", { name: "Shivansh Girdhar", exact: true })).toBeVisible();
  await expect(page.getByText("Degree in Culinary Sciences", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: /Portrait placeholder/ })).toHaveCount(0);
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
  expect(message).toBe(await dialog.getByLabel("Your message draft").textContent());
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
  for (const route of ["/", "/menu/", "/plans/", "/request/", "/about/", "/faq/", "/catering/", "/kitchen/"]) {
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

test("multiple quick selections retain the menu filters and selected quantities", async ({ page, request }) => {
  const catalog = parsePublicCatalog(await (await request.get("/catalog.json")).json());
  const category = catalog.meals.find((meal) => meal.available && meal.options.length === 1)!.category;
  const meals = catalog.meals.filter((meal) => meal.category === category && meal.available && meal.options.length === 1).slice(0, 2);
  expect(meals).toHaveLength(2);
  await page.goto(`/menu/?category=${encodeURIComponent(category)}`);
  for (const meal of meals) {
    await page.getByRole("button", { name: `Add ${meal.name} to request`, exact: true }).click();
    await expect(page.getByRole("form", { name: `Select ${meal.name}`, exact: true })).toContainText("1 in your request");
    await expect(page).toHaveURL(/\/menu\/\?category=/);
  }
  await page.getByRole("form", { name: `Select ${meals[0].name}`, exact: true }).getByRole("button").click();
  await expect(page.getByRole("form", { name: `Select ${meals[0].name}`, exact: true })).toContainText("2 in your request");
  await page.locator(`a[href^="/menu/${meals[1].slug}/"]`).first().click();
  await page.getByRole("button", { name: "Add & keep browsing", exact: true }).click();
  await expect(page).toHaveURL(/\/menu\/\?category=/);
  await expect(page.locator("#menu-category")).toHaveValue(category);
  await expect(page.getByRole("form", { name: `Select ${meals[1].name}`, exact: true })).toContainText("2 in your request");
  await page.goto("/request/");
  for (const meal of meals) await expect(page.getByRole("main")).toContainText(meal.name);
});

test("meal and catering dates stay separate and the mobile shortcut focuses preview", async ({ page, request }) => {
  const catalog = parsePublicCatalog(await (await request.get("/catalog.json")).json());
  const meal = catalog.meals.find((entry) => entry.available)!;
  await page.goto(`/menu/${meal.slug}/`);
  await page.getByRole("button", { name: /Add to request & review/ }).click();
  const year = new Date().getFullYear() + 1;
  await page.getByLabel("Preferred meal date (optional)").fill(`${year}-03-11`);
  await page.locator("#request-purpose").selectOption("catering");
  await expect(page.getByLabel("Preferred event date (optional)")).toHaveValue("");
  await page.getByLabel("Preferred event date (optional)").fill(`${year}-03-20`);
  await page.getByRole("button", { name: "Preview message", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Your message draft")).toContainText(`${year}-03-20`);
  await expect(dialog.getByLabel("Your message draft")).not.toContainText(`${year}-03-11`);
  await page.getByRole("button", { name: "Close message preview" }).click();
  await page.locator("#request-purpose").selectOption("meals");
  await expect(page.getByLabel("Preferred meal date (optional)")).toHaveValue(`${year}-03-11`);
  await page.reload();
  await expect(page.getByLabel("Preferred meal date (optional)")).toHaveValue(`${year}-03-11`);
  await page.locator("#request-purpose").selectOption("catering");
  await expect(page.getByLabel("Preferred event date (optional)")).toHaveValue(`${year}-03-20`);
  if ((page.viewportSize()?.width ?? 0) <= 760) {
    await page.getByRole("link", { name: "Review message", exact: true }).click();
    await expect(page.locator("#preview-message")).toBeFocused();
  }
});

test("an inactive plan change does not block meals but still needs review when selected", async ({ page, request }) => {
  const catalog = parsePublicCatalog(await (await request.get("/catalog.json")).json());
  const meal = catalog.meals.find((entry) => entry.available)!;
  const plan = catalog.plans[0];
  await page.addInitScript((draft) => {
    if (!sessionStorage.getItem("healthy-nation:request:v2")) sessionStorage.setItem("healthy-nation:request:v2", JSON.stringify(draft));
  }, { ...EMPTY_DRAFT, catalogRevision: catalog.publication.revision, planId: plan.id, items: [{ mealId: meal.id, quantity: 1, option: meal.options[0] }] });
  const updated = structuredClone(catalog);
  updated.publication.revision = "a".repeat(64);
  updated.plans[0].description += " Updated terms.";
  await page.route("**/catalog.json", (route) => route.fulfill({ json: updated }));
  await page.goto("/request/");
  await page.getByRole("button", { name: "Preview message", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("link", { name: "Open WhatsApp", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close message preview" }).click();
  await page.locator("#request-purpose").selectOption("plan");
  await expect(page.getByRole("button", { name: "I reviewed the menu changes" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "I reviewed the menu changes" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("healthy-nation:request:v2")!).pendingReview)).toContain("plan");
});

test("acknowledging meal changes does not clear an inactive plan review", async ({ page, request }) => {
  const catalog = parsePublicCatalog(await (await request.get("/catalog.json")).json());
  const meal = catalog.meals.find((entry) => entry.available)!;
  await page.addInitScript((draft) => sessionStorage.setItem("healthy-nation:request:v2", JSON.stringify(draft)),
    { ...EMPTY_DRAFT, catalogRevision: catalog.publication.revision, planId: catalog.plans[0].id, pendingReview: ["meals", "plan"], items: [{ mealId: meal.id, quantity: 1, option: meal.options[0] }] });
  await page.goto("/request/");
  await page.getByRole("button", { name: "Preview message", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("button", { name: "Check menu again", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Close message preview" }).click();
  await page.getByRole("button", { name: "I reviewed the menu changes" }).click();
  await expect(page.getByRole("button", { name: "I reviewed the menu changes" })).toHaveCount(0);
  await page.locator("#request-purpose").selectOption("plan");
  await expect(page.getByRole("button", { name: "I reviewed the menu changes" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("healthy-nation:request:v2")!).pendingReview)).toEqual(["plan"]);
});

test("a failed menu check can be retried inside the readable single-scroll preview", async ({ page, request }) => {
  const catalog = parsePublicCatalog(await (await request.get("/catalog.json")).json());
  const meal = catalog.meals.find((entry) => entry.available)!;
  let attempts = 0;
  await page.route("**/catalog.json", (route) => {
    attempts += 1;
    return attempts === 1 ? route.fulfill({ status: 503, body: "Unavailable" }) : route.fulfill({ json: catalog });
  });
  await page.goto(`/menu/${meal.slug}/`);
  await page.getByRole("button", { name: /Add to request & review/ }).click();
  await page.getByRole("button", { name: "Preview message", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("alert")).toContainText("could not verify");
  await expect(dialog.getByRole("link", { name: "Open WhatsApp", exact: true })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Check menu again", exact: true }).click();
  await expect(dialog.getByRole("link", { name: "Open WhatsApp", exact: true })).toBeVisible();
  const text = dialog.getByLabel("Your message draft");
  expect(await text.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined }));
  await dialog.getByRole("button", { name: "Copy draft", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("Select message");
  await dialog.getByRole("button", { name: "Select message", exact: true }).click();
  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(await text.textContent());
});

test("keyboard focus clears the fixed bars at narrow widths", async ({ page, request }) => {
  const catalog = parsePublicCatalog(await (await request.get("/catalog.json")).json());
  const meal = catalog.meals.find((entry) => entry.available)!;
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto(`/menu/${meal.slug}/`);
    await page.getByRole("combobox").focus();
    await page.keyboard.press("Tab");
    const add = page.getByRole("button", { name: /Add to request & review/ });
    await expect(add).toBeFocused();
    const bounds = await add.boundingBox();
    const bar = await page.getByRole("complementary", { name: "Request quick action" }).boundingBox();
    const header = await page.locator(".site-header").boundingBox();
    expect(bounds).not.toBeNull();
    expect(bar).not.toBeNull();
    expect(bounds!.y + bounds!.height + 4).toBeLessThanOrEqual(bar!.y);
    expect(bounds!.y - 4).toBeGreaterThanOrEqual(header!.y + header!.height);
  }
});

test("the kitchen gallery includes every unique source and example images stay labelled", async ({ page, request }) => {
  await page.goto("/kitchen/");
  await expect(page.locator(".kitchen-photo")).toHaveCount(kitchenPhotos.length);
  const category = kitchenPhotos[0].category;
  await page.getByRole("link", { name: category, exact: true }).click();
  await expect(page.getByRole("heading", { name: category, exact: true })).toBeInViewport();
  const catalog = parsePublicCatalog(await (await request.get("/catalog.json")).json());
  const meal = catalog.meals.find((entry) => entry.image?.kind === "example-photo")!;
  await page.goto(`/menu/${meal.slug}/`);
  await expect(page.locator(".detail-figure figcaption")).toContainText(/example|not.*confirmed/i);
  const image = page.locator(".detail-figure img");
  await expect(image).toHaveAttribute("alt", /example/i);
  expect(await image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
});
