import { afterEach, describe, expect, it, vi } from "vitest";
import { catalog } from "@/lib/catalog";
import {
  buildInquiryMessage as buildMessage,
  EMPTY_DRAFT,
  getLocalCalendarDate,
  getWhatsAppUrl,
  getHandoffDecision,
  parseDraft,
  reconcileDraft,
  type InquiryDraft,
} from "@/lib/inquiry";
import type { ContactSettings, PublicCatalog } from "@/lib/types";

function buildInquiryMessage(input: InquiryDraft, snapshot: PublicCatalog = catalog, now?: Date) {
  return buildMessage(input, snapshot, now);
}

const NOW = new Date("2030-01-15T12:00:00.000Z");
const approvedContact: ContactSettings = {
  phoneNumber: "12345678901",
  approved: true,
  generalInquiriesEnabled: true,
  offerRequestsEnabled: true,
};

function liveCatalog(): PublicCatalog {
  const snapshot = structuredClone(catalog);
  snapshot.isPreview = false;
  snapshot.weeklyMenu.isSample = false;
  for (const entry of [...snapshot.meals, ...snapshot.plans]) {
    entry.isSample = false;
    entry.price = 100;
  }
  snapshot.publication = {
    revision: "a".repeat(64),
    publishedAt: "2030-01-01T00:00:00.000Z",
    validFrom: "2030-01-10T00:00:00.000Z",
    validUntil: "2030-01-20T00:00:00.000Z",
  };
  return snapshot;
}

