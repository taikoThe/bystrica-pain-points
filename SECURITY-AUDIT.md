# Security Audit — Bystrica Pain Points

OWASP Top 10 audit performed 2026-04-16. Issues grouped by severity.
Status: ✅ Fixed | ⬜ TODO | 🚫 Out of scope

---

## Critical — all fixed ✅

### ✅ 1. Unauthenticated PATCH on /api/reports/[id]
- **OWASP:** A01 Broken Access Control
- **Problem:** The PATCH endpoint had no authentication or field validation. Any person on the internet could send a request and silently overwrite any report's data — title, description, status, coordinates — without logging in.
- **Fix:** Removed the endpoint entirely (`src/app/api/reports/[id]/route.ts`). It was not called from any frontend code — the admin panel uses the separate, protected `/api/admin/reports/[id]` endpoint. Removing it eliminates the attack surface completely.
- **Verified:** `curl -X PATCH https://pipis-school.org/pain-points/api/reports/any-id` returns `405 Method Not Allowed`.

---

### ✅ 2. JWT secret had an insecure hardcoded fallback
- **OWASP:** A02 Cryptographic Failures
- **Problem:** `src/lib/auth.ts` contained `process.env.JWT_SECRET || "default-secret-change-me"`. If the environment variable was ever missing (server migration, typo in .env, new deployment), all JWTs would be silently signed with a publicly known string. An attacker knowing this string could forge a valid admin token and gain full access to the admin panel.
- **Fix:** Removed the fallback (`src/lib/auth.ts`). The app now throws an explicit error at module load time if `JWT_SECRET` is missing, failing the build and startup visibly rather than running insecurely. Because Next.js loads `.env` before module initialisation, the build itself fails if the variable is absent.
- **Verified:** App starts cleanly with JWT_SECRET set. No fallback path exists.

---

### ✅ 3. File uploads accepted based on MIME type only (spoofable)
- **OWASP:** A04 Insecure Design
- **Problem:** The upload endpoint (`src/app/api/upload/route.ts`) only checked `file.type.startsWith("image/")`. The MIME type is sent by the client and can be set to anything. An attacker could rename `shell.php` to `shell.jpg`, claim Content-Type `image/jpeg`, and upload a server-side script.
- **Fix 1 — Magic number validation:** After reading the raw file bytes into a Buffer, the actual binary file signature is now checked:
  - JPEG: first 3 bytes `FF D8 FF`
  - PNG: first 8 bytes `89 50 4E 47 0D 0A 1A 0A`
  - GIF: first 4 bytes `47 49 46 38`
  - WebP: bytes 0–3 are `RIFF` AND bytes 8–11 are `WEBP`
  - Any file that fails all checks is rejected with 400, regardless of what the client claims. SVG is implicitly rejected (can embed `<script>` tags).
- **Fix 2 — Cryptographic filename:** Replaced `Date.now() + Math.random()` with `crypto.randomBytes(16).toString("hex")`. The old approach produced ~48 bits of entropy from a predictable clock + weak random; the new one produces 128 bits of cryptographically secure randomness. Filenames cannot be guessed or predicted.
- **File:** `src/app/api/upload/route.ts`

---

## High — all fixed ✅

