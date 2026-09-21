# Healthy Nation: product brief and roadmap

<img src="../assets/brand/healthy-nation-logo.png" alt="Healthy Nation green wordmark and leaf emblem on a white background" width="480" />

[Documentation index](README.md) | [System architecture](architecture.md)

Flavorful, nutritious everyday meals, made affordable and convenient.

Healthy Nation is a planned food business web application for discovering individual meals, exploring meal plans, and connecting directly with the team to inquire and order.

**Project status:** Awaiting owner design approval after two independent reviews and their corrections. Initial Next.js scaffolding and preliminary catalog code exist in `web`, but application implementation remains paused. The roadmap below is not a claim that V1 is complete. No hosting, DNS, or production deployment has been configured.

## Confirmed brand identity

- **Name:** Healthy Nation.
- **Brand colors:** Green and white.
- **Logo:** The supplied green wordmark and leaf emblem on a white background, preserved in [the original logo asset](../assets/brand/healthy-nation-logo.png).
- **Visual direction:** Use the logo as the brand reference, with white space, green accents, and colorful food photography. Preserve the logo's proportions and colors rather than stretching or recoloring it.

Exact UI color tokens, typography, and any alternate logo formats remain design decisions; they are not specified by this image alone.

## Mission and business goals

Take a step toward a healthier nation by making tasty, balanced meals accessible for everyday eating.

- Offer budget-friendly meals with thoughtfully proportioned protein, fiber, and other nutrients.
- Support busy routines, fitness goals, and pre- or post-workout meal preferences.
- Sell both individual meals (a la carte) and flexible meal plans.
- Encourage repeat purchases through consistent quality, convenience, clear pricing, and variety.
- Offer a rotating weekly menu, with no repeated meals within the week as an operational goal to confirm before advertising.
- Provide a premium, welcoming brand experience without making healthy eating feel exclusive.

## Audience

The initial focus is busy working professionals and fitness-conscious customers who want convenient, flavorful meals.

Additional audiences include athletes, people with active or mindfulness-focused routines, entrepreneurs, other convenience-focused customers, and corporate teams seeking catering. Messaging should focus on customer needs rather than age groups or stereotypes.

## Release strategy

| Release | Purpose | Ordering approach |
| --- | --- | --- |
| **V1: Discover and order through WhatsApp** | Launch the brand, menu, meal plans, and inquiry experience. Validate demand and the fulfillment operation. | Customers prepare a selection on the website and send it through WhatsApp. The team checks availability, agrees on details, and explicitly confirms the order. |
| **V2: Online ordering and payments** | Add an end-to-end website checkout and structured order management. | Customers use a cart, provide delivery details, and pay through an integrated payment provider. WhatsApp remains available for support and assisted ordering. |
| **V3: Repeat-order and subscription automation** | Reduce manual work once the business rules and demand are established. | Potential additions include customer accounts, reordering, self-service meal-plan management, and recurring billing where supported. |

V1 does not require customer accounts, an online checkout, automated recurring charges, or a transactional order database.

## V1: Customer experience

### Pages and features

| Area | Planned experience |
| --- | --- |
| **Home** | Introduce the mission, show real food photography, explain the value proposition, highlight meals and plans, and make the next action obvious. |
| **About us** | Explain the business, values, approach to food, and commitment to affordable everyday nutrition. |
| **Menu** | Show individual meal cards with photos, descriptions, prices, portions, availability, and relevant dietary information. |
| **Meal details** | Give each meal a stable identity and shareable detail page with ingredients, allergens, customization options, and verified nutrition information where available. |
| **Menu search** | Search dishes by name or description and filter using supported dietary or meal categories. A small menu does not need a dedicated search service. |
| **Featured meals** | Offer curated shortcuts to individual dishes. Use "Featured meals" rather than "Popular" until actual customer behavior supports a popularity ranking. |
| **Meal plans** | Explain the price, number of meals, delivery schedule, inclusions, available choices, and applicable pause, cancellation, and refund terms. |
| **Sample weekly menu** | Show the variety customers can expect. Clearly distinguish an illustrative sample from the currently available menu and label the relevant week. |
| **Customization** | Let customers choose supported options and request a conversation about requirements that need staff review. |
| **Corporate catering** | Explain the offering and provide a dedicated WhatsApp inquiry for the event date, approximate headcount, and service needs. Catering is quoted and confirmed separately. |
| **FAQs and policies** | Answer questions about delivery, ordering deadlines, ingredients, allergens, meal plans, cancellations, and refunds using original content based on actual business policies. |
| **Contact and footer** | Keep contact information prominent, with WhatsApp as the primary action and Instagram and Facebook as secondary links. |

