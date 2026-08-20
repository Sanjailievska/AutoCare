# AutoCare — Auto Repair Shop Management Platform

A full-stack repair-shop platform: customers submit repair requests, shops
diagnose and estimate, customers approve, repairs happen, service history
and reviews follow. Built with React + TypeScript + Vite + Tailwind CSS on
the frontend and Supabase (Postgres, Auth, Storage, RLS) as the backend.

Every page in this app reads and writes real Supabase data — there is no
mock data layer.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Supabase (`@supabase/supabase-js`) — Auth, Postgres, Row Level Security, Storage
- react-router-dom for routing

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
3. Copy `.env.example` to `.env` and fill both in:

   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## 2. Set up the database

Open the Supabase SQL Editor and run these three files **in order**:

1. `supabase/schema.sql` — tables, enums, indexes, triggers, notification logic
2. `supabase/rls.sql` — Row Level Security policies for every table
3. `supabase/storage.sql` — storage buckets (`vehicle-images`, `request-images`, `repair-images`, `shop-logos`) and their access policies

Each file is idempotent-ish for a fresh project; run them once, top to bottom.

### What the schema gives you

- Every table from the spec (`profiles`, `repair_shops`, `mechanics`,
  `vehicles`, `services`, `repair_requests`, `repair_request_images`,
  `diagnoses`, `estimates`, `estimate_items`, `repairs`, `repair_images`,
  `reviews`, `notifications`) with foreign keys, indexes, and constraints.
- A Postgres trigger creates a `profiles` row automatically from
  `auth.users` metadata (`full_name`, `role`) on sign-up.
- Triggers keep derived data correct automatically: estimate totals
  recompute from `estimate_items`, shop ratings recompute from `reviews`,
  and the repair-request `status` column advances automatically as
  diagnoses are added, estimates are approved/rejected, and repairs move
  through `IN_REPAIR → READY_FOR_PICKUP → COMPLETED`.
- The same triggers insert rows into `notifications` at each of those
  transitions (accepted, estimate ready, approved/rejected, in repair,
  ready for pickup, completed, new request) — this is the in-app
  notification system, driven entirely by the database so it can't drift
  out of sync with the actual state.

### Row Level Security — how access is enforced

RLS is enabled on every table; there is no table a client can read or
write without a matching policy. In short:

- **Customers** can only see their own profile, vehicles, and requests —
  and the diagnosis/estimate/repair rows attached to *their* requests.
- **Shops** can only see requests addressed to their own shop (via a
  `is_my_shop()` helper checking `repair_shops.owner_id = auth.uid()`),
  and only the customer/vehicle data attached to those requests — never
  another shop's data or another customer's unrelated data.
- **Shops** are public-readable for browsing (name, services, rating);
  management data (mechanics roster, incoming requests) is owner-only.
- **Admins** (`profiles.role = 'admin'`) bypass the ownership checks via
  a `my_role() = 'admin'` clause on every policy.
- Storage buckets mirror this: images are stored under
  `<bucket>/<owning-row-uuid>/filename`, and storage policies join back
  to the owning row (vehicle, request, or repair) to decide access —
  private buckets, no public URLs except shop logos.

Admin accounts can't be created through the public sign-up form (the
`user_role` enum defaults new sign-ups to `customer` or `shop` only —
see `handle_new_auth_user()`). To create an admin, sign up normally, then
in the SQL editor run:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

## 3. Install and run

```bash
npm install
npm run dev
```

Visit the printed local URL. Register as either a **customer** or a
**repair shop** — shop accounts are prompted to fill in their shop
profile on first login (name, city, hours) before reaching their
dashboard.

## 4. Seed demo data (optional but recommended)

Plain SQL can't create working logins (Supabase Auth passwords go
through GoTrue, not a raw table insert), so demo accounts are created by
a small Node script using your **service role key** — the script creates
real, sign-in-capable accounts, then inserts realistic shops, vehicles,
and repair requests spanning every status in the workflow (including one
full happy-path example: a BMW 320d "brake problem" from submission
through completed repair and a 5-star review).

Find your service role key in **Project Settings → API** (careful — it
bypasses RLS, never expose it in frontend code):

```bash
SUPABASE_URL=https://your-project-ref.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
node scripts/seed.mjs
```

All demo logins use the password `Demo1234!`. The script prints the demo
emails when it finishes. Every seeded row is flagged `is_demo = true`, so
you can wipe just the demo data later without touching real users — run
`supabase/reset_demo.sql` in the SQL editor (it removes the demo profile
rows and shops; delete the demo logins themselves from **Authentication →
Users** in the dashboard, since `auth.users` can't be touched by SQL).

## 5. Build for production

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

Deploy the contents of `dist/` to any static host (Vercel, Netlify,
Cloudflare Pages, etc.) with the same two `VITE_SUPABASE_*` environment
variables set at build time.

## Project structure

```
src/
  components/
    ui/            Button, Card, Input, Modal, Toast, Badge, Skeleton, StarRating...
    layout/         Sidebar, DashboardLayout, NotificationBell, icon set
    requests/       StatusTimeline — the repair-progress gauge component
  context/          AuthContext (Supabase session + profile)
  hooks/            useMyShop, useNotifications, useImageUpload
  lib/              supabase.ts (client)
  types/            database.types.ts (hand-written, mirrors schema.sql)
  router/           ProtectedRoute (role-gated)
  pages/
    auth/           Login, Register, ForgotPassword, ResetPassword
    customer/       Dashboard, Vehicles, VehicleDetail, Requests, NewRequest
                     (8-step wizard), RequestDetail, FindShop, ShopProfile,
                     ServiceHistory, Notifications, Profile
    shop/           Dashboard, Requests list + detail (accept/reject, assign
                     mechanic, diagnosis, estimate builder, repair progress,
                     photo upload), ActiveRepairs, Appointments, Customers,
                     Vehicles, Services, Mechanics, Reviews, Settings
    admin/          Dashboard, Users, Shops, Requests, Reviews
supabase/
  schema.sql        Tables, enums, indexes, triggers
  rls.sql           Row Level Security policies
  storage.sql       Storage buckets + policies
  reset_demo.sql    Wipes demo data only
scripts/
  seed.mjs          Creates demo accounts + realistic sample data
```

## The end-to-end workflow, as implemented

```
Customer registers → adds a vehicle → browses shops → submits a
request (8-step wizard: vehicle, shop, category, description,
urgency, date, photos, review) → shop accepts → shop adds a
diagnosis → shop builds a line-item estimate (parts/labor/service,
auto-totaled) → customer approves or rejects → on approval a repair
record is created automatically → shop updates progress and photos
→ shop marks ready for pickup → shop marks completed with a final
cost → the vehicle's service history updates automatically →
customer leaves a star rating + comment → the shop's average rating
recalculates automatically.
```

Every arrow above is a real Supabase write with a corresponding RLS
policy and, where relevant, an automatic notification — not a UI-only
transition.

## Notes on scope and what to check before shipping

- No mock data anywhere: every list, detail page, and dashboard stat
  queries Supabase directly.
- Toasts, skeleton loaders, empty states, and confirm dialogs are used
  throughout rather than bare error console logs or silent failures.
- Before treating this as final, run through the checklist you'd expect
  for any handoff: `npm run build` cleanly, sign up as both roles, submit
  a request end-to-end, and check the Supabase dashboard's **Logs** tab
  if any query unexpectedly returns empty — it's almost always an RLS
  policy mismatch, and the policy names in `rls.sql` are written to make
  that easy to trace.
