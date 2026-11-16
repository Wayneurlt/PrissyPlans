# Prissy Plans Events

Website, event enquiry system and private admin dashboard for **Prissy Plans Events**, an event planning, decoration and coordination business in Kenya.

Built with Nuxt 4 (Vue 3, TypeScript), Tailwind CSS 4, PostgreSQL with Prisma 7, Cloudinary for images and Nodemailer for email. Animations are light CSS transitions that respect reduced-motion settings.

---

## What's included

**Public website**
- Home: hero, short introduction, three signature services, three featured projects, testimonials (only when real ones are published) and a closing call to action.
- About, Services (index and detail template), Portfolio (category filter, project pages, lightbox, related projects), Event Inspiration (eight style themes, each linking into the enquiry form), Contact (form, WhatsApp, Instagram, contact details).
- Multi-step enquiry form at `/enquire` with a thank-you page that shows the reference and a WhatsApp follow-up.
- WhatsApp click-to-chat everywhere: floating button, hero, service pages, contact page, after submission. Each entry point uses a context-specific prefilled message.
- SEO: per-page titles and descriptions, Open Graph, canonical URLs, JSON-LD (LocalBusiness and Service), `/sitemap.xml` and `/robots.txt`.

**Enquiry system**
- Six steps: event type, details, services, budget (KES, admin-configurable), vision with optional inspiration uploads, and contact details.
- Validation on both client and server with one set of shared zod schemas.
- Duplicate protection through a per-form idempotency key, plus a honeypot field, a minimum fill time and rate limiting.
- Each enquiry is saved with a reference such as `PPE-2611-K7Q4M`. Event type, services and budget are stored as snapshots, so later edits to services or categories do not change past enquiries.
- An email notification goes to the admin and a confirmation goes to the client. Email failures never block a submission.

**Admin dashboard** (`/admin`)
- Overview: enquiry counts by stage, latest enquiries, upcoming dated events, recent activity and a setup checklist.
- Enquiries: search, status and event-type filters, a detail view, pipeline status, follow-up dates, internal notes, inspiration image viewing, one-tap WhatsApp or email to the client, and delete.
- Portfolio: create and edit projects, upload multiple images, set the cover, add captions, reorder, feature, publish or unpublish, and delete.
- Services: full editing, including the "What's included" and "Suitable for" lists, images, ordering and publishing.
- Testimonials: add, edit, publish or unpublish, and delete.
- Categories: event categories (which drive the portfolio filter) and service categories.
- Website settings: hero copy, introduction, About page, contact details, social links, WhatsApp number, call-to-action text, footer, budget ranges, success message and SEO defaults.

---

## Project structure

```
app/
  assets/css/main.css        Design tokens (palette, type scale) and component classes
  components/
    ui/                      AppLogo, AppIcon, AppImage, AppButton, AppToasts
    site/                    Header, footer, homepage sections, cards, grid, lightbox, forms
    enquiry/                 EnquiryWizard, EnquiryImageUpload
    admin/                   Admin forms, image manager, fields, badges
  composables/               Site settings, WhatsApp, SEO, toasts, motion
  layouts/                   default (public), admin, blank
  middleware/admin.ts        Client-side redirect for admin pages (server check is authoritative)
  pages/                     Public pages, /enquire, /admin/**
  plugins/reveal.ts          v-reveal scroll-in directive (respects reduced motion)
server/
  api/                       Public endpoints and /api/admin/** (all admin routes call requireAdmin)
  middleware/                Admin guard and security headers
  routes/                    sitemap.xml, robots.txt
  services/                  Enquiry, notification and catalogue business logic
  utils/                     Prisma client, auth, rate limiting, uploads, Cloudinary, mail, settings
shared/
  config/                    Enquiry options, settings catalogue, inspiration themes, placeholder images
  schemas/                   zod schemas shared by client and server
  utils/                     WhatsApp link builder, formatting helpers
prisma/
  schema.prisma              Database schema
  migrations/                SQL migrations
  seed.ts                    Categories, services, settings and labelled sample projects
public/brand/                Logo variants (from the supplied artwork), favicon, Open Graph image
brand/                       Original logo PDF and generated exports
scripts/                     create-admin.ts, screenshots.mjs, dev/ checks
tests/                       unit/ (vitest), api/ (vitest against a server), e2e/ (Playwright)
```

