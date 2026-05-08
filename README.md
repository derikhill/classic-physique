# Classic Physique

A personal hypertrophy training app built around the 80s/90s classic-physique aesthetic — proportional development, full muscle bellies, priorities on Back, Chest, Quads, Side Delts, and Arms.

It's a Next.js app backed by Supabase, designed for daily use across phone and desktop.

## Features

- **Log Tab** — Per-set logging with weight / reps / RIR, drop sets, rest-pause sets, supersets, and compound sets. Editable rep range per exercise. Ghost-fill weight suggestions when reps overshoot the target.
- **History Tab** — Recent 4 weeks visible by default; older sessions group into per-month collapsible cards. A "Trending Lifts" card surfaces multi-session streaks with sparklines and an expandable per-session history.
- **Dashboard** — Volume, frequency, and momentum at a glance.
- **Body Tracker** — Bodyweight, body fat, and macro targets logged daily.
- **AI Coach** — Claude-powered analysis of your data, plus on-demand split generation tuned to your training history, lagging muscles, and active injury constraints.
- **Settings** — Phase selection (Cut / Build / Maintenance / Recovery), phase-specific goal targets, custom split ordering, custom exercise library, program switching with archival, and "Build My Own" split editor.
- **Recovery Mode** — Mark active injuries; the app flags exercises that may aggravate the area.
- **Auto-Regulation** — Pre-session check-in (energy / motivation / physical) suggests deload adjustments.

## Stack

- [Next.js 16](https://nextjs.org) with App Router
- [React 19](https://react.dev)
- [Supabase](https://supabase.com) — Postgres, auth, RLS
- [Tailwind CSS v4](https://tailwindcss.com)
- TypeScript
- [Bun](https://bun.sh) as the package manager and runtime

## Local development

### Prerequisites

- Bun (`curl -fsSL https://bun.sh/install | bash`)
- A Supabase project with the following tables: `workouts`, `body_entries`, `user_settings`. Auth enabled.

### Setup

```bash
bun install
```

Create a `.env.local` at the repo root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Run the dev server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). The middleware will redirect to `/login` until you're authenticated.

## Scripts

| Command         | What it does                  |
| --------------- | ----------------------------- |
| `bun run dev`   | Start the Next.js dev server  |
| `bun run build` | Production build              |
| `bun run start` | Run the production build      |
| `bun run lint`  | ESLint                        |

## Deployment

Hosted on [Vercel](https://vercel.com). Two pieces of setup outside the code:

1. **Vercel → Project Settings → Environment Variables** — add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production, Preview, and Development.
2. **Supabase → Authentication → URL Configuration** — add your Vercel domain to the Site URL and Redirect URLs allowlist so magic-link auth resolves on the deployed site.

## Project layout

```
app/                  Next.js App Router entry points
  login/              Supabase magic-link login page
  page.tsx            Auth-gated app shell entry
components/
  AppShell.tsx        Top-level state: workouts, settings, phase, etc.
  tabs/               Log, History, Dashboard, BodyTracker, AICoach, Settings
  shared/             ExercisePickerModal, CustomSplitBuilder, TrendingCard, etc.
lib/
  constants.ts        Exercise library, phases, recovery reasons, default split
  db.ts               Supabase data access (workouts, body, settings)
  migrate.ts          One-shot localStorage → Supabase migration
  progression.ts      Auto-reg, progression maps, trending detection, switch analysis
  supabase/           Browser + server Supabase client factories
  utils.ts            Domain types and small helpers
middleware.ts         Route gating via Supabase session
```

## Data model notes

- All data is keyed by `user_id` (Supabase auth user). RLS policies should restrict reads/writes to the owning user.
- `workouts.exercises` and related nested data are stored as JSON columns — the shape lives in `lib/utils.ts`.
- The legacy `migrate.ts` will lift any existing `localStorage`-backed sessions into Supabase on first login.

## Personal project

This is a personal training app, not a product. No support, no roadmap promises — just a tool.
