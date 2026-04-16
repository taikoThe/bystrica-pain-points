# Deploying bystrica-pain-points to Hostinger VPS

A step-by-step guide to deploying this Next.js + PostgreSQL app alongside an existing Nginx site.

---

## Overview

```
Next.js app (port 3001)
      ↓
PM2 keeps it running
      ↓
Nginx proxies /pain-points → localhost:3001
      ↓
https://pipis-school.org/pain-points
```

**Stack:**
| Component | Purpose |
|-----------|---------|
| Next.js | Full-stack React framework |
| PostgreSQL 16 | Database (runs in Docker) |
| Docker | Isolates the PostgreSQL container |
| PM2 | Keeps the Node.js process alive, auto-starts on reboot |
| Nginx | Reverse proxy — routes `/pain-points` to the app |
| systemd | Starts PM2 on server boot |

---

## Prerequisites

- Hostinger VPS (Ubuntu)
- Nginx already installed and serving the domain
- Node.js 20+ installed via nvm
- Docker installed (`apt install docker.io -y`)
- SSH access as both `student` and `root`

---

## Step 1 — Add basePath to next.config.ts

Because the app is served at a subpath (`/pain-points`) rather than the domain root, Next.js needs to know this so it generates correct internal links and asset URLs.

```ts
// next.config.ts
const nextConfig: NextConfig = {
  basePath: '/pain-points',
  serverExternalPackages: ["bcryptjs"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};
```

---

## Step 2 — Fix client-side fetch calls

Next.js automatically prepends `basePath` to `<Link>` and `router.push()`, but **not** to `fetch()` calls. All API fetches must include the basePath prefix.

### Create a helper utility

```ts
// src/lib/api-path.ts
export const bp = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const api = (path: string) => `${bp}${path}`;
```

### Update every fetch call

Replace every `fetch("/api/...")` with `fetch(api("/api/..."))`:

```ts
// Before
const res = await fetch("/api/auth/login", { ... });

// After
import { api } from "@/lib/api-path";
const res = await fetch(api("/api/auth/login"), { ... });
```

**Files that needed updating:**
- `src/app/auth/login/page.tsx`
- `src/app/auth/register/page.tsx`
- `src/components/layout/Header.tsx`
- `src/app/HomePageClient.tsx`
- `src/components/reports/ReportForm.tsx`
- `src/app/report/[id]/ReportDetailPage.tsx`
- `src/app/admin/reports/[id]/AdminReportDetailClient.tsx`
- `src/app/admin/categories/CategoriesClient.tsx`
- `src/components/shared/StreetSearch.tsx` — `fetch("/streets.json")` for address autocomplete
- `src/components/map/DistrictsLayer.tsx` — `fetch("/districts.geojson")` for district overlay

> **Note:** This applies to all `fetch()` calls with absolute paths — not just `/api/` routes, but also public assets like `.json` and `.geojson` files served from the `public/` folder.

---

## Step 3 — Start PostgreSQL in Docker

Run as **root**:

```bash
docker run -d \
  --name painpoints-pg \
  --restart unless-stopped \
  -e POSTGRES_USER=painpoints \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=painpoints_bb \
  -p 5432:5432 \
  postgres:16
```

- `--restart unless-stopped` — container auto-starts on server reboot
- Port `5432` is exposed only on localhost by default

Verify it's running:
```bash
docker ps | grep painpoints-pg
```

---

## Step 4 — Create .env file

```bash
# /home/student/projects/bystrica-pain-points/.env

DATABASE_URL=postgresql://painpoints:devpassword@localhost:5432/painpoints_bb
JWT_SECRET=<generate with: openssl rand -base64 32>
NODE_ENV=production
NEXT_PUBLIC_BASE_PATH=/pain-points
```

> `NEXT_PUBLIC_BASE_PATH` is inlined into the JS bundle at build time — it must be set before running `npm run build`.

---

## Step 5 — Set up the database

No migrations folder exists — use `prisma db push` to create tables directly from the schema:

```bash
cd ~/projects/bystrica-pain-points
npm install
npx prisma db push
npx prisma db seed
```

The seed creates:
- 12 issue categories
- Demo users (all passwords: `password123`):
  - `admin@bystrica.sk` — Admin
  - `moderator@bystrica.sk` — Moderator
  - `jana@email.sk`, `marek@email.sk`, `zuzana@email.sk` — Citizens
- 25 sample reports with confirmations and timeline updates

---

## Step 6 — Build the app

```bash
npm run build
```

---

## Step 7 — Start with PM2

Install PM2 if not already installed:
```bash
npm install -g pm2
```

Start the app on port 3001:
```bash
pm2 start npm --name "pain-points" -- start -- -p 3001
pm2 save
```

Useful PM2 commands:
```bash
pm2 status                        # check running processes
pm2 logs pain-points              # view live logs
pm2 restart pain-points           # restart after code changes
pm2 restart pain-points --update-env  # restart and pick up new env vars
```

---

## Step 8 — Configure PM2 to start on reboot

Run as **root** (PM2 is installed under student's nvm, so root needs the full path):

```bash
env PATH=/home/student/.nvm/versions/node/v20.20.1/bin:$PATH \
  pm2 startup systemd -u student --hp /home/student
```

This creates `/etc/systemd/system/pm2-student.service` and enables it. PM2 will now start automatically on server boot and resurrect all saved processes (including `pain-points`).

---

## Step 9 — Configure Nginx

### 9a — Security headers

Add these lines inside the `server {}` block (the HTTPS one), before the `location /` block:

```nginx
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(self), camera=(), microphone=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

These apply to all responses from this server (including the Maslow static app).

### 9b — Rate limiting zone

Create `/etc/nginx/conf.d/rate-limit.conf` (must be in http context, so a separate file works):

```nginx
limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/m;
```

### 9c — Proxy location blocks

Add these two location blocks inside the `server {}` block:

```nginx
location /pain-points {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_cache_bypass $http_upgrade;
}

location /pain-points/api/auth {
    limit_req zone=auth burst=5 nodelay;
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_cache_bypass $http_upgrade;
}
```

The second block applies rate limiting (10 req/min per IP, burst 5) specifically to login and register endpoints. The general proxy block has no rate limit so normal browsing is never affected.

Test and reload:
```bash
nginx -t
systemctl reload nginx
```

---

## Daily Deployment Workflow

After making code changes:

```bash
# On the VPS
cd ~/projects/bystrica-pain-points
git pull
npm run build
pm2 restart pain-points
```

---

## Troubleshooting

### App not responding
```bash
pm2 status               # check if process is online
pm2 logs pain-points     # check for errors
```

### Database connection error
```bash
docker ps | grep painpoints-pg   # check container is running
docker start painpoints-pg       # start it if stopped
```

### Nginx errors
```bash
nginx -t                              # test config
tail -f /var/log/nginx/error.log      # view errors
```

### Port already in use
```bash
ss -tlnp | grep 3001    # check what's on port 3001
```

### PM2 not starting on reboot
```bash
pm2 save    # re-save process list
systemctl status pm2-student    # check systemd service
```

---

## URLs

| URL | Description |
|-----|-------------|
| `https://pipis-school.org/pain-points` | Homepage (map) |
| `https://pipis-school.org/pain-points/report/new` | Submit a report |
| `https://pipis-school.org/pain-points/browse` | List view |
| `https://pipis-school.org/pain-points/auth/login` | Login |
| `https://pipis-school.org/pain-points/admin` | Admin dashboard |
