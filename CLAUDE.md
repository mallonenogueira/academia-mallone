# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (React Router + Vite)
npm run build      # Production build
npm run start      # Serve the production build
npm run typecheck  # Run react-router typegen + tsc
```

Deploy to Firebase Hosting:
```bash
npx firebase deploy
```

## Architecture

This is a **React Router v7 SPA** (SSR disabled) with **Firebase** as the backend. The app is a gym training tracker in Portuguese.

### Data layer

- **Firestore** is the database. Collections are typed via the `Collections` enum in [app/firebase/config.ts](app/firebase/config.ts).
- `FirestoreCrudService<T>` ([app/services/firestore-crud-service.ts](app/services/firestore-crud-service.ts)) is a generic base class for CRUD operations. Domain services (`TrainingService`, `TrainingSessionService`) extend or compose it for collection-specific queries.
- Auth is Google Sign-In via `signInWithPopup`. The `useAuth()` hook (from [app/contexts/auth.tsx](app/contexts/auth.tsx)) exposes `user`, `isAuth`, `login`, and `logout` throughout the app.

### Domain model

- **Training** (`/treinos`): a workout plan with a title and named divisions, each containing a list of exercise names.
- **TrainingSession** (`/sessao`): a logged workout tied to a user, a training, and a division. Stores per-exercise series with weight/reps, plus `previousWeight`/`previousReps` pre-populated from the last session for that division.

### Routing

Routes are defined in [app/routes.ts](app/routes.ts). The `Paths` constant there is the canonical source for URL patterns — use it instead of string literals.

| Path | File |
|------|------|
| `/` | `training-session-table.tsx` |
| `/sessao/:id` | `training-session-view.tsx` |
| `/sessao/:id/formulario` | `training-session-form.tsx` |
| `/treinos` | `training-table.tsx` |
| `/treinos/:id` | `training-form.tsx` |

The id `"novo"` is used as a sentinel for new-record routes (e.g. `/sessao/novo/formulario`).

### UI

Tailwind CSS v4. Shared primitives live in [app/components/](app/components/) (`Button`, `Checkbox`, `DataTable`, `Input`, `Label`, `Select`). `@tanstack/react-table` is used for table rendering.
