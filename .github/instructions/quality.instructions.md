---
applyTo: "**/*"
description: "Use when implementing features to enforce safe changes, validation, and concise delivery quality standards"
---

# Quality Instructions

## Required Validation

- For backend code changes, run lint and at least one relevant test path when possible.
- For frontend code changes, run lint and build when changes affect routes/components.
- If commands cannot run, state why and describe expected verification steps.

## Output Discipline

- Summarize behavior change first.
- List touched files and key logic updates.
- Call out known risks, technical debt, or deferred work.

## Scope Control

- Implement only what is requested.
- Avoid unrelated formatting churn.
- Keep commits and edits focused and reversible.
