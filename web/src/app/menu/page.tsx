import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublicCatalog } from "@/lib/catalog";
import { MenuBrowser, MenuFallback } from "@/components/menu-browser";
import { WhatsAppLink, DELIVERY_INQUIRY } from "@/components/whatsapp-link";

export const metadata: Metadata = { title: "The menu", description: "Browse Healthy Nation's menu and listed prices. Choose dishes and prepare an order request on WhatsApp." };

export default function MenuPage() {
  const catalog = getPublicCatalog();
  return <div className="container menu-page">
    <header className="menu-intro"><span className="eyebrow">{catalog.isPreview ? "Sample dishes" : "Healthy Nation menu"}</span><h1>Find your next meal.</h1><p>Search dishes, choose a category, or add a favorite straight to your request.</p><p className="service-context">{catalog.isPreview ? "Sample dishes, not available offers. " : "Listed prices are shown below. "}Confirm availability, delivery timing and charges with the team. Dish images marked as examples are not confirmed matches.</p><WhatsAppLink message={DELIVERY_INQUIRY} className="text-link">Check delivery availability</WhatsAppLink></header>
    <Suspense fallback={<MenuFallback meals={catalog.meals} />}><MenuBrowser meals={catalog.meals} /></Suspense>
    <p className="small-note section-note">Veg/non-veg labels follow the supplied menu; unlabeled items are marked &quot;Not specified&quot;. Ingredients, allergens, serving sizes, and nutrition were not listed. Confirm these details before ordering.</p>
  </div>;
}
