# Axlori Resolve (frontend demo)

Campus issue-reporting and resolution platform. Students report problems around campus, staff review, assign and resolve them. **This repository is the frontend-only phase**: every dataset, person and interaction is fictional demonstration data held in local frontend state. No backend is connected yet, deliberately.

## Tech stack

- Next.js 14 (App Router) + TypeScript + React 18
- Tailwind CSS, Lucide React icons
- Recharts for charts
- React Hook Form + Zod for the submission form
- No other dependencies

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # strict tsc
```

## Authentication foundation (Phase 2)

Auth pages live at `/login`, `/signup`, `/forgot-password`, `/reset-password`,
`/verify-email`, `/unauthorized`, with `/auth/callback` and `/auth/signout`
route handlers and a server-side `middleware.ts` for session refresh and route
protection. The design, navigation and dashboard from Phase 1 are untouched;
pages were reorganized into route groups `(app)` (shell) and `(auth)`
(minimal chrome) without changing any URLs that already existed.

Auth is **prepared but not connected**: without the environment variables
below the middleware is a no-op and the auth pages explicitly say sign-in is
unavailable (nothing is faked). The demo stays accessible via `/demo/start`,
and demo access is clearly labeled and grants no privileges.

### Required environment variables (`.env.local`, see `.env.example`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # production domain when supplied
```

Both `NEXT_PUBLIC_*` values are publishable by design; security comes from
RLS. The **service-role key is never used by this app** and must never appear
in client-reachable code.

### Supabase dashboard steps (one time)

1. Create a project at https://supabase.com, then copy Project URL and anon
   key from **Project Settings > API** into `.env.local`.
2. In the **SQL editor**, run `supabase/schema.sql`. This creates
   `public.profiles`, the signup trigger (every new account gets role
   `student`, hard-coded server-side), and RLS policies. Column grants mean
   users can only update their own `full_name`, never their `role` or `email`.
3. **Authentication > Providers**: leave Email enabled (password sign-in).
   Keep "Confirm email" ON so accounts must verify before access.
4. **Authentication > URL Configuration**: set Site URL to the deployed
   origin and add `<origin>/auth/callback` to Redirect URLs (also add
   `http://localhost:3000/auth/callback` for local development).
5. Elevate roles only through a trusted process (SQL editor or a future
   server-side service-role route): `update public.profiles set role='staff' where id='<uuid>';`

### Security notes and limitations

- Route protection lives in `middleware.ts` (verified via `auth.getUser()`),
  with RLS as the enforcement layer for data. Hiding UI is never the control.
- Password recovery uses Supabase recovery emails + `/auth/callback`;
  passwords are never collected or stored by this app.
- Error messages are generic and never reveal whether an account exists.
- Known limitation: role-based page checks inside the app (e.g. team,
  analytics gates) still read the profile client/context-side; per-row data
  authorization for reports comes with the database phase and must be RLS.
- Known limitation: "Keep me signed in" is enforced from the browser
  (session-sentinel sign-out), which is a convenience control, not
  server-side session management policy.
- The `reports`, notifications, and people you see after signing in (or in
  demo) are still fictional mock data until the backend phase.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Dashboard: KPIs, trend + category charts, recent reports, priority panel, activity feed |
| `/reports` | Searchable, filterable, sortable, paginated report queue (role-aware) |
| `/reports/new` | Validated report submission form (mock submit into local state) |
| `/reports/[id]` | Report detail: timeline, comments, staff assignment + status actions |
| `/locations` | Illustrative campus map (no paid maps API) with per-location open counts |
| `/analytics` | Date-range-filtered metrics computed from the mock dataset |
| `/team` | Fictional staff directory with workloads and assignment detail |
| `/settings` | Profile, display, notification and workspace settings (localStorage) |
| `/terms`, `/privacy` | Draft legal documents clearly marked pending legal review |

Custom 404 (`not-found.tsx`), error boundary with retry (`error.tsx`), and route-level loading states are included.

## Demo roles

The sidebar role switcher (Student / Staff / Administrator) changes navigation, visible data and available actions. **It is not authentication.** Any real deployment must enforce permissions on the backend.

## Architecture notes for the backend phase

- `lib/store.tsx` is the single data seam. Replace its internals with real API calls; components do not read mock data directly.
- `lib/mock-data.ts` generates a deterministic, seeded dataset (UTC-anchored to 22 Oct 2026) whose derived stats intentionally match the demo screenshot (24 open, 12 in progress, 86 resolved this month, 1.8-day average).
- `types/index.ts` mirrors the planned tables: profiles, reports, report_images, comments, status_history, staff_assignments, notifications.
- Session mutations (new reports, comments, status changes, assignments, settings) persist to `localStorage` under `axlori.*` keys; nothing leaves the browser.
- `lib/site.ts` centralizes the app name and `metadataBase`. Set `NEXT_PUBLIC_SITE_URL` when a real domain is supplied.

## Icons

`app/icon.svg` is the hand-authored brand mark. PNG derivatives (`app/apple-icon.png`, `public/icons/*.png`) can be regenerated with `python3 scripts/generate-icons.py` (requires Pillow).

## Honest limitations

- Reports submitted here never reach campus staff; local state only.
- Notifications, people, campus locations and activity are invented.
- Legal documents are unreviewed drafts.
- Custom domain is prepared for, not registered or connected.
