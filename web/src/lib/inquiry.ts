import { z } from "zod";
import { catalog, formatPrice } from "@/lib/catalog";

export type InquiryPurpose = "meals" | "plan" | "catering" | "general";
export type InquiryDraft = {
  version: 1;
  items: { mealId: string; quantity: number; option: string }[];
  planId: string | null;
  requestedDate: string;
  purpose: InquiryPurpose;
  headcount: string;
};

export const EMPTY_DRAFT: InquiryDraft = {
  version: 1,
  items: [],
  planId: null,
  requestedDate: "",
  purpose: "meals",
  headcount: "",
};

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

const draftSchema = z
  .strictObject({
    version: z.literal(1),
    items: z.array(
      z.strictObject({
        mealId: z.string().min(1),
        quantity: z.number().refine(
          (value) => Number.isSafeInteger(value) && value > 0,
          "Quantity must be a positive safe integer",
        ),
        option: z.string().min(1),
      }),
    ),
    planId: z.string().min(1).nullable(),
    requestedDate: z.string().refine(
      (value) => value === "" || isCalendarDate(value),
      "Requested date must be empty or a valid YYYY-MM-DD calendar date",
    ),
    purpose: z.enum(["meals", "plan", "catering", "general"]),
    headcount: z.string().refine(
      (value) =>
        value === "" ||
        (/^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value))),
      "Headcount must be empty or a positive safe integer string",
    ),
  })
  .superRefine((draft, context) => {
    const selections = new Set<string>();
    draft.items.forEach((item, index) => {
      const meal = catalog.meals.find((entry) => entry.id === item.mealId);
      if (!meal) {
        context.addIssue({
          code: "custom",
          path: ["items", index, "mealId"],
          message: `Unknown meal ID "${item.mealId}"; remove this stale selection`,
        });
      } else if (!meal.options.includes(item.option)) {
        context.addIssue({
          code: "custom",
          path: ["items", index, "option"],
          message: `Unsupported option "${item.option}" for "${meal.name}"; choose a current option`,
        });
      }
      const key = JSON.stringify([item.mealId, item.option]);
      if (selections.has(key)) {
        context.addIssue({
          code: "custom",
          path: ["items", index],
          message: `Duplicate selection for "${item.mealId}" and option "${item.option}"`,
        });
      }
      selections.add(key);
    });
    if (draft.planId !== null && !catalog.plans.some((plan) => plan.id === draft.planId)) {
      context.addIssue({
        code: "custom",
        path: ["planId"],
        message: `Unknown plan ID "${draft.planId}"; choose a current plan`,
      });
    }
  });

export function parseDraft(input: unknown): InquiryDraft {
  const result = draftSchema.safeParse(input);
  if (!result.success) {
    throw new Error(
      `Invalid inquiry draft: ${result.error.issues
        .map((issue) => `${issue.path.join(".") || "draft"}: ${issue.message}`)
        .join("; ")}`,
    );
  }
  return result.data;
}

// Local calendar dates avoid shifting a user's requested day through UTC.
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
  meals: "Meal inquiry",
  plan: "Meal plan inquiry",
  catering: "Catering inquiry",
  general: "General inquiry",
};

export function buildInquiryMessage(input: InquiryDraft): string {
  const draft = parseDraft(input);
  if (draft.purpose === "meals" && draft.items.length === 0) {
    throw new Error("Choose at least one meal before preparing a meal inquiry");
  }
  if (draft.purpose === "plan" && draft.planId === null) {
    throw new Error("Choose a plan before preparing a meal plan inquiry");
  }

  const includesDate = draft.purpose !== "general" && draft.requestedDate !== "";
  if (includesDate && draft.requestedDate < getLocalCalendarDate()) {
    throw new Error("Requested date is in the past; choose today or a future date");
  }

  const items = draft.purpose === "meals" ? draft.items : [];
  const plan =
    draft.purpose === "plan"
      ? catalog.plans.find((entry) => entry.id === draft.planId)
      : undefined;
  const isSample =
    catalog.isPreview ||
    plan?.isSample ||
    items.some((item) => catalog.meals.find((meal) => meal.id === item.mealId)?.isSample);

  const lines = ["Hello Healthy Nation,", "", `Purpose: ${purposeLabels[draft.purpose]}`];
  if (isSample) {
    lines.push("Sample / preview catalog request — these are illustrative concepts, not live offers.");
  }
  lines.push("This is an inquiry, not a paid or accepted order.");

  items.forEach((item, index) => {
    const meal = catalog.meals.find((entry) => entry.id === item.mealId)!;
    if (!meal.available) {
      throw new Error(
        `"${meal.name}" (${meal.id}) is currently marked unavailable. Remove it or ask the team about availability in a general inquiry.`,
      );
    }
    lines.push(
      "",
      `Meal ${index + 1}`,
      `ID: ${meal.id}`,
      `Name: ${meal.name}`,
      `Option: ${item.option}`,
      `Quantity: ${item.quantity}`,
      `Unit price: ${formatPrice(meal.price)}`,
    );
  });

  if (plan) {
    lines.push(
      "",
      "Selected plan",
      `ID: ${plan.id}`,
      `Name: ${plan.name}`,
      `Illustrative schedule: ${plan.meals} meals over ${plan.days} days; please confirm.`,
      `Plan price: ${formatPrice(plan.price)}`,
    );
  }
  if (includesDate) lines.push("", `Requested date: ${draft.requestedDate} (please confirm)`);
  if (draft.purpose === "catering" && draft.headcount !== "") {
    lines.push(`Requested headcount: ${draft.headcount}`);
  }
  lines.push(
    "",
    "Please confirm availability, delivery areas and charges, the final total, and how to complete this request.",
    "Please confirm actual ingredients, allergens, cross-contact and portions; the preview details are illustrative and unverified.",
  );
  return lines.join("\n");
}

export function getWhatsAppUrl(phone: string | undefined, message: string): string | null {
  if (phone === undefined || phone.trim() === "") return null;
  if (!/^[1-9]\d{6,14}$/.test(phone)) {
    throw new Error(
      "Invalid WhatsApp phone configuration: use 7–15 international digits including the country code, without +, spaces or punctuation",
    );
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
