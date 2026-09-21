import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublicCatalog } from "@/lib/catalog";
import { MenuBrowser, MenuFallback } from "@/components/menu-browser";

export const metadata: Metadata = { title: "The menu", description: "Explore Healthy Nation meal ideas by ingredient, dietary direction, and category. Sample prices and portions remain to be confirmed." };

export default function MenuPage() {
  const catalog = getPublicCatalog();
  return <div className="container menu-page">
    <header className="menu-intro"><span className="eyebrow">{catalog.isPreview ? "Sample dishes" : "Individual meals"}</span><h1>Menu</h1><p>Search by ingredient or filter by diet and meal category.</p><p className="service-context">{catalog.isPreview ? "Sample dishes, not available offers. " : ""}Delivery area & ordering windows: to be confirmed.</p></header>
    <Suspense fallback={<MenuFallback meals={catalog.meals} />}><MenuBrowser meals={catalog.meals} /></Suspense>
    <p className="small-note section-note">Dietary categories describe recipe direction, not verified suitability. Confirm ingredients, allergens, portions, and nutrition before deciding what works for you.</p>
  </div>;
}
