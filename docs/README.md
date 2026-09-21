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
| [Agent guidance](AGENTS.md) | Project-specific rules for contributors and coding agents. |

## Decision and delivery status

| Area | Status |
| --- | --- |
| Brand | Confirmed: **Healthy Nation**, supplied green-and-white logo. |
| Application stack | Confirmed: Next.js and TypeScript in one project. |
| Content management | Confirmed: editable content files first; CMS/admin later. |
| V1 transaction model | Confirmed: WhatsApp inquiry/request and manual team confirmation, not website checkout. |
| Architecture and visual design | Under discussion; not yet approved for full implementation. |
| Technical delivery mode | Static-first export is the current architecture recommendation, not a completed configuration. |
| Initial code | Scaffolding and preliminary catalog/domain modules exist under `web`. |
| Implementation | Paused while the owner reviews the design. |
| Independent reviews | Both architecture and visual passes completed; corrections are applied to the proposal and concept, with reproducible prototype regression checks. |
| Hosting, domain, DNS | Deferred. No domain ownership or provider is confirmed. |
| Source checkpoint | Reviewed documentation/prototype and the unfinished scaffold are preserved together; source publication is not a deployment. |

The preliminary code does not yet implement all design corrections. Do not treat an architecture target, a clickable mock, or a configured test command as a delivered feature or a passed check.

## Documentation ownership

The product brief describes scope; the architecture document describes the proposed technical design. Neither can silently approve a business promise, live contact number, or deployment.

Keep review status and implementation status separate. Record accepted changes in the appropriate document and their disposition in the review register. Once the design is approved, update this index and the architecture status before resuming implementation.

The root README and AGENTS files are short discovery pointers. `web/AGENTS.md` and its `CLAUDE.md` pointer remain in place because Next.js and coding tools discover them there; project-specific guidance lives here.
