"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useRequest } from "./request-provider";
import { WhatsAppLink } from "./whatsapp-link";

const links = [{ href: "/menu/", label: "The menu" }, { href: "/plans/", label: "Meal plans" }, { href: "/about/", label: "About us" }];

export function SiteHeader({ isPreview }: { isPreview: boolean }) {
  const pathname = usePathname();
  const { draft } = useRequest();
  const disclosure = useRef<HTMLDetailsElement>(null);
  const total = draft.items.reduce((sum, item) => sum + item.quantity, 0) + (draft.planId ? 1 : 0);
  function closeMenu() { if (disclosure.current) disclosure.current.open = false; }

  useEffect(() => {
    function outside(event: PointerEvent | FocusEvent) {
      if (event.target instanceof Node && !disclosure.current?.contains(event.target)) closeMenu();
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape" && disclosure.current?.open) {
        closeMenu();
        disclosure.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", escape);
    const breakpoint = window.matchMedia("(min-width: 761px)");
    function reflow() {
      if (breakpoint.matches && disclosure.current) {
        const hadFocus = disclosure.current.contains(document.activeElement);
        closeMenu();
        if (hadFocus) document.querySelector<HTMLAnchorElement>(".site-brand")?.focus();
      }
    }
    breakpoint.addEventListener("change", reflow);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", escape);
      breakpoint.removeEventListener("change", reflow);
    };
  }, []);

  return (
    <>
      <div className="announcement">{isPreview ? "Sample menu · meal & plan selections are preview-only" : "Meal requests are confirmed directly with our team"}</div>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="site-brand" aria-label="Healthy Nation home" onClick={closeMenu}>
            <Image src="/brand/logo.webp" alt="Healthy Nation" width={680} height={248} priority unoptimized />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname.startsWith(link.href.slice(0, -1)) ? "page" : undefined}>{link.label}</Link>)}
          </nav>
          <div className="header-actions">
            <WhatsAppLink className="text-link header-chat">Ask the team</WhatsAppLink>
            <Link className="button compact" href="/request/">Your request <span className="request-count" aria-label={`${total} saved selections`}>{total}</span></Link>
          </div>
          <details ref={disclosure} className="mobile-navigation">
            <summary>Explore <span aria-hidden="true">☰</span></summary>
            <nav className="mobile-menu" aria-label="Mobile navigation" onClick={(event) => { if (event.target instanceof Element && event.target.closest("a")) closeMenu(); }}>
              <Link href="/">Home</Link>
              {links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname.startsWith(link.href.slice(0, -1)) ? "page" : undefined}>{link.label}</Link>)}
              <Link href="/request/">Your request ({total})</Link>
              <WhatsAppLink className="text-link">Ask the team on WhatsApp</WhatsAppLink>
              <small>Opening a message is not a confirmed order.</small>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}

export function MobileRequestBar() {
  const { draft } = useRequest();
  const pathname = usePathname();
  const count = draft.items.reduce((sum, item) => sum + item.quantity, 0) + (draft.planId ? 1 : 0);
  return <aside className="mobile-request-bar" aria-label="Request quick action">
    <div><strong>Your request <span aria-label={`${count} saved selections`}>{count}</span></strong><small>Not an accepted order</small></div>
    <Link className="button compact" href={pathname.startsWith("/request") ? "/request/#request-actions" : "/request/"}>{pathname.startsWith("/request") ? "Review next steps" : "Review request"} <span aria-hidden="true">↗</span></Link>
  </aside>;
}
