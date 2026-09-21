import Link from "next/link";

export default function NotFound() {
  return <section className="container section empty-state not-found"><span className="eyebrow">A little detour</span><h1>That page isn’t on the menu.</h1><p>The meal or page may have changed. Explore the current menu, or return home for a fresh start.</p><div className="button-row"><Link href="/menu/" className="button">Explore the menu</Link><Link href="/" className="button secondary">Return home</Link></div></section>;
}
