# How the App Is Built and Runs on the Server

## The Big Picture

```
You edit code on the server
        ↓
npm run build   ← compiles your source code into optimised files
        ↓
PM2 runs the compiled app on port 3001
        ↓
Nginx sits in front and forwards traffic from the internet to port 3001
        ↓
User visits https://pipis-school.org/pain-points
```

---

## Why You Need to Build

This is a **Next.js** app. Next.js is not like a simple PHP site where you edit a file and it
immediately changes on the web. Instead it works in two stages:

| Stage | What happens |
|-------|-------------|
| **Source code** | The files you edit — TypeScript, JSX, CSS in `src/` |
| **Build output** | Compiled, optimised JavaScript in `.next/` — this is what actually runs |

When you edit a file in `src/`, the website does **not** change yet. You must run
`npm run build` to compile the new version. Only after that does the change go live
(after restarting PM2).

---

## What Is PM2?

PM2 is a **process manager** for Node.js apps. Think of it as a guardian that:

- **Keeps the app running** — if the app crashes, PM2 automatically restarts it
- **Starts on server reboot** — you do not need to SSH in and start the app manually after the server restarts
- **Collects logs** — stdout and stderr are saved to log files you can read at any time

Without PM2 you would have to run `npm start` in a terminal and keep that terminal open forever. PM2 runs it as a background service instead.

---

## How the App Was Started (one-time setup, already done)

```bash
# Start the app on port 3001 and give it the name "pain-points"
pm2 start npm --name "pain-points" -- start -- -p 3001

# Save the process list so PM2 remembers it after a reboot
pm2 save
```

You do not need to run these again. They were done during initial deployment.

---

## Daily Workflow — How to Deploy a Change

Every time you edit code and want the changes to go live:

```bash
cd ~/projects/bystrica-pain-points

# 1. Compile your edited source code into the .next/ folder
npm run build

# 2. Tell PM2 to restart the app so it picks up the new build
pm2 restart pain-points
```

That is it. Two commands.

---

## Useful PM2 Commands

```bash
# See all running apps and their status
pm2 status

# See live logs (press Ctrl+C to stop watching)
pm2 logs pain-points

# See the last 50 lines of logs (not live)
pm2 logs pain-points --lines 50

# Restart the app (after a new build)
pm2 restart pain-points

# Stop the app
pm2 stop pain-points

# Start the app again after stopping
pm2 start pain-points

# Restart AND reload environment variables from .env
pm2 restart pain-points --update-env
```

---

## Where Logs Are Stored

PM2 writes logs to files automatically:

| File | Contains |
|------|---------|
| `~/.pm2/logs/pain-points-out.log` | Normal output (requests, info messages) |
| `~/.pm2/logs/pain-points-error.log` | Errors and crashes |

If something is broken, always check the error log first:

```bash
pm2 logs pain-points --lines 50
# or read the file directly:
cat ~/.pm2/logs/pain-points-error.log
```

---

## How Nginx Fits In

The app runs on **port 3001**, which is not directly accessible from the internet.
Nginx acts as a **reverse proxy** — it receives requests on port 443 (HTTPS) and
forwards them to the app on port 3001.

```
Internet → Nginx (port 443) → Next.js app (port 3001)
```

The relevant part of the Nginx config (`/etc/nginx/sites-available/default`):

```nginx
location /pain-points {
    proxy_pass http://localhost:3001;
    ...
}
```

You almost never need to touch Nginx. Changes to application code only require
`npm run build` + `pm2 restart pain-points`.

---

## What Happens on Server Reboot

The server was configured with `pm2 startup systemd`, which creates a systemd
service (`pm2-student`). When the server reboots:

1. systemd starts the `pm2-student` service
2. PM2 reads its saved process list
3. PM2 automatically starts the `pain-points` app

You do not need to do anything — the app comes back on its own.

---

## Reading the Build Output

When you run `npm run build && pm2 restart pain-points` you see two sections. Here is what each part means.

### The build section (`npm run build`)

```
▲ Next.js 16.2.2 (Turbopack)
- Environments: .env              ← found your .env file with DATABASE_URL, JWT_SECRET, etc.

  Creating an optimized production build ...
✓ Compiled successfully in 6.1s   ← TypeScript/JSX compiled to JavaScript, no errors
✓ Finished TypeScript in 4.4s    ← type-checked all files, no type errors
✓ Collecting page data            ← ran each server page to gather metadata
✓ Generating static pages (14/14) ← pre-rendered pages that never change (login, register, etc.)
✓ Finalizing page optimization    ← done
```

Then the route list:

```
┌ ƒ /                        ← ƒ = Dynamic: rendered fresh on every request (needs database)
├ ○ /auth/login              ← ○ = Static: pre-built HTML, no database needed
├ ƒ /api/auth/login          ← all API routes are always dynamic
```

| Symbol | Meaning |
|--------|---------|
| `○` Static | HTML built once at deploy time. Fast, no server work per request. |
| `ƒ` Dynamic | HTML built on each request. Needed when content comes from the database. |

If the build fails (TypeScript error, missing env var, syntax error) you will see a red error here and the old version keeps running — PM2 is untouched until you reach the restart command.

### The PM2 section (`pm2 restart pain-points`)

```
Use --update-env to update environment variables
```
This warning appears every time. It just means: if you changed something in `.env`, add `--update-env` to pick it up. For normal code changes you can ignore it.

```
[PM2] Applying action restartProcessId on app [pain-points](ids: [ 0 ])
[PM2] [pain-points](0) ✓
```
PM2 stopped the old process and started a new one with the fresh build.

The status table:

```
│ id │ name        │ pid    │ uptime │ ↺ │ status │ cpu │ mem    │
│ 0  │ pain-points │ 167015 │ 0s     │ 5 │ online │ 0%  │ 13.4mb │
```

| Column | Meaning |
|--------|---------|
| `id` | PM2's internal number for this process (always 0 for your single app) |
| `name` | The name you gave it (`pain-points`) |
| `pid` | The Linux process ID — changes on every restart |
| `uptime` | How long it has been running. `0s` right after a restart is normal |
| `↺` | How many times the process has been restarted. `5` means it has been restarted 5 times total (including crashes and manual restarts) |
| `status` | `online` = running fine. `stopped` = not running. `errored` = crashed |
| `cpu` | CPU usage. `0%` is normal at idle |
| `mem` | RAM used. ~13–50 MB is normal for this app |

**The one thing to check:** `status` must say `online`. If it says `errored`, the app crashed — run `pm2 logs pain-points --lines 50` to see why.

---

## Quick Reference Card

```bash
# Deploy a code change
npm run build && pm2 restart pain-points

# Check if the app is running
pm2 status

# Read logs to debug a problem
pm2 logs pain-points --lines 50

# App is down after a crash — restart it
pm2 restart pain-points
```