### Meal plans and customization

In V1, a "subscription" means a team-managed meal plan, potentially sold as a prepaid pack if the business chooses that model. It does not mean automatic renewal or recurring card debits.

Customers can request a plan at any time, but service is subject to operating hours, delivery coverage, order cutoffs, and availability. "On demand" must not imply guaranteed immediate preparation or delivery.

Ordinary preferences and high-protein options should be distinct from medically tailored meals. Diabetes-friendly, heart-health, PCOS/PCOD, or other condition-specific offerings require qualified nutrition review and accurate claims before publication. The site must not promise treatment or universal suitability.

### WhatsApp inquiry and ordering flow

The core journey is:

**Discover -> Browse -> Select -> Review request -> Open WhatsApp -> Send message -> Receive team confirmation**

1. **Choose an entry point.** A customer selects a meal, explores a plan, requests customization, or opens a general or corporate catering inquiry.
2. **Prepare a request.** Capture the relevant meal or plan identifiers, quantities, supported options, and requested delivery date where applicable. Preserve the selection across in-site navigation so the customer does not need to start again.
3. **Review the selection.** Show the selected items and displayed prices before leaving the site. Any estimated total must identify excluded or unconfirmed delivery fees and other applicable charges.
4. **Open a prefilled WhatsApp message.** Use the configured business number and URL-encode the message in a standard click-to-chat link: `https://wa.me/<business-number>?text=<url-encoded-message>`. The number must use WhatsApp's required international digits-only format.
5. **Let the customer send it.** Opening WhatsApp shares the prepared draft URL with WhatsApp, but does not send the message to the business. Explain that disclosure before handoff. The customer must explicitly send the message; the website cannot assume it was sent or received.
6. **Confirm details with the team.** Staff verify availability, coverage, delivery timing, requested options, the final total, and any applicable payment arrangement. Collect the exact address and other necessary personal details directly during the conversation rather than embedding them in the link.
7. **Explicitly confirm the order.** The team sends an agreed order summary and confirmation or reference. Until then, the website submission is an inquiry or order request, not an accepted order.

Example message structure:

```text
Hi Healthy Nation! I would like to request an order.

Meal: <meal name and ID>
Quantity: <quantity>
Selected options: <supported options>
Displayed unit price: <price and currency>
Requested delivery date: <date, if applicable>

Please confirm availability, delivery charges, the final total,
and how to complete my order.
```

Repeat the meal section for multiple selections. Plan inquiries should include the plan name and requested start date instead; general inquiries do not need meal fields.

### Messaging and draft-handling rules

- Prefer clear actions such as **"Request order on WhatsApp"**, **"Ask about this plan"**, and **"Inquire about catering"**. If "Place order" is used, explain that confirmation happens with the team.
- Explain that the customer still needs to send the WhatsApp message. Never display "Order placed" or "Payment successful" just because the link was opened.
- Treat the V1 selection as a request draft, not an inventory reservation or a full checkout cart.
- Keep draft persistence limited to non-sensitive selections. Do not save addresses, medical histories, or payment details in browser storage, URL parameters, or analytics.
- Do not prefetch WhatsApp links or record full handoff URLs/message text in analytics or error logs. Keep a selectable message and copy action available even when clipboard access or app handoff fails.
- Use one shared preview/live policy for every entry point. A configured number alone must not enable requests from sample offers; approved contact, live publication, and current valid selections are required.
- Keep catalog revision/validity separate from draft schema version. Refresh and reconcile the catalog before offer handoff, preserve unaffected selections, and flag changed or unavailable lines for review.
- Do not prefill diagnoses or medical histories. Customers with specialized requirements should request a private discussion; sharing sensitive information should not be a prerequisite for browsing.
- Provide a way to copy the request and view the business contact details if WhatsApp cannot be opened.
- Support mobile and desktop handoff, and keep the request available when the customer returns to the website.
- Use ordinary WhatsApp click-to-chat links in V1. Automated sending, chatbots, and WhatsApp Business Platform integrations are not required.

