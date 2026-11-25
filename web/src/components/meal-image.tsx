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
    const alt = decorative ? "" : `${meal.image.alt}${meal.image.kind === "example-photo" ? ". Example kitchen photo, not a confirmed photo of this dish." : ""}`;
    return <picture>
      {meal.image.width && meal.image.src.startsWith("/images/kitchen/") && <source type="image/webp" srcSet={`${meal.image.src.replace(".webp", "-480.webp")} ${meal.image.width / 2}w, ${meal.image.src} ${meal.image.width}w`} sizes={width <= 400 ? "(max-width: 760px) 140px, 33vw" : "(max-width: 760px) 100vw, 50vw"} />}
      <Image src={meal.image.src} alt={alt} width={width} height={height} className={className} priority={priority} unoptimized />
    </picture>;
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