---

## Requirements

- Node.js `^22.21.0` or `>=24.11.0`. Nuxt 4.6 warns on older 22.x releases.
- PostgreSQL 14 or newer. For local development, `npm run db:local` starts a Prisma Postgres instance with no install needed.

---

## Environment variables

Copy `.env.example` to `.env` and fill it in. Every value is read on the server only, except those starting with `NUXT_PUBLIC_`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DATABASE_POOL_MAX` | No | Connections per server instance. Use `1` with `npm run db:local`, and 5 to 10 for hosted Postgres. |
| `SHADOW_DATABASE_URL` | No | Only needed if the database user cannot create databases during `migrate dev` |
| `NUXT_APP_SECRET` | Yes | Seals the admin session cookie. Generate with `openssl rand -base64 32`. |
| `NUXT_PUBLIC_SITE_URL` | Yes | Public URL, used for canonical links, the sitemap, emails and Open Graph |
| `NUXT_CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | For uploads | Image uploads. Without these, uploads are disabled and the admin shows a notice. |
| `NUXT_CLOUDINARY_FOLDER` | No | Root Cloudinary folder (default `prissy-plans`) |
| `NUXT_SMTP_HOST` / `_PORT` / `_SECURE` / `_USER` / `_PASS` | For email | SMTP delivery. Without a host, emails are written to the server log instead. |
| `NUXT_MAIL_FROM` | For email | Sender, e.g. `Prissy Plans Events <hello@yourdomain>` |
| `NUXT_ADMIN_NOTIFICATION_EMAIL` | For email | Inbox for new-enquiry alerts. Can be overridden in Admin → Settings. |
| `NUXT_IP_HASH_SALT` | Yes | Salt used to hash client IPs. Raw IPs are never stored. |
| `NUXT_PUBLIC_WHATSAPP_NUMBER` | No | Fallback WhatsApp number. The number saved in Admin → Settings wins. |

---

## Local setup

```bash
npm install
cp .env.example .env            # then edit values

# Option A: local Prisma Postgres (no install). Leave it running in its own terminal
# and paste the DATABASE_URL it prints into .env, with DATABASE_POOL_MAX="1".
npm run db:local

# Option B: your own PostgreSQL. Just set DATABASE_URL.

npm run db:migrate              # applies prisma/migrations
npm run db:seed                 # categories, services, settings, labelled sample projects
npm run admin:create -- --email you@example.com --name "Your Name" --password "Choose-A-Strong-Passw0rd"
npm run dev                     # http://localhost:3000
```

The seed is safe to re-run. It never overwrites service text you edited in the admin, and it never creates enquiries, testimonials or admin users. Set `SEED_SAMPLE_PORTFOLIO=false` to skip the sample projects.

## Admin accounts

There is no public registration. Create or update admins from the command line:

```bash
npm run admin:create -- --email owner@example.com --name "Owner Name" --password "Str0ng-Password" --role OWNER
```

Re-running with the same email resets that admin's password. Passwords need at least 10 characters, with upper-case and lower-case letters and a number. They are hashed with scrypt. Sign in at `/admin/login`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Generates the Prisma client and builds for production |
| `npm start` | Runs the production build (`.output/server/index.mjs`) |
| `npm run db:migrate` | Creates and applies migrations in development |
| `npm run db:deploy` | Applies migrations in production |
| `npm run db:seed` | Seeds default content |
| `npm run db:studio` | Opens Prisma Studio |
| `npm run typecheck` | Runs the TypeScript checks |
| `npm test` | Unit tests. API tests also run when `TEST_BASE_URL` is set. |
| `npm run test:e2e` | Playwright browser tests (set `E2E_BASE_URL`; uses your installed Chrome) |
| `npm run screenshots` | Desktop and mobile screenshots of key pages (`BASE_URL`, `OUT_DIR`) |

API and admin tests against a running server:

