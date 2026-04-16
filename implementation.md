# Bystrica Pain Points — Implementation Document

## 1. Product Summary

**Bystrica Pain Points** is a civic issue reporting platform for Banská Bystrica where citizens report and track city infrastructure problems on an interactive map. The map-first homepage lets anyone see what's happening in their neighborhood, submit reports in under a minute, and follow resolution progress. City staff use an admin dashboard to triage, assign statuses, and resolve issues with full audit trails.

### Key Differentiators

- Map-centered homepage (not a list or dashboard)
- Under-1-minute report submission flow (3-step wizard)
- Duplicate detection via proximity warnings (Haversine distance within 200m)
- "I have this problem too" confirmations to reduce duplicates
- Public transparency with real-time status updates and timelines
- Clean, trustworthy civic design with Slovak localization

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js (App Router) | 16.2.2 | Full-stack React framework with SSR |
| UI | React | 19.2.4 | Component library |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Components | Radix UI | Various | Accessible headless components (Dialog, Select, Tabs, Sheet, etc.) |
| Component Variants | class-variance-authority | 0.7.1 | Variant-based component styling |
| Icons | Lucide React | 1.7.0 | Icon library |
| Maps | Leaflet + react-leaflet | 1.9.4 / 5.0.0 | Interactive maps with OpenStreetMap tiles (free, no API key) |
| Map Clustering | react-leaflet-cluster + leaflet.markercluster | 4.1.3 / 1.5.3 | Marker clustering at low zoom levels |
| ORM | Prisma | 5.22.0 | Database access and schema management |
| Database | PostgreSQL | 16 | Primary data store (running in Podman container) |
| Auth | jose | 6.2.2 | JWT token creation and verification (edge-compatible) |
| Password Hashing | bcryptjs | 3.0.3 | Secure password hashing |
| Validation | Zod | 4.3.6 | Schema validation for API inputs and forms |
| Geocoding | Nominatim (OSM) | — | Free reverse geocoding and address search |

### Why These Choices

- **Leaflet over Mapbox**: Free, no API key, no usage limits — ideal for civic/public-service apps
- **Prisma 5 over 7**: v7 changed datasource config significantly; v5 is stable and well-documented
- **jose over jsonwebtoken**: Edge-compatible JWT library (works in Next.js middleware)
- **Radix UI**: Accessible, unstyled primitives — we layer Tailwind styling on top for full control
- **No separate state management**: React state + server components cover all needs; no Redux/Zustand overhead

---

## 3. Architecture

### Pattern

- **Server Components** for data fetching (pages query Prisma directly)
- **Client Components** for interactivity (map, filters, forms)
- **API Routes** for mutations and client-side fetches
- **JWT cookies** for authentication (httpOnly, 7-day expiry)

### Data Flow

```
Browser → Server Component (SSR) → Prisma → PostgreSQL
Browser → API Route (mutation) → Prisma → PostgreSQL
Browser → Nominatim API (geocoding, client-side)
```

### Folder Structure

```
bystrica-pain-points/
├── prisma/
│   ├── schema.prisma          # 8 models, 4 enums
│   └── seed.ts                # 25 reports, 5 users, 12 categories
├── public/
│   ├── uploads/               # Dev-only file uploads
│   ├── districts.geojson      # 7 electoral district boundaries with councillor data
│   ├── streets.json           # 331 street names for autocomplete
│   └── councillors/           # 31 councillor portrait photos
├── src/
│   ├── app/                   # Next.js App Router pages & API routes
│   │   ├── page.tsx           # Homepage (server) → HomePageClient
│   │   ├── HomePageClient.tsx # Map + sidebar + filters + detail drawer
│   │   ├── browse/            # List view
│   │   ├── report/new/        # 3-step submission wizard
│   │   ├── report/[id]/       # Report detail page
│   │   ├── my-reports/        # User's reports dashboard
│   │   ├── auth/              # Login + Register
│   │   ├── how-it-works/      # Help/FAQ
│   │   ├── admin/             # Admin layout + 4 sub-pages
│   │   └── api/               # 15 API routes
│   ├── components/
│   │   ├── ui/                # 12 base components (Button, Card, Badge, Dialog, Sheet, etc.)
│   │   ├── map/               # 8 map components (container, markers, controls, districts layer, search, location picker)
│   │   ├── reports/           # 6 report components (card, detail, form, timeline, list, duplicates)
│   │   ├── filters/           # 4 filter components (panel, category dropdown, status dropdown, search)
│   │   ├── layout/            # 4 layout components (header, footer, sidebar, bottom sheet)
│   │   ├── admin/             # 4 admin components (sidebar, table, stats, moderation)
│   │   └── shared/            # 7 shared components (badges, upload, empty state, skeleton, confirm, street search)
│   ├── lib/
│   │   ├── prisma.ts          # Singleton Prisma client
│   │   ├── auth.ts            # JWT helpers (createToken, verifyToken, getSession, getCurrentUser)
│   │   ├── validators.ts      # Zod schemas for all inputs
│   │   ├── utils.ts           # cn(), formatDate(), formatRelativeDate(), slugify(), truncate()
│   │   ├── constants.ts       # CATEGORIES, STATUS_CONFIG, SEVERITY_CONFIG, MAP_CONFIG
│   │   └── geocoding.ts       # reverseGeocode(), searchAddress() via Nominatim
│   └── types/index.ts         # TypeScript types (ReportWithRelations, MapMarkerData, MapFilters, etc.)
```

