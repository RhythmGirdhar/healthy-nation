import { catalog, getMeal } from "@/lib/catalog";

export const dynamic = "force-static";
// Unknown slugs reach GET so the API returns JSON rather than an HTML 404.
export const dynamicParams = true;

export function generateStaticParams() {
  return catalog.meals.map((meal) => ({ slug: meal.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const meal = getMeal(slug);
  if (!meal) {
    return Response.json({ error: "Meal not found" }, { status: 404 });
  }
  return Response.json(meal);
}
