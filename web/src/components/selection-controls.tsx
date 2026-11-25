"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Meal } from "@/lib/types";
import { useRequest } from "./request-provider";

export function AddMealForm({ meal, compact = false, query = "" }: { meal: Meal; compact?: boolean; query?: string }) {
  const { ready, draft, updateDraft, rememberMenu, menuHref } = useRequest();
  const [option, setOption] = useState(meal.options[0] || "");
  const [error, setError] = useState("");
  const router = useRouter();
  const count = draft.items.filter((line) => line.mealId === meal.id).reduce((total, line) => total + line.quantity, 0);
  return <form className={compact ? "quick-add" : "meal-selection"} aria-label={`Select ${meal.name}`} onSubmit={(event) => {
    event.preventDefault();
    if (!ready) return;
    if (!meal.options.includes(option)) { setError("Choose a supported option for this meal."); return; }
    const existing = draft.items.find((line) => line.mealId === meal.id && line.option === option);
    if (existing && existing.quantity >= 99) { setError("The request already contains 99 of this meal and option. Review the existing quantity."); return; }
    setError("");
    if (compact) rememberMenu(query, window.scrollY);
    updateDraft((current) => {
      const found = current.items.find((line) => line.mealId === meal.id && line.option === option);
      return {
        ...current, purpose: "meals",
        items: found ? current.items.map((line) => line === found ? { ...line, quantity: line.quantity + 1 } : line) : [...current.items, { mealId: meal.id, option, quantity: 1 }],
      };
    }, `${meal.name} added to your request. It is not reserved or ordered.`);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (submitter instanceof HTMLButtonElement && submitter.value === "browse") {
      router.push(menuHref, { scroll: false });
    } else if (!compact) router.push("/request/");
  }}>
    {!compact && <div className="field"><label htmlFor={`meal-option-${meal.id}`}>Your meal option{meal.isSample ? " (sample)" : ""}</label><select id={`meal-option-${meal.id}`} name="meal-option" autoComplete="off" value={option} onChange={(event) => { setOption(event.target.value); setError(""); }} disabled={!meal.options.length}>{meal.options.map((entry) => <option key={entry}>{entry}</option>)}</select></div>}
    {meal.isSample && <p className="small-note">Illustrative options only. Sample selections can be previewed locally, not sent as offer requests.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="button-row"><button type="submit" className={`button${compact ? " secondary compact" : ""}`} disabled={!ready || !meal.available || !meal.options.length} aria-label={compact ? `Add ${meal.name} to request` : undefined}>{!meal.available ? "Currently unavailable" : compact ? "Add to request" : "Add to request & review"}{!compact && <span aria-hidden="true">↗</span>}</button>
      {!compact && <button type="submit" value="browse" className="text-button" disabled={!ready || !meal.available || !meal.options.length}>Add & keep browsing</button>}
    </div>
    {count > 0 && <p className="selected-quantity" role="status">{count} in your request</p>}
  </form>;
}

export function SelectPlanButton({ planId, isSample, light = false }: { planId: string; isSample: boolean; light?: boolean }) {
  const { ready, updateDraft } = useRequest();
  const router = useRouter();
  return <button type="button" className={`button ${light ? "light" : "secondary"}`} disabled={!ready} onClick={() => {
    updateDraft((draft) => ({ ...draft, purpose: "plan", planId }), "Plan selected for discussion. Your individual meals remain separate.");
    router.push("/request/");
  }}>{isSample ? "Explore this sample plan" : "Discuss this plan"} <span aria-hidden="true">↗</span></button>;
}
