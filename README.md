# Bystrica Pain Points

Civic issue reporting platform for Banská Bystrica. Citizens report city problems (potholes, broken lights, illegal dumping, etc.) on an interactive map. City administration reviews, moderates, and resolves reports.

## Features

- **Interactive map** with clustered markers, category icons, and status colors
- **Quick report submission** — location picker, photo upload, category selection
- **Duplicate detection** — warns about nearby existing reports
- **"I have this problem too"** — confirmations instead of duplicates
- **Admin dashboard** — moderation queue, status management, analytics
- **Responsive design** — mobile-first with bottom sheets, desktop sidebar
- **Public transparency** — report timeline, status updates visible to all

## Tech Stack

- **Next.js 16** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS v4**
- **Prisma** + PostgreSQL
- **Leaflet** + OpenStreetMap (free, no API key)
- **Radix UI** components

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL running locally (or Docker)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

Copy the environment file and update the database URL if needed:

```bash
cp .env.example .env
```

Default database URL: `postgresql://postgres:postgres@localhost:5432/bystrica_pain_points`

Create the database:

```bash
createdb bystrica_pain_points
```

Or with Docker:

```bash
docker run -d --name bystrica-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=bystrica_pain_points -p 5432:5432 postgres:16
```

### 3. Push schema and seed data

```bash
npx prisma db push
npm run seed
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

| Role      | Email                    | Password    |
|-----------|--------------------------|-------------|
| Admin     | admin@bystrica.sk        | password123 |
| Moderator | moderator@bystrica.sk    | password123 |
| Citizen   | jana@email.sk            | password123 |
| Citizen   | marek@email.sk           | password123 |
| Citizen   | zuzana@email.sk          | password123 |

## Routes

### Public

| Route           | Description                    |
|-----------------|--------------------------------|
| `/`             | Homepage with interactive map  |
| `/browse`       | List view of all reports       |
| `/report/new`   | Submit a new report            |
| `/report/[id]`  | Report detail page             |
| `/my-reports`   | User's submitted reports       |
| `/auth/login`   | Login                          |
| `/auth/register`| Registration                   |
| `/how-it-works` | Help / FAQ page                |

### Admin

| Route                  | Description              |
|------------------------|--------------------------|
| `/admin`               | Dashboard overview        |
| `/admin/reports`       | Reports management table  |
| `/admin/reports/[id]`  | Report moderation view    |
| `/admin/analytics`     | Analytics & statistics    |
| `/admin/categories`    | Category management       |

## Issue Categories

Potholes, Broken Streetlights, Illegal Dumping, Graffiti, Public Furniture, Sidewalk Damage, Traffic Signs, Dangerous Crossings, Public Greenery, Water/Drainage, Winter Maintenance, Other.

## Status Workflow

New → Under Review → Accepted → In Progress → Resolved

Also: Rejected, Duplicate
