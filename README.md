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
