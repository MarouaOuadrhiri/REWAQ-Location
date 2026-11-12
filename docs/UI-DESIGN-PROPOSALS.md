# LOCATION — UI and brand proposals

Recommended direction: **Midnight Editorial**. Midnight Navy #101C2C / Deep Blue #26374B / Champagne Gold #C6A36B / Warm Ivory #F5F3EF / White #FFFFFF. Editorial serif headlines, neutral sans-serif controls, restrained 4–8 px corners, an 8 px spacing scale and one clear primary action on each screen. These are proposals; the working application remains connected to MySQL.

## Public screens

| Page            | Proposed composition                                                                                                                                    | Primary action       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Home            | Navy cinematic stage, oversized ivory headline, isolated vehicle, gold price, three short pinned scenes; ivory date search and curated collection below | Find your drive      |
| Fleet           | Ivory editorial heading, compact filter strip, three-column white vehicle cards, transparent photos, explicit date availability and DH rates            | Book now             |
| Vehicle details | 60/40 split: large gallery and specifications left, white quote/reservation panel right; sticky quote on desktop, bottom reserve action on mobile       | Request reservation  |
| Booking form    | Dates and locations first, backend quote breakdown second, customer details third; inline errors and pending explanation                                | Request reservation  |
| Confirmation    | Spacious ivory composition, gold success mark, private booking reference, status, dates, quote and expiry; no false confirmation claim                  | Check booking status |
| About           | Editorial brand story, road photography, short values, three numbered principles                                                                        | Explore collection   |
| Services        | Concierge-style service cards, pickup locations, daily/weekly/monthly rental explanation                                                                | Choose a vehicle     |
| Contact         | Clean assistance layout with service areas and an invitation to include special requirements in a request; publish real phone/email only when provided  | Plan your drive      |

## Admin screens

| Page                  | Proposed composition                                                                                                         | Primary action               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Login                 | Navy canvas, centered ivory/white form, compact monogram and minimal gold accent                                             | Sign in                      |
| Dashboard             | Navy sidebar, light workspace, real statistics, restrained revenue and reservation charts, latest booking table              | Review pending requests      |
| Fleet                 | Search and archive filter above image cards; registration and availability information; gold add button                      | Add vehicle                  |
| Add / edit vehicle    | Grouped sections: identity, technical specifications, independent rates, discount overrides, gallery and archive state       | Save vehicle                 |
| Reservations          | Status tabs, date/customer/reference filters, readable table with status chips and clear per-row action                      | Manage reservation           |
| Reservation details   | Reference/status header, editable period and vehicle panel, price comparison, customer snapshot, payments and audit timeline | Validate, recalculate & save |
| Customers             | Compact searchable directory with booking counts and contact details                                                         | View customer                |
| Customer details      | Editable profile, immutable booking snapshots and linked rental history                                                      | Save profile                 |
| Availability calendar | Vehicle selector, month view, colored booking intervals; side panel for maintenance/manual blocks                            | Block dates                  |
| Pricing               | Vehicle rate matrix in DH, inherited vs overridden discounts, clear pricing-policy explanation                               | Edit rates                   |
| Settings              | Small grouped cards for discount defaults, pending expiry/blocking and business currency                                     | Save settings                |

## Logo concepts

1. **Route L — recommended.** An L-shaped road, center markings and a destination point. Direct connection to LOCATION, recognizable at favicon size, distinctive without a generic car silhouette. Files: `public/brand/route-l.svg` and `icon-route.svg`.
2. **Apex.** A precise diamond frame and forward ascent mark. More sporting, angular and performance-oriented. File: `public/brand/apex.svg`.
3. **Journey Compass.** A gold compass ring and forward pointer. Emphasizes travel, exploration and Morocco. File: `public/brand/compass.svg`.

Use the chosen symbol alone for favicon/app icon and beside the wordmark for navigation. Keep clear space equal to one symbol stroke. Navy on ivory for documents, ivory/gold on navy for the website. The current proposals are original vector concepts, pending normal brand clearance before commercial registration.

## Icon language

Thin 1.5–1.75 px strokes, squared or lightly rounded ends, 20/24 px grids. Use consistent Lucide symbols for tasks: route for bookings, key for active rentals, calendar for availability, shield-check for confirmation, wrench for maintenance, archive for inactive fleet, wallet for received payments. Gold is for emphasis; status colors retain their operational meanings. Always provide visible labels or accessible names.

## Shared behavior

Loading placeholders match final geometry. Empty states explain the next action. Errors appear beside the affected field and in a concise summary. Focus outlines stay visible. Reduced-motion disables pinning and large transforms. Cards stack to one column on narrow mobile screens; booking and admin forms stack in reading order. Pricing and status changes never rely only on color.
