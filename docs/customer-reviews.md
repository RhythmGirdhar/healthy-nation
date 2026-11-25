# Customer journey reviews

[Documentation index](README.md) | [Founder questions](founder-questions.md) | [Current design](design/README.md)

## Review method

Two reviewers worked independently against the unchanged application at commit `9fe9ad2`. Each used a separate browser session at 1440, 1024, 768, 390 and 320 pixel widths. Neither read the other's findings, changed the application or opened WhatsApp.

The first reviewer took the view of a curious first-time customer. The second took the view of a returning customer who wants a quick, simple request. These are expert assessments using customer roles, not interviews, measured sales results or a full accessibility audit.

Both valued the calm green and cream colors, clear prices, simple navigation, saved quantities, safe undo and honest distinction between a request and an accepted order. Keep these features.

## First-time customer findings

| ID | Priority | Observed problem | Change |
| --- | --- | --- | --- |
| NEW-01 | High | At 320 and 390px, the fixed request bar covered the focused Add button on meal details. | Added bottom focus and scroll clearance. Check focused controls against the actual bar bounds. |
| NEW-02 | High | Coverage, delivery timing and charges were unknown before choosing food. | Added a clear delivery-availability inquiry on Home and Menu. Actual service facts remain [founder questions](founder-questions.md). |
| NEW-03 | High | A blank hero, 55 missing dish photos and a large missing founder portrait made the site look unfinished. | Added optimized food photos and a gallery. Dish examples are labelled. Kept unmatched dishes honest and removed the oversized founder placeholder. |
| NEW-04 | High | No dish had a description; all 55 portions were unknown. Customers could not compare what they would receive. | Asked for portions, ingredients and short descriptions. No recipe, nutrition or serving size was invented. |
| NEW-05 | Medium | A meal date silently became a catering event date. | Added separate meal, catering and plan dates, including saved-draft migration. |
| NEW-06 | Medium | Every added meal forced a trip to Request; Keep exploring lost filters. | Added menu-card selection, Add & keep browsing, visible selected quantities and filtered return links. |
| NEW-07 | Medium | The menu started with sides and hid category access during a long scroll. | Added a compact category strip that stays available while browsing. Kept the supplied menu order rather than inventing a ranking. |
| NEW-08 | Medium | The prominent plan journey led to blocked examples; the useful general inquiry was far below. | Labelled the Home plan entry as examples and moved a current-plan inquiry above the example cards. Sample plan sending stays blocked. |
| NEW-09 | Medium | The ingredients fallback opened a generic inquiry without the dish name. | Added Ask about this meal, with the real dish name and ID. It does not include unrelated saved selections. |
| NEW-10 | Medium | Home and Request still used sample-era and internal catalog wording. | Updated the real-meal flow, page metadata and request summary. Kept sample warnings only where relevant. |
| NEW-11 | Medium | Message preview had a scrolling dialog and a second scrolling text box. | Replaced the text box with selectable, wrapping text in one scrolling dialog. Copy and manual selection remain available. |

Baseline evidence: `MealPage`, `AddMealForm`, `MenuBrowser`, `RequestReview`, `MessagePreview`, `HomePage` and the mobile rules in `web/src/app/globals.css`.

## Returning customer findings

| ID | Priority | Observed problem | Change |
| --- | --- | --- | --- |
| RETURN-01 | High | Meal and catering dates overwrote each other when purpose changed. | Same fix as NEW-05. Each message uses only its own date. |
| RETURN-02 | High | A familiar multi-dish request repeatedly lost its browsing context. | Same fix as NEW-06. Quick selection does not navigate away from Menu. |
| RETURN-03 | High | The mobile bar hid focused request controls and their outlines. | Same fix as NEW-01. |
| RETURN-04 | Medium | A changed, inactive plan blocked an unchanged meal request. | Review flags now belong to meals or plans. An inactive change is retained for later review, including after reload, without blocking the active inquiry. |
| RETURN-05 | Medium | Preview message appeared after too much explanatory content; the mobile shortcut did not focus it. | Moved the action before expanded explanations. The mobile shortcut scrolls to and focuses the action. |
| RETURN-06 | Medium | Failed or expired menu checks had no retry action in the preview. | Added Check menu again inside the dialog. Failed checks still block the WhatsApp link and retain selections. |
| RETURN-07 | Low | Cards and details did not show an already selected quantity. | Added a visible quantity beside meal-selection actions, restored from the same-tab draft. |
| RETURN-08 | Low | The badge added inactive meal and plan drafts together. | The count now describes only the active inquiry. The mobile bar also names that inquiry. |

Baseline evidence: `RequestReview`, `reconcileDraft`, `AddMealForm`, `MenuBrowser`, `MessagePreview` and `SiteHeader`.

## Photo decisions

All 76 supplied files were inspected. There are 75 unique photos and one exact duplicate. All unique photos are in the kitchen gallery, with 960px and 480px WebP files. Together, the image files use about 4.96 MB.

The filenames do not identify recipes. Fifty-two dishes use clearly labelled example photos from the matching food category. These are not verified dish matches. French Fries, Peri Peri French Fries and Strawberry Smoothie keep their missing-photo state. No founder portrait was found. Photos of pasta and other food do not create new menu offers.

The [source register](../web/content/photo-source.json) accounts for every source file and records the duplicate and example assignments. The [editing guide](content-editing.md) explains how to replace examples after confirmation.

## Acceptance checks and remaining decisions

Application checks cover multi-meal selection, filter restoration, independent dates, review flags, retry after a failed menu check, copy fallback, photo coverage and narrow-screen focus. The current design view uses the application itself, so it cannot retain old menu data or separate interface copy.

Still needed from the founder: approved dish/photo matches, food details, delivery coverage and timing, fees, payment arrangements, plan terms, operational policies, public business details and a primary domain. These are business decisions, not safe code defaults.

Hosting, DNS, checkout, payments, accounts and a self-service content editor remain outside this change. No customer message was sent during the reviews or application checks.
