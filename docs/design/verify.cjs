const assert = require("node:assert/strict");
const path = require("node:path");
const { createRequire } = require("node:module");
const fromWeb = createRequire(path.resolve(__dirname, "..", "..", "web", "package.json"));
const { chromium, expect } = fromWeb("@playwright/test");

const base = process.argv[2] || "http://127.0.0.1:4180/design/index.html";
const origin = new URL(base).origin;
assert(["127.0.0.1", "localhost"].includes(new URL(base).hostname), "Use a local design preview.");
const futureYear = new Date().getFullYear() + 1;
const errors = [];
const externalRequests = [];

async function screen(page, value) {
  await page.locator("#screen-select").selectOption(value);
  await expect(page.locator(`[data-screen="${value}"]`)).toBeVisible();
}

async function addPaneer(page) {
  await screen(page, "menu");
  await page.locator('[data-screen="menu"] [data-meal-link="paneer"]').click();
  await page.locator("#meal-option").selectOption("Mild flavor requested (sample)");
  await page.locator("#add-to-request").click();
  await expect(page.locator('[data-screen="request"]')).toBeVisible();
}

async function closeMessage(page) {
  await page.getByRole("button", { name: "Close local message preview", exact: true }).click();
}

async function run() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  async function test(name, action, viewport = { width: 1440, height: 1000 }) {
    const page = await browser.newPage({ viewport });
    page.on("pageerror", error => errors.push(error.message));
    await page.route("**/*", route => {
      if (new URL(route.request().url()).origin === origin) return route.continue();
      externalRequests.push(route.request().url());
      return route.abort();
    });
    try {
      await page.goto(base);
      await action(page);
      console.log(`PASS ${name}`);
    } finally {
      await page.close();
    }
  }

  try {
    await test("empty start, vegetarian-only selection, editable per-meal preference", async page => {
      await expect(page.locator(".hero-copy")).toContainText("Individual meals");
      await expect(page.locator(".hero-copy .service-context")).toContainText("awaiting confirmation");
      await screen(page, "request");
      await expect(page.locator("#empty-request")).toBeVisible();
      await expect(page.locator("#summary-count")).toHaveText("0");
      await expect(page.locator("#preview-request")).toBeDisabled();
      await addPaneer(page);
      await expect(page.locator("#request-items .request-item")).toHaveCount(1);
      await expect(page.locator("#request-items")).not.toContainText("Harissa");
      await expect(page.locator("#request-preference")).toHaveCount(0);
      await page.locator("[data-item-option]").selectOption("Dressing on the side requested (sample)");
      await page.locator("#preview-request").click();
      await expect(page.locator("#message-text")).toContainText("Dressing on the side requested (sample)");
      await expect(page.locator("#message-text")).not.toContainText("Mild flavor");
      await expect(page.locator("#message-text")).not.toContainText("Taste preference:");
      await closeMessage(page);
    });

    await test("general and catering inquiries work without meal selections", async page => {
      await screen(page, "request");
      const general = page.getByRole("button", { name: "Or preview a general inquiry", exact: true });
      await general.click();
      await expect(page.locator("#message-text")).toContainText("learn more about the meals and meal plans");
      await expect(page.locator("#message-text")).not.toContainText("Quantity:");
      await closeMessage(page);
      await expect(general).toBeFocused();
      await screen(page, "home");
      await page.locator('.catering [data-inquiry="catering"]').click();
      await expect(page.locator("#message-text")).toContainText("catering options for a team");
      await expect(page.locator("#message-text")).not.toContainText("Harissa");
      await closeMessage(page);
    });

    await test("search/filter and scroll survive meal details and skip navigation", async page => {
      await screen(page, "menu");
      await expect(page.locator('[data-screen="menu"] .service-context')).toContainText("to be confirmed");
      await expect(page.locator("#all-meals .meal-meta").first()).toContainText("Portion to be confirmed");
      await page.locator('[data-filter="vegetarian"]').click();
      await page.locator("#meal-search").fill("paneer");
      await expect(page.locator("#all-meals .meal-card")).toHaveCount(1);
      const link = page.locator('#all-meals [data-meal-link="paneer"]');
      await expect(link).toHaveAttribute("href", /category=vegetarian/);
      await expect(link).toHaveAttribute("href", /q=paneer/);
      await link.scrollIntoViewIfNeeded();
      const before = await page.locator("#shop-scroll").evaluate(node => node.scrollTop);
      await link.click();
      await page.getByRole("button", { name: "Keep browsing", exact: true }).click();
      await expect(page.locator("#meal-search")).toHaveValue("paneer");
      await expect(page.locator('[data-filter="vegetarian"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#all-meals .meal-card")).toHaveCount(1);
      const after = await page.locator("#shop-scroll").evaluate(node => node.scrollTop);
      assert(Math.abs(before - after) <= 2, `Browsing position changed: ${before} -> ${after}`);
      const url = page.url();
      await page.locator(".skip").focus();
      await page.keyboard.press("Enter");
      assert.equal(page.url(), url, "Skip link changed the route.");
      await expect(page.locator("#main-content")).toBeFocused();
    });

    await test("explicit example and safe undo after later edits", async page => {
      await page.locator("#load-example").click();
      await expect(page.locator("#request-items")).toContainText("Harissa");
      await page.getByRole("button", { name: "Remove Harissa chicken bowl from sample request", exact: true }).click();
      await expect(page.locator("#undo-action")).toBeVisible();
      await addPaneer(page);
      await expect(page.locator("#toast")).toBeHidden();
      await expect(page.locator("#request-items")).not.toContainText("Harissa");
      await page.locator("#reset-draft").click();
      await expect(page.locator("#empty-request")).toBeVisible();
      await page.locator("#undo-action").click();
      await expect(page.locator("#request-items")).toContainText("Paneer");
      await expect(page.locator("#request-items")).not.toContainText("Harissa");
    });

    await test("meal and plan drafts have separate dates and unambiguous semantics", async page => {
      await addPaneer(page);
      await page.locator("#request-date").fill(`${futureYear}-06-12`);
      await screen(page, "plans");
      await expect(page.locator(".plan-terms")).toHaveCount(3);
      await page.locator('[data-plan="weekday"]').click();
      await expect(page.locator("#request-purpose")).toHaveValue("plan");
      await expect(page.locator("#request-items .request-item")).toHaveCount(1);
      await expect(page.locator("#request-items [data-quantity]")).toHaveCount(0);
      await expect(page.locator("#request-date-label")).toContainText("Requested start date");
      await expect(page.locator("#request-date")).toHaveValue("");
      await page.locator("#request-date").fill(`${futureYear}-07-04`);
      await page.locator("#preview-request").click();
      await expect(page.locator("#message-text")).toContainText("Plan description:");
      await expect(page.locator("#message-text")).toContainText("Requested start date:");
      await expect(page.locator("#message-text")).not.toContainText("Quantity:");
      await expect(page.locator("#message-text")).not.toContainText("Paneer");
      await closeMessage(page);
      await page.locator("#request-purpose").selectOption("meals");
      await expect(page.locator("#request-items")).toContainText("Paneer");
      await expect(page.locator("#request-date")).toHaveValue(`${futureYear}-06-12`);
      await page.locator("#preview-request").click();
      await expect(page.locator("#message-text")).not.toContainText("Plan inquiry:");
      await closeMessage(page);
      await page.locator("#request-date").fill("2000-01-01");
      await page.locator("#preview-request").click();
      await expect(page.locator("#date-error")).toBeVisible();
      await expect(page.locator("#message-dialog")).not.toBeVisible();
    });

    for (const width of [1440, 390, 320]) {
      await test(`${width}px screens, dialogs and readable controls`, async page => {
        for (const view of ["home", "menu", "plans", "request"]) {
          await screen(page, view);
          const headerColor = await page.locator(".site-header").evaluate(node => getComputedStyle(node).backgroundColor);
          assert.equal(headerColor, "rgb(249, 251, 252)", "Navbar must match the displayed logo's opaque white background.");
          const overflow = await page.evaluate(() => ({
            page: document.documentElement.scrollWidth > innerWidth + 1,
            shop: document.querySelector("#shop-scroll").scrollWidth > document.querySelector("#shop-scroll").clientWidth + 1,
          }));
          assert(!overflow.page && !overflow.shop, `${view} overflow: ${JSON.stringify(overflow)}`);
        }
        await screen(page, "menu");
        if (width === 390) {
          const position = await page.locator("#all-meals h3").first().evaluate(node => ({
            top: node.getBoundingClientRect().top,
            bottom: node.getBoundingClientRect().bottom,
            visibleBottom: document.querySelector("#shop-scroll").getBoundingClientRect().bottom,
          }));
          assert(position.bottom <= position.visibleBottom, `First meal heading is below the fold: ${JSON.stringify(position)}`);
        }
        await page.locator('#all-meals [data-meal-link="oats"]').click();
        const dimensions = await page.locator("#meal-dialog").evaluate(dialog => {
          const select = dialog.querySelector("#meal-option").getBoundingClientRect();
          const box = dialog.getBoundingClientRect();
          return { width: dialog.clientWidth, scrollWidth: dialog.scrollWidth, right: box.right, selectRight: select.right };
        });
        assert(dimensions.scrollWidth <= dimensions.width + 1, `Dialog overflow: ${JSON.stringify(dimensions)}`);
        assert(dimensions.selectRight <= dimensions.right, "Meal option extends outside dialog.");
        await page.keyboard.press("Escape");
        await expect(page.locator('#all-meals [data-meal-link="oats"]')).toBeFocused();
        const fonts = await page.evaluate(() => ({
          price: parseFloat(getComputedStyle(document.querySelector(".meal-meta")).fontSize),
          inclusions: parseFloat(getComputedStyle(document.querySelector(".plan-card ul")).fontSize),
          summary: parseFloat(getComputedStyle(document.querySelector(".summary-line")).fontSize),
        }));
        assert(Object.values(fonts).every(size => size >= 14), `Small decision text: ${JSON.stringify(fonts)}`);
      }, { width, height: 844 });
    }

    await test("mobile disclosure closes before focus leaves and on outside interaction", async page => {
      await screen(page, "menu");
      await page.locator("#mobile-navigation summary").click();
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press("Tab");
        if (!await page.locator("#mobile-navigation").evaluate(node => node.contains(document.activeElement))) break;
      }
      assert.equal(await page.locator("#mobile-navigation").evaluate(node => node.open), false);
      const exposed = await page.evaluate(() => {
        const element = document.activeElement;
        const rect = element.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return element === hit || element.contains(hit);
      });
      assert(exposed, "Focused control is covered.");
      await page.locator("#mobile-navigation summary").click();
      await page.locator(".review-title").click();
      assert.equal(await page.locator("#mobile-navigation").evaluate(node => node.open), false);
    }, { width: 390, height: 844 });

    await test("control contrast and constrained mobile artboard", async page => {
      await page.locator('[data-width="mobile"]').click();
      await screen(page, "menu");
      await page.locator('#all-meals [data-meal-link="oats"]').click();
      assert(await page.locator("#meal-dialog").evaluate(node => node.scrollWidth <= node.clientWidth + 1));
      await page.keyboard.press("Escape");
      const colors = await page.locator("#meal-search").evaluate(node => {
        const style = getComputedStyle(node);
        return { border: style.borderTopColor, background: style.backgroundColor };
      });
      const luminance = css => {
        const rgb = css.match(/[\d.]+/g).slice(0, 3).map(value => {
          const channel = Number(value) / 255;
          return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
        });
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
      };
      const values = [luminance(colors.border), luminance(colors.background)].sort((a, b) => b - a);
      const ratio = (values[0] + .05) / (values[1] + .05);
      assert(ratio >= 3, `Control boundary contrast is ${ratio.toFixed(2)}:1`);
    });

    assert.deepEqual(errors, [], "Prototype JavaScript errors.");
    assert.deepEqual(externalRequests, [], "Prototype attempted external requests.");
    console.log("All prototype regression checks passed. This does not certify production readiness or full accessibility.");
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
