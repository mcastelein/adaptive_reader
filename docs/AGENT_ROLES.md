# Agent Flywheel — I CAN Platform

## Overview

Development uses a 3-agent Claude Code workflow. Each agent has a clearly scoped role and hands off to the next. This prevents context bloat, enforces separation of concerns, and makes the spec the single source of truth.

---

## Agent 1 — Orchestrator (You, main Claude Code session)

**Role:** Product thinking, architecture, and specs.

**Responsibilities:**
- Maintain `docs/` — write/update all feature specs before coding begins
- Define task breakdowns in `TASKS.md`
- Update `CLAUDE.md` when architecture changes
- Review Agent 3 QA reports and decide: fix → re-send to Agent 2, or accept
- Make all design decisions — Agent 2 should never need to guess

**When to run:** Before every feature implementation, and after QA reports.

**Handoff to Agent 2:** Provide the exact feature spec file path + any constraints.

---

## Agent 2 — Coder (Separate Claude Code session)

**Role:** Pure implementation — no design decisions.

**Responsibilities:**
- Read the feature spec from `docs/features/<feature>.md`
- Read `docs/ARCHITECTURE.md` for structural constraints
- Implement exactly what the spec says — no extras, no redesigns
- Follow existing patterns in the codebase (read 2-3 existing files first)
- Mark tasks complete in `TASKS.md` as it goes

**When to run:** After Agent 1 has written the spec and TASKS.md entries.

**Handoff prompt template:**
```
Read docs/features/<feature>.md and docs/ARCHITECTURE.md.
Implement the <feature> feature per spec. 
The repo has Next.js 15, Anthropic SDK, and OpenAI SDK already installed.
Reuse existing patterns — see app/api/audio/route.ts for TTS, app/(features)/reader/page.tsx for UI patterns.
Do not redesign. Follow the spec exactly.
```

---

## Agent 3 — QA (Separate Claude Code session)

**Role:** Verification and issue reporting.

**Responsibilities:**
- Read the feature spec from `docs/features/<feature>.md`
- Read the implemented code
- Check spec compliance: does the implementation match the spec?
- Test edge cases: empty inputs, API failures, missing env vars, browser compatibility notes
- Check for TypeScript errors, missing error handling at system boundaries
- Output a structured QA report (list of issues with file:line references)
- Does NOT fix issues — reports back to Agent 1

**When to run:** After Agent 2 completes implementation.

**Handoff prompt template:**
```
Read docs/features/<feature>.md. 
Audit the implementation in app/(features)/<feature>/page.tsx and app/api/<feature>/route.ts.
Check: spec compliance, edge cases, error handling, TypeScript correctness.
Output a QA report: list each issue with file path, line number, and description.
Do NOT fix anything — report only.
```

---

## Agent 4 — Content Curator (Separate Claude Code session)

**Role:** Owns the graded real-world content pipeline — sources, selects, and pre-processes input for the Graded Input feature.

**Responsibilities:**
- Identify and maintain RSS/API sources by language (BBC Chinese, VOA, etc.)
- Curate articles: filter out low-quality, paywalled, or off-topic content
- Pre-process raw text: clean HTML, strip ads, normalize encoding
- Evaluate rewrite quality: does the Claude rewrite actually read at the target level? Flag poor outputs
- Expand source library as new languages are added to the platform

**When to run:** When building or iterating on the Graded Input feature, or adding support for a new language.

**Handoff prompt template:**
```
We are building the Graded Input feature (spec: docs/features/graded-input.md).
Your job: find and validate content sources for {language}.
For each source: test the RSS/API, verify content quality, check for Chinese/Japanese character encoding, 
and confirm the content is free to access. Return a list of 5+ working sources with sample article titles.
```

---

## Flywheel Loop

```
Agent 1 (spec) → Agent 2 (code) → Agent 3 (QA) → Agent 1 (review + fix decision)
                                                          ↓
                                              If issues: back to Agent 2
                                              If clean: ship + next feature
```

---

## Rules

1. **Spec first.** Never start Agent 2 without a written spec in `docs/features/`.
2. **One feature at a time.** Don't queue Agent 2 on multiple features simultaneously.
3. **Agent 2 never designs.** If spec is ambiguous, Agent 1 clarifies before Agent 2 starts.
4. **Agent 3 never fixes.** QA is read-only. Fixes always go back through Agent 2.
5. **CLAUDE.md is updated after each structural change.** Agent 1 owns this.
