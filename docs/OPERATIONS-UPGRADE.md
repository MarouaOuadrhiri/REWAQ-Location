# REWAQ operations upgrade

Extend the existing Next.js / Prisma / MySQL architecture. Keep reservation locking, backend quotes, original snapshots and historical records.

Additive schema: structured flight/arrival/meeting details on Reservation; customer change requests linked to Reservation; append-only handover inspections (departure/return, condition, mileage, fuel, photos); payment kind and memo; nullable business policy settings (airport handover fee, security deposit and terms). Relations use RESTRICT; nothing historical is deleted. Inspection photos are private and served only after admin authentication.

Implementation: (1) database migration and validated APIs; (2) fleet timeline and daily operations; (3) booking availability, policies and private customer requests; (4) handover and ledger admin UI; (5) integration and browser verification. External payment/email providers are not enabled without merchant/provider configuration. Existing inventory is demonstration inventory; no fabricated reviews or guarantees.