---

## 4. Database Schema

### Models (8)

| Model | Purpose | Key Fields |
|-------|---------|------------|
| User | Citizens, moderators, admins | email, passwordHash, role (CITIZEN/MODERATOR/ADMIN) |
| Category | 12 issue categories | name, slug, icon (Lucide name), color (hex) |
| Report | Core entity — a reported problem | title, description, status, latitude, longitude, address, severity |
| Attachment | Photos attached to reports | url, filename, mimeType, size |
| ReportUpdate | Timeline entries / status notes | content, isPublic, authorId |
| Confirmation | "I have this problem too" | reportId, userId, ipHash (anonymous dedup) |
| AdminAction | Audit log of admin changes | action, details (JSON), adminId |

### Enums

- **Role**: CITIZEN, MODERATOR, ADMIN
- **ReportStatus**: NEW, UNDER_REVIEW, ACCEPTED, IN_PROGRESS, RESOLVED, REJECTED, DUPLICATE
- **Severity**: LOW, MEDIUM, HIGH, CRITICAL

### Indexes

- `Report(latitude, longitude)` — spatial queries for nearby duplicate detection
- `Report(status)` — filtering by status
- `Report(categoryId)` — filtering by category
- `Report(createdAt)` — sorting by date

### Constraints

- `Confirmation(reportId, userId)` — unique, prevents double confirmations per user
- `Confirmation(reportId, ipHash)` — unique, prevents anonymous double confirmations

---

## 5. Design System

### Color Palette

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary / Trust | Blue | #2563EB |
| New status | Blue | #3B82F6 |
| Under Review | Purple | #8B5CF6 |
| Accepted | Cyan | #06B6D4 |
| In Progress | Amber | #F59E0B |
| Resolved | Emerald | #10B981 |
| Rejected | Rose | #F43F5E |
| Duplicate | Gray | #6B7280 |
| Background | Slate-50 | #F8FAFC |

Each category also has a unique color used for map markers and badges.

### Typography

- **Font**: Inter (Google Fonts, subsets: latin, latin-ext for Slovak diacritics)
- **Hierarchy**: text-xs through text-3xl, font-medium/semibold/bold
- **Language**: All UI text in Slovak

### Component Design Tokens

- Border radius: `rounded-lg` (8px) for cards, `rounded-xl` (12px) for modals, `rounded-full` for badges
- Shadows: `shadow-sm` for cards, `shadow-lg/shadow-xl` for floating elements
- Transitions: 150ms ease for hover/focus states

### UI Components (12 base)

All built on Radix UI primitives with Tailwind styling:
Button, Card, Badge, Input, Textarea, Label, Select, Dialog, Sheet, Tabs, Separator, ScrollArea, DropdownMenu, Tooltip

---

## 6. Map Implementation

### Technology

- **Leaflet** with OpenStreetMap tiles (free, no API key)
- **react-leaflet** for React integration
- **react-leaflet-cluster** + **leaflet.markercluster** for clustering
- **Dynamic imports** (`next/dynamic` with `ssr: false`) to avoid SSR issues with Leaflet

### Map Components

