# Design references

[Documentation index](../README.md) | [Architecture](../architecture.md) | [Customer reviews](../customer-reviews.md)

## Current storefront

The [current design view](index.html) displays the real local Next.js application. It has desktop and phone widths and links to Home, Menu, Plans, About, kitchen photos and Request. Menu data, images and interface changes come from `web`, not a second frontend.

The app includes the 55 priced PDF dishes, all 75 unique supplied food photos, labelled dish examples and manual WhatsApp requests. Exact photo matches, recipes, portions, delivery facts and real plan terms still need confirmation.

The [customer review record](../customer-reviews.md) lists the findings from two independent customer-role assessments and their dispositions.

## Local preview

Start the app from `web` with `npm run dev`, or use `npm run build` followed by `npm run start`. The design view expects it at `http://127.0.0.1:3000`.

In another terminal, run from the repository root:

```powershell
python -m http.server 4180 --bind 127.0.0.1 --directory docs
```

Open `http://127.0.0.1:4180/design/index.html`. Its embedded preview blocks new tabs. Open the app directly for its WhatsApp links; the customer must still send the message and receive team confirmation.

These are local previews. They do not configure hosting or DNS.

## Historical sample concept

The original reviewed [sample concept](concept-baseline.html) remains unchanged. It contains sample dishes, illustrations, simulated sending and the original review controls. It is not the current menu or a second app to update.

The [historical review register](../reviews.md) records that review's scope, hashes and limits. The illustration-export script reads this preserved file. The supplied logo remains in [assets/brand](../../assets/brand/healthy-nation-logo.png); derived assets do not replace it.

With the documentation server running, the `web` dependencies installed and Microsoft Edge available, run the historical checks from the repository root:

```powershell
node docs\design\verify.cjs
```

These checks use the preserved concept, block external requests and do not send messages. The current application is covered by `npm run test:e2e` from `web`, after a static build. Neither suite is a full accessibility certification.

## Architecture

- [Browser presentation](architecture.html)
- [Architecture diagram](architecture.svg)
- [Detailed architecture](../architecture.md)
