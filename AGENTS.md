# GradeLog agent guidance

## Project

GradeLog is a local-first grade tracker built with Next.js 15, React 19,
TypeScript, Tailwind CSS, and shadcn-style Radix UI primitives. It also ships
as a PWA and via Capacitor Android/iOS shells.

Treat privacy as a product constraint: grades are stored locally by default.
Do not introduce remote storage, telemetry, or data sharing without explicit
user authorization and clear product intent.

## Working conventions

- Preserve the semester → module → assignment hierarchy.
- Prefer small, focused changes that preserve existing local data and its
  migration/backup compatibility.
- Keep UI calm, direct, accessible, and intentionally custom rather than
  reverting to default component-library styling.
- Do not commit secrets or edit `.env.local` unless explicitly asked.

## Commands

```bash
npm run dev
npm run lint
npm test
npm run build
npm run format:check
```

Run the most relevant checks after changes. For broad TypeScript, route, or
build changes, run `npm run build` as well.

## Key areas

- `app/` — Next.js routes and app metadata
- `components/` — reusable interface components
- `lib/` — application state, persistence, domain logic, and integrations
- `supabase/` — optional sync and account-related backend resources
- `android/` — generated Capacitor Android shell; avoid hand-editing generated
  files unless the task specifically requires native changes

## Optional sync

Supabase-powered sync is optional and is not currently end-to-end encrypted.
When working in sync or account features, preserve offline-first behavior and
avoid implying that remote data is end-to-end encrypted.
