import Image from "next/image";
import Link from "next/link";
import { Leaf, Soup, Sun } from "lucide-react";
import { getPublicCatalog } from "@/lib/catalog";
import { MealCard } from "@/components/meal-card";
import { WhatsAppLink, CATERING_INQUIRY } from "@/components/whatsapp-link";

export default function HomePage() {
  const catalog = getPublicCatalog();
  const featured = catalog.meals.filter((meal) => meal.featured).slice(0, 3);
  const hero = featured[0] || catalog.meals[0];
  return <>
    <section className="container hero">
      <div className="hero-copy">
        <span className="eyebrow">Healthy Nation</span>
        <h1>Balanced meals<br />for <em>everyday life.</em></h1>
        <p>Explore individual meals and team-managed meal plans. Our goal is to make nutritious food affordable and easier to fit into a busy day.</p>
        <div className="button-row"><Link href="/menu/" className="button">Browse the menu <span aria-hidden="true">↗</span></Link><Link href="/plans/" className="button secondary">Explore meal plans</Link></div>
        <p className="hero-footnote"><Leaf size={19} aria-hidden="true" /> Recipes built around flavor, protein, fiber, and variety.</p>
        <p className="service-context">Delivery area and ordering windows are awaiting confirmation.{catalog.isPreview ? " The menu is currently a sample, not an available offer." : ""}</p>
      </div>
      {hero && <figure className="hero-art">
        <div className="hero-art-label" aria-hidden="true"><span>Explore the menu</span><strong>Individual meals</strong></div>
        <Image className="hero-meal" src={hero.image.src} alt={hero.image.alt} width={600} height={495} priority unoptimized />
        <div className="hero-art-label peach-label" aria-hidden="true"><span>Plan your week</span><strong>Team-managed plans</strong></div>
        <figcaption>{hero.image.kind === "illustration" ? "Original illustration · actual food photography to follow" : hero.name}</figcaption>
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
        <li><span aria-hidden="true">01</span><h3>Find your favorites</h3><p>Explore individual meals or a plan that could suit your week.</p></li>
        <li><span aria-hidden="true">02</span><h3>Start a conversation</h3><p>Ask about the current menu on WhatsApp. Sample offer selections stay local until real offers are approved.</p></li>
        <li><span aria-hidden="true">03</span><h3>Confirm with the team</h3><p>Agree availability, delivery, and final price. A message draft is not an order.</p></li>
      </ol>
    </div></section>
    <section className="container section story-section" aria-labelledby="story-heading">
      <figure className="story-illustration"><span className="eyebrow">Rooted in the everyday</span><Image src="/images/story-carrots.svg" alt="Original illustration of two carrots with leafy green tops" width={340} height={290} unoptimized /><figcaption>A fresh start, on your plate.</figcaption></figure>
      <div><span className="eyebrow">Our founder & mission</span><h2 id="story-heading">About Healthy Nation</h2><p>Healthy Nation aims to make flavorful, balanced meals accessible for everyday eating.</p><p>Our founder, Shivansh Girdhar, holds a degree in Culinary Sciences.</p><Link href="/about/" className="text-link">Read about Healthy Nation <span aria-hidden="true">↗</span></Link></div>
    </section>
    <section className="container"><div className="plan-teaser"><div><span className="eyebrow">Team-managed plans</span><h2>Meal plans for your week</h2><p>Compare sample plans and discuss the schedule with our team. No automatic renewal or recurring billing at launch.</p></div><Link href="/plans/" className="button">Compare meal plans <span aria-hidden="true">↗</span></Link></div></section>
    <section className="container section faq-teaser" aria-labelledby="home-faq-heading">
      <div><span className="eyebrow">Menu, delivery & ingredients</span><h2 id="home-faq-heading">FAQs</h2><Link href="/faq/" className="text-link">Read all FAQs <span aria-hidden="true">↗</span></Link></div>
      <div className="faq-list">
        <details><summary>Is this an available menu?</summary><p>{catalog.isPreview ? "Our current dishes and plans are illustrative samples. Recipes, pricing, portions, and availability need approval." : "Review each meal’s published details. Availability, delivery, and the final price still need to be confirmed with the team."} You can ask our team about the current offering through WhatsApp.</p></details>
        <details><summary>Where do you deliver?</summary><p>The delivery area, schedule, fees, and ordering windows are awaiting confirmation. Please ask the team before planning a meal request.</p></details>
        <details><summary>Can I check ingredients and allergens?</summary><p>Sample ingredients and allergen notes are not verified recipes. Confirm the complete ingredients, allergens, and cross-contact information with the team; these samples cannot establish dietary suitability.</p></details>
      </div>
    </section>
    <section className="container catering-teaser"><div><h2>Catering</h2><p>Ask about food for your team or event. Menus, availability, service area, and pricing need confirmation.</p><Link href="/catering/" className="text-link">View catering information <span aria-hidden="true">↗</span></Link></div><WhatsAppLink message={CATERING_INQUIRY} className="button secondary">Ask about catering</WhatsAppLink></section>
  </>;
}
