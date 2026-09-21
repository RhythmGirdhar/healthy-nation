import type { Metadata } from "next";
import { getPublicCatalog } from "@/lib/catalog";
import { business } from "@/data/business";
import { CATERING_INQUIRY, WhatsAppLink } from "@/components/whatsapp-link";
import { CateringInquiry } from "./catering-inquiry";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "Corporate catering inquiries",
  description: "Discuss a team lunch or event with Healthy Nation. Ask about catering options, availability, pricing, and delivery.",
};

export default function CateringPage() {
  const catalog = getPublicCatalog();
  return (
    <div className={styles.page}>
      <span className={styles.eyebrow}>Team lunches and events</span>
      <h1 className={styles.title}>Corporate catering</h1>
      <p className={styles.lede}>
        Planning a team lunch or an event? Ask us about menu options, pricing,
        and delivery. The team will confirm availability and terms before
        accepting a booking.
      </p>
      <div className={styles.cateringLayout}>
        <section aria-labelledby="catering-steps">
          <h2 className={styles.sectionTitle} id="catering-steps">How to inquire</h2>
          <ol className={styles.steps}>
            <li>Share an optional date and approximate headcount, or start with a general question.</li>
            <li>Review the prepared message and send it yourself in WhatsApp.</li>
            <li>Agree on availability, meal choices, the final quote, and delivery directly with the team.</li>
          </ol>
          <p className={styles.privacy}>
            No menu selection, customer account, deposit, or medical history is
            required to make an inquiry. The website does not accept a booking.
          </p>
          <div className={styles.actions}>
            <WhatsAppLink message={CATERING_INQUIRY}>Chat directly on WhatsApp</WhatsAppLink>
          </div>
          <p className={styles.privacy}>{business.phoneDisplay}</p>
        </section>
        <CateringInquiry catalog={catalog} />
      </div>
    </div>
  );
}
