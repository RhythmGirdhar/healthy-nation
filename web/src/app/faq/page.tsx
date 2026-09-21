import type { Metadata } from "next";
import { getPublicCatalog } from "@/lib/catalog";
import { WhatsAppLink } from "@/components/whatsapp-link";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Questions about Healthy Nation's menu preview, meal plans, ingredients, delivery, and WhatsApp inquiries.",
};

export default function FaqPage() {
  const { faqs } = getPublicCatalog();
  return (
    <div className={styles.page}>
      <span className={styles.eyebrow}>Before you order</span>
      <h1 className={styles.title}>Frequently asked questions</h1>
      <p className={styles.lede}>
        The menu on this site is a preview. Ask us about current meals,
        prices, delivery, or specific dietary requirements before ordering.
      </p>
      <div className={styles.faqList}>
        {faqs.map(faq => (
          <details key={faq.id} id={`faq-${faq.id}`}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
      <aside className={styles.contactCard}>
        <h2>Have another question?</h2>
        <p>
          A WhatsApp inquiry starts a conversation, not an order. You do not need
          to share a diagnosis or health history to ask about meal options.
        </p>
        <WhatsAppLink>Ask the team a question</WhatsAppLink>
      </aside>
    </div>
  );
}
