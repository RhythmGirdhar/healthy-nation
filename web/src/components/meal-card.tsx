import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Meal } from "@/lib/types";
import { MealImage } from "./meal-image";
import { AddMealForm } from "./selection-controls";

export function MealCard({ meal, query = "", onNavigate, quickAdd = false }: { meal: Meal; query?: string; onNavigate?: () => void; quickAdd?: boolean }) {
  return <article className={`meal-card accent-${meal.accent}`}>
    <Link href={`/menu/${meal.slug}/${query ? `?${query}` : ""}`} className="meal-card-link" onClick={onNavigate} aria-label={`Explore ${meal.name}${meal.isSample ? " — sample dish" : ""}`}>
      <div className={`meal-art${meal.image && meal.image.kind !== "illustration" ? " has-photo" : ""}`}>
        <MealImage meal={meal} width={400} height={330} />
        {meal.image && <span className="image-label">{meal.image.kind === "illustration" ? "Illustration" : meal.image.kind === "example-photo" ? "Example photo" : "Kitchen photo"}</span>}
      </div>
      <div className="meal-copy">
        <span className="meal-tag">{meal.diet === "Not specified" ? meal.category : meal.diet}{meal.isSample ? " · sample" : ""}</span>
        <h3>{meal.name}</h3>
        {meal.description && <p className="meal-description">{meal.description}</p>}
        <div className="meal-price"><strong>{formatPrice(meal.price)}</strong><span>{meal.portion}</span></div>
        <span className="meal-card-action">Explore meal <span aria-hidden="true">↗</span></span>
      </div>
    </Link>
    {quickAdd && meal.options.length === 1 && <AddMealForm meal={meal} compact query={query} />}
  </article>;
}
