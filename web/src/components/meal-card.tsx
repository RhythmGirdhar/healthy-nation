import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Meal } from "@/lib/types";

export function MealCard({ meal, query = "", onNavigate }: { meal: Meal; query?: string; onNavigate?: () => void }) {
  return <article className={`meal-card accent-${meal.accent}`}>
    <Link href={`/menu/${meal.slug}/${query ? `?${query}` : ""}`} className="meal-card-link" onClick={onNavigate} aria-label={`Explore ${meal.name}${meal.isSample ? " — sample dish" : ""}`}>
      <div className="meal-art">
        <Image src={meal.image.src} alt={meal.image.alt} width={400} height={330} unoptimized />
        <span className="image-label">{meal.image.kind === "illustration" ? "Illustration" : "Food photo"}</span>
      </div>
      <div className="meal-copy">
        <span className="meal-tag">{meal.diet}{meal.isSample ? " · sample" : ""}</span>
        <h3>{meal.name}</h3>
        <p className="meal-description">{meal.description}</p>
        <div className="meal-price"><strong>{formatPrice(meal.price)}</strong><span>{meal.portion}</span></div>
        <span className="meal-card-action">Explore meal <span aria-hidden="true">↗</span></span>
      </div>
    </Link>
  </article>;
}
