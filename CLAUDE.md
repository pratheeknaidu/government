# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

No test runner is configured.

## Environment

Firebase config is read from environment variables in `.env.local`:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

The app reuses the `paycheck-planner` Firebase project. All variables must be prefixed with `VITE_` to be exposed to the client.

## Architecture

**MyRepublic** is a personal life-governance app that frames daily goals, habits, and self-accountability as running a government. React 19 + Vite SPA, Firebase Auth (Google) + Firestore for persistence.

### Data flow

All app state lives in a single custom hook `useRepublic()` (`src/store.js`). It:
1. Loads a single Firestore document per user (`government_users/{uid}`) on mount.
2. Exposes action functions that update React state immediately, then debounce-save to Firestore (1-second delay).

The state shape has five top-level domains:
- `republic` — name, motto, setup status
- `constitution` — preamble + articles (immutable; amendments create new articles with `amendmentOf` reference)
- `legislature` — bills with lifecycle: `draft → proposed → deliberation → enacted/rejected`, plus `repealed`
- `judiciary` — cases with verdict: `pending → guilty/not-guilty/pardoned`, with optional sentence tracking
- `executive` — orders with priority/deadline, statuses: `active → completed/cancelled`
- `activity` — rolling log of last 50 cross-domain events

### Component structure

`App.jsx` is the root — it handles auth gating and the one-time setup flow before rendering the router. Pages receive `republic` (the full hook return) and `showToast` as props; they do not call Firebase directly.

Pages map to governance branches:
- `Dashboard` — health score gauge + stats + activity feed
- `Constitution` — preamble editor + article ratification/amendment
- `Legislature` — bill drafting, debate (pros/cons), enactment/repeal
- `Judiciary` — case filing, verdict, sentence completion
- `Executive` — order issuance, completion, cancellation

### Health score

`calculateHealthScore()` in `src/utils.js` produces a 0–100 score from five weighted components: law adherence (35%), order completion last 30 days (30%), constitution coverage (15%), legislative activity (10%), judicial diligence (10%).

### Utilities (`src/utils.js`)

Single file with pure helpers: `generateNumber` (produces IDs like `LR-2025-001`), `toRoman`, date formatters, `DEPARTMENTS` constant (the six life areas used across all branches), health score logic, and status label maps.

### Styling

All CSS is in `src/index.css`. Uses CSS custom properties (design tokens) for colors (`--gold-primary`, `--text-secondary`, etc.), spacing (`--space-*`), and fonts. No CSS-in-JS or utility framework.
