import type { Metadata } from "next";
import { RequestReview } from "@/components/request-review";

export const metadata: Metadata = { title: "Review your request", robots: { index: false, follow: false }, description: "Review a meal or plan inquiry, check the current catalog, and preview a message. A draft is not a reservation, checkout, or accepted order." };

export default function RequestPage() {
  return <div className="container request-page"><header className="page-intro"><span className="eyebrow">Review your selections</span><h1>Your request</h1><p>Check your selections and preview a message. This draft is not a checkout, reservation, or confirmed order.</p></header><RequestReview /></div>;
}
