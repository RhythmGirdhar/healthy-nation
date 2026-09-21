import type { ContactSettings } from "@/lib/types";
import businessContent from "../../content/business.json";

type Business = {
  name: string;
  phoneDisplay: string;
  contact: ContactSettings;
  founder: {
    name: string;
    qualification: string;
    portrait: { src: string; alt: string } | null;
  };
  serviceArea: string | null;
  orderingHours: string | null;
  social: { instagram: string | null; facebook: string | null };
  domains: string[];
};

const content: Omit<Business, "phoneDisplay"> = businessContent;
const phone = content.contact.phoneNumber;
if (phone !== "" && !/^[1-9]\d{6,14}$/.test(phone)) {
  throw new Error("Invalid contact.phoneNumber in content/business.json: use international digits only, including the country code.");
}

const phoneDisplay = /^91\d{10}$/.test(phone)
  ? `+91 ${phone.slice(2, 7)} ${phone.slice(7)}`
  : phone ? `+${phone}` : "Contact number not configured";

export const business: Business = { ...content, phoneDisplay };
