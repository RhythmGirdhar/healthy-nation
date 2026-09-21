# Healthy Nation documentation

This folder is the home for project requirements, architecture, design, reviews, and contributor guidance.

## Read in this order

| Document | Purpose |
| --- | --- |
| [Product brief](product-brief.md) | Mission, audience, confirmed brand, complete V1 WhatsApp approach, and V2/V3 scope. |
| [Architecture proposal](architecture.md) | System boundaries, data model, draft lifecycle, handoff policy, publishing process, and proposed quality gates. |
| [Visual design](design/README.md) | Screen concept, preview instructions, and the distinction between the prototype and the real app. |
| [Independent reviews](reviews.md) | Engineering and business/product findings, corrections, and outstanding review work. |
| [Development guide](development.md) | Repository layout, local commands, configuration, and current implementation limitations. |
| [Content editing](content-editing.md) | Founder/contact facts, portrait setup, editable catalog, and safe sample-to-live publication. |
| [Future content editor](future-content-admin.md) | A separate self-service admin UI for meals, plans, contact settings, photo uploads, previews, and publishing. |
| [Agent guidance](AGENTS.md) | Project-specific rules for contributors and coding agents. |

## Decision and delivery status

| Area | Status |
| --- | --- |
| Brand | Confirmed: **Healthy Nation**, supplied green-and-white logo. |
| Founder and contact | Confirmed: Shivansh Girdhar, degree in Culinary Sciences; WhatsApp **+91 81049 60748**. Founder photograph not supplied. |
| Menu | 55 priced dishes imported from the supplied PDF. Missing food facts and per-dish photos are explicit; sample meal plans remain protected. |
| Application stack | Confirmed: Next.js and TypeScript in one project. |
| Content management | Confirmed: editable content files first; CMS/admin later. |
| V1 transaction model | Confirmed: WhatsApp inquiry/request and manual team confirmation, not website checkout. |
| Architecture and visual design | Reviewed direction approved by the owner for V1 implementation. |
| Technical delivery mode | Static export with build-validated content; hosting vendor still deferred. |
| Initial code | Scaffolding and preliminary catalog/domain modules exist under `web`. |
| Implementation | In progress, applying the independent-review corrections and confirmed founder/contact details. |
| Independent reviews | Both architecture and visual passes completed; corrections are applied to the proposal and concept, with reproducible prototype regression checks. |
| Hosting, domain, DNS | Owner reported **thehealthynation.in** and **healthynation.co.in**. Primary domain, hosting, and DNS configuration remain deferred. |
| Source checkpoint | Reviewed documentation/prototype and the unfinished scaffold are preserved together; source publication is not a deployment. |

The preliminary code does not yet implement all design corrections. Do not treat an architecture target, a clickable mock, or a configured test command as a delivered feature or a passed check.

## Documentation ownership

The product brief describes scope; the architecture document describes the proposed technical design. Neither can silently approve a business promise, live contact number, or deployment.

Keep review status and implementation status separate. Record accepted changes in the appropriate document and their disposition in the review register. The design direction is approved; do not treat that as approval of unconfirmed food facts or deployment.

The root README and AGENTS files are short discovery pointers. `web/AGENTS.md` and its `CLAUDE.md` pointer remain in place because Next.js and coding tools discover them there; project-specific guidance lives here.
