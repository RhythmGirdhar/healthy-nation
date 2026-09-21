# Healthy Nation: agent and contributor guidance

## Current phase

The owner has approved implementing the reviewed design. Both independent reviews are complete and their corrections are documented. Build the V1 application using those decisions; hosting, DNS, payments, and customer accounts remain deferred.

Read the [documentation index](README.md), [product brief](product-brief.md), [architecture proposal](architecture.md), and [review register](reviews.md). Preserve the difference between approved requirements, proposed design, incomplete scaffolding, and delivered behavior.

## Product boundaries

- The name is **Healthy Nation**. Preserve the supplied green-and-white logo and its proportions.
- V1 is a public, read-only meal/plan storefront. Customers prepare requests and manually send them through WhatsApp. The team explicitly confirms availability, price, payment arrangements, and delivery.
- A selected meal is not reserved. Opening WhatsApp is not proof of sending, payment, acceptance, or fulfillment.
- Do not add checkout, automatic recurring billing, customer accounts, a transactional database, a CMS, or deployment resources to V1 without an explicit scope decision.
- The founder is **Shivansh Girdhar**, who holds a **degree in Culinary Sciences**. The owner supplied **+91 81049 60748** and a five-page menu PDF containing 55 priced dishes. The real dishes can be requested; the example plans remain preview-only. Do not invent recipes, allergens, portions, nutrition, per-dish photos, additional biography, or delivery coverage.
- Keep general, meal, plan, and catering inquiries distinct. Do not quietly include an inactive selection in a different inquiry.

## Architecture guidance

The accepted V1 direction is one Next.js App Router + TypeScript project with build-validated editable content and static delivery. Existing preliminary code must be reconciled with these boundaries as implementation proceeds.

- Keep content loading and full catalog validation on the build/server side.
- Supply small serializable public data snapshots to interactive components. Do not import the full content/validation graph into client code.
- Use pure, explicitly parameterized draft/reconciliation/message functions and type-only imports where appropriate.
- Keep catalog revision and validity separate from draft schema version. Reconcile stale selections without silently dropping unaffected lines.
- Use one shared, fail-closed preview/live handoff policy across all entry points.
- Published real dishes may coexist with explicitly flagged sample plans. Validate the selected offers individually. A missing menu expiry is represented by `validUntil: null`, not an invented date; fresh catalog checks and any configured bounds still apply.
- Use static-compatible generated routes and image assets if the static-first proposal is accepted. Do not assume a runtime API or image optimizer is available.
- Do not create HTTP endpoints merely for pages to fetch their own local catalog.

## Customer data and trust

- Store only limited, non-sensitive request selections in same-tab session storage. Treat restored storage as untrusted.
- Do not put addresses, medical histories, free-form sensitive notes, payment information, or credentials into drafts, public catalog files, URL parameters, or tracking events.
- Explain that opening a WhatsApp handoff transmits the prepared draft URL to WhatsApp before the customer sends it to the business.
- Do not prefetch handoff URLs or log complete URLs/message bodies. Keep copyable/selectable text available as a fallback.
- Treat nutrition and medical-condition positioning as business/professional-review decisions. Never imply treatment or guaranteed suitability.

## Code and UX standards when implementation resumes

- Use strict TypeScript and explicit data contracts; validate external or editable inputs at their boundary.
- Follow the installed framework's APIs and the local guidance in [web/AGENTS.md](../web/AGENTS.md). Next.js bundles version-matched documentation with the installed package.
- Surface loading, invalid content, missing configuration, storage failure, unavailable selections, and network/clipboard errors with actionable messages.
- Follow the architecture's accessibility and performance acceptance criteria. Use semantic controls, visible focus, accessible names, honest status messages, and reduced-motion support.
- Keep food illustrations and sample offers labeled until replaced by approved content. Do not use fake reviews, popularity rankings, prices, or customer counts.
- Add focused tests for behavior changes. Distinguish what was actually exercised from what remains a proposed test or launch target.

## Files and documentation

- `web` contains the application scaffold, not the design-review prototype.
- `docs/design` contains review-only browser artifacts, not production frontend code.
- `assets/brand` preserves the original supplied logo. Derived web assets must not overwrite it.
- Put substantive project documentation under `docs`; maintain short root entry points instead of duplicating entire documents.
- Preserve the generated Next.js instruction block in `web/AGENTS.md` and the `web/CLAUDE.md` discovery pointer.
- Keep configuration examples free of real private credentials. Public contact/domain values still require owner confirmation.
- Do not infer approval to deploy, change DNS, purchase services, or publish a design from a placeholder domain or an existing preview.

## Review workflow

Engineering and product reviewers should form their assessments independently before findings are combined. Record evidence, priority, proposed correction, and disposition in [reviews.md](reviews.md). Mark fixes as design changes unless implementation and verification have actually occurred.

Unresolved business decisions belong in the review/launch-input list; they must not be disguised as code defaults.
