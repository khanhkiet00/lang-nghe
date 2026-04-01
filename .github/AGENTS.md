# AGENTS

## Project Agent Contract

This repository contains a monorepo-style workspace with two apps:
- backend: NestJS + Prisma + PostgreSQL
- frontend: Next.js App Router + Tailwind

The agent should follow this operating order for implementation tasks:
1. Read relevant spec notes in memory-bank only when needed.
2. Inspect target module and adjacent DTO/service/controller files.
3. Implement smallest viable change.
4. Run lint and targeted tests for changed area.
5. Report what changed, what was validated, and any gaps.

## Runtime Commands

### Backend
- Install: npm install (inside backend)
- Dev: npm run start:dev
- Test e2e: npm run test:e2e
- Lint: npm run lint

### Frontend
- Install: npm install (inside frontend)
- Dev: npm run dev
- Lint: npm run lint
- Build: npm run build

## Coding Boundaries

- Do not hardcode secrets in source.
- Keep API under /api/v1 prefix conventions.
- Prefer module-local DTO validation over ad-hoc checks in controller.
- Preserve existing naming in Vietnamese-facing labels and messages.
- Use incremental changes; avoid broad refactors unless asked.

## Definition Of Done

A task is complete only when:
- Code is implemented.
- Relevant lint/tests are run (or a clear reason is given if not run).
- Any API contract change is reflected in frontend usage.
- Risks or follow-up items are explicitly listed.
