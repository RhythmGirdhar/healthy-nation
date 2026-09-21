import { formatPrice } from "@/lib/format";
import {
  array, choice, identifier, isCalendarDate, isUtcTimestamp, positiveInteger, record, REVISION, text,
} from "@/lib/domain-validation";
import type {
  ContactSettings, HandoffDecision, InquiryDraft, InquiryPurpose, Meal, MealPlan,
  PublicCatalog, Reconciliation,
} from "@/lib/types";

export type { InquiryDraft, InquiryPurpose } from "@/lib/types";

export const EMPTY_DRAFT: InquiryDraft = {
  version: 2,
  catalogRevision: null,
  items: [],
  planId: null,
  requestedDate: "",
  planStartDate: "",
  purpose: "meals",
  headcount: "",
};

function calendarDate(input: unknown, path: string): string {
  if (typeof input !== "string" || (input !== "" && !isCalendarDate(input))) {
    throw new Error(`${path}: Use an empty value or a valid YYYY-MM-DD calendar date`);
  }
  return input;
}

export function parseDraft(input: unknown): InquiryDraft {
  try {
    const value = record(input, "draft", [
      "version", "catalogRevision", "items", "planId", "requestedDate", "planStartDate", "purpose", "headcount",
    ]);
    if (value.version !== 2) throw new Error("version: Unsupported draft version; start a new request");
    let catalogRevision: string | null = null;
    if (value.catalogRevision !== null) {
      catalogRevision = text(value.catalogRevision, "catalogRevision", 64);
      if (!REVISION.test(catalogRevision)) throw new Error("catalogRevision: Expected a SHA256 catalog revision");
    }
    const items = array(value.items, "items", (entry, path) => {
      const item = record(entry, path, ["mealId", "quantity", "option"]);
      return {
        mealId: identifier(item.mealId, `${path}.mealId`),
        quantity: positiveInteger(item.quantity, `${path}.quantity`),
        option: text(item.option, `${path}.option`, 120),
      };
    });
    const keys = new Set<string>();
    for (const item of items) {
      const key = JSON.stringify([item.mealId, item.option]);
      if (keys.has(key)) throw new Error(`items: Duplicate selection for "${item.mealId}" and option "${item.option}"`);
      keys.add(key);
    }
    if (
      typeof value.headcount !== "string" ||
      (value.headcount !== "" && (!/^[1-9]\d{0,15}$/.test(value.headcount) || !Number.isSafeInteger(Number(value.headcount))))
    ) {
      throw new Error("headcount: Use an empty value or a positive safe integer string");
    }
    return {
      version: 2,
      catalogRevision,
      items,
      planId: value.planId === null ? null : identifier(value.planId, "planId"),
      requestedDate: calendarDate(value.requestedDate, "requestedDate"),
      planStartDate: calendarDate(value.planStartDate, "planStartDate"),
      purpose: choice(value.purpose, "purpose", ["meals", "plan", "catering", "general"]),
      headcount: value.headcount,
    };
  } catch (error) {
    throw new Error(`Invalid inquiry draft: ${error instanceof Error ? error.message : "Start a new request"}`);
  }
}

