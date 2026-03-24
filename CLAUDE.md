# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**I CAN App** — An adaptive language learning web app that generates personalized stories (A1–C1 CEFR levels) with optional audio playback. Built with Next.js, deployed on Vercel.

## Commands

```bash
npm install          # Install dependencies (first time)
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
```

## Architecture

Single Next.js 15 monorepo (App Router) — frontend and backend colocated:

```
app/
  page.tsx               # Main UI: level selector, topic input, story display, audio player
  layout.tsx             # Root layout + metadata
  globals.css            # Tailwind imports
  api/
    generate/route.ts    # POST {level, topic} → {story} via Claude (claude-haiku-4-5)
    audio/route.ts       # POST {text} → audio/mpeg blob via OpenAI TTS (tts-1, voice: alloy)
```

## AI Services

- **Story generation:** Anthropic Claude (`claude-haiku-4-5-20251001`) — cheap and fast
- **Text-to-speech:** OpenAI TTS (`tts-1`, voice `alloy`) — audio returned as `audio/mpeg` buffer

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

On Vercel, add these in Project Settings → Environment Variables.

## Key Design Decisions

- Audio is generated on demand (user clicks "Listen"), not automatically — saves API cost
- Frontend creates an object URL from the audio blob for HTML5 `<audio>` playback
- No database or auth in V1 — stateless, no caching yet (planned: cache by level+topic key)
- Mobile-first layout, max-width `lg` centered container