## V1: Business operations

The website is only one part of the ordering experience. The team needs an agreed manual process before launch.

| Responsibility | V1 process |
| --- | --- |
| Content updates | A designated developer maintains typed content files for meals, prices, availability, photography, plans, weekly menus, and FAQs. The business owner approves changes before a rebuild/release. A browser-based CMS is deferred. |
| Inquiry handling | Monitor the business WhatsApp account during published hours and explain expected response times. |
| Order acceptance | Check the request, communicate the final price and terms, and send an explicit confirmation. |
| Order tracking | Maintain a private operational register with order references, confirmed selections, fulfillment dates, and relevant payment and delivery status. Choose the tool and access owners before launch. |
| Kitchen coordination | Prepare a daily list of confirmed meals, quantities, agreed options, and delivery requirements. |
| Delivery and support | Coordinate fulfillment and handle changes, cancellations, refunds, and customer questions under published policies. |

If the business accepts payment outside the website during V1, staff must explain the method and independently verify payment before recording it as received. There is no integrated website payment flow in V1.

Track inquiries, confirmed orders, and repeat purchases separately. A WhatsApp button click measures intent, not a sent message, completed order, or sale. Reconcile confirmed purchases with the operational register.

## Content model

Use structured, editable TypeScript content files rather than hard-coding every menu card and plan. A shared build-time validation layer should check the catalog before publishing.

| Content type | Initial fields |
| --- | --- |
| **Meal** | Stable ID, slug, name, description, photos and alternative text, price and currency, portion, ingredients, allergens, supported dietary tags, verified nutrition per stated serving where available, customization options, availability, and featured placement. |
| **Meal plan** | Stable ID, name, description, price and currency, meal count, duration, delivery cadence, delivery-fee treatment, inclusions, choice/substitution rules, and policy references. |
| **Weekly menu** | Week or date range, daily meal references, and whether the menu is a sample or currently available. |
| **FAQ** | Question, original answer, category, and display order. |
| **Business settings** | Approved brand assets, WhatsApp number, social links, contact details, operating hours, delivery coverage, response expectations, and policies. |
| **Catering content** | Offering description, confirmed service constraints, and inquiry instructions. |
| **Catalog publication** | Revision, publication timestamp, validity window, and preview/live status. |

The catalog is for publishable content. Customer messages, addresses, medical information, orders, and payment records must not be stored in these public files. V1 has no customer or order database.

## Design and non-functional requirements

- **Brand:** Use the confirmed Healthy Nation name and supplied green-and-white logo, with a premium but approachable presentation, minimal visual clutter, and colorful food photography.
- **Mobile first:** Clear navigation, comfortable touch targets, and a persistent WhatsApp action that does not obscure content.
- **Accessibility:** Readable contrast, semantic structure, keyboard access, visible focus states, descriptive image text, and clear labels and errors.
- **Performance:** Responsive, compressed images and fast page loads on mobile networks. Drive may hold original assets, but website images should be served through the chosen image delivery infrastructure.
- **Clarity:** Make prices, portions, service coverage, availability, and the inquiry-versus-confirmation distinction easy to understand.
- **Discoverability:** Search-friendly public meal pages, meaningful page titles and descriptions, shareable links, and accurate business information.
- **Privacy and security:** Collect only necessary data, restrict repository and staff access, keep secrets out of the repository, and avoid sensitive data in tracking events.
- **Reliability:** Handle unavailable meals, missing images, content-loading failures, and failed WhatsApp handoffs explicitly rather than showing a successful order state.
- **Trust:** Publish accurate allergens and qualified nutrition information, applicable food-business disclosures, and business-specific policies. Do not copy another company's FAQs or make unsupported health claims.

## Proposed technology stack

Next.js and TypeScript have been scaffolded locally. Editable content files are the selected V1 approach; CMS and hosting recommendations from the initial discussion are deferred. Remaining design choices are under review.

