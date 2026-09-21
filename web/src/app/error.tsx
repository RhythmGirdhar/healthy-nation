"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="container section empty-state"><span className="eyebrow">Something didn’t load</span><h1>Let’s try that again.</h1><p>This page couldn’t be displayed. Your request has not been sent or accepted. Try again or return to the menu.</p><div className="button-row"><button type="button" className="button" onClick={reset}>Try again</button><Link href="/menu/" className="button secondary">Back to menu</Link></div></section>;
}
