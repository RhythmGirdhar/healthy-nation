import type { Metadata } from "next";
import Link from "next/link";
import { getPublicCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { SelectPlanButton } from "@/components/selection-controls";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { MealImage } from "@/components/meal-image";

export const metadata: Metadata = { title: "Meal plans", description: "Explore Healthy Nation team-managed meal plan ideas. Compare sample meal counts, durations, delivery details, and a rotating weekly menu." };

export default function PlansPage() {
  const catalog = getPublicCatalog();
  const hasSamplePlans = catalog.plans.some((plan) => plan.isSample);
  return <>
    <div className="container">
      <header className="page-intro"><span className="eyebrow">Team-managed plans</span><h1>Meal plans</h1><p>Compare meal counts, schedules, and choices. The team confirms the details with you.</p>{hasSamplePlans && <p className="small-note">Plans marked as samples are examples, not confirmed offers. The supplied menu did not include meal-plan pricing or terms.</p>}</header>
      <div className="plan-grid">{catalog.plans.map((plan, index) => <article key={plan.id} className={`plan-card${plan.featured ? " featured-plan" : ""}`}>
        <span className="plan-number" aria-hidden="true">0{index + 1} /</span><span className="eyebrow">{plan.eyebrow}</span><h2>{plan.name}</h2><p>{plan.description}</p>
        <p className="plan-count">{plan.meals} meals · {plan.days} days{plan.isSample ? " · sample" : ""}</p>
        <p className="plan-price">{formatPrice(plan.price)}</p><ul>{plan.inclusions.map((inclusion) => <li key={inclusion}>{inclusion}</li>)}</ul>
        <dl className="plan-terms"><div><dt>Delivery schedule</dt><dd>{plan.deliverySchedule}</dd></div><div><dt>Choices & substitutions</dt><dd>{plan.choicePolicy}</dd></div><div><dt>Delivery fees</dt><dd>{plan.deliveryFees}</dd></div></dl>
        <SelectPlanButton planId={plan.id} isSample={plan.isSample} light={plan.featured} />
        {plan.isSample && <p className="small-note">Sample plan · local preview only</p>}
      </article>)}</div>
      <p className="notice plan-notice"><strong>Team-managed, not auto-renewed.</strong> At launch the team would agree your plan directly with you. No automatic renewal or recurring billing. Final availability, delivery, changes, cancellation, and refund terms need confirmation.</p>
    </div>
    <section className="weekly-section"><div className="container">
      <div className="section-intro"><div><span className="eyebrow">Meal rotation</span><h2>{catalog.weeklyMenu.days.length && catalog.weeklyMenu.isSample ? "Sample weekly menu" : "Weekly menu"}</h2><p>{catalog.weeklyMenu.label}</p>{catalog.weeklyMenu.days.length > 0 && catalog.weeklyMenu.isSample && <p className="small-note">An example rotation, not scheduled or available meals.</p>}</div></div>
      {!catalog.weeklyMenu.days.length && <WhatsAppLink className="text-link">Ask about the weekly menu</WhatsAppLink>}
      <div className="weekly-grid">{catalog.weeklyMenu.days.map((day) => {
        const meal = catalog.meals.find((entry) => entry.id === day.mealId);
        return meal ? <article className="week-day" key={day.day}><span className="eyebrow">{day.day}</span><MealImage meal={meal} width={180} height={149} decorative /><div><h3>{meal.name}</h3><Link href={`/menu/${meal.slug}/`} className="text-link">Explore meal <span aria-hidden="true">↗</span></Link></div></article> : null;
      })}</div>
    </div></section>
    <div className="container section"><div className="notice"><h2>Have something else in mind?</h2><p>Start with a general inquiry. You don’t need to share a diagnosis or health history to explore the idea.</p><WhatsAppLink className="text-link">Ask the team about meal plans</WhatsAppLink></div></div>
  </>;
}
