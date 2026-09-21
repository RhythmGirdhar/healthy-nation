# Independent design reviews

[Documentation index](README.md) | [Architecture proposal](architecture.md) | [Visual design](design/README.md)

## Scope and status

The owner requested two independent perspectives before implementation resumes:

- **Principal engineer:** technical efficiency, ownership, TypeScript/Next.js boundaries, standards, reliability, accessibility architecture, privacy, and maintainability.
- **Business/product/marketing reviewer:** customer fit, conversion, personas, operational viability, usability, visual hierarchy, typography, color, and imagery.

**Both independent reviews are complete.** Each reviewer assessed the architecture first, then independently inspected the same frozen storefront concept. Their actionable findings have been incorporated into the proposal and [revised visual concept](design/index.html).

Corrections below have been applied to the design proposal, prototype, and supporting documentation, not to the paused Next.js application. Owner approval and implementation are still separate steps.

Reviewed baseline SHA256: `51AA8DF2DB086A62C4AE7D80333B81CEE6CDA9D4B56EAE2DAEC2DF5D14FB1C3D`.

Revised concept SHA256: `B684937067CBBB5A281DEC96D65EF374B65576B767B5AFA4DFBBC4595448CAE8`.

After the review corrections, the owner requested a seamless logo/navbar background. The navbar now uses the displayed logo's sampled opaque white (`#F9FBFC`); its color is checked at desktop and mobile widths.

## Principal-engineer findings

| ID | Priority | Finding | Design correction and disposition |
| --- | --- | --- | --- |
| ENG-01 | P2 | Draft schema version does not establish that an open tab has the current menu. | **Documented:** separate catalog revision and validity; refresh and reconcile before handoff, preserve unaffected lines, flag changed offers, and retain drafts on failed handoff. |
| ENG-02 | P2 | Preview/live behavior needs an enforceable shared rule, not just disabled button copy. | **Documented:** one fail-closed handoff policy, with independently approved contact, live publication, fresh valid offers, and separate general-inquiry behavior. |
| ENG-03 | P2 | Static export and a Next.js runtime are not interchangeable deployment switches. | **Documented:** static-first baseline without unnecessary API endpoints; generated meal paths, static 404s, image variants, and a public catalog snapshot. Runtime V2 requires revisiting those assumptions. |
| ENG-04 | P2 | Browser request logic could import the full server catalog/validation dependency graph. | **Documented:** build/server-only loading and validation, public DTOs, type-only imports, and pure parameterized browser helpers. |
| ENG-05 | P2 | Code-edited content lacks a publishing/urgent-correction/rollback contract. | **Documented:** business approver, release and backup owners, pre-release gates, atomic publication, smoke checks, and availability-aware rollback. |
| ENG-06 | P2 | Opening a WhatsApp link discloses its draft URL before the customer presses Send. | **Documented:** explicit disclosure, no prefetch or full-URL/body logging, and always-available selectable/copyable text. |
| ENG-07 | P2 | Accessibility and performance aspirations need measurable acceptance criteria. | **Documented:** WCAG 2.2 AA target, contrast/focus/reflow/zoom checks, proposed performance budgets, Core Web Vitals targets, and failure-state coverage. |
| ENG-08 | P3 | Original README still prescribed a CMS/host and said no scaffold existed. | **Corrected:** the product brief and documentation index reflect approved editable files, deferred hosting, and the unfinished scaffold. |

Evidence was the architecture proposal, browser-rendered architecture presentation, and relevant preliminary modules. The reviewer found no evidenced P1 defect in the paused, non-live design; this is not production approval.

Retain the positive decisions: one application, no obligatory HTTP API, build-validated content, stable identifiers, limited drafts, no sensitive fulfillment fields, an explicit request-versus-order distinction, and deferred commerce complexity.

## Business/product findings

| ID | Priority | Finding | Design correction and disposition |
| --- | --- | --- | --- |
| PROD-01 | P2 | Delivery coverage and ordering context are not specified early enough in the journey. | **Applied to proposal and concept:** early Home/Menu service-area/order-window copy explicitly says facts are pending. |
| PROD-02 | P2 | Unclear price and portion comparison weakens the affordable everyday-meal proposition. | **Applied to proposal and concept:** cards show price and portion status; request review separates subtotal from unknown fees. Real prices remain a launch input. |
| PROD-03 | P2 | Plan count/duration alone does not explain fulfillment. | **Applied to proposal and concept:** each plan displays pending delivery cadence, choice/substitution rules, and fee treatment. |
| PROD-04 | P3 | Manual repeat ordering should not wait for V3 accounts. | **Applied to proposal and concept:** repeat-request copy points to the current menu or existing chat, with availability reconfirmed. No CRM or new persistence added. |

These are expert judgments and product hypotheses, not findings from actual customer interviews or conversion data.

## Persona coverage

| Persona | Design intent | Remaining concern |
| --- | --- | --- |
| Busy professionals | Quick discovery and an uncomplicated request. | Coverage, meal timing, predictable response, and fulfillment must be easy to understand. |
| Fitness-conscious customers | Clear ingredients, portion, and verified nutrition where available. | Do not turn fitness intent into unsupported clinical claims or made-up macros. |
| Athletes, yoga/mindfulness, convenience seekers | Shared dietary and routine-based decision aids. | Separate persona funnels are not justified without evidence. |
| Corporate buyers | Separate inquiry without requiring a meal selection. | The concept inquiry was exercised; actual service details and event handling still need business confirmation. |

