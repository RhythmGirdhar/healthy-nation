import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Leaf, Heart, UtensilsCrossed } from "lucide-react";
import { business } from "@/data/business";
import { WhatsAppLink } from "@/components/whatsapp-link";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "About us",
  description: "Meet Healthy Nation founder Shivansh Girdhar, who holds a degree in Culinary Sciences, and discover our ambition for flavorful everyday meals.",
};

export default function AboutPage() {
  const { founder } = business;
  return (
    <div className={styles.page}>
      <span className={styles.eyebrow}>About us</span>
      <h1 className={styles.title}>About Healthy Nation</h1>
      <p className={styles.lede}>
        Healthy Nation is a food business offering individual meals and meal plans.
        Contact us for the current menu, prices, and delivery details.
      </p>

      <section className={styles.founder} aria-labelledby="founder-heading">
        <div className={styles.portrait}>
          {founder.portrait ? (
            <Image
              src={founder.portrait.src}
              alt={founder.portrait.alt}
              fill
              sizes="(max-width: 700px) 90vw, 460px"
              className={styles.portraitImage}
            />
          ) : (
            <div className={styles.portraitPlaceholder} role="img" aria-label="Portrait placeholder for Shivansh Girdhar; a founder photo has not been supplied">
              <span className={styles.initials} aria-hidden="true">SG</span>
              <strong>Founder portrait</strong>
              <p>Photo not added yet</p>
            </div>
          )}
        </div>
        <div className={styles.founderCopy}>
          <span className={styles.eyebrow}>Meet the founder</span>
          <h2 id="founder-heading">{founder.name}</h2>
          <p className={styles.qualification}>
            <GraduationCap size={22} aria-hidden="true" />
            {founder.qualification}
          </p>
          <p>
            Shivansh Girdhar founded Healthy Nation. He holds a degree in
            Culinary Sciences.
          </p>
          <p>
            Our goal is to make nutritious, good-tasting meals more affordable.
            You can order individual meals or ask about a meal plan through WhatsApp.
            The team confirms the menu, price, and delivery before accepting an order.
          </p>
          <WhatsAppLink message="Hi Shivansh! I'd like to learn about Healthy Nation and your current meal options.">
            Message Shivansh
          </WhatsAppLink>
        </div>
      </section>

      <section aria-labelledby="values-heading">
        <span className={styles.eyebrow}>Our priorities</span>
        <h2 className={styles.sectionTitle} id="values-heading">What matters to us</h2>
        <div className={styles.values}>
          <article className={styles.value}>
            <UtensilsCrossed size={28} aria-hidden="true" />
            <h3>Taste</h3>
            <p>Meals should be enjoyable as well as nutritious.</p>
          </article>
          <article className={styles.value}>
            <Leaf size={28} aria-hidden="true" />
            <h3>Balanced choices</h3>
            <p>Protein, fiber, and variety guide our menu planning. Ask the team to confirm ingredients, portions, and nutrition for a particular meal.</p>
          </article>
          <article className={styles.value}>
            <Heart size={28} aria-hidden="true" />
            <h3>Affordability</h3>
            <p>We want meals that fit everyday budgets. Contact us for current prices and plan options.</p>
          </article>
        </div>
      </section>

      <aside className={styles.contactCard}>
        <h2>Contact Healthy Nation</h2>
        <p>
          The menu on this website is a preview. Contact
          Shivansh at {business.phoneDisplay} for current meals and plans.
          The team confirms availability, pricing, and delivery before accepting an order.
        </p>
        <div className={styles.actions}>
          <Link href="/menu/" className="button secondary">View menu</Link>
          <WhatsAppLink>Chat with the team</WhatsAppLink>
        </div>
      </aside>
    </div>
  );
}
