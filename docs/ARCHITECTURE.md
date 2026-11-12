# LOCATION architecture

Next.js App Router serves React server pages and a Node REST API. MySQL is the permanent source of truth. Prisma handles typed queries and migrations. No in-memory database or mocked booking fallback exists. CSS tokens implement the supplied navy/gold/ivory palette; GSAP provides the desktop pinned hero. Mobile and reduced-motion visitors receive a stable hero without pinning.

## Relationships

- Admin 1:N AdminSession; sessions store SHA-256 hashes of random cookie tokens, expire in eight hours and are revoked on logout.
- Vehicle 1:N VehicleImage, Reservation, VehicleMaintenance. Archive flags preserve all related data.
- Customer 1:N Reservation. Optional User 1:1 Customer supports future accounts without requiring one today.
- Reservation 1:N ReservationHistory and Payment. An immutable original customer snapshot survives profile changes; every price update has before/after history.
- Admin 1:N ReservationHistory records the editing administrator. Original booking creation and expiration use a null administrator.
- PricingSettings is a singleton (id 1). Nullable vehicle discount fields inherit its defaults.
- All historical foreign keys use RESTRICT. Monetary values are Decimal(12,2), with cent arithmetic in the pricing service.

## Availability and concurrency

Intervals are half-open [pickup, return), in UTC. Adjacent reservations are allowed. Confirmed and active reservations block their dates; unexpired pending reservations block if enabled. Maintenance and manual blocks participate in the same validation. Write transactions lock the affected Vehicle rows in sorted ID order before checking availability and writing records. Changes lock old and new vehicles. This serializes competing bookings for a vehicle. Public quotes are advisory; booking submission checks again. Never delete bookings.

Pending expiration is evaluated by timestamp in availability queries even before persisted status cleanup. Administrator pages/API calls run audited cleanup. Run scripts/expire.ts as an external scheduled job for prompt background persistence. Turning pending blocking on takes effect immediately; existing expiration timestamps remain unchanged.

## Pricing

Use full 30-day months, then full 7-day weeks, then daily remainder. Apply monthly and weekly discounts only to their period rate; round discounted unit prices to cents. This is the requested deterministic period policy, not a cheapest-combination optimizer. Backend dates determine duration. Browser prices and statuses are ignored on public submission. Booking writes store the entire rate/discount snapshot.

## Phases

1. Schema, MySQL configuration, core services and migrations.
2. Public website, database-driven collection, dynamic detail and booking form.
3. Admin sessions, fleet CRUD/archive/restore and verified image uploads.
4. Reservation lifecycle, customer records, backend recalculation and history.
5. Availability calendar, maintenance/manual blocks, payment ledger and real reporting.
6. Pricing tests, concurrent booking tests, auth tests, production build and visual inspection.

## REST routes

Public: GET /api/vehicles; POST /api/pricing/quote; POST /api/reservations.
Authentication: POST /api/auth/login and /logout; GET /api/auth/session.
Admin: GET/POST /api/admin/vehicles; PATCH /api/admin/vehicles/:id; POST /api/admin/vehicles/:id/images; GET /api/admin/reservations[/:id]; PATCH /api/admin/reservations/:id; GET /api/admin/customers; PATCH /api/admin/customers/:id; GET/PATCH /api/admin/settings; GET/POST /api/admin/calendar; PATCH /api/admin/calendar/:id releases blocks; POST /api/admin/payments.

Reservation creation returns a private bearer token used by the confirmation page. It never exposes customer identity fields. Admin endpoints independently authenticate, irrespective of page protection. State-changing requests require a same-origin Origin header. Uploads allow PNG/JPEG/WebP based on file signatures, cap sizes at 8 MB, and replace names with random UUIDs. SVG/HTML uploads are disallowed.

## Deployment boundaries

Use a Node host with persistent public/uploads storage and a separate MySQL server; Cloudflare Sites static/Worker hosting is not configured for this application. No external payment gateway or email delivery is claimed. Payments are manually recorded receipts. Notifications are in-app success/error messages and the private booking status page. Configure a mail provider before promising email/SMS confirmations. Identity fields require restricted database access, encrypted disks/backups, and an appropriate retention policy in production.
