"use client";

import { useRef, useState } from "react";
import { getHandoffDecision } from "@/lib/inquiry";
import type { HandoffDecision } from "@/lib/types";
import { useRequest } from "./request-provider";

export function MessagePreview({ message, decision }: { message: string; decision: HandoffDecision }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const text = useRef<HTMLTextAreaElement>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [handoffError, setHandoffError] = useState("");
  const { draft, snapshot, contact, checkedAt, needsReview, refreshing, refreshCatalog, error } = useRequest();

  function close() { dialog.current?.close(); }
  async function copy() {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(message);
      setCopyStatus("Draft copied to your clipboard. Nothing has been sent.");
    } catch {
      setCopyStatus("Copy was not available. Choose “Select message”, then use your device’s Copy command.");
    }
  }

  return <>
    <button ref={trigger} type="button" className="button" disabled={!message} onClick={() => {
      setCopyStatus("");
      setHandoffError("");
      const realOffer = !snapshot.isPreview && (draft.purpose === "meals"
        ? draft.items.length > 0 && draft.items.every((item) => snapshot.meals.find((meal) => meal.id === item.mealId)?.isSample === false)
        : draft.purpose === "plan" && snapshot.plans.find((plan) => plan.id === draft.planId)?.isSample === false);
      const fresh = checkedAt !== null && Date.now() - checkedAt < 60000 && !needsReview;
      if (realOffer && !fresh && !refreshing) void refreshCatalog();
      dialog.current?.showModal();
      title.current?.focus();
    }}>Preview message <span aria-hidden="true">↗</span></button>
    <dialog ref={dialog} className="message-dialog" aria-labelledby="message-preview-title" aria-describedby="message-preview-description" onClose={() => trigger.current?.focus()}>
      <div className="dialog-content">
        <div className="dialog-heading"><div><span className="eyebrow">Nothing has been sent</span><h2 id="message-preview-title" ref={title} tabIndex={-1}>Review your message</h2></div><button type="button" className="icon-button" aria-label="Close message preview" onClick={close}>×</button></div>
        <p id="message-preview-description">Nothing has been sent. Review this draft, then copy it or open an eligible inquiry in WhatsApp. Opening a message is not an accepted order.</p>
        <label className="field-label" htmlFor="request-message-text">Your message draft</label>
        <textarea ref={text} id="request-message-text" name="request-message-text" className="message-text" value={message} readOnly autoComplete="off" spellCheck={false} rows={13} />
        <div className="button-row"><button type="button" className="button secondary" onClick={copy}>Copy draft</button><button type="button" className="text-button" onClick={() => { text.current?.focus(); text.current?.select(); setCopyStatus("Message selected. Use your device’s Copy command."); }}>Select message</button></div>
        <p role="status" aria-live="polite" className="small-note">{copyStatus}</p>
        <div className="notice">
          {refreshing ? <p role="status">Checking the latest menu before preparing your WhatsApp link…</p> : decision.allowed ? <p><strong>WhatsApp opens in a new tab.</strong> Opening the link shares the prepared draft with WhatsApp before you press Send. Only you send it to the team; the team still needs to confirm availability, final price, and delivery.</p> : <p><strong>Local preview only.</strong> {decision.reason || "This request is not eligible for handoff."} You can review or copy the draft. Resolve the issue above before opening WhatsApp with this request.</p>}
        </div>
        {error && <p role="alert" className="form-error">{error}</p>}
        {handoffError && <p role="alert" className="form-error">{handoffError}</p>}
        <div className="dialog-actions">
          <button type="button" className="button secondary" onClick={close}>Back to request</button>
          {decision.allowed && decision.url && <a href={decision.url} className="button" target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" aria-describedby="whatsapp-privacy" onClick={(event) => {
            const fresh = checkedAt !== null && Date.now() - checkedAt < 60000 && !needsReview;
            const current = getHandoffDecision(draft, snapshot, contact, { fresh, now: new Date() });
            if (!current.allowed || current.url !== decision.url) {
              event.preventDefault();
              setHandoffError(current.reason || "The request changed or its catalog check expired. Close this preview, check the catalog, and review again.");
            }
          }}>Open WhatsApp <span aria-hidden="true">↗</span></a>}
        </div>
      </div>
    </dialog>
  </>;
}
