# REWAQ operations upgrade

Extend the existing Next.js / Prisma / MySQL architecture. Keep reservation locking, backend quotes, original snapshots and historical records.

Additive schema: structured flight/arrival/meeting details on Reservation; customer change requests linked to Reservation; append-only handover inspections (departure/return, condition, mileage, fuel, photos); payment kind and memo; nullable business policy settings (airport handover fee, security deposit and terms). Relations use RESTRICT; nothing historical is deleted. Inspection photos are private and served only after admin authentication.

Implementation: (1) database migration and validated APIs; (2) fleet timeline and daily operations; (3) booking availability, policies and private customer requests; (4) handover and ledger admin UI; (5) integration and browser verification. External payment/email providers are not enabled without merchant/provider configuration. Existing inventory is demonstration inventory; no fabricated reviews or guarantees.

## Delivered and verified
- Public 180-day availability calendar without customer details; backend recheck on quote and booking.
- Backend-priced airport handovers, separate refundable deposit and editable rental policies. Blank configuration stays explicitly “to arrange”; no invented free delivery or policy.
- Private booking change/cancellation requests and admin replies, preserved in audit history. Admin applies approved edits through the existing availability/quote validation.
- Fleet timeline and Today operations queue with pickups, returns, overdue rentals, flight and meeting details.
- Append-only departure/return inspections, mileage/fuel/checklists and protected condition photos. Inspection saves validate availability/recalculate price and activate/complete the rental.
- Rental/deposit/refund ledger with refund-balance validation and actor history; deposits excluded from rental revenue.
- Three-vehicle comparison; mobile booking action summary.
- Complete generated hero scene per car; simplified fleet cards; shared beige public navigation.
- Git .gitattributes normalizes source files to LF; no global Git configuration or index changes.

Verification: production build and TypeScript passed; 10 pricing tests, 27 operations integration checks and 30 existing booking regression checks passed. Browser review covered desktop/mobile cards, full-image slide switching, server quote, Today and fleet timeline. Synthetic test records remain auditable and test payment balances were reversed through refund ledger entries.

Remaining separate integrations: full FR/EN/AR localization, external email/SMS delivery and merchant payment processing are not implemented/enabled in this upgrade. They must not be shown as active. No external messages were sent and no money was charged.
