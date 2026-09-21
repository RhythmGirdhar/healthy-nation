"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Meal } from "@/lib/types";
import { MealCard } from "./meal-card";
import { useRequest } from "./request-provider";

const diets = ["Vegetarian", "Plant-based", "Non-vegetarian"];
const categories = ["Bowls", "Wraps", "Breakfast"];

function safeMenuParams(input: URLSearchParams): URLSearchParams {
  const safe = new URLSearchParams();
  const query = (input.get("q") || "").slice(0, 80).replace(/[\u0000-\u001f\u007f]/g, "");
  if (query) safe.set("q", query);
  const diet = input.get("diet");
  const category = input.get("category");
  if (diet && diets.includes(diet)) safe.set("diet", diet);
  if (category && categories.includes(category)) safe.set("category", category);
  return safe;
}

export function BackToMenu() {
  const search = useSearchParams();
  const query = safeMenuParams(new URLSearchParams(search.toString())).toString();
  return <Link href={`/menu/${query ? `?${query}` : ""}`} scroll={false} className="text-link">← Back to the menu</Link>;
}

export function MenuBrowser({ meals }: { meals: Meal[] }) {
  const search = useSearchParams();
  const { rememberMenu, takeMenuPosition } = useRequest();
  const restored = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const params = safeMenuParams(new URLSearchParams(search.toString()));
  const query = params.toString();
  const text = params.get("q") || "";
  const diet = params.get("diet") || "";
  const category = params.get("category") || "";
  const normalized = text.trim().toLocaleLowerCase();
  const matches = meals.filter((meal) =>
    (!diet || meal.diet === diet) && (!category || meal.category === category) &&
    [meal.name, meal.description, ...meal.ingredients].join(" ").toLocaleLowerCase().includes(normalized));

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const position = takeMenuPosition(query);
    if (position !== null) window.scrollTo({ top: position, behavior: "instant" });
  }, [query, takeMenuPosition]);

  function change(key: string, value: string) {
    const next = safeMenuParams(new URLSearchParams(window.location.search));
    if (value) next.set(key, value);
    else next.delete(key);
    const serialized = safeMenuParams(next).toString();
    window.history.replaceState(null, "", `/menu/${serialized ? `?${serialized}` : ""}`);
  }
  function reset() {
    window.history.replaceState(null, "", "/menu/");
    searchRef.current?.focus();
  }
  return <>
    <div className="menu-controls">
      <div className="field menu-search"><label htmlFor="meal-search">Find a meal</label><input ref={searchRef} id="meal-search" name="q" type="search" autoComplete="off" maxLength={80} placeholder="Try chickpea or berry…" value={text} onChange={(event) => change("q", event.target.value)} /></div>
      <div className="field"><label htmlFor="menu-diet">Dietary direction</label><select id="menu-diet" name="diet" value={diet} onChange={(event) => change("diet", event.target.value)}><option value="">All dietary ideas</option>{diets.map((entry) => <option key={entry}>{entry}</option>)}</select></div>
      <div className="field"><label htmlFor="menu-category">Meal category</label><select id="menu-category" name="category" value={category} onChange={(event) => change("category", event.target.value)}><option value="">All categories</option>{categories.map((entry) => <option key={entry}>{entry}</option>)}</select></div>
    </div>
    <div className="menu-result-heading"><p role="status" aria-live="polite">{matches.length} {matches.length === 1 ? "meal idea" : "meal ideas"}{text || diet || category ? " matching your filters" : " to explore"}</p>{query && <button type="button" className="text-button" onClick={reset}>Reset filters</button>}</div>
    {matches.length ? <div className="meal-grid menu-grid">{matches.map((meal) => <MealCard key={meal.id} meal={meal} query={query} onNavigate={() => rememberMenu(query, window.scrollY)} />)}</div> : <div className="empty-state"><h2>No matches on this menu.</h2><p>Try another ingredient, or reset your search and filters to see all meal ideas.</p><button type="button" className="button secondary" onClick={reset}>Show all meals</button></div>}
  </>;
}

export function MenuFallback({ meals }: { meals: Meal[] }) {
  return <><p className="muted">Search & filters are loading…</p><div className="meal-grid menu-grid">{meals.map((meal) => <MealCard key={meal.id} meal={meal} />)}</div></>;
}