```bash
TEST_BASE_URL=http://localhost:3000 TEST_ADMIN_EMAIL=you@example.com TEST_ADMIN_PASSWORD=... npm test
E2E_BASE_URL=http://localhost:3000 npm run test:e2e
```

These tests create and then delete a test enquiry and a draft project. Repeated runs count toward the hourly enquiry rate limit. Locally you can reset it with `echo 'DELETE FROM "RateLimit";' | npx prisma db execute --stdin`.

---

## Deployment (Vercel)

1. Create a PostgreSQL database such as Neon, Supabase, Vercel Postgres or Prisma Postgres, and copy its connection string.
2. Import the repository into Vercel. The Nuxt preset is detected automatically.
3. Add the environment variables from the table above. Set `NUXT_PUBLIC_SITE_URL` to your domain and `DATABASE_POOL_MAX` to around `5`.
4. Set the build command to `npm run vercel-build`. It generates the client, applies migrations and builds.
5. After the first deploy, seed the database and create the owner account from your machine, pointing `DATABASE_URL` at production:
   ```bash
   DATABASE_URL="postgres://..." npm run db:seed
   DATABASE_URL="postgres://..." npm run admin:create -- --email ... --name ... --password ...
   ```
6. Add the custom domain, then submit `https://yourdomain/sitemap.xml` to Google Search Console.

On any Node host such as Railway, Render or a VPS, run `npm ci && npm run build && npm run db:deploy && npm start` with the same environment variables.

---

## Before launch: replace the placeholders

Nothing about the business has been invented. These still need real information:

- **Admin → Settings → Contact & social:** WhatsApp number, phone, email, location, business hours and Instagram, Facebook and TikTok links. Fields still marked `[PLACEHOLDER…]` are hidden or flagged.
- **Admin → Settings → About page:** the business story, the planner's name and a planner photo.
- **Admin → Portfolio:** the 11 seeded projects marked **Sample** use stock photography and are publicly labelled "Sample imagery". Replace them with real projects, or unpublish or delete them.
- **Admin → Services:** cover images are stock placeholders. Upload real photographs and set them as covers.
- **Page-level imagery** (hero backgrounds and section photos) is mapped in `shared/config/placeholders.ts`. Swap the Unsplash IDs there, or replace those components with uploaded images.
- **Inspiration themes** live in `shared/config/inspiration.ts`. They are proposed style directions and are labelled as stock imagery on the page.
- **Testimonials:** the section stays hidden until a real testimonial is published.

## Security notes

- Every `/api/admin/**` endpoint calls `requireAdmin()`, which checks the sealed session cookie and confirms the admin is still active in the database. A server middleware also blocks unauthenticated requests and redirects `/admin/**` pages to the login screen.
- Session cookies are `HttpOnly`, `SameSite=Lax`, `Secure` in production and expire after eight hours. Mutating requests are JSON or multipart; `SameSite=Lax` prevents them from being sent cross-site, which provides the CSRF protection.
- Login is rate limited to 5 attempts per 15 minutes per IP and email, and returns a generic error message. Enquiries, contact messages and uploads are also rate limited. The counters live in Postgres, so the limits work on serverless hosts.
- Uploads are checked for count and size, and file types are detected from the file's actual bytes rather than the browser's claimed MIME type. Files go straight to Cloudinary and are never written to the server's disk.
- Prisma parameterises all queries. Email templates escape all user content.
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, plus HSTS in production. Admin pages send `noindex`.

## Known limitations

- WhatsApp uses click-to-chat links. WhatsApp Business API messaging is not implemented; credentials would belong server-side if it is added later.
- Email uses SMTP through Nodemailer. Any provider that offers SMTP works, including Resend, Postmark, SendGrid, Zoho and Google Workspace.
- Image uploads use Cloudinary only. Switching to S3 means replacing `server/utils/cloudinary.ts`.
- Page-level hero imagery is configured in code, not from the admin. Services, portfolio, testimonial photos and the planner photo are managed in the admin.
- Admin roles exist (`OWNER`, `ADMIN`) but currently share the same permissions.
- Online payments are intentionally not included in this version.
