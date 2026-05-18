# Verkada Maps 2.0 Navigation Audit

Live at https://ankush-rustagi.github.io/maps-2-0-nav-audit/

Comparative audit of Google Maps navigation patterns mapped against the Verkada Maps 2.0 information architecture.

## Status

Coming soon. Source canvas built in Cursor on 2026-05-15; porting to standalone interactive React app in progress.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- shadcn/ui (new-york style, neutral palette)
- Locked dark mode

## Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deployment

Pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/deploy.yml`.
