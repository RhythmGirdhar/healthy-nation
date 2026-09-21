import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPublicCatalog } from "@/lib/catalog";
import { business } from "@/data/business";
import { RequestProvider } from "@/components/request-provider";
import { SiteHeader, MobileRequestBar } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Healthy Nation | Meals & meal plans", template: "%s | Healthy Nation" },
  description: "Explore Healthy Nation’s approach to flavorful, balanced individual meals and team-managed meal plans. View sample ideas and speak directly with the team.",
  robots: getPublicCatalog().isPreview ? { index: false, follow: false } : { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const catalog = getPublicCatalog();
  return (
    <html lang="en">
      <body>
        <RequestProvider catalog={catalog} contact={business.contact}>
          <a className="skip-link" href="#main-content">Skip to content</a>
          <SiteHeader isPreview={catalog.isPreview} />
          <main id="main-content" tabIndex={-1}>{children}</main>
          <SiteFooter />
          <MobileRequestBar />
        </RequestProvider>
      </body>
    </html>
  );
}