| Component | File | Purpose |
|-----------|------|---------|
| MapContainer | `components/map/MapContainer.tsx` | SSR-safe wrapper with loading state |
| DynamicMap | `components/map/DynamicMap.tsx` | Main map with tiles, markers, clustering, event handlers |
| IssueMarker | `components/map/IssueMarker.tsx` | Colored circle markers with category colors, resolved = faded |
| MapControls | `components/map/MapControls.tsx` | Zoom in/out, locate me, district toggle buttons |
| DistrictsLayer | `components/map/DistrictsLayer.tsx` | GeoJSON overlay for 7 electoral districts with councillor popups |
| LocationPicker | `components/map/LocationPicker.tsx` | SSR-safe wrapper for location selection |
| DynamicLocationPicker | `components/map/DynamicLocationPicker.tsx` | Click-to-place pin map with GPS locate, flies to geocoded street |
| MapSearch | `components/map/MapSearch.tsx` | Address search via Nominatim with typeahead |

### Map Interactions

- Markers are colored circles: category color, white border, drop shadow
- Selected marker: larger (32px vs 24px), blue ring glow
- Resolved/rejected/duplicate markers: 50% opacity
- Click marker → fetch full report → open right Sheet drawer (desktop) or bottom sheet (mobile)
- Click empty map tiles → navigate to `/report/new?lat=...&lng=...` (clicks on controls, markers, overlays are filtered out)
- Toggle district overlay button → shows/hides 7 electoral district boundaries with councillor info popups
- Cluster icons: blue (small), amber (medium), red (large) — count displayed
- My Location button: uses browser Geolocation API

### Center & Default View

- Banská Bystrica center: `48.7364, 19.1461`
- Default zoom: 14
- Min zoom: 10, Max zoom: 19

---

## 7. Page Structure

### Public Pages (9)

| Page | Route | Type | Description |
|------|-------|------|-------------|
| Homepage | `/` | Server + Client | Map with markers, sidebar filters, detail drawer, FAB report button |
| Browse | `/browse` | Server + Client | List view with search and category/status filters |
| New Report | `/report/new` | Server + Client | 3-step wizard: Location → Details → Contact & Submit |
| Report Detail | `/report/[id]` | Server + Client | Full report view with photos, timeline, confirm button |
| My Reports | `/my-reports` | Server | User's submitted reports (requires auth) |
| Login | `/auth/login` | Client | Email + password login form |
| Register | `/auth/register` | Client | Name + email + password registration |
| How It Works | `/how-it-works` | Server | 6-step guide + FAQ |

### Admin Pages (5)

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin` | Stats cards (6 metrics) + recent reports table |
| Reports | `/admin/reports` | Filterable table of all reports |
| Report Detail | `/admin/reports/[id]` | Full report with moderation panel (status change + note) |
| Analytics | `/admin/analytics` | By-status and by-category bar charts with counts |
| Categories | `/admin/categories` | Grid of all categories with report counts + add/edit/delete forms |

### API Routes (15)

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/reports` | Public | List reports with optional status/category filters |
| POST | `/api/reports` | Public | Create a new report |
| GET | `/api/reports/[id]` | Public | Get report with relations |
| PATCH | `/api/reports/[id]` | Public | Update report fields |
| POST | `/api/reports/[id]/confirm` | Public | Add "I have this too" confirmation (IP-hash dedup) |
| POST | `/api/reports/[id]/updates` | Admin | Add timeline update |
| GET | `/api/reports/nearby` | Public | Find reports within radius (Haversine formula) |
| GET | `/api/categories` | Public | List categories with report counts |
| POST | `/api/auth/login` | Public | Login, returns JWT cookie |
| POST | `/api/auth/register` | Public | Register, returns JWT cookie |
| POST | `/api/upload` | Public | Upload photo to /public/uploads/ (dev-only) |
| POST | `/api/auth/logout` | Public | Clear auth-token cookie (logout) |
| PATCH | `/api/admin/reports/[id]` | Admin | Change status + add note + log action |
| GET | `/api/admin/analytics` | Admin | Aggregate stats |
| POST | `/api/admin/categories` | Admin | Create a new category |
| PATCH | `/api/admin/categories/[id]` | Admin | Update a category |
| DELETE | `/api/admin/categories/[id]` | Admin | Delete a category (blocked if has reports) |

