# LOCATION — search-led booking redesign

Reference: Booking.com car rentals, reviewed 12 November 2026. The implementation borrows the search/compare/reserve interaction structure, while retaining LOCATION's original navy, gold, ivory palette and road-monogram identity. No Booking.com branding, reviews, ratings, promotions, partner claims or policies are reused.

## Changes

- Search-first Marrakech arrival homepage, with the real fleet, a dedicated airport-delivery section, three booking steps, FAQ and the original cinematic collection retained below the main search experience.
- Shared destination/date search component. Supported public pickup locations are Marrakech Menara Airport and Marrakech city.
- Vehicle results with a filter sidebar, real database sorting and availability, readable horizontal cards, server-calculated period totals and query-preserving detail links.
- Vehicle page with breadcrumb navigation, anchor tabs, specifications, independent rates, airport-arrival guidance and a sticky reservation panel.
- Three-stage booking: trip, driver details, review. Required fields are validated before advancing. Quotes are recalculated when dates change, stale async responses are ignored and final submission remains server authoritative.
- Optional flight number and Marrakech-local arrival time are validated by Zod and saved in reservation notes, visible to administrators and in the creation audit snapshot. Existing reservations remain untouched.
- About, services, contact and confirmation pages now share the Marrakech/airport content and new visual system. Admin pages inherit the typography, spacing, buttons, surfaces and original brand icon.
- Responsive two-column date search, stacked results and mobile booking stages. No fabricated ratings, free delivery, free cancellation or 24/7 availability claims.

## Verification

Run the production build and `npm test`, then start the app and run `npm run test:e2e` and `node --env-file=.env scripts/redesign-checks.cjs`. The latter covers date preservation, full-period pricing, invalid-date feedback, flight validation and persistence. Synthetic bookings are cancelled with history retained.

Verified during this upgrade: successful production compilation and type validation; seven pricing tests; 30 existing HTTP workflow checks; 11 redesign integration checks. In the browser, the search retained the selected dates, a seven-day C-Class quote displayed 2,850 DH, driver/flight details advanced to a separate review step, and only the explicit Request reservation action submitted the booking. The synthetic browser booking was cancelled through the authorized admin endpoint and its history retained. Mobile homepage/results were checked at 390 px with no horizontal overflow and one primary h1. The original road icon is now used in the shared navigation, admin sign-in and favicon metadata.

Design evidence: `upgraded-home.jpg` and `upgraded-booking.jpg` in this directory. No remote deployment, email/SMS integration, or payment processing was added.
