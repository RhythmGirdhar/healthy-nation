import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import type { Meal } from "@/lib/types";

export function MealImage({ meal, width, height, className = "", priority = false, decorative = false }: {
  meal: Pick<Meal, "name" | "image">;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  decorative?: boolean;
}) {
  if (meal.image) {
    return <Image src={meal.image.src} alt={decorative ? "" : meal.image.alt} width={width} height={height} className={className} priority={priority} unoptimized />;
  }
  return <div
    className={`meal-image-placeholder ${className}`}
    style={{ aspectRatio: `${width} / ${height}` }}
    role={decorative ? undefined : "img"}
    aria-label={decorative ? undefined : `${meal.name}: photo not provided`}
    aria-hidden={decorative || undefined}
  >
    <UtensilsCrossed size={36} aria-hidden="true" />
    <span>Photo not available</span>
  </div>;
}