// Date-only requests use the customer's calendar, not UTC serialization.
export function getLocalCalendarDate(now: Date = new Date()): string {
  if (!Number.isFinite(now.getTime()) || now.getFullYear() < 1 || now.getFullYear() > 9999) {
    throw new Error("Cannot determine a valid local calendar date");
  }
  return [
    String(now.getFullYear()).padStart(4, "0"),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

const purposeLabels: Record<InquiryPurpose, string> = {
  meals: "Meal inquiry", plan: "Meal plan inquiry", catering: "Catering inquiry", general: "General inquiry",
};

function selectedMeals(draft: InquiryDraft, snapshot: PublicCatalog): { meal: Meal; quantity: number; option: string }[] {
  if (draft.items.length === 0) throw new Error("Choose at least one meal before preparing a meal inquiry");
  return draft.items.map((item) => {
    const meal = snapshot.meals.find((entry) => entry.id === item.mealId);
    if (!meal) throw new Error(`Unknown meal ID "${item.mealId}"; remove this stale selection or choose a current meal`);
    if (meal.available !== true) {
      throw new Error(`"${meal.name}" (${meal.id}) is currently marked unavailable. Remove it or ask about availability in a general inquiry.`);
    }
    if (!meal.options.includes(item.option)) {
      throw new Error(`Unsupported option "${item.option}" for "${meal.name}"; choose a current option`);
    }
    return { meal, quantity: item.quantity, option: item.option };
  });
}

function selectedPlan(draft: InquiryDraft, snapshot: PublicCatalog): MealPlan {
  if (draft.planId === null) throw new Error("Choose a plan before preparing a meal plan inquiry");
  const plan = snapshot.plans.find((entry) => entry.id === draft.planId);
  if (!plan) throw new Error(`Unknown plan ID "${draft.planId}"; choose a current plan`);
  return plan;
}

export function buildInquiryMessage(input: InquiryDraft, snapshot: PublicCatalog, now: Date = new Date()): string {
  const draft = parseDraft(input);
  const meals = draft.purpose === "meals" ? selectedMeals(draft, snapshot) : [];
  const plan = draft.purpose === "plan" ? selectedPlan(draft, snapshot) : null;
  const activeDate = draft.purpose === "plan" ? draft.planStartDate : draft.purpose === "general" ? "" : draft.requestedDate;
  const dateLabel = draft.purpose === "plan" ? "Requested start date" : "Requested date";
  if (activeDate && activeDate < getLocalCalendarDate(now)) {
    throw new Error(`${dateLabel} is in the past; choose today or a future date`);
  }
  const sample = (draft.purpose === "meals" || draft.purpose === "plan") &&
    (snapshot.isPreview || meals.some(({ meal }) => meal.isSample) || plan?.isSample);
  const lines = ["Hello Healthy Nation,", "", `Purpose: ${purposeLabels[draft.purpose]}`];
  if (sample) lines.push("Sample / preview catalog request — these are illustrative concepts, not live offers.");
  lines.push("This is an inquiry, not a paid or accepted order.");
  meals.forEach(({ meal, quantity, option }, index) => {
    lines.push("", `Meal ${index + 1}`, `ID: ${meal.id}`, `Name: ${meal.name}`,
      `Option: ${option}`, `Quantity: ${quantity}`, `Unit price: ${formatPrice(meal.price)}`);
  });
  if (plan) {
    lines.push("", "Selected plan", `ID: ${plan.id}`, `Name: ${plan.name}`,
      `Description: ${plan.description}`,
      `${sample ? "Illustrative schedule" : "Plan schedule"}: ${plan.meals} meals over ${plan.days} days; please confirm.`,
      `Delivery cadence: ${plan.deliverySchedule}`, `Meal choices: ${plan.choicePolicy}`,
      `Delivery fees: ${plan.deliveryFees}`, `Inclusions: ${plan.inclusions.join("; ")}`,
      `Plan price: ${formatPrice(plan.price)}`);
  }
  if (draft.purpose === "general") lines.push("", "I would like to learn about your current menu and how to inquire.");
  if (draft.purpose === "catering") {
    lines.push("", "I would like to discuss whether catering is available for my event.");
    if (draft.headcount) lines.push(`Requested headcount: ${draft.headcount}`);
  }
  if (activeDate) lines.push("", `${dateLabel}: ${activeDate} (please confirm)`);
  lines.push("", "Please confirm availability, delivery areas and charges, the final total, and how to complete this request.");
  if (sample) lines.push("Preview ingredients, allergens and portions are illustrative and unverified; please confirm actual food information with the team.");
  else lines.push("Please discuss ingredients, allergens, cross-contact and any requirements with the team before confirming.");
  return lines.join("\n");
}

export function getWhatsAppUrl(phone: string | undefined, message: string): string | null {
  if (phone === undefined || phone.trim() === "") return null;
  if (!/^[1-9]\d{6,14}$/.test(phone)) {
    throw new Error("Invalid WhatsApp phone configuration: use 7–15 international digits including the country code, without +, spaces or punctuation");
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function getHandoffDecision(
  input: InquiryDraft,
  snapshot: PublicCatalog,
  contact: ContactSettings,
  options: { fresh: boolean; now?: Date },
): HandoffDecision {
  let message = "";
  const blocked = (reason: string): HandoffDecision => ({ allowed: false, message, url: null, reason });
  try {
    const draft = parseDraft(input);
    const now = options.now ?? new Date();
    message = buildInquiryMessage(draft, snapshot, now);
    if (contact.approved !== true) return blocked("The business contact has not been approved. Keep this request for later.");
    if (draft.purpose === "general" || draft.purpose === "catering") {
      if (contact.generalInquiriesEnabled !== true) return blocked("General and catering inquiries are not enabled yet.");
    } else {
      if (contact.offerRequestsEnabled !== true) return blocked("Live meal and plan requests are not enabled. You can still ask a general question.");
      if (snapshot.schemaVersion !== 1) return blocked("This catalog version is unsupported. Refresh the page before requesting an offer.");
      if (snapshot.isPreview !== false || (draft.purpose === "meals"
        ? selectedMeals(draft, snapshot).some(({ meal }) => meal.isSample !== false || meal.price === null)
        : selectedPlan(draft, snapshot).isSample !== false || selectedPlan(draft, snapshot).price === null)) {
        return blocked("Sample or unpriced offers are preview-only. Choose an approved live offer or ask a general question.");
      }
      if (options.fresh !== true || draft.catalogRevision !== snapshot.publication.revision) {
        return blocked("Refresh the catalog and review this request before opening WhatsApp.");
      }
      const { publishedAt, validFrom, validUntil } = snapshot.publication;
      if (
        !Number.isFinite(now.getTime()) || !isUtcTimestamp(publishedAt) ||
        validFrom === null || validUntil === null || !isUtcTimestamp(validFrom) || !isUtcTimestamp(validUntil) ||
        Date.parse(publishedAt) > Date.parse(validFrom) || Date.parse(validFrom) >= Date.parse(validUntil) ||
        now.getTime() < Date.parse(validFrom) || now.getTime() >= Date.parse(validUntil)
      ) {
        return blocked("This menu is not within its published availability window. Refresh it or ask a general question.");
      }
    }
    const url = getWhatsAppUrl(contact.phoneNumber, message);
    if (url === null) return blocked("The WhatsApp contact number is missing. Keep the request and try again once contact is configured.");
    if (url.length > 8000) return blocked("This request is too long for a reliable WhatsApp link. Copy the reviewed message instead.");
    return { allowed: true, message, url, reason: null };
  } catch (error) {
    return blocked(error instanceof Error ? error.message : "The request could not be prepared. Review the selected items and try again.");
  }
}

export function reconcileDraft(input: InquiryDraft, previous: PublicCatalog, current: PublicCatalog): Reconciliation {
  const draft = parseDraft(input);
  const issues: string[] = [];
  if ((draft.items.length > 0 || draft.planId !== null) && draft.catalogRevision !== previous.publication.revision) {
    issues.push("The saved request came from a different catalog. Review all selections against the refreshed menu.");
  }
  for (const item of draft.items) {
    const before = previous.meals.find((meal) => meal.id === item.mealId);
    const after = current.meals.find((meal) => meal.id === item.mealId);
    if (!after) {
      issues.push(`"${before?.name ?? item.mealId}" was removed. Remove this selection or choose a current meal.`);
      continue;
    }
    if (!after.available) issues.push(`"${after.name}" is unavailable. Remove it or ask a general question.`);
    if (!after.options.includes(item.option)) issues.push(`"${after.name}" no longer supports "${item.option}". Choose a current option.`);
    if (!before) issues.push(`Review the current details for "${after.name}"; the previous catalog did not contain this meal.`);
    else {
      const terms = (meal: Meal) => ({
        name: meal.name, description: meal.description, price: meal.price, currency: meal.currency,
        ingredients: meal.ingredients, allergens: meal.allergens, portion: meal.portion, diet: meal.diet,
        options: meal.options, isSample: meal.isSample, available: meal.available,
      });
      if (JSON.stringify(terms(before)) !== JSON.stringify(terms(after))) {
        issues.push(`The price, options or food details for "${after.name}" changed. Review the current terms.`);
      }
    }
  }
  if (draft.planId !== null) {
    const before = previous.plans.find((plan) => plan.id === draft.planId);
    const after = current.plans.find((plan) => plan.id === draft.planId);
    if (!after) issues.push(`"${before?.name ?? draft.planId}" was removed. Choose a current plan.`);
    else if (!before || JSON.stringify(before) !== JSON.stringify(after)) {
      issues.push(`The price, cadence, choices or terms for "${after.name}" changed. Review the current plan.`);
    }
  }
  if (
    previous.isPreview !== current.isPreview ||
    previous.publication.validFrom !== current.publication.validFrom ||
    previous.publication.validUntil !== current.publication.validUntil
  ) {
    issues.push("The catalog's publication status or validity window changed. Review availability before continuing.");
  }
  return {
    draft: { ...draft, catalogRevision: current.publication.revision },
    issues: [...new Set(issues)],
    needsReview: issues.length > 0,
  };
}
