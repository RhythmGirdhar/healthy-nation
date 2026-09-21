"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Meal } from "@/lib/types";
import { useRequest } from "./request-provider";

export function AddMealForm({ meal }: { meal: Meal }) {
  const { ready, draft, updateDraft } = useRequest();
  const [option, setOption] = useState(meal.options[0] || "");
  const [error, setError] = useState("");
  const router = useRouter();
  return <form className="meal-selection" onSubmit={(event) => {
    event.preventDefault();
    if (!ready) return;
    if (!meal.options.includes(option)) { setError("Choose a supported option for this meal."); return; }
    const existing = draft.items.find((line) => line.mealId === meal.id && line.option === option);
    if (existing && existing.quantity >= 99) { setError("The request already contains 99 of this meal and option. Review the existing quantity."); return; }
    updateDraft((current) => {
      const found = current.items.find((line) => line.mealId === meal.id && line.option === option);
      return {
        ...current, purpose: "meals",
        items: found ? current.items.map((line) => line === found ? { ...line, quantity: line.quantity + 1 } : line) : [...current.items, { mealId: meal.id, option, quantity: 1 }],
      };
    }, `${meal.name} added to your request. It is not reserved or ordered.`);
    router.push("/request/");
  }}>
    <div className="field"><label htmlFor="meal-option">Your meal option{meal.isSample ? " (sample)" : ""}</label><select id="meal-option" name="meal-option" autoComplete="off" value={option} onChange={(event) => { setOption(event.target.value); setError(""); }} disabled={!meal.options.length}>{meal.options.map((entry) => <option key={entry}>{entry}</option>)}</select></div>
    {meal.isSample && <p className="small-note">Illustrative options only. Sample selections can be previewed locally, not sent as offer requests.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button type="submit" className="button" disabled={!ready || !meal.available || !meal.options.length}>{!meal.available ? "Currently unavailable" : "Add to request & review"} <span aria-hidden="true">↗</span></button>
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
