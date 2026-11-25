import Image from "next/image";
import Link from "next/link";
import { Leaf, Soup, Sun } from "lucide-react";
import { getPublicCatalog } from "@/lib/catalog";
import { MealCard } from "@/components/meal-card";
import { WhatsAppLink, CATERING_INQUIRY, DELIVERY_INQUIRY } from "@/components/whatsapp-link";
import { MealImage } from "@/components/meal-image";
import { kitchenPhotos } from "@/data/kitchen";

export default function HomePage() {
  const catalog = getPublicCatalog();
  const featured = catalog.meals.filter((meal) => meal.featured).slice(0, 3);
  const hero = kitchenPhotos.find((photo) => photo.category === "Bowls") || kitchenPhotos[0];
  const gallery = ["Salads", "Wraps", "Meals"].map((category) => kitchenPhotos.find((photo) => photo.category === category)).filter((photo) => photo !== undefined);
  return <>
    <section className="container hero">
      <div className="hero-copy">
        <span className="eyebrow">Healthy Nation</span>
        <h1>Eat well.<br /><em>Feel good.</em><br />Every day.</h1>
        <p>Salads, wraps, bowls and meals for your everyday appetite. Find something you like, then talk to our team on WhatsApp.</p>
        <div className="button-row"><Link href="/menu/" className="button">Browse the menu <span aria-hidden="true">↗</span></Link><Link href="/kitchen/" className="button secondary">See kitchen photos</Link></div>
        <p className="hero-footnote"><Leaf size={19} aria-hidden="true" /> Good food. A little less fuss.</p>
        <p className="service-context">Check your delivery area, timing and charges before choosing a meal.{catalog.isPreview ? " This menu contains examples only." : ""}</p>
        <WhatsAppLink message={DELIVERY_INQUIRY} className="text-link">Check delivery availability</WhatsAppLink>
      </div>
      {hero && <figure className="hero-art">
        <MealImage className="hero-meal" meal={{ name: hero.alt, image: { src: hero.src, alt: hero.alt, kind: "photo", width: hero.width } }} width={hero.width} height={hero.height} priority />
        <figcaption>From our kitchen. Check the menu for dishes and prices.</figcaption>
      </figure>}
    </section>
    <section className="values-band" aria-label="Our guiding ambitions"><div className="container values-inner">
      <div><Soup aria-hidden="true" /><p><strong>Flavor</strong><span>Food you want to eat regularly.</span></p></div>
      <div><Leaf aria-hidden="true" /><p><strong>Balanced eating</strong><span>Protein, fiber, and variety.</span></p></div>
      <div><Sun aria-hidden="true" /><p><strong>Affordability</strong><span>Making everyday meals accessible is our goal.</span></p></div>
    </div></section>
    <section className="container section" aria-labelledby="featured-heading">
      <div className="section-intro"><div><span className="eyebrow">Individual meals</span><h2 id="featured-heading">{catalog.isPreview ? "Sample meals" : "Featured meals"}</h2></div><Link href="/menu/" className="text-link">View {catalog.isPreview ? "the sample menu" : "the menu"} <span aria-hidden="true">↗</span></Link></div>
      <div className="meal-grid">{featured.map((meal) => <MealCard key={meal.id} meal={meal} />)}</div>
      {catalog.isPreview && <p className="small-note section-note">Sample dishes, not an available menu. Recipes, dietary labels, portions, nutrition, availability, and pricing await confirmation.</p>}
    </section>
    <section className="container"><div className="how-panel" aria-labelledby="how-heading">
      <div><span className="eyebrow">Ordering through WhatsApp</span><h2 id="how-heading">How requests work</h2></div>
      <ol className="how-steps">
        <li><span aria-hidden="true">01</span><h3>Find your favorites</h3><p>Browse the menu and add the dishes you want to your request.</p></li>
        <li><span aria-hidden="true">02</span><h3>Start a conversation</h3><p>Review your selection, open WhatsApp and send the message when you are ready.</p></li>
        <li><span aria-hidden="true">03</span><h3>Confirm with the team</h3><p>Agree availability, delivery, and final price. A message draft is not an order.</p></li>
      </ol>
    </div></section>
    <section className="container section story-section" aria-labelledby="story-heading">
      <figure className="story-illustration"><span className="eyebrow">Rooted in the everyday</span><Image src="/images/story-carrots.svg" alt="Original illustration of two carrots with leafy green tops" width={340} height={290} unoptimized /><figcaption>A fresh start, on your plate.</figcaption></figure>
      <div><span className="eyebrow">Our founder & mission</span><h2 id="story-heading">About Healthy Nation</h2><p>Healthy Nation aims to make flavorful, balanced meals accessible for everyday eating.</p><p>Our founder, Shivansh Girdhar, holds a degree in Culinary Sciences.</p><Link href="/about/" className="text-link">Read about Healthy Nation <span aria-hidden="true">↗</span></Link></div>
    </section>
    <section className="container section kitchen-teaser" aria-labelledby="kitchen-heading">
      <div className="section-intro"><div><span className="eyebrow">A closer look</span><h2 id="kitchen-heading">From our kitchen.</h2><p>Food photos from Healthy Nation. Exact dish matches are still being confirmed.</p></div><Link href="/kitchen/" className="text-link">See all kitchen photos <span aria-hidden="true">↗</span></Link></div>
      <div className="kitchen-grid">{gallery.map((photo) => <figure key={photo.id} className="kitchen-photo"><MealImage meal={{ name: photo.alt, image: { src: photo.src, alt: photo.alt, kind: "photo", width: photo.width } }} width={photo.width} height={photo.height} /><figcaption>{photo.category}</figcaption></figure>)}</div>
    </section>
    <section className="container"><div className="plan-teaser"><div><span className="eyebrow">Team-managed plans</span><h2>Meal plans for your week</h2><p>Explore example plans, then ask our team about current options. The examples are not available offers. No automatic renewal or recurring billing.</p></div><Link href="/plans/" className="button">Explore example plans <span aria-hidden="true">↗</span></Link></div></section>
    <section className="container section faq-teaser" aria-labelledby="home-faq-heading">
      <div><span className="eyebrow">Menu, delivery & ingredients</span><h2 id="home-faq-heading">FAQs</h2><Link href="/faq/" className="text-link">Read all FAQs <span aria-hidden="true">↗</span></Link></div>
      <div className="faq-list">
        <details><summary>Is this an available menu?</summary><p>{catalog.isPreview ? "Our current dishes and plans are illustrative samples. Recipes, pricing, portions, and availability need approval." : "Review each meal’s published details. Availability, delivery, and the final price still need to be confirmed with the team."} You can ask our team about the current offering through WhatsApp.</p></details>
        <details><summary>Where do you deliver?</summary><p>The delivery area, schedule, fees, and ordering windows are awaiting confirmation. Please ask the team before planning a meal request.</p></details>
        <details><summary>Can I check ingredients and allergens?</summary><p>The supplied menu lists dish names and prices, not complete recipes or allergen information. Confirm ingredients, allergens, and cross-contact with the team before ordering.</p></details>
      </div>
    </section>
    <section className="container catering-teaser"><div><h2>Catering</h2><p>Ask about food for your team or event. Menus, availability, service area, and pricing need confirmation.</p><Link href="/catering/" className="text-link">View catering information <span aria-hidden="true">↗</span></Link></div><WhatsAppLink message={CATERING_INQUIRY} className="button secondary">Ask about catering</WhatsAppLink></section>
  </>;
}
