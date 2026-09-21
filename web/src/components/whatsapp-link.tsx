import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { business } from "@/data/business";
import { getWhatsAppUrl } from "@/lib/inquiry";

export const GENERAL_INQUIRY =
  "Hi Healthy Nation! I'd like to ask about your current menu, prices, delivery area, and how to request a meal.";
export const CATERING_INQUIRY =
  "Hi Healthy Nation! I'd like to discuss food for a team or event. Please confirm your catering options, service area, availability, pricing, and terms.";

export function WhatsAppLink({
  children = "Chat on WhatsApp",
  message = GENERAL_INQUIRY,
  className = "button",
}: {
  children?: ReactNode;
  message?: string;
  className?: string;
}) {
  const enabled = business.contact.approved && business.contact.generalInquiriesEnabled;
  const url = enabled ? getWhatsAppUrl(business.contact.phoneNumber, message) : null;

  if (!url) {
    return <span className={className} aria-disabled="true">WhatsApp contact is not configured</span>;
  }

  return (
    <a
      href={url}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="no-referrer"
      aria-describedby="whatsapp-privacy"
    >
      {children}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}

export function WhatsAppDisclosure() {
  return (
    <p id="whatsapp-privacy" className="contact-disclosure">
      WhatsApp opens in a new tab. Opening a link shares its prepared draft with WhatsApp;
      you still press Send to message the team. An inquiry is not an accepted order.
    </p>
  );
}
