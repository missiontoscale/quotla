# MASTER_GUIDE.md — Operating Manual for AI Agents

## Purpose

This is the operating manual for every AI agent working on Quotla.

It contains **instructions only**, never product knowledge.

It answers:
- How should I work?
- Which files should I read?
- Which files should I update?
- In what order should I perform work?

This file should rarely change.

---

## Repository Rules

- Files under `for-AI-agents/` must never be committed to the repository
- Never push `.env` or `.env.local`
- Of all `.md` files, commit only `README.md` unless explicitly told otherwise
- Never hardcode secrets, API keys, or passwords in source code

---

## File Hierarchy

```
for-AI-agents/
  MASTER_GUIDE.md            ← Instructions for agents (rarely changes)
  MASTER_CONTEXT.md          ← Complete understanding of Quotla (rarely changes)
  DESIGN_PRO.md              ← Design operating system (rarely changes)
  SECURITY_PRO.md            ← Security governance (rarely changes)
  PROGRESS_TRACKER.md        ← Progress, lessons, outstanding problems (continuously changes)
  SECURITY_LOOPHOLES.md      ← Structured security risk register (updated when vulns found/resolved)
  design principles/         ← Supporting design reference files
  security-principles/       ← Security principle reference files
```

---

## Reading Order

| File | When to Read |
|------|-------------|
| MASTER_GUIDE.md | Start of every task |
| MASTER_CONTEXT.md | Start of every task |
| DESIGN_PRO.md | Task involves UI, UX, layout, components, styling, or user flows |
| SECURITY_PRO.md | Task involves auth, authorization, data handling, API routes, or any user-facing feature |
| PROGRESS_TRACKER.md | Start of every task (read); after completion (update) |
| SECURITY_LOOPHOLES.md | When implementing security-sensitive features or triaging vulnerabilities |
| security-principles/ | When directed by SECURITY_PRO.md; read only relevant principle files |
| design principles/ | When directed by DESIGN_PRO.md; read only relevant reference files |

---

## Task Lifecycle

Every task MUST follow this lifecycle in order:

1. **Read MASTER_GUIDE.md** — understand how to work
2. **Read MASTER_CONTEXT.md** — understand what Quotla is
3. **Read DESIGN_PRO.md and/or SECURITY_PRO.md** if the task touches design or security
4. **Read only the specific supporting files required** (e.g. files under `security-principles/`, `design principles/`)
5. **Implement the change**
6. **Run all required verification steps**
7. **Update PROGRESS_TRACKER.md** — completed work, lessons learned, remaining issues, revised scores
8. **Update SECURITY_LOOPHOLES.md** only if a new vulnerability is discovered or an existing one is resolved

---

## Development Workflow

1. Understand the task and read required context files
2. Identify all files that need to be created or modified
3. Implement changes following existing code conventions (mimic patterns in neighboring files)
4. Never add comments unless the existing codebase uses them
5. Never create documentation files (`*.md`) or README files unless explicitly requested
6. Verify changes by running all required checks

---

## Build Verification

- `npx tsc --noEmit` — must pass with 0 errors
- `npm run build` — must pass
- `next.config.mjs` — must have `ignoreBuildErrors: false`
- Always run lint (`npm run lint`) and typecheck after completing a task

---

## Commit Policy

- Only commit, amend, push, or create PRs when explicitly requested
- Before committing, inspect `git status`, `git diff`, and `git log --oneline -10`
- Stage only intended files; never commit secrets
- Write concise commit messages matching repo style
- Never update git config, skip hooks, use interactive mode, force-push, or create empty commits
- If a commit fails due to hooks, fix the issue and create a new commit (do not amend)

---

## Token Efficiency Rules

- Prioritize token efficiency
- Do not give useless explanations
- Do not read files that do not need to be read
- Use smart algorithms to identify operations with highest reward (in terms of tokens saved)

---

## Deletion Policy

- Delete files if they are replaced or redundant
- Always fix references when deleting files
- Make sure all links lead to existing functional pages

---

## Documentation Policy

- Never proactively create documentation files (`*.md`) or README files
- Only create documentation files if explicitly requested
- Only use emojis if explicitly requested
- Keep responses short (under 4 lines when possible)
- Avoid introductions, conclusions, and explanations unless asked

---

## Reference Integrity Rules

- All links must lead to existing functional pages
- When renaming or moving files, update all references
- When deleting files, ensure no broken references remain

---

## When Each Supporting File Must Be Read

| File | Trigger |
|------|---------|
| MASTER_GUIDE.md | Every task |
| MASTER_CONTEXT.md | Every task |
| DESIGN_PRO.md | Any UI, UX, design, or component work |
| SECURITY_PRO.md | Any auth, API, data handling, or security-sensitive work |
| PROGRESS_TRACKER.md | Every task — read before starting, update after completion |
| SECURITY_LOOPHOLES.md | When implementing security features or triaging vulnerabilities |
| security-principles/ | When SECURITY_PRO.md directs you to |
| design principles/ | When DESIGN_PRO.md directs you to |

---

## When Each Supporting File Must Be Updated

| File | When |
|------|------|
| PROGRESS_TRACKER.md | After every completed stage — add completed work, lessons learned, remaining issues, updated scores |
| SECURITY_LOOPHOLES.md | When a new vulnerability is discovered or an existing one is resolved |

---

## Definition of Done

A task is done when:
- All changes are implemented
- `npx tsc --noEmit` passes (0 errors)
- `npm run build` passes
- `PROGRESS_TRACKER.md` is updated
- `SECURITY_LOOPHOLES.md` is updated if applicable
- No broken references exist
- No redundant files remain

---

## Final Checklist

Before considering any task complete:
- [ ] Implementation matches the requirements
- [ ] Code follows existing conventions
- [ ] TypeScript compiles with zero errors
- [ ] Build succeeds
- [ ] `PROGRESS_TRACKER.md` updated
- [ ] `SECURITY_LOOPHOLES.md` updated (if applicable)
- [ ] All references are valid
- [ ] No redundant files exist

---
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
alwaysApply: true
---

# Karpathy behavioral guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.