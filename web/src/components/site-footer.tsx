import Image from "next/image";
import Link from "next/link";
import { business } from "@/data/business";
import { WhatsAppDisclosure, WhatsAppLink, CATERING_INQUIRY } from "./whatsapp-link";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="container">
      <div className="footer-top">
        <div className="footer-brand"><Link href="/" aria-label="Healthy Nation home"><Image src="/brand/logo.webp" alt="Healthy Nation" width={680} height={248} unoptimized /></Link><p>Individual meals and team-managed meal plans for everyday eating.</p></div>
        <nav className="footer-nav" aria-label="Footer navigation">
          <div><h2>Explore</h2><Link href="/menu/">The menu</Link><Link href="/plans/">Meal plans</Link><Link href="/about/">About us</Link></div>
          <div><h2>Let’s talk</h2><WhatsAppLink className="text-link">{business.phoneDisplay}</WhatsAppLink><Link href="/catering/">Corporate catering</Link><WhatsAppLink message={CATERING_INQUIRY} className="text-link">Ask about catering</WhatsAppLink></div>
          <div><h2>Good to know</h2><Link href="/faq/">FAQs & information</Link><Link href="/request/">Review your request</Link>{business.social.instagram && <a href={business.social.instagram} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Instagram</a>}<span>Delivery area: to be confirmed</span></div>
        </nav>
      </div>
      <div className="footer-bottom"><p>Healthy Nation · Flavorful, balanced everyday eating.</p><p>Confirm availability, delivery charges, ingredients, and allergens with the team before ordering.</p></div>
      <WhatsAppDisclosure />
    </div>
  </footer>;
}