---

## 8. Responsive Design

### Desktop (≥1024px)

- Full layout: Header → Sidebar (280px, left) + Map (fills rest)
- Sidebar: search bar, dropdown filter menus (Kategória, Stav), last 10 reports list
- Report detail opens as right-side Sheet drawer (max-w-md)
- Admin: fixed sidebar (256px) + scrollable content

### Mobile (<1024px)

- Full-screen map, no sidebar
- Floating search bar at top
- Bottom controls: Filter button, Map/List toggle, Report FAB
- Filters open as bottom Sheet
- Report detail opens as bottom Sheet (max-h-80vh, rounded top)
- Large touch targets (h-11, h-12 for primary actions)

---

## 9. Report Submission Flow

### 3-Step Wizard (`/report/new`)

**Step 1 — Location**
- LocationPicker map (click or GPS)
- Street search autocomplete (331 streets from OSM, diacritics-insensitive, 2+ chars to trigger)
- Selecting a street geocodes it via Nominatim and sets map pin + flies to location
- Reverse geocoding shows address preview when clicking map directly
- Nearby duplicate warning (reports within 100m)

**Step 2 — Details**
- Category select (12 options with icons)
- Title (5-150 chars)
- Description (10-2000 chars)
- Photo upload (up to 5 images, max 10MB each)

**Step 3 — Contact & Submit**
- Optional email
- Anonymous mode checkbox
- Summary preview
- Submit → success screen with "Back to map" and "New report" options

### Validation

All inputs validated with Zod schemas (server-side in API routes, client-side for UX).

---

## 10. Authentication

- **JWT-based** with httpOnly cookies (7-day expiry)
- **jose** library for edge-compatible token operations
- **bcryptjs** for password hashing (12 rounds)
- Session read via `getSession()` → decodes cookie → returns `{ userId, email, role }`
- Admin check: `isAdmin(role)` — true for ADMIN or MODERATOR
- Admin layout redirects to `/auth/login` if not authorized

### User Roles

| Role | Permissions |
|------|------------|
| CITIZEN | Submit reports, confirm reports, view own reports |
| MODERATOR | All citizen + change status, add updates, view admin dashboard |
| ADMIN | All moderator + full admin access |

---

## 11. Seed Data

### Demo Content

- **5 users**: 1 admin, 1 moderator, 3 citizens (all password: `password123`)
- **12 categories**: Slovak names, Lucide icons, unique colors
- **25 reports**: Spread across Banská Bystrica with realistic titles, descriptions, addresses
- **Status distribution**: Mix of NEW, UNDER_REVIEW, ACCEPTED, IN_PROGRESS, RESOLVED, REJECTED
- **8 report update entries**: Timeline notes from admin on various reports
- **Confirmations**: Multiple users confirming popular reports

### Static Data Files

- `public/streets.json`: 331 street names from OpenStreetMap Overpass API (Banská Bystrica)
- `public/districts.geojson`: 7 electoral district polygons with names, descriptions, precinct ranges, councillor names and photo filenames
- `public/councillors/`: 31 portrait photos (200x300 JPG) from cdn.banskabystrica.sk

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bystrica.sk | password123 |
| Moderator | moderator@bystrica.sk | password123 |
| Citizen | jana@email.sk | password123 |
| Citizen | marek@email.sk | password123 |
| Citizen | zuzana@email.sk | password123 |

---

## 12. Current State & Known Limitations

### What Works

- Full map experience with clustered markers
- Electoral district overlay with councillor info and photos (toggle on/off)
- Report submission with location picker, street search autocomplete, and photo upload
- Report detail view with timeline
- "I have this problem too" confirmations (hidden for resolved/rejected/duplicate reports)
- Admin dashboard with stats, report table, moderation panel
- Admin category management (add, edit, delete with validation)
- Authentication (login, register, logout, JWT sessions)
- Filters as dropdown menus (category, status, search)
- Duplicate detection (nearby reports warning)
- Responsive mobile layout

### Known Limitations / Future Work

