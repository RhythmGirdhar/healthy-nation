import { afterEach, describe, expect, it, vi } from "vitest";
import { catalog } from "@/lib/catalog";
import {
  buildInquiryMessage,
  EMPTY_DRAFT,
  getLocalCalendarDate,
  getWhatsAppUrl,
  parseDraft,
  type InquiryDraft,
} from "@/lib/inquiry";

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
      version: 1,
      items: [],
      planId: null,
      requestedDate: "",
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
    expect(() => parseDraft({ ...draft(), version: 2 })).toThrow(/version/);
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

  it("rejects a removed meal ID", () => {
    const input = draft();
    input.items[0].mealId = "removed-meal";
    expect(() => parseDraft(input)).toThrow(/Unknown meal ID "removed-meal"/);
  });

  it("rejects a removed plan ID", () => {
    expect(() => parseDraft(draft({ planId: "removed-plan" }))).toThrow(
      /Unknown plan ID "removed-plan"/,
    );
  });

  it("requires a supported option for that particular meal", () => {
    const input = draft();
    input.items[0].option = "Toppings on the side";
    expect(() => parseDraft(input)).toThrow(/Unsupported option/);
    input.items[0].mealId = "oats-berry-pot";
    expect(parseDraft(input).items[0].option).toBe("Toppings on the side");
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
    expect(message).toContain("Name: Sample weekday");
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
      const input = draft({ purpose, planId: "sample-weekday", requestedDate: "2030-01-14" });
      expect(parseDraft(input).requestedDate).toBe("2030-01-14");
      expect(() => buildInquiryMessage(input)).toThrow(/Requested date is in the past/);
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
