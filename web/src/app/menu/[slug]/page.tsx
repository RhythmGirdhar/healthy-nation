import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPublicCatalog, getMeal } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { BackToMenu } from "@/components/menu-browser";
import { AddMealForm } from "@/components/selection-controls";
import { WhatsAppLink } from "@/components/whatsapp-link";

export const dynamicParams = false;
export function generateStaticParams() { return getPublicCatalog().meals.map((meal) => ({ slug: meal.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const meal = getMeal(slug);
  return meal ? { title: meal.name, description: meal.description } : { title: "Meal not found" };
}

export default async function MealPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meal = getMeal(slug);
  if (!meal) notFound();
  return <div className="container meal-detail-page">
    <Suspense fallback={<Link href="/menu/" className="text-link">← Back to the menu</Link>}><BackToMenu /></Suspense>
    <div className="meal-detail">
      <figure className={`detail-figure accent-${meal.accent}`}><Image src={meal.image.src} alt={meal.image.alt} width={600} height={495} priority unoptimized /><figcaption>{meal.image.kind === "illustration" ? "Original illustration · not actual food photography" : meal.name}</figcaption></figure>
      <div className="detail-info">
        <span className="eyebrow">{meal.diet}{meal.isSample ? " · sample dish" : ""}</span><h1>{meal.name}</h1><p>{meal.description}</p>
        <p className="detail-price">{formatPrice(meal.price)}</p><p className="small-note">{meal.portion}</p>
        <AddMealForm meal={meal} />
        <WhatsAppLink className="text-link">Ask about the current menu</WhatsAppLink>
      </div>
    </div>
    <section className="ingredient-section" aria-labelledby="ingredients-heading">
      <div><span className="eyebrow">Know what you’re exploring</span><h2 id="ingredients-heading">{meal.isSample ? "Illustrative ingredients" : "Ingredients"}</h2><ul>{meal.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul></div>
      <div><h2>Allergens & suitability</h2><ul>{meal.allergens.map((allergen) => <li key={allergen}>{allergen}</li>)}</ul><p className="notice">{meal.isSample ? "Recipe, allergen, cross-contact, portion, and nutrition verification is pending. Do not use this sample to assess dietary suitability." : "Confirm the complete ingredients, preparation, cross-contact information, and any needs directly with the team before ordering."}</p></div>
    </section>
  </div>;
}