- **File uploads**: Currently stored in `public/uploads/` — production should use cloud storage (S3, Cloudflare R2)
- **No email notifications**: Citizens don't get notified when status changes
- **No image optimization**: Uploaded photos served as-is, should add compression/resizing
- **No rate limiting**: API routes have no rate limiting or CSRF protection
- **No pagination**: Report lists load all data; should add cursor-based pagination for scale
- **No i18n framework**: UI is hardcoded Slovak; adding multilingual support would require next-intl or similar
- **No real-time updates**: Map doesn't auto-refresh; would need WebSockets or polling
- **Admin merge duplicates**: Schema supports it (mergedIntoId) but UI is not yet built
- **No map heatmap mode**: Planned but not implemented

---

## 13. Running the Project

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (running via Podman: container `painpoints-db`)

### Commands

```bash
npm install                    # Install dependencies
npx prisma db push             # Push schema to database
npm run seed                   # Seed demo data
npm run dev                    # Start dev server at localhost:3000
npx prisma studio              # Open Prisma Studio (database GUI)
npx next build                 # Production build
```

### Environment

Database connection: `postgresql://painpoints:devpassword@localhost:5432/painpoints_bb`

Configured in `.env` (not committed to git).

---

## TODO

### District Polygons (Manual)

The electoral district overlay (`public/districts.geojson`) needs accurate polygon boundaries. Automated generation from street data / OSM boundaries didn't match the official map (`mapa_volebnych_okrskov_a_volebnych_miestnosti_2018.pdf`).

**Steps:**
1. Open https://geojson.io/#map=12.92/48.74261/19.14692
2. Draw 7 polygons (Obvod 1–7) tracing boundaries from the official PDF map
3. Set `id` property (1–7) on each polygon in geojson.io's right panel
4. Export the GeoJSON (Save → GeoJSON)
5. Run merge script or provide the file to Claude — properties (councillors, precincts, photos) will be merged from `scripts/districts-template.geojson`
6. Output goes to `public/districts.geojson`

**Reference files:**
- `mapa_volebnych_okrskov_a_volebnych_miestnosti_2018.pdf` — official district map
- `scripts/districts-template.geojson` — properties template (councillor data)
- `scripts/generate-districts.ts` — automated generation script (kept for reference)

### Reverse Geocoding — City Part Fix (Done)

Nominatim reverse geocoding returned incorrect city parts (mestské časti) for some streets — e.g. Skuteckého was shown as "Uhlisko" instead of "Banská Bystrica" (centrum). OSM's suburb/neighbourhood boundaries don't match the official city part assignments.

**Fix:** Created `src/lib/city-parts.ts` with the official street-to-city-part mapping (19 mestské časti, all streets from banskabystrica.sk). When reverse geocoding, the street name from Nominatim is looked up against this mapping to determine the correct city part. The unreliable `suburb`/`neighbourhood` field from Nominatim is no longer used.

**Files changed:**
- `src/lib/city-parts.ts` — official street → city part lookup (new)
- `src/lib/geocoding.ts` — `reverseGeocode()` uses `getCityPart()` instead of Nominatim suburb
- `src/components/reports/ReportForm.tsx` — inline reverse geocode uses `getCityPart()` too

**Address format:** `Skuteckého 116/3, Banská Bystrica, 974 01` (street + number, city part, postal code)

### Report Detail Page Enhancements

Enhance the individual report page/panel with the following features:

1. **Photo uploads on existing reports** — Allow users to add photos to an already-submitted report (not just during creation). Gallery view of all photos with timestamps and who uploaded them.

2. **Comments** — Users can comment on a report (discussion thread). Show commenter name/anonymous, timestamp, and comment text. Admin can also reply.

3. **Social media sharing** — Share button with options for Facebook, Twitter/X, and copy link. Generate a shareable URL with OG meta tags (title, description, map thumbnail) for nice previews.

4. **Watch/subscribe to report** — "Sledovať" button that lets a user subscribe to a report. When the report status changes, send an email notification to all watchers. Requires email input (or use logged-in user's email).

### Overview page Enhancements

Enhance problem overview page http://localhost:3000/browse
1. ** User should be able to sort problem by date of adding and date of resolution
2. ** User should be able to filter problem by city part also

### Main page Enhancement

Solve the problems
1. ** on Map page, map is too big and it is partially covering section "Posledné hlásenia"
2. ** filter section and "Posledné hlásenia" section should be visually separated
3. ** Main page header should be improved. Page name should be adapted and we will add the logo of the city. Menu should be visually enhanced, visually separated. I don't know how to formulate it, claude should help me to formulate what I want
