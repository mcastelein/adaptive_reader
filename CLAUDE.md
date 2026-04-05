# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**I CAN** — A full language learning platform. Adaptive stories, AI conversation partner, flashcards/SRS, pronunciation grading, and graded real-world content (news, articles). Built with Next.js, deployed on Vercel.

See `docs/ARCHITECTURE.md` for full system architecture.
See `docs/AGENT_ROLES.md` for the agent flywheel development workflow.
See `docs/features/` for individual feature specs.

## Commands

```bash
npm install          # Install dependencies (first time)
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
```

## Architecture

Next.js 15 monorepo (App Router) — feature-folder structure:

```
app/
  page.tsx                    # Home/landing: feature cards
  (features)/
    reader/page.tsx           # Adaptive story reader
    conversation/page.tsx     # AI conversation partner
    flashcards/page.tsx       # SRS flashcard review
    pronunciation/page.tsx    # Pronunciation grading
    graded-input/page.tsx     # Graded news/content
  api/
    generate/route.ts         # POST → story via Claude
    audio/route.ts            # POST → TTS via OpenAI
    transcribe/route.ts       # POST → STT via Whisper
    conversation/route.ts     # POST → conversation reply via Claude
    flashcards/route.ts       # POST → flashcard generation
    pronunciation/route.ts    # POST → pronunciation scoring
    graded-input/route.ts     # POST → content rewriting

lib/
  vocab/chinese.ts            # HSK vocab A1–C1
  prompts/                    # Shared Claude prompt templates
  types/                      # Shared TypeScript interfaces

docs/
  ARCHITECTURE.md
  AGENT_ROLES.md
  features/                   # Per-feature specs
```

## AI Services

- **Story generation:** Anthropic Claude (`claude-haiku-4-5-20251001`)
- **Conversation:** Anthropic Claude (`claude-haiku-4-5-20251001`)
- **Text-to-speech:** OpenAI TTS (`tts-1`, voice `alloy`)
- **Speech-to-text:** OpenAI Whisper (`whisper-1`)

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

On Vercel, add these in Project Settings → Environment Variables.

## Key Design Decisions

- Audio generated on demand — saves API cost
- Only target language audio plays; English translations are text-only
- No database or auth in V1 — stateless, session state in React
- Mobile-first layout, max-width `lg` centered container
- Words from reader/conversation/news feed into flashcard queue
- Agent flywheel: Agent 1 specs → Agent 2 codes → Agent 3 QAs (see `docs/AGENT_ROLES.md`)