function draft(overrides: Partial<InquiryDraft> = {}): InquiryDraft {
  return {
    ...structuredClone(EMPTY_DRAFT),
    items: [{ mealId: catalog.meals[0].id, quantity: 2, option: "Standard" }],
    ...overrides,
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("untrusted inquiry draft parsing", () => {
  it("accepts an empty saved draft without requiring a completed inquiry", () => {
    expect(parseDraft(EMPTY_DRAFT)).toEqual({
      version: 2,
      catalogRevision: null,
      items: [],
      planId: null,
      requestedDate: "",
      planStartDate: "",
      purpose: "meals",
      headcount: "",
    });
  });

  it("round-trips JSON storage and returns independent nested objects", () => {
    const input = draft();
    const parsed = parseDraft(JSON.parse(JSON.stringify(input)));
    expect(parsed).toEqual(input);
    expect(parsed.items).not.toBe(input.items);
    expect(parseDraft(input).items[0]).not.toBe(input.items[0]);
  });

  it.each([null, undefined, [], "{}", 1, true])("rejects non-draft input %s", (input) => {
    expect(() => parseDraft(input)).toThrow(/Invalid inquiry draft/);
  });

  it("rejects a stale version and missing required fields", () => {
    expect(() => parseDraft({ ...draft(), version: 1 })).toThrow(/version/);
    const missingField: Partial<InquiryDraft> = draft();
    delete missingField.headcount;
    expect(() => parseDraft(missingField)).toThrow(/headcount/);
  });

  it.each(["name", "phone", "address", "email", "healthNotes", "medicalConditions"])(
    "rejects unexpected personal field %s",
    (field) => {
      expect(() => parseDraft({ ...draft(), [field]: "not allowed" })).toThrow(
        /Unrecognized key/,
      );
    },
  );

  it("rejects unknown keys within items, including arbitrary instructions", () => {
    const input = draft();
    Object.assign(input.items[0], { notes: "not allowed" });
    expect(() => parseDraft(input)).toThrow(/items\.0: Unrecognized key/);
  });

  it.each([0, -1, 0.5, Number.MAX_SAFE_INTEGER + 1, Number.NaN, Infinity, "2"])(
    "rejects unsafe or non-integer quantity %s without coercion",
    (quantity) => {
      const input = draft();
      Object.assign(input.items[0], { quantity });
      expect(() => parseDraft(input)).toThrow(/items\.0\.quantity/);
    },
  );

  it.each([1, 1000, Number.MAX_SAFE_INTEGER])(
    "accepts positive safe quantity %s without imposing a business cap",
    (quantity) => {
      const input = draft();
      input.items[0].quantity = quantity;
      expect(parseDraft(input).items[0].quantity).toBe(quantity);
    },
  );

  it("preserves a removed meal ID for visible correction", () => {
    const input = draft();
    input.items[0].mealId = "removed-meal";
    expect(parseDraft(input).items[0].mealId).toBe("removed-meal");
    expect(() => buildInquiryMessage(input)).toThrow(/Unknown meal ID "removed-meal"/);
  });

  it("preserves a removed plan ID for correction only when that purpose is active", () => {
    expect(parseDraft(draft({ planId: "removed-plan" })).planId).toBe("removed-plan");
    expect(() => buildInquiryMessage(draft({ planId: "removed-plan", purpose: "plan" }))).toThrow(/Unknown plan ID/);
    expect(buildInquiryMessage(draft({ planId: "removed-plan" }))).toContain("Meal inquiry");
  });

  it("requires a supported option for that particular meal", () => {
    const input = draft();
    input.items[0].option = "Toppings on the side";
    expect(parseDraft(input).items[0].option).toBe("Toppings on the side");
    expect(() => buildInquiryMessage(input)).toThrow(/Unsupported option/);
    input.items[0].mealId = "oats-berry-pot";
    expect(parseDraft(input).items[0].option).toBe("Toppings on the side");
    expect(buildInquiryMessage(input)).toContain("Toppings on the side");
  });

  it("rejects duplicate meal-option pairs rather than silently combining quantities", () => {
    const input = draft();
    input.items.push({ ...input.items[0], quantity: 3 });
    expect(() => parseDraft(input)).toThrow(/Duplicate selection/);
  });

  it("allows the same meal with different supported options", () => {
    const input = draft();
    input.items.push({ ...input.items[0], option: "Dressing on the side" });
    expect(parseDraft(input).items).toHaveLength(2);
  });

  it("rejects unsupported inquiry purposes", () => {
    expect(() => parseDraft({ ...draft(), purpose: "checkout" })).toThrow(/purpose/);
  });

  it.each(["", "2030-01-01", "2000-02-29", "2028-02-29", "0001-01-01", "9999-12-31"])(
    "accepts a structurally valid stored calendar date %s",
    (requestedDate) => {
      expect(parseDraft(draft({ requestedDate })).requestedDate).toBe(requestedDate);
    },
  );

  it.each([
    "2030-2-01",
    "2030-02-1",
    "2030-02-29",
    "1900-02-29",
    "2100-02-29",
    "2030-04-31",
    "2030-13-01",
    "2030-00-01",
    "2030-01-00",
    "0000-01-01",
    "2030-01-01T00:00:00Z",
    " 2030-01-01",
    "tomorrow",
  ])("rejects an invalid calendar date %s", (requestedDate) => {
    expect(() => parseDraft(draft({ requestedDate }))).toThrow(/valid YYYY-MM-DD/);
  });

  it.each(["", "1", "1000", String(Number.MAX_SAFE_INTEGER)])(
    "accepts a safe headcount string %s",
    (headcount) => {
      expect(parseDraft(draft({ headcount })).headcount).toBe(headcount);
    },
  );

  it.each(["0", "-1", "1.5", "1e3", "+1", "01", " 1", "1 ", "lots", "9007199254740992", 2])(
    "rejects a malformed headcount %s without coercion",
    (headcount) => {
      expect(() => parseDraft({ ...draft(), headcount })).toThrow(/headcount/);
    },
  );
});

describe("inquiry message generation", () => {
  it("includes each meal selection unambiguously without implying order acceptance", () => {
    const input = draft();
    input.items.push({
      mealId: "oats-berry-pot",
      quantity: 1,
      option: "Toppings on the side",
    });
    const message = buildInquiryMessage(input);
    expect(message).toContain("Hello Healthy Nation,");
    expect(message).toContain("Purpose: Meal inquiry");
    expect(message).toContain("Sample / preview catalog request");
    expect(message).toContain("not a paid or accepted order");
    expect(message).toContain(
      "Meal 1\nID: harissa-chicken-bowl\nName: Harissa chicken bowl\nOption: Standard\nQuantity: 2",
    );
    expect(message).toContain(
      "Meal 2\nID: oats-berry-pot\nName: Oats & berry pot\nOption: Toppings on the side\nQuantity: 1",
    );
    expect(message.match(/Unit price: Price to be confirmed/g)).toHaveLength(2);
    expect(message).toContain("availability");
    expect(message).toContain("delivery areas and charges");
    expect(message).toContain("final total");
    expect(message).toContain("how to complete");
    expect(message).toContain("illustrative and unverified");
  });

  it("validates input again at generation time", () => {
    const input = draft();
    input.items[0].quantity = -3;
    expect(() => buildInquiryMessage(input)).toThrow(/Quantity/);
  });

  it("rejects an empty meal inquiry with a useful error", () => {
    expect(() => buildInquiryMessage(draft({ items: [] }))).toThrow(/Choose at least one meal/);
  });

  it("rejects a plan inquiry without a selected plan", () => {
    expect(() => buildInquiryMessage(draft({ purpose: "plan" }))).toThrow(/Choose a plan/);
  });

  it("describes the chosen sample plan and omits stale meal selections", () => {
    const message = buildInquiryMessage(
      draft({ purpose: "plan", planId: "sample-weekday" }),
    );
    expect(message).toContain("Purpose: Meal plan inquiry");
    expect(message).toContain("ID: sample-weekday");
    expect(message).toContain("Name: The weekday rhythm");
    expect(message).toContain("5 meals over 5 days");
    expect(message).toContain("Plan price: Price to be confirmed");
    expect(message).not.toContain("harissa-chicken-bowl");
    expect(message).not.toContain("Quantity:");
  });

  it("omits a stale selected plan and headcount from a meal inquiry", () => {
    const message = buildInquiryMessage(draft({ planId: "sample-weekday", headcount: "20" }));
    expect(message).not.toContain("sample-weekday");
    expect(message).not.toContain("Selected plan");
    expect(message).not.toContain("headcount");
  });

  it.each(["catering", "general"] as const)(
    "allows %s without any meal or plan selections",
    (purpose) => {
      expect(buildInquiryMessage(draft({ purpose, items: [] }))).toContain(
        `Purpose: ${purpose === "catering" ? "Catering" : "General"} inquiry`,
      );
    },
  );

  it.each(["catering", "general"] as const)(
    "does not include stale meals or plans for %s",
    (purpose) => {
      const message = buildInquiryMessage(draft({ purpose, planId: "sample-weekday" }));
      expect(message).not.toContain("harissa-chicken-bowl");
      expect(message).not.toContain("sample-weekday");
      expect(message).not.toContain("Quantity:");
    },
  );

  it("includes requested catering headcount and date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2030, 0, 15, 12));
    const message = buildInquiryMessage(
      draft({ purpose: "catering", headcount: "50", requestedDate: "2030-01-20" }),
    );
    expect(message).toContain("Requested headcount: 50");
    expect(message).toContain("Requested date: 2030-01-20 (please confirm)");
  });

  it("omits irrelevant headcount and expired requested date from a general inquiry", () => {
    const message = buildInquiryMessage(
      draft({ purpose: "general", headcount: "50", requestedDate: "2000-01-01" }),
    );
    expect(message).not.toContain("headcount");
    expect(message).not.toContain("2000-01-01");
  });

  it.each(["meals", "plan", "catering"] as const)(
    "rejects a past requested date for %s only when generating",
    (purpose) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2030, 0, 15, 0, 1));
      const input = draft({ purpose, planId: "sample-weekday", requestedDate: "2030-01-14", planStartDate: "2030-01-14" });
      expect(parseDraft(input).requestedDate).toBe("2030-01-14");
      expect(() => buildInquiryMessage(input)).toThrow(/Requested (start )?date is in the past/);
    },
  );

  it.each(["2030-01-15", "2030-01-16"])(
    "accepts today and future local-calendar dates: %s",
    (requestedDate) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2030, 0, 15, 23, 59));
      expect(buildInquiryMessage(draft({ requestedDate }))).toContain(requestedDate);
    },
  );

  it("explicitly rejects unavailable meals at generation but keeps saved drafts parseable", () => {
    const meal = catalog.meals[0];
    const wasAvailable = meal.available;
    meal.available = false;
    try {
      expect(parseDraft(draft()).items).toHaveLength(1);
      expect(() => buildInquiryMessage(draft())).toThrow(
        /Harissa chicken bowl.*currently marked unavailable/,
      );
      expect(buildInquiryMessage(draft({ purpose: "general" }))).toContain("General inquiry");
      expect(buildInquiryMessage(draft({ purpose: "plan", planId: "sample-weekday" }))).toContain(
        "Selected plan",
      );
    } finally {
      meal.available = wasAvailable;
    }
  });

  it("does not mutate the draft or the empty template", () => {
    const input = draft();
    const original = structuredClone(input);
    buildInquiryMessage(input);
    expect(input).toEqual(original);
    expect(EMPTY_DRAFT.items).toEqual([]);
  });
});

