# Copilot Instructions

## Project Context
- Monorepo workspace includes:
	- frontend: Next.js 14 App Router + TypeScript + Tailwind
	- backend: NestJS + Prisma + PostgreSQL
- API base path convention: /api/v1
- Follow modular architecture: controllers -> services -> Prisma

## Execution Priorities
- Make the smallest safe change that satisfies the request.
- Keep backend and frontend contracts in sync within the same task.
- Prefer explicit DTO validation and typed payload handling.
- Avoid broad refactors unless explicitly requested.

## UI/Design Rules
- Theme: Dark. Background #09090B, surface #18181B, border #27272A
- Typography: Inter font. Sizes: text-sm / text-base / text-lg / text-2xl
- Spacing system: multiples of 4px only (p-2, p-4, p-6, p-8...)
- Border radius: rounded-md for inputs, rounded-lg for cards, rounded-full for avatars
- All interactive elements must have hover + focus-visible states
- Animations: transition-all duration-200 ease-out
- Never use pure white text — use text-zinc-100 or text-zinc-200

## Component Style Reference
- Cards: bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm
- Buttons primary: bg-violet-600 hover:bg-violet-500 text-white rounded-md px-4 py-2
- Input: bg-zinc-900 border border-zinc-700 focus:border-violet-500 rounded-md

## Backend Guardrails
- Do not expose secrets or sensitive tokens in API responses.
- Preserve auth semantics (access token + refresh cookie + RBAC roles).
- Keep route paths stable unless requirement asks for path changes.
- Throw Nest exceptions for invalid/forbidden/not-found states.

## Frontend Guardrails
- Default to server components; use client components only when needed.
- Add metadata for public content pages when relevant for SEO.
- Always handle non-OK API responses with clear UI status.

## Validation Checklist
- Backend changes: run npm run lint and targeted tests in backend when feasible.
- Frontend changes: run npm run lint in frontend; run npm run build for route-level behavior changes.
- If commands are skipped, state the reason and expected manual verification.