### ✅ 4. No rate limiting on any API endpoint
- **OWASP:** A05 Security Misconfiguration
- **Problem:** Any endpoint could be called unlimited times per second from any IP. This enabled brute force attacks on login, spam report creation, and denial-of-service by flooding.
- **Fix — Nginx rate limiting on auth only:** Created `/etc/nginx/conf.d/rate-limit.conf` defining an `auth` zone (10 requests/minute per IP). Added a dedicated `location /pain-points/api/auth` block in `/etc/nginx/sites-available/default` with `limit_req zone=auth burst=5 nodelay`. The general `/pain-points` location has no rate limit so normal browsing is never affected. Auth-specific limiting is sufficient because account lockout (issue #9) already handles per-account brute force, and Nginx handles IP-level flooding of the login/register endpoints.
- **Note:** An earlier version used a `general` zone on all `/pain-points` traffic (30 req/min) which caused false 503s during normal page loads. Switched to auth-only targeting.
- **Verified:** 10 rapid requests to `/api/categories` all return 200. Rapid POST requests to `/api/auth/login` hit 503 after 5 attempts.

---

### ✅ 5. No HTTP security headers
- **OWASP:** A05 Security Misconfiguration
- **Problem:** The app sent no security headers, leaving users exposed to clickjacking (iframe embedding), MIME sniffing, referrer leakage, and missing HTTPS enforcement.
- **Fix — Nginx** (`/etc/nginx/sites-available/default`): Added 5 headers to the HTTPS server block. These apply to all responses including the static Maslow app:
  ```
  X-Frame-Options: DENY                              — prevents iframe embedding (clickjacking)
  X-Content-Type-Options: nosniff                    — stops browsers guessing file types
  Referrer-Policy: strict-origin-when-cross-origin   — only sends origin on cross-site links
  Permissions-Policy: geolocation=(self), camera=(), microphone=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  ```
- **Fix — Next.js** (`next.config.ts`): Added a `Content-Security-Policy` header via the `headers()` function. The CSP is app-specific (different allowed domains than a generic policy) so it lives in Next.js, not Nginx:
  ```
  default-src 'self'
  script-src 'self' 'unsafe-inline'        — unsafe-inline required by Next.js App Router hydration
  style-src 'self' 'unsafe-inline'         — unsafe-inline required by Leaflet inline styles
  img-src 'self' data: blob:
      https://*.tile.openstreetmap.org     — map tiles
      https://cdnjs.cloudflare.com         — Leaflet default marker icons
  connect-src 'self'
      https://nominatim.openstreetmap.org  — geocoding / address search
  font-src 'self'                          — Inter font is self-hosted by Next.js at build time
  frame-ancestors 'none'
  ```
- **Verified:** `curl -sI https://pipis-school.org/pain-points` returns all 6 headers. `curl -sI https://pipis-school.org/maslow-city/` returns the 5 Nginx headers.

---

### ✅ 6. No CSRF protection on state-changing requests
- **OWASP:** A01 Broken Access Control
- **Problem:** Auth cookies were set with `SameSite=Lax`. A malicious website could trigger authenticated actions by navigating the user to our app via a link or form submission, causing the browser to automatically include the auth cookie.
- **Fix:** Changed `sameSite: "lax"` to `sameSite: "strict"` in both `src/app/api/auth/login/route.ts` and `src/app/api/auth/register/route.ts`. With `Strict`, the browser only sends the cookie for requests that originate from our own domain — cross-site requests never include it.
- **Trade-off:** Users arriving from an external bookmark or link will appear logged out on first load and must navigate once inside the app before the cookie is sent. Acceptable for this use case.
- **Verified:** Login response includes `Set-Cookie: auth-token=...; SameSite=Strict`.

---

### ✅ 7. Wildcard image domain in next.config.ts
- **OWASP:** A10 Server-Side Request Forgery (SSRF)
- **Problem:** `next.config.ts` had `remotePatterns: [{ hostname: "**" }]`. The Next.js Image Optimization API proxies and caches remote images through the server. With a wildcard, an attacker could craft a URL that makes the server fetch any internal or external resource, potentially exposing internal services or metadata endpoints.
- **Fix:** Changed to `remotePatterns: []` (`next.config.ts`). All images in the app (report photos, councillor portraits) are self-hosted in `public/`. No external image proxying is needed.

---

### ✅ 8. Password minimum is only 6 characters
- **OWASP:** A07 Identification and Authentication Failures
- **Problem:** Both `loginSchema` and `registerSchema` in `src/lib/validators.ts` accepted passwords as short as 6 characters. 6-character passwords are trivial to brute force and don't meet modern standards (NIST SP 800-63B recommends 8+).
- **Fix:** Increased minimum to 8 characters in `registerSchema` only (`src/lib/validators.ts`). The `loginSchema` was intentionally left at 6 to avoid locking out existing users who registered with 6–7 character passwords. New registrations now require 8+ characters. The Zod error is now properly surfaced as a 400 with the message "Heslo musí mať aspoň 8 znakov" instead of being swallowed by the catch block.
- **Verified:** Registering with a 7-character password returns `{"error":"Heslo musí mať aspoň 8 znakov"}` (HTTP 400).

---

### ✅ 9. No account lockout after failed login attempts
- **OWASP:** A07 Identification and Authentication Failures
- **Problem:** There was no limit on failed login attempts. An attacker could try millions of passwords against any account without being blocked.
- **Fix:** Added in-memory account lockout to `src/app/api/auth/login/route.ts`. A module-level `Map` tracks failed attempts per email address:
  - After 5 failed attempts within a 15-minute window, the account is locked for the remainder of that window
  - Returns HTTP 429 with a `Retry-After` header indicating seconds until the lock expires
  - On successful login, the failure counter for that email is cleared
  - The window resets automatically after 15 minutes of inactivity
  - Uses normalised (lowercase) email as the key to prevent case-variation bypass
- **Note:** The Map resets on server restart. For a multi-instance deployment, a shared store (Redis) would be needed. Acceptable for this single-instance app.
- **Verified:** 6 rapid bad-password attempts return `401 401 401 401 401 429`.

---

## Medium — not yet fixed

### ⬜ 10. No input validation on /api/reports/nearby coordinates
- **OWASP:** A03 Injection
- **Problem:** The `lat`, `lng`, and `radius` query parameters are converted with `parseFloat()` and passed directly to the Haversine formula without range checks. Extreme values (`lat=99999`, `radius=-1`) won't cause SQL injection (Prisma prevents that) but can produce NaN results, unexpected database behaviour, or expose error traces.
- **Fix:** Validate ranges before use. Latitude: −90 to 90. Longitude: −180 to 180. Radius: 1 to 5000 metres. Return 400 if out of range.
- **File:** `src/app/api/reports/nearby/route.ts`

---

### ⬜ 11. X-Forwarded-For IP can be spoofed in report confirmations
- **OWASP:** A01 Broken Access Control
- **Problem:** The "I have this problem too" confirmation endpoint (`src/app/api/reports/[id]/confirm/route.ts`) reads the `x-forwarded-for` header to deduplicate anonymous confirmations. This header is set by the client and can contain any value. An attacker can rotate fake IPs and add unlimited confirmations to any report, inflating its apparent severity.
- **Fix:** Replace the `x-forwarded-for` header with the actual remote address provided by Nginx via `X-Real-IP`, which is set by our Nginx config and cannot be forged by the client. Alternatively, accept that anonymous deduplication is best-effort only and remove the IP-based check.
- **File:** `src/app/api/reports/[id]/confirm/route.ts`

---

### ⬜ 12. No security event logging
- **OWASP:** A09 Security Logging and Monitoring Failures
- **Problem:** Failed logins, account lockouts, 403 errors on admin routes, and rate limit hits are not logged anywhere persistent. If an attack happens (or is happening), there is no audit trail to detect or investigate it.
- **Fix:** Add `console.error` logging at minimum for security events: failed login (with email and IP), account lockout triggered, unexpected 5xx errors. For production, replace with a structured logger (Pino) that writes to a file PM2 can rotate. PM2 already captures stdout/stderr to `~/.pm2/logs/`.
- **Files:** `src/app/api/auth/login/route.ts`, admin API routes

---

### ⬜ 13. No email verification on registration
- **OWASP:** A07 Identification and Authentication Failures
- **Problem:** Anyone can register with any email address, including addresses they do not own. This enables account squatting on other people's emails and would cause notification emails (if added) to go to wrong recipients.
- **Fix:** After registration, send a verification email containing a signed, time-limited token. Mark the user as `emailVerified: false` in the database until they click the link. Requires: a new `emailVerified` field in the Prisma schema, an email sending service (Resend, Nodemailer + SMTP), and a new `/api/auth/verify` route.
- **Note:** This is a significant feature addition, not a small fix. Requires planning before implementation.

---

### ⬜ 14. Uploaded files stored in public/ with no access control
- **OWASP:** A01 Broken Access Control
- **Problem:** Report photos are stored in `public/uploads/` and served as static files. Anyone who knows a filename can access the photo. Photos from rejected or deleted reports remain publicly accessible forever.
- **Fix (production):** Move uploads to cloud object storage (Cloudflare R2, AWS S3) and serve them via pre-signed URLs with expiry. This is already noted in `implementation.md` as a known production limitation.
- **Note:** For this civic transparency use case, report photos are intentionally public. The risk is low. Priority increases if any sensitive document upload feature is ever added.

---

## Low — not yet fixed

### ⬜ 15. No cache-control headers on static assets
- **Problem:** Without explicit cache headers, browsers apply their own heuristic caching. After a deployment, users may see a stale version of the site for minutes or hours.
- **Fix:** Next.js already sets correct `Cache-Control` headers on `/_next/static/` assets (content-hashed, 1-year immutable). No action needed for the Next.js app. For the Maslow static app (`/maslow-city/`), add Nginx cache headers for `.js`, `.css` files.

---

### ⬜ 16. Login and register responses return full user object
- **OWASP:** A02 Cryptographic Failures (data minimisation)
- **Problem:** Both the login and register API responses return `{ user: { id, name, email, role } }`. This is more data than the client needs at authentication time and slightly increases the information surface per request.
- **Fix:** Return `{ success: true }` only. If the client needs user details (e.g. to display the logged-in name in the header), fetch them from a dedicated `/api/me` endpoint that is only accessible when authenticated.
- **Files:** `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`

---

## Out of Scope 🚫

| Issue | Reason |
|-------|--------|
| MFA / 2FA | Significant complexity; not justified for a civic reporting app at this scale |
| Virus/malware scanning on uploads | Requires ClamAV or paid API; upload size (10MB max, images only) limits risk |
| Single-session enforcement | Requires a shared session store (Redis); architecture change beyond current scope |
| JWT refresh token rotation | 7-day expiry is acceptable; adding refresh tokens requires significant auth refactor |

---

## Progress Summary

| Severity | Total | Fixed | Remaining |
|----------|-------|-------|-----------|
| Critical | 3 | 3 ✅ | 0 |
| High | 6 | 6 ✅ | 0 |
| Medium | 5 | 0 | 5 |
| Low | 2 | 0 | 2 |
| **Total** | **16** | **10** | **6** |

### What was fixed (in order)
1. Removed unauthenticated PATCH endpoint
2. JWT_SECRET fallback removed — fails loudly if missing
3. File upload magic number validation + cryptographic filename
4. Nginx rate limiting (30 req/min per IP, burst 10)
5. Security headers — 5 via Nginx (all apps), CSP via Next.js (pain-points only)
6. CSRF — SameSite=Strict on auth cookie
7. SSRF — image remotePatterns narrowed to empty (all images self-hosted)
8. Password minimum raised to 8 chars on new registrations
9. Account lockout — 5 failures in 15 min → 429 with Retry-After
