# Partner marketplace architecture

REWAQ becomes a multi-agency marketplace on the existing Next.js / MySQL stack.

Approved business rule: agency rates are net; a default 10% markup is added to the rental price. Airport fees and refundable deposits are not marked up. Admin can edit the global rate or override it for an agency. Original and current booking snapshots retain agency, net rental amount, rate and REWAQ markup. Existing direct REWAQ inventory retains its existing prices.

Relationships: Agency -> AgencySession, Vehicle, Reservation. Each agency account has a unique email and bcrypt password. Vehicle.agencyId is nullable for the original fleet. Agency status is PENDING / ACTIVE / SUSPENDED. Partner vehicle listing status is PENDING / APPROVED / REJECTED. Existing vehicles default APPROVED. Reservations retain their agency relation and price split; no historical records are deleted.

Flow: self-register -> pending partner workspace -> admin activates account -> partner adds vehicles/photos/base rates -> admin approves listing -> vehicle appears in public search with marked-up prices -> backend booking snapshots the split -> agency views only its own fleet and reservation summaries. Partner edits re-enter review; no partner can change the platform markup, ownership, approval or booking totals. Admin remains responsible for reservation lifecycle changes. Customer identity/license/access tokens/internal notes never appear in partner responses.

Implementation: additive migration; scoped partner authentication/APIs; consistent public visibility and backend pricing; polished responsive partner workspace and onboarding; admin agency/listing review; unit + two-tenant integration tests and browser QA. No external messages or fund transfers.

Verification: the production build passes with all partner, admin and customer routes generated. The implementation run also passed 18 unit tests, 38 partner isolation/pricing integration checks, and 30 existing booking-regression checks. The local production preview is available at `http://127.0.0.1:3004`; MySQL remains the backing store. The synthetic preview agency is suspended, its two `DEMO-` vehicles are archived, and no reservation history was removed.
