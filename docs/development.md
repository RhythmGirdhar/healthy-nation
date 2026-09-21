# Local development

[Documentation index](README.md) | [Architecture](architecture.md) | [Agent guidance](AGENTS.md)

## Current state

The application was scaffolded with Next.js, TypeScript, Tailwind CSS, and ESLint. Preliminary catalog, inquiry, and API modules exist, but the owner paused implementation to discuss design first.

The current app is not the clickable design concept and does not implement the revised architecture in full. In particular, preliminary API routes and the default Next.js configuration are not the proposed static-export V1. Reconcile them after design approval.

## Repository layout

```text
healthy-nation
  README.md                Short project entry point
  AGENTS.md                Agent discovery pointer
  assets
    brand                  Original supplied logo
  docs
    README.md              Documentation index and status
    product-brief.md       Product scope and roadmap
    architecture.md        System design proposal
    reviews.md             Independent review register
    development.md         This guide
    AGENTS.md              Project-specific contributor guidance
    design                 Review-only visual/architecture artifacts
  web                      Next.js application scaffold
```

## Prerequisites

- Node.js 22.14 or newer, as declared in the app's package manifest.
- npm, included with Node.js.
- Git for source control.
- Python 3 is optional and is only used by the simple documentation-preview command below.

Dependency versions are recorded in `web/package.json` and `web/package-lock.json`. Use the lockfile rather than updating packages simply to start the project.

## Run the current scaffold

From the repository root in PowerShell:

```powershell
Set-Location web
npm ci
npm run dev
```

Open `http://localhost:3000`. If that port is occupied, follow the address printed by Next.js. Press `Ctrl+C` in the terminal to stop the server.

This starts the unfinished scaffold, not the design-review prototype.

## Public configuration

The template is `web/.env.example`. For future local configuration:

```powershell
Copy-Item .env.example .env.local
```

Run this from `web` only if `.env.local` does not already exist; do not overwrite someone else's configuration.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Owner-confirmed international digits-only business number. Leave blank until confirmed. |
| `NEXT_PUBLIC_SITE_URL` | Confirmed public origin for eventual site metadata. Leave blank during initial local work. |

These values are public, not secrets. A valid number format is not proof of ownership, and a configured number must not bypass the design's preview/live gates. Do not assume that `healthynation.in` belongs to this business.

Never commit `.env.local`, credentials, or private customer information. The environment example is intentionally empty.

## Existing scripts

Run these from `web`:

| Command | Purpose and current limitation |
| --- | --- |
| `npm run dev` | Start the local Next.js development server. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Generate Next.js route types and run TypeScript checking. |
| `npm test` | Run the preliminary Vitest tests. |
| `npm run build` | Build the current Next.js configuration; it is not yet the approved static-export implementation. |
| `npm run start` | Serve the existing production build with a Next.js runtime. |
| `npm run test:e2e` | Playwright command is configured, but the application end-to-end suite still needs implementation. Do not treat configuration as coverage. |

This table documents commands, not a claim that every check passed or that V1 is complete. After approval, align build scripts, server mode, and tests with the chosen delivery mode.

## Preview the design documents

From the repository root:

```powershell
python -m http.server 4180 --bind 127.0.0.1 --directory docs
```

Open `http://127.0.0.1:4180/design/architecture.html` for the system-design presentation. The [visual design guide](design/README.md) describes the storefront concept and its status.

This local server exposes only the documentation directory on this machine. It is not hosting the business website and does not change DNS. If the port is already in use, use another port rather than stopping an unrelated process.

## After design approval

Reconcile the scaffold with the accepted architecture, implement the approved customer flows, add the missing verification, and update these instructions to match the actual application. Hosting, a verified domain, publishing permissions, and deployment remain separate decisions.
