# Local development

[Documentation index](README.md) | [Architecture](architecture.md) | [Agent guidance](AGENTS.md)

## Current state

The owner approved implementing the reviewed Next.js + TypeScript design. The application is being built around a static export, validated editable content, and browser-side request drafts. The browser design concept remains a separate review artifact.

The founder and public WhatsApp number are confirmed. The owner-supplied PDF now provides 55 dishes and their INR prices. Real meal requests are enabled; example plans remain gated. Ingredients, allergens, portions, individual dish photos, service coverage, and the founder photo remain unconfirmed or unmapped.

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
    content-editing.md     Founder, contact, and catalog editing
    AGENTS.md              Project-specific contributor guidance
    design                 Review-only visual/architecture artifacts
  web                      Next.js application
```

## Prerequisites

- Node.js 22.14 or newer, as declared in the app's package manifest.
- npm, included with Node.js.
- Git for source control.
- Python 3 is optional and is only used by the simple documentation-preview command below.

Dependency versions are recorded in `web/package.json` and `web/package-lock.json`. Use the lockfile rather than updating packages simply to start the project.

## Run the application locally

From the repository root in PowerShell:

```powershell
Set-Location web
npm ci
npm run dev
```

Open `http://localhost:3000`. If that port is occupied, follow the address printed by Next.js. Press `Ctrl+C` in the terminal to stop the server.

This starts the application in `web`, not the design-review prototype.

## Build and preview the static site

From `web`:

```powershell
npm run build
npm run start
```

The build produces `web/out`. The start command is a small **local preview server**, not a permanent application backend. It serves the exported files on `http://127.0.0.1:3000` and returns real 404 responses for missing pages. To use another port:

```powershell
node scripts\serve-static.mjs --port 3001
```

The eventual host must serve the generated routes/assets and revalidate `catalog.json` appropriately. Hosting, cache-header configuration at that host, and DNS have not been set up.

## Public configuration

The template is `web/.env.example`. For future local configuration:

```powershell
Copy-Item .env.example .env.local
```

Run this from `web` only if `.env.local` does not already exist; do not overwrite someone else's configuration.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Confirmed public origin for eventual site metadata. Leave blank during initial local work. |

The owner-approved public number (`918104960748`), founder details, and inquiry permissions are maintained in `content/business.json`, not a secret environment variable. The display format is derived by the TypeScript loader. A configured number must not bypass the preview/live gates. Do not assume that `healthynation.in` belongs to this business.

Never commit `.env.local`, credentials, or private customer information. The environment example is intentionally empty.

## Existing scripts

Run these from `web`:

| Command | Purpose and current limitation |
| --- | --- |
| `npm run dev` | Start the local Next.js development server. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Generate Next.js route types and run TypeScript checking. |
| `npm test` | Run the preliminary Vitest tests. |
| `npm run build` | Produce the static export in `out`, validating build-time content. |
| `npm run start` | Serve the exported site locally without a Next.js application server. |
| `npm run test:e2e` | Run the application browser suite against a completed static build on port 3100. Windows uses installed Microsoft Edge; other platforms use Playwright Chromium. |

Run `npm run build` before the browser suite. If Playwright reports that its browser executable is missing on a non-Windows environment, install its Chromium browser with `npx playwright install chromium` and retry. The tests never send a WhatsApp message.

This table documents commands, not a claim that every check passed or that the business is ready to launch.

## Images

The supplied logo is preserved separately from its optimized web derivative. Original concept illustrations are exported into `public/images` and clearly identified as illustrations, not actual food photography.

To regenerate those illustrations from the reviewed design artifact:

```powershell
node scripts\export-illustrations.mjs
```

Generated assets are stored with the app; the ordinary application build does not depend on extracting the prototype. See [content editing](content-editing.md) before replacing images or publishing real offers.

## Preview the design documents

From the repository root:

```powershell
python -m http.server 4180 --bind 127.0.0.1 --directory docs
```

Open `http://127.0.0.1:4180/design/architecture.html` for the system-design presentation. The [visual design guide](design/README.md) describes the storefront concept and its status.

This local server exposes only the documentation directory on this machine. It is not hosting the business website and does not change DNS. If the port is already in use, use another port rather than stopping an unrelated process.

## Before deployment

Confirm real food content, operational policies, catalog validity, and the intended contact capabilities. Sample menu pages must not be presented as live offers. Hosting, verified domain ownership, publishing configuration, and deployment remain separate decisions.
