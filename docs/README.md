# Healthy Nation documentation

This folder is the home for project requirements, architecture, design, reviews, and contributor guidance.

## Read in this order

| Document | Purpose |
| --- | --- |
| [Product brief](product-brief.md) | Mission, audience, confirmed brand, complete V1 WhatsApp approach, and V2/V3 scope. |
| [Architecture proposal](architecture.md) | System boundaries, data model, draft lifecycle, handoff policy, publishing process, and proposed quality gates. |
| [Visual design](design/README.md) | Screen concept, preview instructions, and the distinction between the prototype and the real app. |
| [Independent reviews](reviews.md) | Engineering and business/product findings, corrections, and outstanding review work. |
| [Customer journey reviews](customer-reviews.md) | Two independent customer-role reviews, applied changes and remaining food/service inputs. |
| [Founder questions](founder-questions.md) | Questions to confirm delivery, food details, photos, plans and operating policies. |
| [Development guide](development.md) | Repository layout, local commands, configuration, and current implementation limitations. |
| [Content editing](content-editing.md) | Founder/contact facts, portrait setup, editable catalog, and safe sample-to-live publication. |
| [Future content editor](future-content-admin.md) | A separate self-service admin UI for meals, plans, contact settings, photo uploads, previews, and publishing. |
| [Agent guidance](AGENTS.md) | Project-specific rules for contributors and coding agents. |

## Decision and delivery status

| Area | Status |
| --- | --- |
| Brand | Confirmed: **Healthy Nation**, supplied green-and-white logo. |
| Founder and contact | Confirmed: Shivansh Girdhar, degree in Culinary Sciences; WhatsApp **+91 81049 60748**. Founder photograph not supplied. |
| Menu and photos | 55 priced dishes imported from the supplied PDF. All 75 unique supplied food photos are in the kitchen gallery. Fifty-two dishes use labelled example photos; exact matches and food facts need confirmation. Sample plans remain protected. |
| Application stack | Confirmed: Next.js and TypeScript in one project. |
| Content management | Confirmed: editable content files first; CMS/admin later. |
| V1 transaction model | Confirmed: WhatsApp inquiry/request and manual team confirmation, not website checkout. |
| Architecture and visual design | Reviewed direction approved by the owner for V1 implementation. |
| Technical delivery mode | Static export with build-validated content; hosting vendor still deferred. |
| Application | Working local storefront, dish pages, plans, request review, About, FAQ, Catering and kitchen gallery under `web`. |
| Request flow | Multi-meal selection, filter restoration, separate inquiry dates, same-tab storage, purpose-specific change review, copy and manual WhatsApp sending. |
| Independent reviews | Architecture/product and customer-role passes completed. The review documents distinguish historical design findings, implemented fixes and business inputs. |
| Hosting, domain, DNS | Owner reported **thehealthynation.in** and **healthynation.co.in**. Primary domain, hosting, and DNS configuration remain deferred. |
| Design reference | The current design view uses the real local app. The original sample prototype is preserved as a historical review artifact. Source publication is not a deployment. |

Local checks do not establish business readiness, production performance or a complete accessibility audit. Confirm the [founder inputs](founder-questions.md) before launch.

## Documentation ownership

The product brief describes scope; the architecture document describes the proposed technical design. Neither can silently approve a business promise, live contact number, or deployment.

Keep review status and implementation status separate. Record accepted changes in the appropriate document and their disposition in the review register. The design direction is approved; do not treat that as approval of unconfirmed food facts or deployment.

The root README and AGENTS files are short discovery pointers. `web/AGENTS.md` and its `CLAUDE.md` pointer remain in place because Next.js and coding tools discover them there; project-specific guidance lives here.
