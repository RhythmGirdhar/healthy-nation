# Design-review artifacts

[Documentation index](../README.md) | [System proposal](../architecture.md) | [Review register](../reviews.md)

These are discussion artifacts, not production application code.

## Architecture

- [Browser presentation](architecture.html)
- [Architecture diagram](architecture.svg)
- [Detailed system proposal](../architecture.md)

## Storefront concept

A self-contained [clickable storefront concept](index.html) is available with Home, Menu/meal details, Meal plans, and Request-review screens, plus desktop/mobile controls. The copied logo asset is [logo.webp](logo.webp); the original supplied artwork remains in [assets/brand](../../assets/brand/healthy-nation-logo.png).

The concept is not a Figma document or a finished Next.js frontend. All dishes and illustrations are samples; no verified price list, food photography, service coverage, business number, or domain is supplied. It must not send a real WhatsApp message or accept an order.

Both independent reviews are complete. The revised concept incorporates their actionable findings, including a genuinely empty initial request, clearer plan semantics, per-meal preferences, improved mobile menu discovery, larger decision text, and safer keyboard/undo behavior. The [review register](../reviews.md) records fixes, verification, remaining launch inputs, and review limitations.

The navbar uses an opaque `#F9FBFC`, sampled from the displayed logo asset's background, so the logo does not appear as a differently colored rectangle. The rest of the warm-white/green palette is unchanged.

## Local preview

From the repository root:

```powershell
python -m http.server 4180 --bind 127.0.0.1 --directory docs
```

Open `http://127.0.0.1:4180/design/index.html` for the storefront or `http://127.0.0.1:4180/design/architecture.html` for the system presentation. Use another port if 4180 is occupied by an unrelated process.

The actual application scaffold is in `web`. Do not copy a prototype wholesale into the app without reconciling the approved architecture, data boundaries, and accessibility requirements.

## Reproduce the prototype checks

With the preview server above running, the `web` dependencies installed, and Microsoft Edge available, run from the repository root:

```powershell
node docs\design\verify.cjs
```

The script uses the existing Playwright dependency to check the local concept at desktop, 390px, and 320px widths, including the specific interaction regressions identified by reviewers. It blocks external network requests and does not send messages. This is prototype verification, not the application's future end-to-end suite or a full accessibility certification.
