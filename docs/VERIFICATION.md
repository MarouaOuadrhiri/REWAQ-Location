# Local verification — 12 November 2026

- Official MySQL 8.4.13 server initialized inside the workspace, bound to localhost port 3307. Database: `location`.
- Three checked-in migrations applied, including database CHECK constraints and immutable original pricing snapshots.
- Next.js 15.5.29 production build passed. Development and production output are isolated in `.next-dev` and `.next`.
- Strict TypeScript validation passed.
- Seven pricing tests passed.
- Thirty main HTTP workflow checks passed.
- Fourteen database edge-case checks passed.
- Ten vehicle/upload/lifecycle checks passed, including serving images uploaded after server startup.
- Browser: desktop and narrow homepage layouts inspected; scroll scenes transitioned; seven-day quote displayed 2,850 DH; guest reservation submitted; private confirmation displayed; admin login, confirmation and cancellation verified; audit history remained available.
- Synthetic bookings are retained as CANCELLED, EXPIRED or COMPLETED. Lifecycle test vehicles are archived. Test customer identifiers are labelled TEST and use example.invalid emails. No historical booking rows were deleted.

Screenshots: `booking-verified.jpg` and `admin-verified.jpg`. The separate UI proposal board and SVG logos are proposals, not replacements for database-backed application pages.

Not verified or configured: remote deployment, external email/SMS delivery, external payment collection, real fleet image licensing, or behavior against the missing original Gostick screenshot. Payments in the app are manual receipt records.
