# Future enhancement: self-service content editor

[Documentation index](README.md) | [Content editing today](content-editing.md)

**Status:** Captured for a later release. Do not add this admin application, authentication, uploads, or its infrastructure to the current V1 build.

## Goal

Shivansh should be able to update the website without asking a developer to change code or deploy it for each update.

The public site should remain fast and simple. Content management can be a separate authenticated application.

## Current step: editable files

Use clearly named JSON files as the website's editable content source:

- Business settings: founder details, WhatsApp number, contact permissions, delivery information, and social links.
- Meals: names, descriptions, ingredients, allergens, portions, prices, images, options, and availability.
- Meal plans: meal count, duration, delivery cadence, choice/substitution rules, pricing, and terms.
- Catalog settings: publication status, validity, weekly menu, and FAQs.

The existing TypeScript modules should load and validate those files; rendering components should not contain duplicate menu or contact values. The WhatsApp display format should come from the same number used to build its link.

JSON is the near-term editing format, not the final experience for the owner. Changes still require a validated build and publication until the admin workflow is implemented.

## Owner experience

1. Sign into the private content editor.
2. Choose Meals, Meal plans, Weekly menu, Business settings, Photos, or FAQs.
3. Edit labeled fields rather than raw JSON.
4. Upload a photo, choose its crop, and add meaningful alternative text.
5. Save a draft without changing the live site.
6. Preview the proposed changes on desktop and mobile.
7. Publish when ready and see whether the update is building, live, or failed.
8. Correct or roll back an update without editing code.

The editor should also make routine actions quick: mark a meal unavailable, change a price, replace a photo, update the weekly menu, or change business hours.

## Required features

| Area | Expected behavior |
| --- | --- |
| Meals and plans | Add, edit, reorder, archive, and restore records. Keep stable IDs so links and saved requests can be reconciled. |
| Business settings | Edit the WhatsApp contact once, with a formatted preview and explicit confirmation before publishing a changed number. |
| Images | Upload approved images, resize/compress them, preview crops, manage alternative text, and associate them with meals or the founder profile. |
| Drafts and preview | Keep unpublished content separate from live content. Show exactly what will change. |
| Validation | Explain missing prices, invalid dates, duplicate IDs, broken references, unavailable images, and incomplete live-offer information next to the relevant fields. |
| Publishing | Run the same validation and verification gates as a developer release. Publish catalog, pages, assets, and configuration together. |
| History | Record who changed content, when it changed, and which version was published. |
| Recovery | Retain the last good release; show publication failures clearly without replacing the live site with a broken build. |
| Roles | Limit access to approved business users. A future editor role may prepare content while an owner approves publication. |

## Image handling

- Accept a small set of supported image formats such as JPEG, PNG, and WebP; validate actual decoded content rather than trusting the filename.
- Apply file-size and dimension limits and create web-sized variants.
- Remove unnecessary metadata, including location metadata.
- Keep draft uploads private until publication. Publish only approved assets.
- Do not accept arbitrary executable files or unsanitized SVG uploads.
- Avoid deleting an image while a live release still references it. Archive unused assets and provide recovery.
- Keep the original and web derivatives separate when needed.

This should support both menu photography and Shivansh's founder photo.

## Possible implementation paths

### Git-backed editor

An authenticated editor could save validated JSON and asset references to the repository through a server-side integration. A build pipeline creates previews and publishes approved changes.

This keeps version history and fits the static site. It also means updates are not instantaneous: build time, failed deployments, simultaneous edits, and rollback behavior must be handled clearly.

Repository credentials belong on the server, never in the browser. Give the integration access only to the required repository and operations.

### Managed CMS

A CMS could provide authentication, structured editing, media management, previews, and publication hooks. The app would read the same validated public content shape during its build.

This reduces custom admin code but adds service setup, costs, permissions, and vendor-specific integration.

### Choosing between them

Choose based on how frequently the menu changes, how quickly an unavailable meal must disappear, budget, owner usability, and ongoing maintenance. No platform is selected yet.

If rebuilding the static site is too slow for urgent availability changes, consider a small runtime availability service as a separate decision. Do not describe a build-triggered update as real-time.

## Access and safety

- Authenticate every admin operation and enforce authorization on the server.
- Keep the public storefront read-only; hiding an admin button is not access control.
- Do not store customer addresses, medical information, or payment details in public content files.
- Keep sample/live publication gates. Adding a phone number or toggling a draft must not accidentally publish sample food as a live offer.
- Changing nutrition, allergen, or condition-specific claims still requires appropriate human review.
- Confirm changed contact details before publication so requests are not misdirected.
- Protect publishing actions against duplicate submissions and conflicting edits.

## Completion criteria for this future feature

Shivansh can change a meal, plan, photo, or WhatsApp number; preview the result; publish it; and verify that it is live without developer help. Invalid content cannot be published, failed releases leave the previous site available, and an approved user can recover the prior version.

This is content administration, not online ordering or payment processing. It can be scheduled independently from the V2 checkout and V3 subscription work.
