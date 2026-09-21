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

Edit [meals.json](../web/content/meals.json) for dishes, [plans.json](../web/content/plans.json) for meal plans, and [catalog.json](../web/content/catalog.json) for the weekly menu, FAQs, preview status, and publication metadata. The TypeScript catalog module loads and validates these files. The initial dish descriptions and plan examples are preserved from the design concept so the owner can review the demo before replacing them with his real menu.

Sample content must remain explicitly marked. Sample prices are `null`, not fabricated promotional offers. Illustrations are not actual food photographs, and ingredients/allergens/portions in a sample record are not verified food information.

The application can link to real **general and catering inquiries** without representing the sample dishes as live offers. A configured phone number alone must not enable sample-offer requests.

## Publishing real offers

Before enabling meal or plan handoff:

1. Obtain approved recipes, ingredients, complete allergen/cross-contact information, portions, prices, availability, and any nutritional claims.
2. Replace sample descriptions and images with accurate content. Only label an image as a photograph if it actually shows approved food imagery.
3. Confirm plan duration/count, delivery cadence, choice/substitution rules, delivery-fee treatment, and cancellation/refund terms.
4. Set publication validity deliberately. `publishedAt`, `validFrom`, and `validUntil` describe the catalog version, not an automatic promise of delivery.
5. Change preview/sample flags only when all relevant content is genuinely approved. The build validation rejects inconsistent live/sample content.
6. Enable `business.contact.offerRequestsEnabled` only after the live catalog and business operation are ready. General-inquiry permission is separate.
7. Validate the content and application, inspect the preview, and publish pages, catalog snapshot, assets, and configuration together.

Do not flip flags just to make a disabled button clickable. Until launch facts are confirmed, leave offer requests gated and use the generic current-menu inquiry.

## Menu changes and existing drafts

The public catalog has a deterministic revision. The browser must check a current snapshot before a live offer handoff, preserve unaffected selections, and require review of changed prices, options, plans, or availability.

Correct urgent unavailability through the same validated publishing process. A rollback must not silently reactivate withdrawn meals. See the [architecture](architecture.md) for ownership and recovery rules.

## Domain and social profiles

The actual domain, service coverage, operating hours, Instagram profile, and Facebook profile remain unconfirmed. Do not invent them. An optional public site origin can be configured only after domain ownership is established; see the environment example and development guide.

Hosting and DNS are a later step. Editing these files does not deploy the website.

The separate [future content-editor proposal](future-content-admin.md) covers the owner's eventual browser-based editing, photo uploads, and publishing experience. It is not part of the current V1 implementation.
