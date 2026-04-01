---
applyTo: "backend/src/**/*.ts"
description: "Use when editing NestJS backend modules, controllers, services, auth, prisma access, and DTO validation in this project"
---

# Backend Instructions

## Architecture Rules

- Keep features modular by Nest module boundaries.
- Controller handles transport concerns only.
- Service contains business logic.
- Validate input through DTO + class-validator.
- Keep Prisma access in services.

## Auth And Security

- Keep JWT flow compatible with existing access/refresh endpoints.
- Preserve RBAC behavior based on roles array in JWT payload.
- Do not expose sensitive values in API responses.
- For OTP endpoints, avoid returning OTP codes in production-safe paths.

## Prisma Conventions

- Use explicit select/include for API payload shaping.
- Handle not-found with Nest exceptions.
- Keep optimistic-lock-related fields intact when touching product/order logic.

## Change Discipline

- Do not change route paths unless requested.
- If changing DTOs, update controller/service usage in same task.
- Add focused tests for new endpoint behavior when feasible.