## Final visual and interaction findings

The reviewers worked from the unchanged baseline above without reading each other's findings. Shared findings are listed once here.

| ID | Priority | Reviewer(s) and observed problem | Correction in the revised concept |
| --- | --- | --- | --- |
| VIS-01 | P2 | Both: long meal-option text overflowed mobile dialogs. | Shrinkable grid tracks/children, full-width selects, and shorter display labels. Checked at 320px, 390px, and the constrained mobile artboard. |
| VIS-02 | P2 | Both: per-meal preferences could conflict with a global taste selector. | Removed the global control; supported options are editable per meal and the message includes only resolved per-line instructions. |
| VIS-03 | P2 | Engineering: expanded mobile navigation obscured focus after Tab left the disclosure. | Close on focus leaving or outside-pointer interaction; retain Escape and ordinary non-modal navigation. |
| VIS-04 | P2 | Engineering: Undo could restore an obsolete whole draft over later edits. | Invalidate old undo after another draft mutation. Immediate reset/removal undo remains available without deleting newer work. |
| VIS-05 | P2 | Engineering: essential input borders had approximately 1.8:1 contrast. | Added a stronger control-boundary color, retaining visible focus; measured the revised boundary against its background at >= 3:1. |
| VIS-06 | P3 | Engineering: the skip link erased active filter/search route state. | Move focus/scroll without replacing the current hash parameters. |
| VIS-07 | P2 | Product: important prices, options, summaries, and inclusions were 10-11px. | Increased decision text toward 14px and explanatory body text toward 16px while preserving the editorial heading treatment. |
| VIS-08 | P2 | Product: an automatically seeded chicken meal appeared in vegetarian and plan-only requests. | Start empty. An explicit **Load example request** control outside the storefront is the only way to load the demonstration meal. |
| VIS-09 | P2 | Product: opening a dish discarded search/filter context. | Preserve query/category parameters and browsing position through meal-detail open/close. |
| VIS-10 | P2 | Product: plans inherited ambiguous meal quantities, preferences, and dates. | Keep meal/plan drafts separate; one plan inquiry has no stepper, uses **Plan description**, and has its own **Requested start date**. |
| VIS-11 | P2 | Product: the mobile menu introduction hid the first identifiable dish below the initial viewport. | Shortened the Menu introduction, reduced duplicate navigation, and used compact mobile meal cards. The first meal heading is fully visible at 390x844. |
| VIS-12 | P3 | Product: hero positioning was generic and two inquiry labels implied the wrong action. | Explicit individual-meal/team-managed-plan positioning, aspirational affordability, and clear team-message/inquiry copy. |

### Optional idea deliberately deferred

The product reviewer suggested adding meals without always navigating to Request Review. The current control explicitly says **Add to request & review**, so it remains truthful. Choosing a browse-first versus review-first flow is left for the owner's design discussion rather than expanding the interaction model during correction.

### Positive visual decisions retained

- Original logo, deep green, warm white, restrained sage/peach, and an editorial serif heading style.
- Clearly labeled original food illustrations instead of invented actual food photography.
- A small, understandable set of sample meals and plans.
- No fabricated reviews, nutrition numbers, auto-renewal promises, paid-order states, or live sends.
- Native dialogs, keyboard-accessible controls, visible focus, and separate general/catering inquiries.

## Verification and limitations

The reproducible [prototype regression script](design/verify.cjs) passes against the revised concept. It covers empty start, vegetarian-only selection, per-meal preferences, search/filter/scroll preservation, safe undo, independent meal/plan dates, plan wording, invalid dates, mobile navigation, dialog reflow, input contrast, and decision-text sizes.

Desktop, 390px, and 320px layouts were exercised, along with the Desktop/Mobile artboard controls. Observed flows produced no JavaScript exceptions or external requests. Opening WhatsApp remains simulated; no message was sent.

The product reviewer inspected a desktop Home screenshot, but further image-view limits restricted screenshot inspection. Both reviewers used rendered browser interactions and DOM measurements for other findings. Native zoom behavior and screen-reader compatibility were not certified. These checks are not a complete accessibility audit, real-customer usability study, production performance result, or approval to launch.

## Launch gates, not bugs in a truthful concept

- Approved recipes, ingredients, portions, allergens, availability, actual prices, and appropriate review of nutrition/condition-specific claims.
- Verified business contact, delivery area, cutoff windows, fees, response expectations, and staffed ownership.
- Meal-plan cadence, choice, skip/cancellation/refund terms, and allergy-handling policies.
- Actual food photography before claiming that concept illustrations show the meals being sold.
- Confirmation of price/value fit and contribution margin after ingredients, labor, packaging, delivery, waste, and manual inquiry handling.

## Next decision

The owner should review the corrected concept and approve or revise its direction before application implementation resumes. Keep **design fixed**, **implemented**, and **verified** as distinct states in future updates.
