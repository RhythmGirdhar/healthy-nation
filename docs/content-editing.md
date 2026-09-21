# Editing business and menu content

[Documentation index](README.md) | [Product brief](product-brief.md) | [Development](development.md)

## Confirmed business information

The owner supplied the following facts:

- Brand: **Healthy Nation**, with the supplied green-and-white logo.
- Founder: **Shivansh Girdhar**.
- Education: **Degree in Culinary Sciences**.
- Public WhatsApp contact: **+91 81049 60748**.

These live in [`web/content/business.json`](../web/content/business.json), loaded by the TypeScript business module. Edit `contact.phoneNumber` to change the WhatsApp number; use the digits-only form with country code (`918104960748`). The display format is derived from that one value so it does not drift from the link. This is an owner-approved public contact setting, not a secret or proof of technical account ownership.

Do not add a university, graduation year, awards, professional history, nutrition credentials, or quotes that have not been supplied.

## Founder photograph

No photograph has been supplied. The About page uses a clearly labeled portrait placeholder instead of a fabricated person or an unrelated stock photo.

When an approved photo is available:

1. Prepare a suitably sized, optimized local image and place it in `web/public/images`.
2. Set `founder.portrait` in `web/content/business.json` to an object such as:

```json
{
  "src": "/images/shivansh-girdhar.webp",
  "alt": "Shivansh Girdhar, founder of Healthy Nation"
}
```

3. Check the crop, alternative text, mobile layout, and file size. The founder card uses a portrait container, so ensure important content is not cropped out.

Keep the original supplied logo under `assets/brand`. Web derivatives are separate assets.

## Sample meals and plans

Edit [meals.json](../web/content/meals.json) for dishes, [plans.json](../web/content/plans.json) for meal plans, and [catalog.json](../web/content/catalog.json) for the weekly menu, FAQs, preview status, and publication metadata. The TypeScript catalog module loads and validates these files.

The current menu contains **55 dishes imported from Healthy Nation Online Menu.pdf**, with listed INR prices. The [import record](../web/content/menu-source.json) records the source hash, source pages, and name/price pairs. It is an audit of the import, not a second live configuration to edit.

The PDF did not provide full recipes, allergens, portions, a weekly schedule, or meal plans. Those facts have not been invented. Empty ingredient/allergen lists mean **unknown**, never allergen-free; `image: null` shows a photo placeholder instead of an unrelated demonstration image. Categories are editable text. Diet labels follow the PDF's Veg/Non Veg headings; unlabeled sides and smoothies use `Not specified`.

The example meal plans remain `isSample: true` with `price: null`, so they cannot be sent as live offers even though the actual dishes can. Sample and real entries can coexist; eligibility is checked for the selected items, not inferred from the phone number alone.

Domain names reported by the owner are recorded in `business.json`: **thehealthynation.in** and **healthynation.co.in**. Neither has been selected as canonical or connected through DNS by this work.

## Publishing real offers

Before enabling meal or plan handoff:

1. Use owner-approved dish names and prices. Leave missing descriptions blank, unknown ingredient/allergen lists empty, and unmapped photos `null` rather than inventing information. The team must clarify food suitability and fulfillment details before accepting an order.
2. Replace sample descriptions and images with accurate content. Only label an image as a photograph if it actually shows approved food imagery.
3. Confirm plan duration/count, delivery cadence, choice/substitution rules, delivery-fee treatment, and cancellation/refund terms.
4. Set publication validity deliberately. `publishedAt` and `validFrom` are required for a published catalog. `validUntil: null` means no fixed expiry is configured; the PDF supplied no expiry, so none was invented. A configured expiry is still enforced. These fields do not promise stock or delivery.
5. Set actual dishes to `isSample: false` only when their names/prices are approved. Unpriced or sample selections remain blocked. A published catalog can include explicitly marked sample plans, but those plans must retain `isSample: true` and `price: null`.
6. Enable `business.contact.offerRequestsEnabled` only after the live catalog and business operation are ready. General-inquiry permission is separate.
7. Validate the content and application, inspect the preview, and publish pages, catalog snapshot, assets, and configuration together.

Do not flip sample flags merely to make a button clickable. The PDF dishes are enabled for WhatsApp **requests**, not automatically accepted orders. Example plans remain gated. Every request still needs team confirmation.

## Menu changes and existing drafts

The public catalog has a deterministic revision. The browser must check a current snapshot before a live offer handoff, preserve unaffected selections, and require review of changed prices, options, plans, or availability.

Correct urgent unavailability through the same validated publishing process. A rollback must not silently reactivate withdrawn meals. See the [architecture](architecture.md) for ownership and recovery rules.

## Domain and social profiles

Service coverage, operating hours, and Facebook remain unconfirmed. The Instagram handle `@healthy.nation.in` is printed in the supplied menu and is linked in the footer. The two reported domains are recorded, but the primary domain and hosting/DNS configuration are still undecided.

Hosting and DNS are a later step. Editing these files does not deploy the website.

The separate [future content-editor proposal](future-content-admin.md) covers the owner's eventual browser-based editing, photo uploads, and publishing experience. It is not part of the current V1 implementation.
