---
applyTo: "frontend/src/**/*.{ts,tsx,css}"
description: "Use when editing Next.js App Router pages, metadata, fetch logic, forms, and Tailwind UI in this project"
---

# Frontend Instructions

## UI Direction

- Follow project dark theme tokens from workspace instructions.
- Keep spacing on 4px scale and maintain focus-visible states.
- Avoid pure white text; use zinc palette.

## Next.js Rules

- Use server components by default; use client components only when state/events are required.
- Keep public pages SEO-friendly with metadata where relevant.
- For API calls in server components, handle non-OK responses safely.

## Data Contract

- Keep frontend request/response shape aligned with backend DTOs.
- If backend field names change, update UI mapping in the same task.
- Avoid silent failures; show user-facing status/error text for form actions.

## Styling

- Prefer utility classes consistent with existing pages.
- Preserve existing visual language across pages unless asked for redesign.