| Layer | V1 recommendation | Purpose |
| --- | --- | --- |
| Application | Next.js with React and TypeScript | Build public pages, meal details, search, and selection flows in one codebase, with room for server-side commerce features later. |
| UI | Tailwind CSS; component choices under design review | Build a consistent responsive interface with accessible interaction patterns. |
| Content management | Editable, validated TypeScript files | Keep V1 small; a developer updates the menu and the business owner approves publication. A browser-based CMS can be added later. |
| Image delivery | Local, optimized image assets | Preserve the original logo and prepare appropriately sized food images when supplied. |
| Messaging | WhatsApp click-to-chat | Hand off customer-reviewed inquiry and order-request drafts to the business. |
| Hosting | Deferred | Confirm the delivery mode, real domain ownership, provider, and costs after the application design is agreed. No provider has been selected. |

V1 does not need a separate Express service, microservices, a dedicated search engine, or customer authentication.

The current architecture proposal favors a static export with a build-time catalog layer rather than a permanent API server. It remains under design review. If Vercel is selected later, its Hobby plan is restricted to non-commercial use; see the [Vercel fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage).

Reference documentation: [Next.js](https://nextjs.org/docs/app/getting-started), [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports), and [Tailwind CSS](https://tailwindcss.com/docs).

## Future enhancements

### V2: Online ordering, cart, and payments

This release implements the originally proposed online ordering and payment scope:

- A proper shopping cart with editable quantities, supported customizations, and server-validated prices and availability.
- Checkout with delivery details, service-area validation, delivery slots or dates, and a complete cost breakdown.
- Integrated online payment and clear pending, successful, failed, canceled, and refunded states.
- Persistent order records, references, confirmations, and an internal order-management interface.
- Continued WhatsApp access for inquiries, assisted ordering, and support. Direct WhatsApp handoff already exists in V1 and is not deferred to this release.

**Proposed additions:** PostgreSQL through Supabase for transactional data, and Razorpay as a payment-provider candidate if the business operates in India. Confirm merchant eligibility, supported methods, costs, and legal requirements before selecting a provider.

Keep transactional orders and payments separate from published menu content. Payment success must be verified server-side using the provider's authenticated mechanisms, with safe handling of repeated events; a browser redirect alone is not proof of payment.

### V3: Retention and subscription automation

These are optional extensions beyond the initial online checkout scope:

- Customer accounts, order history, and one-click reordering.
- Self-service meal-plan schedules, substitutions, pauses, skips, and cancellations.
- Automated recurring billing where supported and explicitly authorized by the customer.
- Renewal reminders, failed-payment handling, and clear refund or credit rules.
- Operational automation for kitchen quantities and delivery schedules as volume increases.

Automating billing does not by itself automate meal fulfillment. Define how schedule changes, cutoff times, skipped meals, and payments interact before building this release.

## V1 build sequence and launch decisions

1. **Finalize the business rules and remaining assets.** Use the confirmed Healthy Nation name and supplied logo. Finalize approved food photos, the launch menu, prices, service area, operating hours, order cutoffs, delivery charges, and meal-plan terms.
2. **Model and publish content.** Set up typed meals, plans, weekly menus, FAQs, and contact settings, with designated business approval and developer publishing owners.
3. **Build the storefront.** Implement the public pages, meal details, search, plan discovery, and responsive navigation.
4. **Build the WhatsApp handoff.** Implement selection retention, request review, encoded message drafts, clear confirmation expectations, and contact fallbacks.
5. **Exercise the full operation.** Walk through meal, plan, customization, and catering inquiries on mobile and desktop, including unavailability and failed handoff cases.
6. **Launch and measure.** Confirm staff coverage and the operational register, then assess confirmed purchases, repeat ordering, and fulfillment quality before expanding to V2.

Before making public promises, resolve who owns menu updates, inquiry responses, order confirmation, payment verification, kitchen coordination, and delivery. Confirm applicable food-business obligations and have condition-specific nutrition claims reviewed.

## Development status

The repository contains this brief, the supplied brand logo, and an unfinished Next.js application scaffold with preliminary catalog/domain modules in `web`. Existing draft code is not the approved design or a finished V1. Local setup, tests, and architecture documentation will be reconciled when design is approved and implementation resumes. No cloud resources, CMS project, production WhatsApp integration, or payment integration have been provisioned.
