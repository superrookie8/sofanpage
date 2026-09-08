# Frontend deployment readiness — 2026-09-08

## Scope and readiness

Deploy `frontend/` once: public website, `/admin`, and `/api/admin` are one Next.js application. Do not deploy the independent `admin/` application for this release. No deployment, push, DNS change, secret registration, or production database write was performed.

The working tree already contained the integrated admin, competition schedules, SEO and news changes. Preserve all tracked and untracked source files in the release; a tracked-only diff is not a complete release manifest. Never include `.env*` or credential backups. Hosting account/project linkage and production environment configuration remain unverified.

## Repository configuration

- Next.js 15.5.25, pnpm 10.27.0; Node 22 configured in Netlify and Docker. This local validation used Node 23.6.1, so target Node 22 CI validation remains recommended.
- `netlify.toml`: build `pnpm build`, publish `.next`, Next.js plugin, production-only public GA setting. Repository layout/base directory must resolve to `frontend/`. No provider console procedure or connected project is assumed here.
- `Dockerfile`: non-root runner, frozen dependencies, build-stage `.next`; runner now also copies `next.config.js` so runtime configuration is available. `.dockerignore` excludes `.env*` except the example. Docker image itself was not built or started in this audit.
- `next.config.js`: permanent `/home` redirect, admin-only noindex/security headers, no-store API responses. Keep public canonical origin and authentication origin aligned; this release uses the existing public domain, no separate administrator hostname.
- NextAuth social sessions remain the sole login. Backend must support current DB-backed ADMIN authorization and additive competition metadata before enabling administrator schedule writes. No authentication bypass is provided.

## Environment inventory

These booleans mean only nonempty values in the local Next environment, not validity and not production provider configuration. Values were not recorded.

| Name | Local configured | Requirement |
| --- | --- | --- |
| NEXTAUTH_SECRET | true | Required server secret; preserve across deploys unless deliberately rotating sessions |
| NEXTAUTH_URL | true | Required public HTTPS production origin |
| GOOGLE_CLIENT_ID | true | Required Google login |
| GOOGLE_CLIENT_SECRET | true | Required server-side Google secret |
| AUTH_EXCHANGE_KEY | true | Required server secret; match backend configuration |
| BACKEND_API_URL | true | Required server-only reachable backend URL |
| KAKAO_CLIENT_ID | true | Optional provider, configured as a pair |
| KAKAO_CLIENT_SECRET | true | Optional provider, configured as a pair |
| ADMIN_APP_ORIGIN | false | Optional; falls back to NEXTAUTH_URL, must agree with public origin if set |
| NAVER_CLIENT_ID | false | Required for on-demand Naver news search |
| NAVER_CLIENT_SECRET | false | Required server-side Naver search secret |
| NEXT_PUBLIC_KAKAO_API_KEY | true | Build-time public map application key |
| NEXT_PUBLIC_GA_ID | false | Optional local analytics; production value is supplied by netlify.toml |

`KAKAO_SCOPE` is optional and defaults to the application's openid/profile scopes. Slack error reporting is optional; its server-only `SLACK_ERROR_ALERTS_ENABLED` and `SLACK_ERROR_WEBHOOK_URL` configuration was not verified. Do not expose server credentials with a NEXT_PUBLIC prefix. Public build-time values must be supplied before building; runtime changes alone do not replace browser bundles. OAuth redirect registrations and map origin permissions require separate provider-side verification; no remote login was attempted.

## Validation and staged rollout

1. Run `pnpm install --frozen-lockfile` in a clean Node 22 CI environment, then `pnpm test`, `pnpm typecheck`, `pnpm build`, and `git diff --check`. Install was not repeated in this audit.
2. Use fixture/mock APIs and an isolated database to validate administrator create → edit → reload, unknown/name-only/full stadium details, mobile calendar density, and admin grant/revoke behavior. Localhost in the current workspace connects to a backend using the real remote database; it is not a safe write sandbox.
3. Confirm production frontend/backend environment variables, release compatibility, existing Google/Kakao login, ADMIN assignment to the intended account, and Naver credentials. Never copy secrets into this document or request them in chat.
4. After a separately authorized deployment, read-only checks: `/` and `/schedule` 200; `/home` permanent redirect; `/robots.txt` and `/sitemap.xml` 200; public canonical metadata; anonymous `/admin/schedule` login redirect; anonymous `/api/admin/session` denial; admin noindex headers without public noindex contamination. Verify authenticated permissions with an authorized test account in the isolated environment first.
5. Preserve the prior deployment artifact and its compatible backend version. If reverting after new competition records have been written, do not roll the backend back to an older writer that discards metadata. Restrict admin writes while restoring a compatible pair. No destructive database rollback is implied.

## Evidence and limits

This audit completed `pnpm test && pnpm typecheck && pnpm build` with exit 0: 31 test files / 190 tests passed; typecheck and production build passed. Five existing ESLint warnings (four image elements and one font placement) and existing Babel/SWC configuration warnings remain. `git diff --check` passed. Tests use fixtures and backend mocks; they are not proof of live OAuth, real role assignment, Naver credentials, provider deployment behavior, browser layout, or database persistence.

The local `.next` directory is a validation artifact, not a portable provider release and not a directory to upload blindly: it can contain locally built public configuration. Rebuild in the verified target environment. Do not distribute local env files or logs.
