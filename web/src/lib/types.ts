export type Meal = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: "Bowls" | "Wraps" | "Breakfast";
  diet: "Vegetarian" | "Plant-based" | "Non-vegetarian";
  ingredients: string[];
  allergens: string[];
  tags: string[];
  options: string[];
  featured: boolean;
  available: boolean;
  price: number | null;
  currency: "INR";
  portion: string;
  accent: "sage" | "peach" | "lilac" | "gold";
  art: "bowl" | "wrap" | "oats";
  image: { src: string; alt: string; kind: "illustration" | "photo" };
  isSample: boolean;
};

export type MealPlan = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  meals: number;
  days: number;
  price: number | null;
  inclusions: string[];
  deliverySchedule: string;
  choicePolicy: string;
  deliveryFees: string;
  featured: boolean;
  isSample: boolean;
};

export type CatalogContent = {
  isPreview: boolean;
  meals: Meal[];
  plans: MealPlan[];
  weeklyMenu: {
    label: string;
    isSample: boolean;
    days: { day: string; mealId: string }[];
  };
  faqs: { id: string; question: string; answer: string }[];
  publication: {
    publishedAt: string;
    validFrom: string | null;
    validUntil: string | null;
  };
};

export type PublicCatalog = Omit<CatalogContent, "publication"> & {
  schemaVersion: 1;
  publication: CatalogContent["publication"] & { revision: string };
};

export type InquiryPurpose = "meals" | "plan" | "catering" | "general";

export type DraftItem = {
  mealId: string;
  quantity: number;
  option: string;
};

export type InquiryDraft = {
  version: 2;
  catalogRevision: string | null;
  items: DraftItem[];
  planId: string | null;
  requestedDate: string;
  planStartDate: string;
  purpose: InquiryPurpose;
  headcount: string;
};

export type ContactSettings = {
  phoneNumber: string;
  approved: boolean;
  generalInquiriesEnabled: boolean;
  offerRequestsEnabled: boolean;
};

export type HandoffDecision = {
  allowed: boolean;
  message: string;
  url: string | null;
  reason: string | null;
};

export type Reconciliation = {
  draft: InquiryDraft;
  issues: string[];
  needsReview: boolean;
};
