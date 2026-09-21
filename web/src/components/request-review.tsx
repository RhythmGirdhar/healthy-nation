"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buildInquiryMessage, getHandoffDecision, getLocalCalendarDate } from "@/lib/inquiry";
import { formatPrice } from "@/lib/format";
import type { DraftItem, HandoffDecision, InquiryPurpose, Meal } from "@/lib/types";
import { useRequest } from "./request-provider";
import { MessagePreview } from "./message-preview";
import { WhatsAppLink } from "./whatsapp-link";

function focusUndo() {
  requestAnimationFrame(() => document.getElementById("undo-request-change")?.focus());
}

function MealLine({ item, index, meal }: { item: DraftItem; index: number; meal?: Meal }) {
  const { draft, ready, updateDraft } = useRequest();
  const [error, setError] = useState("");
  const name = meal?.name || `Unavailable meal (${item.mealId})`;
  const matches = (line: DraftItem) => line.mealId === item.mealId && line.option === item.option;
  const invalidOption = !!meal && !meal.options.includes(item.option);

  function changeOption(option: string) {
    const existing = draft.items.find((line) => line.mealId === item.mealId && line.option === option);
    if (existing && existing !== item && existing.quantity + item.quantity > 99) {
      setError("These matching options would total more than 99 meals. Reduce the quantity first.");
      return;
    }
    setError("");
    updateDraft((current) => {
      const remaining = current.items.filter((line) => !matches(line));
      const target = remaining.find((line) => line.mealId === item.mealId && line.option === option);
      return { ...current, items: target
        ? remaining.map((line) => line === target ? { ...line, quantity: line.quantity + item.quantity } : line)
        : current.items.map((line) => matches(line) ? { ...line, option } : line) };
    }, "Meal option updated. Matching meal and option selections have been combined.");
    requestAnimationFrame(() => {
      document.querySelector<HTMLSelectElement>(`[data-line-meal="${CSS.escape(item.mealId)}"] select`)?.focus();
    });
  }
  return <article className="request-line" data-line-meal={item.mealId}>
    <div className={`request-line-image accent-${meal?.accent || "sage"}`}>
      {meal ? <Image src={meal.image.src} alt="" width={120} height={100} unoptimized /> : <span aria-hidden="true">?</span>}
    </div>
    <div className="request-line-content">
      <span className="eyebrow">{meal?.isSample ? "Sample meal" : "Meal selection"}</span>
      <h2>{name}</h2>
      <p className="line-price">{meal ? formatPrice(meal.price) : "Price unavailable"}</p>
      {meal && <p className="small-note">{meal.portion}</p>}
      {meal && <details className="line-food-details"><summary>Ingredients & allergen notes</summary><h3>{meal.isSample ? "Illustrative ingredients" : "Ingredients"}</h3><ul>{meal.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul><h3>Allergen information</h3><ul>{meal.allergens.map((allergen) => <li key={allergen}>{allergen}</li>)}</ul>{meal.isSample && <p>Verification is pending. Do not use these sample notes to assess dietary suitability.</p>}</details>}
      {!meal && <p className="form-error">This meal is no longer in the catalog. Remove it or browse the current menu; it has not been silently removed.</p>}
      {meal && !meal.available && <p className="form-error">This meal is currently unavailable. Remove it before requesting available offers.</p>}
      {meal ? <div className="field">
        <label htmlFor={`line-option-${index}`}>Option for {meal.name}</label>
        <select id={`line-option-${index}`} name={`line-option-${index}`} value={item.option} disabled={!ready} aria-invalid={invalidOption} onChange={(event) => changeOption(event.target.value)}>
          {invalidOption && <option value={item.option} disabled>Previous option unavailable — choose again</option>}
          {meal.options.map((option) => <option key={option}>{option}</option>)}
        </select>
        {invalidOption && <p className="form-error">The previous option is no longer supported. Choose a current option.</p>}
      </div> : <p>Previous option: {item.option}</p>}
      <div className="quantity-row">
        <div className="quantity-control" role="group" aria-label={`Quantity for ${name}`}>
          <button type="button" disabled={!ready || item.quantity <= 1} aria-label={`Decrease quantity of ${name}`} onClick={() => updateDraft((current) => ({ ...current, items: current.items.map((line) => matches(line) ? { ...line, quantity: Math.max(1, line.quantity - 1) } : line) }), `${name} quantity decreased.`)}>−</button>
          <output aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</output>
          <button type="button" disabled={!ready || item.quantity >= 99} aria-label={`Increase quantity of ${name}`} onClick={() => updateDraft((current) => ({ ...current, items: current.items.map((line) => matches(line) ? { ...line, quantity: Math.min(99, line.quantity + 1) } : line) }), `${name} quantity increased.`)}>+</button>
        </div>
        <button type="button" className="text-button" disabled={!ready} aria-label={`Remove ${name}`} onClick={() => {
          updateDraft((current) => ({ ...current, items: current.items.filter((line) => !matches(line)) }), `${name} removed. Undo is available until the next change.`, true);
          focusUndo();
        }}>Remove</button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  </article>;
}

export function RequestReview() {
  const request = useRequest();
  const { draft, snapshot, ready, storageWarning, error, issues, needsReview, checkedAt, refreshing, undo, updateDraft } = request;
  const [now, setNow] = useState(0);
  useEffect(() => {
    const first = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => { window.clearTimeout(first); window.clearInterval(timer); };
  }, []);
  const today = now ? getLocalCalendarDate(new Date(now)) : "";
  const date = draft.purpose === "plan" ? draft.planStartDate : draft.requestedDate;
  const dateInvalid = Boolean(date && today && date < today);
  const offer = draft.purpose === "meals" || draft.purpose === "plan";
  const plan = snapshot.plans.find((entry) => entry.id === draft.planId);
  const empty = draft.purpose === "meals" ? draft.items.length === 0 : draft.purpose === "plan" ? !draft.planId : false;
  const isSample = snapshot.isPreview || (draft.purpose === "meals" ? draft.items.some((item) => snapshot.meals.find((meal) => meal.id === item.mealId)?.isSample) : Boolean(plan?.isSample));
  const fresh = checkedAt !== null && now > 0 && now - checkedAt < 60000 && !needsReview;
  let message = "";
  let validationError = "";
  let decision: HandoffDecision = { allowed: false, message: "", url: null, reason: "Choose a meal or plan to prepare a request." };
  if (ready && !empty) {
    try {
      const time = new Date(now || snapshot.publication.publishedAt);
      const body = buildInquiryMessage(draft, snapshot, time);
      message = (offer && (isSample || !fresh) ? "LOCAL DRAFT — SAMPLE OR UNVERIFIED OFFER. NOT A CONFIRMED ORDER.\n\n" : "") + body;
      decision = getHandoffDecision(draft, snapshot, request.contact, { fresh, now: time });
      if (offer && needsReview) decision = { ...decision, allowed: false, url: null, reason: "The catalog changed. Review the issues below and acknowledge the updated details before handoff." };
    } catch (failure) {
      validationError = failure instanceof Error ? failure.message : "Check your selections, supported options, and requested date.";
      decision = { allowed: false, message: "", url: null, reason: validationError };
    }
  }
  const total = draft.items.reduce((sum, line) => sum + line.quantity, 0);
  const pricesKnown = draft.items.every((line) => snapshot.meals.find((meal) => meal.id === line.mealId)?.price != null);
  const subtotal = pricesKnown ? draft.items.reduce((sum, line) => sum + (snapshot.meals.find((meal) => meal.id === line.mealId)?.price || 0) * line.quantity, 0) : null;
  const dateId = draft.purpose === "plan" ? "plan-start-date" : "requested-date";

  return <>
    <div className="request-notices">
      {!ready && <p role="status" className="notice">Checking for a saved request in this tab…</p>}
      {storageWarning && <p role="alert" className="notice warning">{storageWarning}</p>}
      {error && <p role="alert" className="form-error">{error}</p>}
    </div>
    <div className="field purpose-field"><label htmlFor="request-purpose">What would you like to discuss?</label><select id="request-purpose" name="request-purpose" value={draft.purpose} disabled={!ready} onChange={(event) => {
      const purpose = event.target.value as InquiryPurpose;
      if (!["meals", "plan", "general", "catering"].includes(purpose)) return;
      updateDraft((current) => ({ ...current, purpose }), "Inquiry purpose changed. Only the active inquiry is included in your message.");
    }}><option value="meals">Individual meals</option><option value="plan">A meal plan</option><option value="general">A general question</option><option value="catering">Team catering</option></select><p className="small-note">Meal and plan drafts stay separate. Switching purpose does not add inactive selections to your message.</p></div>
    {undo && <div className="undo-notice" role="region" aria-label="Undo last removal">
      <p>Your last removal or clear can be undone until you make another change.</p>
      <div className="button-row"><button type="button" id="undo-request-change" className="button secondary" onClick={() => { request.undoChange(); requestAnimationFrame(() => document.getElementById("request-purpose")?.focus()); }}>Undo</button><button type="button" className="text-button" onClick={() => { request.dismissUndo(); document.getElementById("request-purpose")?.focus(); }}>Dismiss</button></div>
    </div>}
    <div className="request-layout">
      <section className="request-selections" aria-label="Active request details">
        {draft.purpose === "meals" && <>
          {!!draft.items.length && <div className="selection-heading"><p>{total} {total === 1 ? "meal" : "meals"} selected · no reservation</p><button type="button" className="text-button" disabled={!ready} onClick={() => {
            updateDraft((current) => ({ ...current, items: [], requestedDate: "" }), "Meal draft cleared. Your plan draft is unchanged. Undo is available.", true);
            focusUndo();
          }}>Clear meal draft</button></div>}
          {draft.items.map((item, index) => <MealLine key={`${item.mealId}:${index}`} item={item} index={index} meal={snapshot.meals.find((meal) => meal.id === item.mealId)} />)}
        </>}
        {draft.purpose === "plan" && draft.planId && <article className="request-plan">
          <span className="eyebrow">{plan?.isSample ? "Sample plan discussion" : "Plan discussion"}</span><h2>{plan?.name || "Unavailable plan"}</h2>
          {plan ? <><p>{plan.description}</p><h3>Plan description</h3><p>{plan.meals} meals across {plan.days} days{plan.isSample ? " · illustrative inclusions" : ""}</p><ul className="plan-inclusions">{plan.inclusions.map((inclusion) => <li key={inclusion}>{inclusion}</li>)}</ul><dl className="plan-terms"><div><dt>Delivery schedule</dt><dd>{plan.deliverySchedule}</dd></div><div><dt>Choices & substitutions</dt><dd>{plan.choicePolicy}</dd></div><div><dt>Delivery fees</dt><dd>{plan.deliveryFees}</dd></div></dl><strong>{formatPrice(plan.price)}</strong></> : <p className="form-error">This saved plan is not in the current catalog. Remove it and explore the available plans.</p>}
          <p className="small-note">One team-managed plan inquiry, not multiple meals in a cart. No automatic renewal or recurring billing at launch.</p>
          <div className="button-row"><Link href="/plans/" className="text-link">Compare plans</Link><button type="button" className="text-button" disabled={!ready} onClick={() => {
            updateDraft((current) => ({ ...current, planId: null, planStartDate: "" }), "Plan draft removed. Your meal draft is unchanged. Undo is available.", true);
            focusUndo();
          }}>Remove plan</button></div>
        </article>}
        {empty && <div className="empty-state"><span className="empty-leaf" aria-hidden="true">↗</span><h2>Room for something good.</h2><p>{draft.purpose === "plan" ? "Choose a plan to start a separate plan conversation. Your individual meals will not be included." : "Your meal request starts empty. Explore the menu, choose a supported option, and come back to review."}</p><Link href={draft.purpose === "plan" ? "/plans/" : "/menu/"} className="button">{draft.purpose === "plan" ? "Explore meal plans" : "Browse the menu"}</Link><WhatsAppLink className="text-link">Ask about the current menu</WhatsAppLink></div>}
        {draft.purpose === "general" && <div className="inquiry-card"><span className="eyebrow">No selections required</span><h2>Let’s start with a question.</h2><p>Ask about the current menu, pricing, delivery area, and how to request a meal. No saved meals or plans are included.</p><p className="small-note">You can add your question directly in WhatsApp. Please don’t include medical or payment information in a website draft.</p></div>}
        {draft.purpose === "catering" && <div className="inquiry-card"><span className="eyebrow">For your team</span><h2>A better kind of team break.</h2><p>Start a catering conversation. Service details, menus, headcount limits, availability, and pricing need team confirmation. No saved meals or plans are included.</p><div className="field"><label htmlFor="catering-headcount">Approximate headcount (optional)</label><input id="catering-headcount" name="headcount" type="text" inputMode="numeric" pattern="[1-9][0-9]*" maxLength={6} autoComplete="off" value={draft.headcount} disabled={!ready} onChange={(event) => updateDraft((current) => ({ ...current, headcount: event.target.value.replace(/[^0-9]/g, "") }), "Approximate catering headcount updated.")} placeholder="For example, 20…" /></div></div>}
        {!empty && draft.purpose !== "general" && <div className="request-date field">
          <label htmlFor={dateId}>{draft.purpose === "plan" ? "Requested start date" : draft.purpose === "catering" ? "Preferred event date" : "Preferred meal date"} (optional)</label>
          <input id={dateId} name={dateId} type="date" min={today || undefined} autoComplete="off" value={date} disabled={!ready} aria-invalid={dateInvalid} aria-describedby={`${dateId}-help${dateInvalid ? ` ${dateId}-error` : ""}`} onChange={(event) => {
            const value = event.target.value;
            updateDraft((current) => draft.purpose === "plan" ? { ...current, planStartDate: value } : { ...current, requestedDate: value }, "Requested date updated. No delivery slot has been reserved.");
          }} />
          <p id={`${dateId}-help`} className="small-note">A preference only, not a booking. {draft.purpose === "plan" ? "Your plan start date is separate from your meal date." : "Availability and delivery timing must be confirmed."}</p>
          {dateInvalid && <p className="form-error" id={`${dateId}-error`} role="alert">Choose today or a future date, or clear this optional field.</p>}
        </div>}
        <p className="small-note privacy-note">No name, address, medical details, or payment information is collected here. Only limited selections are saved for this browser tab; closing the tab ends the session.</p>
      </section>
      <aside className="request-summary" id="request-actions" aria-labelledby="request-summary-heading">
        <span className="eyebrow">A conversation, not a checkout</span><h2 id="request-summary-heading">The small print,<br />up front.</h2>
        <dl className="summary-list">
          <div><dt>Active inquiry</dt><dd>{{ meals: "Individual meals", plan: "One meal plan", general: "General question", catering: "Team catering" }[draft.purpose]}</dd></div>
          {offer && <div><dt>{draft.purpose === "plan" ? "Plan price" : "Meal subtotal"}</dt><dd>{empty ? "Nothing selected" : draft.purpose === "plan" ? formatPrice(plan?.price ?? null) : formatPrice(subtotal)}</dd></div>}
          <div><dt>Delivery & other fees</dt><dd>To be confirmed</dd></div>
          <div><dt>Final total</dt><dd>Not quoted</dd></div>
        </dl>
        {validationError && <p className="form-error" role="alert">{validationError}</p>}
        {offer && !empty && <div className="catalog-check">
          {isSample && <p className="notice"><strong>Sample offers cannot be sent.</strong> These selections are for local review only. Ask the team about the real current menu instead.</p>}
          <button type="button" className="button secondary" disabled={!ready || refreshing} onClick={request.refreshCatalog}>{refreshing ? "Checking catalog…" : "Check current catalog"}</button>
          <p className="small-note">{checkedAt && !fresh && !needsReview ? "The catalog check expired or your selection changed. Check again before handoff." : "A fresh catalog check is required before any live offer handoff. Your draft is kept if the check fails."}</p>
          {!!issues.length && <div className="catalog-issues" role="status" aria-live="polite"><h3>Catalog review</h3><ul>{issues.map((issue, index) => <li key={`${index}:${issue}`}>{issue}</li>)}</ul></div>}
          {needsReview && <button type="button" className="button secondary" disabled={!checkedAt || refreshing} onClick={request.acknowledgeCatalog}>I reviewed the catalog changes</button>}
        </div>}
        <MessagePreview message={message} decision={decision} />
        {!decision.allowed && !empty && !validationError && <p className="small-note">{decision.reason}</p>}
        <WhatsAppLink className="text-link">Ask about the current menu</WhatsAppLink>
        <p className="small-note">The general inquiry above contains no sample selections. Opening WhatsApp shares its prepared draft with WhatsApp; you still press Send yourself.</p>
        <div className="next-steps"><h3>What happens next</h3><ol><li>You review your inquiry.</li><li>You choose whether to send it.</li><li>The team agrees the details and explicitly confirms.</li></ol><p>Nothing is reserved, charged, or accepted by this website.</p></div>
        <Link href="/menu/" className="text-link">Keep exploring <span aria-hidden="true">↗</span></Link>
      </aside>
    </div>
    <p className="repeat-note">Back for another meal? Browse the current menu or continue your existing chat. The team will reconfirm availability and pricing for every new request.</p>
  </>;
}
