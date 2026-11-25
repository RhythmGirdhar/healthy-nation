import type { Metadata } from "next";
import Link from "next/link";
import { kitchenPhotos } from "@/data/kitchen";
import { MealImage } from "@/components/meal-image";

export const metadata: Metadata = {
  title: "From our kitchen",
  description: "See food photographs supplied by Healthy Nation, from salads and wraps to bowls and drinks.",
};

export default function KitchenPage() {
  const categories = [...new Set(kitchenPhotos.map((photo) => photo.category))];
  return <div className="container section kitchen-page">
    <header className="kitchen-intro">
      <span className="eyebrow">Healthy Nation in pictures</span>
      <h1>From our kitchen.</h1>
      <p>A closer look at our food, photographed for Healthy Nation.</p>
      <p className="small-note">This is a photo collection, not an availability list. Exact dish names and portions are being confirmed. See the menu for listed dishes and prices.</p>
      <Link href="/menu/" className="button">Find your next meal <span aria-hidden="true">↗</span></Link>
    </header>
    <nav className="category-links" aria-label="Photo categories">{categories.map((category) => <a key={category} href={`#photos-${category.toLowerCase()}`}>{category}</a>)}</nav>
    {categories.map((category) => <section key={category} className="kitchen-section" aria-labelledby={`photos-${category.toLowerCase()}`}>
      <h2 id={`photos-${category.toLowerCase()}`}>{category}</h2>
      <div className="kitchen-grid">{kitchenPhotos.filter((photo) => photo.category === category).map((photo) => <figure key={photo.id} className="kitchen-photo">
        <MealImage meal={{ name: photo.alt, image: { src: photo.src, alt: photo.alt, kind: "photo", width: photo.width } }} width={photo.width} height={photo.height} />
        <figcaption>{photo.category} <span>Photo {photo.id.slice(-3)}</span></figcaption>
      </figure>)}</div>
    </section>)}
  </div>;
}
