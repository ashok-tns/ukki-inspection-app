---
name: Project Architecture
description: Core tech stack, state management decisions, and architectural patterns for ukki-inspection-app
type: project
---

React Native Expo (managed workflow) car inspection app — rebuilt from Flutter reference app at form-app-main/.

**Why:** Production rebuild of a Flutter inspector tool for car inspection workflows. Flutter app has 20-page form, image capture, batch upload logic.

**How to apply:** Follow existing patterns before introducing new libraries.

## State Management (finalized)
- Server state: TanStack Query (@tanstack/react-query v5)
- Auth state: Context API + useReducer (provider/auth-provider.tsx)
- Local persistence: Realm (models/Inspection.ts)
- NO Redux Toolkit installed — slice.ts files use useReducer pattern instead

## Screen Architecture
Each screen lives in its own directory:
```
app/(group)/<screen>/
  ├── index.tsx       # UI only, no business logic
  ├── styles.ts       # StyleSheet only
  ├── use-<screen>.ts # Hook: React Query + state + handlers
  └── slice.ts        # useReducer state (Redux-pattern without Redux)
```

## Auth Flow
- POST /auth/login/inspector → { accessToken, refreshToken, user }
- GET /auth/check-token (Bearer token) → validate session on boot
- POST /auth/refresh → { refreshToken } → new tokens
- Tokens stored in SecureStore (mobile) / AsyncStorage (web) under key "auth_tokens"
- User object stored in SecureStore under key "auth_user"
- Navigation guard lives in AuthProvider (useSegments + useRouter)

## Provider Stack (app/_layout.tsx)
PostHogProvider > ErrorBoundary > QueryProvider > AuthProvider > Stack

## Key Files
- models/auth.ts — User, AuthTokens, AuthResponse types
- services/api-client.ts — Axios instance + token interceptors + auto-refresh on 401
- services/auth.service.ts — loginInspector, checkToken API functions
- provider/auth-provider.tsx — AuthContext, session bootstrap, nav guard
- provider/query-provider.tsx — QueryClient setup
- components/pin-input.tsx — Reusable 6-box PIN component
- constants/config.ts — ENV (API_URL, APP_ENV from app.config.js)
- helpers/auth.tsx — OLD Ory-based storage (superseded by services/api-client.ts)

## Form Flow (20 pages — not yet built)
Flutter reference at form-app-main/lib/pages/. Pages use PageView controller with swipe navigation.
