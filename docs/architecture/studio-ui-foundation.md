# Studio UI foundation

Zayloq Studio is a dedicated Next.js 16 App Router application in `apps/studio`. It is separate from the root marketing website and uses the official Zayloq logo, deep-ocean palette, and technical visual language without importing the marketing simulator or treating it as product behavior.

## Deployment topology

The intended topology is `www.zayloq.ai` for marketing, `app.zayloq.ai` for Studio, and `api.zayloq.ai` for the control-plane API. Local development uses Studio at `http://localhost:3001` and the API at `http://localhost:4000`; `AUTH_TRUSTED_ORIGINS` must include the Studio origin. Using the same hostname matters for SameSite cookie behavior—avoid mixing `localhost` and `127.0.0.1` during browser auth testing.

`NEXT_PUBLIC_ZAYLOQ_API_URL` is the only browser-exposed configuration and contains only the public API base URL. It defaults to `http://localhost:4000` and is frozen at build time by Next.js. No secret belongs in a `NEXT_PUBLIC_*` variable.

## Routing and rendering

Public authentication routes are `/login`, `/signup`, `/verify-email`, `/forgot-password`, and `/reset-password`. Protected routes use the `(studio)` route group and include `/dashboard`, `/projects`, `/projects/new`, `/projects/[projectId]`, `/builds`, `/deployments`, and `/settings`.

Pages and layouts remain Server Components by default. Interactive auth, navigation, composer, and workspace panels are isolated Client Components. Dynamic project params use the Next.js 16 async `params` contract. The Studio uses a normal Next.js runtime build rather than the marketing site's static export because future projects have runtime dynamic identifiers.

## Authentication and API boundary

The typed API client centralizes the base URL, `credentials: "include"`, safe JSON decoding, network failures, and public API errors. Authentication functions wrap the ZP-0E.5 routes; components do not scatter raw fetch calls.

`AuthProvider` restores the session through `GET /v1/auth/session`, hydrates only the safe public user, and exposes login, registration, refresh, and logout actions. It never reads the HttpOnly token, writes auth state to browser storage, or logs credentials. Because the cookie belongs to the API host in the separated deployment topology, Studio does not assume its Next.js server can inspect that cookie. Protected layouts therefore render a loading boundary and perform client-side session bootstrap before showing the shell. This prevents casual UI exposure but is not authorization; every protected API operation must still be enforced by the Fastify guard.

Login, registration, verification, recovery, and logout call the real API. Error UI renders only sanitized public messages. Email delivery is still unavailable in production until a provider is connected, so Studio reports requests honestly and never exposes tokens.

## Application and workspace shell

The responsive application shell contains Dashboard, Projects, Builds, Deployments, and Settings navigation plus a safe account menu. Mobile navigation becomes an overlay drawer; dashboard metrics and workspace panels collapse into useful stacked layouts instead of shrinking desktop columns.

Dashboard and project screens use explicit empty states because no project API exists. The project composer accepts a multiline prompt and keyboard submission affordance but clearly states that prompts are neither submitted nor stored. It is shaped as the future input boundary for ZP-1D planning and ZP-1E generation.

The project workspace separates the AI conversation/composer from tabbed Preview, Files, Database, Logs, and Build panels. Preview is ready for ZP-1F isolated runtime output. Files is ready for generated artifacts. Database explicitly represents future customer-project databases, never Zayloq's control-plane PostgreSQL. Build is ready for planning, generation, dependency installation, type checking, linting, repair, and preview events. No successful builds, files, databases, previews, or deployments are fabricated.

Future integrations align with the roadmap: ZP-1A supplies model access behind APIs, ZP-1B provides A'Dash Knowledge context, ZP-1C describes available capabilities, ZP-1D consumes composer input, ZP-1E streams generated artifacts, ZP-1F supplies isolated previews, and ZP-1G reports validation and repair state.

## Accessibility and security

Forms use semantic labels, autocomplete hints, constrained inputs, visible focus rings, status/alert roles, keyboard-accessible controls, and reduced-motion styles. Navigation exposes expanded state and tab panels use tab semantics.

The Studio stores no session token, password, verification token, or reset token. It does not use localStorage, sessionStorage, or IndexedDB for authentication. Credentialed CORS and the API's trusted-origin checks remain required. Raw exceptions are replaced by safe loading, unavailable, expired-session, not-found, and unexpected-error states.

Deferred work includes project persistence, AI generation, knowledge retrieval, capability discovery, build/runtime execution, live preview, repair, real deployments, generated-project databases, billing, organizations, OAuth, MFA, passkeys, and a production email provider.
