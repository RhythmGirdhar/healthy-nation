"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { business } from "@/data/business";
import { EMPTY_DRAFT, getHandoffDecision } from "@/lib/inquiry";
import type { HandoffDecision, PublicCatalog } from "@/lib/types";
import styles from "../content.module.css";

export function CateringInquiry({ catalog }: { catalog: PublicCatalog }) {
  const [date, setDate] = useState("");
  const [headcount, setHeadcount] = useState("");
  const [decision, setDecision] = useState<HandoffDecision | null>(null);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDecision(null);
    setError("");
    try {
      const prepared = getHandoffDecision({
        ...EMPTY_DRAFT,
        purpose: "catering",
        requestedDate: date,
        headcount,
      }, catalog, business.contact, { fresh: false });
      if (!prepared.message) {
        setError(prepared.reason ?? "Could not prepare the inquiry. Check the date and headcount.");
        return;
      }
      setDecision(prepared);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not prepare the inquiry. Check the date and headcount, then try again.");
    }
  }

  return (
    <div>
      <form onSubmit={prepare} className={styles.form} aria-label="Prepare a catering inquiry">
        <div className={styles.field}>
          <label htmlFor="catering-date">Requested event date (optional)</label>
          <input id="catering-date" name="event-date" type="date" autoComplete="off" value={date} onChange={event => {
            setDate(event.target.value);
            setDecision(null);
            setError("");
          }} />
          <small>No date or delivery slot is reserved.</small>
        </div>
        <div className={styles.field}>
          <label htmlFor="catering-headcount">Approximate number of people (optional)</label>
          <input id="catering-headcount" name="headcount" type="number" inputMode="numeric" min="1" step="1" autoComplete="off" value={headcount} onChange={event => {
            setHeadcount(event.target.value);
            setDecision(null);
            setError("");
          }} />
          <small>The team will confirm whether they can accommodate your group.</small>
        </div>
        <p className={styles.privacy}>No address, medical information, or payment details are collected here.</p>
        <p ref={errorRef} tabIndex={-1} className={styles.error} role="alert" hidden={!error}>{error}</p>
        <button className="button" type="submit">Prepare a catering inquiry</button>
        <noscript><p>Message the team using the WhatsApp contact link on this page if JavaScript is unavailable.</p></noscript>
      </form>
      <div aria-live="polite">
        {decision && (
          <section className={styles.message} aria-label="Your catering message">
            <h3>Your message</h3>
            <pre tabIndex={0}>{decision.message}</pre>
            <p>Opening WhatsApp shares this prepared draft with WhatsApp. Press Send there to message the team; nothing is booked by opening the link.</p>
            {decision.allowed && decision.url ? (
              <a href={decision.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" aria-describedby="whatsapp-privacy" className="button">
                Open WhatsApp to send
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            ) : <p className={styles.error}>{decision.reason}</p>}
            <p>You can also select and copy the message above if WhatsApp cannot open.</p>
          </section>
        )}
      </div>
    </div>
  );
}
