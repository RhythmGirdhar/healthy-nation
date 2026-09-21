import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublicCatalog } from "@/lib/catalog";
import { MenuBrowser, MenuFallback } from "@/components/menu-browser";

export const metadata: Metadata = { title: "The menu", description: "Browse Healthy Nation's menu and listed prices. Choose dishes and prepare an order request on WhatsApp." };

export default function MenuPage() {
  const catalog = getPublicCatalog();
  return <div className="container menu-page">
    <header className="menu-intro"><span className="eyebrow">{catalog.isPreview ? "Sample dishes" : "Healthy Nation menu"}</span><h1>Menu</h1><p>Search dishes or filter by category and the menu&apos;s dietary labels.</p><p className="service-context">{catalog.isPreview ? "Sample dishes, not available offers. " : "Prices from the supplied online menu. "}Availability, delivery area, and ordering windows must be confirmed with the team.</p></header>
    <Suspense fallback={<MenuFallback meals={catalog.meals} />}><MenuBrowser meals={catalog.meals} /></Suspense>
    <p className="small-note section-note">Veg/non-veg labels follow the supplied menu; unlabeled items are marked &quot;Not specified&quot;. Ingredients, allergens, serving sizes, and nutrition were not listed. Confirm these details before ordering.</p>
  </div>;
}