describe("local calendar date helper", () => {
  it("uses local fields at both ends of a day rather than UTC serialization", () => {
    for (const hour of [0, 23]) {
      const date = new Date(2030, 0, 2, hour, 30);
      const utcSerialization = vi.spyOn(date, "toISOString");
      expect(getLocalCalendarDate(date)).toBe("2030-01-02");
      expect(utcSerialization).not.toHaveBeenCalled();
    }
  });

  it("uses the current local date when no reference date is supplied", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2032, 1, 29, 12));
    expect(getLocalCalendarDate()).toBe("2032-02-29");
  });

  it("rejects an invalid reference date", () => {
    expect(() => getLocalCalendarDate(new Date(Number.NaN))).toThrow(/valid local calendar date/);
  });
});

describe("WhatsApp configuration and URL encoding", () => {
  it.each([undefined, "", "   "])("returns null for an unconfigured phone %s", (phone) => {
    expect(getWhatsAppUrl(phone, "Hello")).toBeNull();
  });

  describe("versioned draft limits and purpose isolation", () => {
    it.each(["", "revision-1", "a".repeat(63), "z".repeat(64)])("rejects malformed catalog revision %s", (catalogRevision) => {
      expect(() => parseDraft(draft({ catalogRevision }))).toThrow(/catalogRevision/);
    });

    it("accepts a catalog revision independently of draft schema version", () => {
      expect(parseDraft(draft({ catalogRevision: "b".repeat(64) })).version).toBe(2);
    });

    it.each(["", "A Meal", "a".repeat(81), "../meal", "meal\nid"])("rejects malformed meal ID %s", (mealId) => {
      const input = draft();
      input.items[0].mealId = mealId;
      expect(() => parseDraft(input)).toThrow(/mealId/);
    });

    it.each(["", " ", "a".repeat(121), "Standard\nmedical notes", "Standard\u0000"])("rejects malformed option text", (option) => {
      const input = draft();
      input.items[0].option = option;
      expect(() => parseDraft(input)).toThrow(/option/);
    });

    it.each(["2030-02-30", "tomorrow", "2030-1-01"])("validates plan-start calendar shape %s", (planStartDate) => {
      expect(() => parseDraft(draft({ planStartDate }))).toThrow(/planStartDate/);
    });

    it.each(["general", "catering"] as const)("never includes dormant offers in %s messages", (purpose) => {
      const input = draft({
        purpose,
        planId: "removed-plan",
        items: [{ mealId: "removed-meal", quantity: 1, option: "Obsolete option" }],
        planStartDate: "2000-01-01",
        requestedDate: purpose === "general" ? "2000-01-01" : "",
      });
      const message = buildInquiryMessage(input);
      for (const forbidden of ["removed", "Obsolete", "2000", "Sample / preview", "illustrative", "Meal 1", "Selected plan"]) {
        expect(message).not.toContain(forbidden);
      }
      expect(message).toContain("not a paid or accepted order");
    });

    it("uses only the plan start date and describes all plan terms without quantities", () => {
      const input = draft({
        purpose: "plan", planId: "sample-weekday", planStartDate: "2030-01-16",
        requestedDate: "2000-01-01", headcount: "100",
        items: [{ mealId: "removed-meal", quantity: 1, option: "Removed option" }],
      });
      const message = buildInquiryMessage(input, catalog, NOW);
      expect(message).toContain("Requested start date: 2030-01-16");
      for (const label of ["Description:", "Delivery cadence:", "Meal choices:", "Delivery fees:", "Inclusions:"]) {
        expect(message).toContain(label);
      }
      for (const forbidden of ["Requested date:", "2000", "headcount", "Quantity:", "removed-meal"]) {
        expect(message).not.toContain(forbidden);
      }
    });

    it("ignores an expired plan date when the active purpose is meals", () => {
      const message = buildInquiryMessage(draft({ planStartDate: "2000-01-01", planId: "removed-plan" }));
      expect(message).not.toContain("2000");
      expect(message).not.toContain("removed-plan");
    });

    it("does not make verified-recipe claims for live offers", () => {
      const message = buildInquiryMessage(draft(), liveCatalog(), NOW);
      expect(message).not.toContain("illustrative and unverified");
      expect(message).not.toMatch(/(?:guaranteed|verified recipes)/i);
      expect(message).toContain("Please discuss ingredients, allergens, cross-contact");
    });
  });

  describe("single fail-closed WhatsApp handoff capability", () => {
    function decision(
      input: InquiryDraft,
      snapshot: PublicCatalog = catalog,
      contact: ContactSettings = approvedContact,
      fresh = true,
      now = NOW,
    ) {
      return getHandoffDecision(input, snapshot, contact, { fresh, now });
    }

    it.each(["general", "catering"] as const)("allows approved %s regardless of preview/freshness and dormant offers", (purpose) => {
      const input = draft({
        purpose, planId: "removed-plan", planStartDate: "2000-01-01",
        items: [{ mealId: "removed-meal", quantity: 1, option: "Old option" }],
      });
      const result = decision(input, catalog, { ...approvedContact, offerRequestsEnabled: false }, false);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeNull();
      expect(result.url).not.toBeNull();
      expect(new URL(result.url!).searchParams.get("text")).toBe(result.message);
      expect(result.message).not.toMatch(/removed|Sample|Old option/);
    });

    it.each(["meals", "plan"] as const)("blocks sample %s despite an approved phone and enabled offers", (purpose) => {
      const result = decision(draft({ purpose, planId: "sample-weekday", catalogRevision: catalog.publication.revision }));
      expect(result).toMatchObject({ allowed: false, url: null });
      expect(result.reason).toMatch(/Sample/);
      expect(result.message).toMatch(/Sample \/ preview/);
    });

    it.each(["general", "catering", "meals", "plan"] as const)("requires approved contact for %s", (purpose) => {
      const result = decision(draft({ purpose, planId: "sample-weekday" }), catalog, { ...approvedContact, approved: false });
      expect(result).toMatchObject({ allowed: false, url: null });
      expect(result.reason).toMatch(/contact has not been approved/);
    });

    it.each(["general", "catering"] as const)("requires the general-contact flag for %s", (purpose) => {
      const result = decision(draft({ purpose }), catalog, { ...approvedContact, generalInquiriesEnabled: false });
      expect(result).toMatchObject({ allowed: false, url: null });
      expect(result.reason).toMatch(/not enabled/);
    });

    it.each(["meals", "plan"] as const)("requires the offer flag for live %s", (purpose) => {
      const snapshot = liveCatalog();
      const result = decision(
        draft({ purpose, planId: "sample-weekday", catalogRevision: snapshot.publication.revision }),
        snapshot, { ...approvedContact, offerRequestsEnabled: false },
      );
      expect(result).toMatchObject({ allowed: false, url: null });
      expect(result.reason).toMatch(/Live meal and plan requests are not enabled/);
    });

    it.each(["meals", "plan"] as const)("allows a fresh, in-date approved live %s request", (purpose) => {
      const snapshot = liveCatalog();
      const result = decision(draft({ purpose, planId: "sample-weekday", catalogRevision: snapshot.publication.revision }), snapshot);
      expect(result.allowed).toBe(true);
      expect(result.url).toMatch(/^https:\/\/wa\.me\/12345678901\?text=/);
      expect(result.message).not.toContain("Sample / preview");
    });

    it.each([false, true])("blocks stale or mismatched live snapshots (fresh=%s)", (fresh) => {
      const snapshot = liveCatalog();
      const result = decision(draft({ catalogRevision: fresh ? "b".repeat(64) : snapshot.publication.revision }), snapshot, approvedContact, fresh);
      expect(result).toMatchObject({ allowed: false, url: null });
      expect(result.reason).toMatch(/Refresh the catalog and review/);
    });

    it("blocks a missing draft catalog revision", () => {
      expect(decision(draft(), liveCatalog()).allowed).toBe(false);
    });

    it.each(["2030-01-09T23:59:59.999Z", "2030-01-20T00:00:00.000Z", "2030-02-01T00:00:00Z"])(
      "blocks offers outside publication validity at %s", (time) => {
        const snapshot = liveCatalog();
        const result = decision(draft({ catalogRevision: snapshot.publication.revision }), snapshot, approvedContact, true, new Date(time));
        expect(result).toMatchObject({ allowed: false, url: null });
        expect(result.reason).toMatch(/availability window/);
      },
    );

    it("allows the inclusive start of a publication", () => {
      const snapshot = liveCatalog();
      const result = decision(draft({ catalogRevision: snapshot.publication.revision }), snapshot, approvedContact, true, new Date(snapshot.publication.validFrom!));
      expect(result.allowed).toBe(true);
    });

    it.each(["validFrom", "validUntil"] as const)("blocks absent live %s at the final boundary", (field) => {
      const snapshot = liveCatalog();
      snapshot.publication[field] = null;
      expect(decision(draft({ catalogRevision: snapshot.publication.revision }), snapshot).url).toBeNull();
    });

    it("blocks a malformed clock without generating a URL", () => {
      const snapshot = liveCatalog();
      expect(decision(draft({ catalogRevision: snapshot.publication.revision }), snapshot, approvedContact, true, new Date(NaN)).allowed).toBe(false);
    });

    it.each(["isSample", "price"] as const)("blocks a selected sample/unpriced meal in a mixed snapshot (%s)", (field) => {
      const snapshot = liveCatalog();
      if (field === "isSample") snapshot.meals[0].isSample = true;
      else snapshot.meals[0].price = null;
      expect(decision(draft({ catalogRevision: snapshot.publication.revision }), snapshot).url).toBeNull();
    });

    it("blocks an unavailable active meal but not dormant selections in a plan inquiry", () => {
      const snapshot = liveCatalog();
      snapshot.meals[0].available = false;
      const input = draft({ catalogRevision: snapshot.publication.revision });
      expect(decision(input, snapshot).reason).toMatch(/unavailable/);
      expect(decision({ ...input, purpose: "plan", planId: "sample-weekday" }, snapshot).allowed).toBe(true);
    });

    it.each(["", "+12345678901", "0123456789"])("fails closed for missing or invalid phone %s", (phoneNumber) => {
      const result = decision(draft({ purpose: "general" }), catalog, { ...approvedContact, phoneNumber });
      expect(result).toMatchObject({ allowed: false, url: null });
      expect(result.reason).toMatch(/missing|Invalid WhatsApp phone/);
      expect(result.message).toContain("General inquiry");
    });

    it("surfaces invalid requests instead of returning an apparently successful draft", () => {
      const result = decision(draft({ items: [] }));
      expect(result).toMatchObject({ allowed: false, url: null, message: "" });
      expect(result.reason).toMatch(/Choose at least one meal/);
    });

    it("blocks an expired active date but ignores dormant dates", () => {
      expect(decision(draft({ purpose: "catering", requestedDate: "2000-01-01" })).reason).toMatch(/past/);
      expect(decision(draft({ purpose: "general", requestedDate: "2000-01-01" })).allowed).toBe(true);
    });

    it("keeps overlong reviewed messages available without silently truncating or linking", () => {
      const snapshot = liveCatalog();
      snapshot.meals[0].name = "🥗".repeat(1000);
      const result = decision(draft({ catalogRevision: snapshot.publication.revision }), snapshot);
      expect(result).toMatchObject({ allowed: false, url: null });
      expect(result.reason).toMatch(/too long.*Copy/);
      expect(result.message).toContain("🥗".repeat(1000));
    });
  });

  describe("catalog reconciliation without silent selection loss", () => {
    function snapshots() {
      const previous = liveCatalog();
      const current = structuredClone(previous);
      current.publication.revision = "b".repeat(64);
      const input = draft({
        catalogRevision: previous.publication.revision,
        items: [
          { mealId: previous.meals[0].id, quantity: 2, option: "Standard" },
          { mealId: previous.meals[1].id, quantity: 1, option: "Standard" },
        ],
        planId: previous.plans[0].id,
      });
      return { previous, current, input };
    }

    it("updates only the revision when selected terms are unchanged", () => {
      const { previous, current, input } = snapshots();
      current.faqs[0].answer = "Updated general FAQ";
      const result = reconcileDraft(input, previous, current);
      expect(result).toMatchObject({ needsReview: false, issues: [] });
      expect(result.draft).toEqual({ ...input, catalogRevision: current.publication.revision });
      expect(input.catalogRevision).toBe(previous.publication.revision);
      expect(result.draft.items).not.toBe(input.items);
    });

    it("preserves removed and unaffected selections and blocks the stale active row", () => {
      const { previous, current, input } = snapshots();
      current.meals = current.meals.slice(1);
      const result = reconcileDraft(input, previous, current);
      expect(result.draft.items).toEqual(input.items);
      expect(result.needsReview).toBe(true);
      expect(result.issues.join(" ")).toMatch(/Harissa chicken bowl.*removed/);
      expect(() => buildInquiryMessage(result.draft, current, NOW)).toThrow(/Unknown meal ID/);
    });

    it("preserves and reports unavailable meals and unsupported options", () => {
      const { previous, current, input } = snapshots();
      current.meals[0].available = false;
      current.meals[1].options = ["Dressing on the side"];
      const result = reconcileDraft(input, previous, current);
      expect(result.draft.items).toEqual(input.items);
      expect(result.issues.join(" ")).toMatch(/unavailable/);
      expect(result.issues.join(" ")).toMatch(/no longer supports/);
      expect(getHandoffDecision(result.draft, current, approvedContact, { fresh: true, now: NOW }).allowed).toBe(false);
    });

    it.each(["price", "portion", "allergens", "options"] as const)("requires review after meal %s changes", (field) => {
      const { previous, current, input } = snapshots();
      if (field === "price") current.meals[0].price = 150;
      if (field === "portion") current.meals[0].portion = "Updated portion";
      if (field === "allergens") current.meals[0].allergens = ["Updated allergen information"];
      if (field === "options") current.meals[0].options.push("New option");
      const result = reconcileDraft(input, previous, current);
      expect(result.needsReview).toBe(true);
      expect(result.issues.join(" ")).toMatch(/current terms/);
      expect(result.draft.items).toEqual(input.items);
    });

    it.each(["price", "deliverySchedule", "choicePolicy", "deliveryFees"] as const)("requires review after plan %s changes", (field) => {
      const { previous, current, input } = snapshots();
      if (field === "price") current.plans[0].price = 200;
      else current.plans[0][field] = "Updated terms";
      const result = reconcileDraft(input, previous, current);
      expect(result.needsReview).toBe(true);
      expect(result.issues.join(" ")).toMatch(/current plan/);
      expect(result.draft.planId).toBe(input.planId);
    });

    it("keeps a removed plan selected so the user can see and correct it", () => {
      const { previous, current, input } = snapshots();
      current.plans = current.plans.slice(1);
      const result = reconcileDraft({ ...input, purpose: "plan" }, previous, current);
      expect(result.draft.planId).toBe(input.planId);
      expect(result.issues.join(" ")).toMatch(/removed/);
      expect(() => buildInquiryMessage(result.draft, current, NOW)).toThrow(/Unknown plan/);
    });

    it("requires review after publication validity or status changes", () => {
      const { previous, current, input } = snapshots();
      current.publication.validUntil = "2030-01-21T00:00:00Z";
      expect(reconcileDraft(input, previous, current).issues.join(" ")).toMatch(/validity window changed/);
      current.publication.validUntil = previous.publication.validUntil;
      current.isPreview = true;
      expect(reconcileDraft(input, previous, current).needsReview).toBe(true);
    });

    it("does not mistake an unknown source revision for a successfully checked previous snapshot", () => {
      const { previous, current, input } = snapshots();
      input.catalogRevision = "c".repeat(64);
      expect(reconcileDraft(input, previous, current).issues.join(" ")).toMatch(/different catalog/);
    });

    it("requires review for existing selections without an originating revision", () => {
      const { previous, current, input } = snapshots();
      input.catalogRevision = null;
      expect(reconcileDraft(input, previous, current).needsReview).toBe(true);
      expect(reconcileDraft(EMPTY_DRAFT, previous, current).needsReview).toBe(false);
    });

    it("preserves optional dates, purpose and headcount", () => {
      const { previous, current, input } = snapshots();
      Object.assign(input, { requestedDate: "2030-01-16", planStartDate: "2030-01-17", purpose: "catering", headcount: "25" });
      const result = reconcileDraft(input, previous, current);
      expect(result.draft).toEqual({ ...input, catalogRevision: current.publication.revision });
    });
  });

  it("encodes ampersands, newlines, unicode and URL metacharacters exactly once", () => {
    const message = "Healthy Nation\nOats & berries + paneer? नमस्ते 🥗 #preview";
    const url = getWhatsAppUrl("12345678901", message);
    expect(url).toBe(`https://wa.me/12345678901?text=${encodeURIComponent(message)}`);
    const parsed = new URL(url!);
    expect(parsed.searchParams.get("text")).toBe(message);
    expect([...parsed.searchParams.keys()]).toEqual(["text"]);
    expect(parsed.protocol).toBe("https:");
    expect(parsed.hostname).toBe("wa.me");
  });

  it.each([
    "+12345678901",
    "0123456789",
    "123 456 7890",
    "123-456-7890",
    "(123)4567890",
    "123456",
    "1234567890123456",
    " 12345678901",
    "12345678901 ",
    "not-configured",
    "https://example.test",
    "1234567?text=override",
    "１２３４５６７８９",
  ])("rejects malformed nonempty phone configuration %s", (phone) => {
    expect(() => getWhatsAppUrl(phone, "Hello")).toThrow(/Invalid WhatsApp phone configuration/);
  });
});
