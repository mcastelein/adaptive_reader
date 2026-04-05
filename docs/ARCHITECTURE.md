# Architecture — I CAN Language Learning Platform

## Overview

Monorepo: single Next.js 15 app (App Router) with feature-folder structure. Frontend and backend colocated. Deployed on Vercel.

---

## Folder Structure

```
app/
  page.tsx                        # Home/landing: feature cards
  layout.tsx                      # Root layout + metadata
  globals.css                     # Tailwind imports
  (features)/
    reader/
      page.tsx                    # Adaptive story reader (existing MVP)
    conversation/
      page.tsx                    # AI conversation partner
    flashcards/
      page.tsx                    # SRS flashcard review
    pronunciation/
      page.tsx                    # Pronunciation grading
    grammar/
      page.tsx                    # Grammar drills
    graded-input/
      page.tsx                    # Graded news/content reader + listener
  api/
    generate/route.ts             # POST → story scene via Claude
    audio/route.ts                # POST → TTS via OpenAI (audio/mpeg)
    transcribe/route.ts           # POST → speech-to-text via Whisper
    conversation/route.ts         # POST → AI conversation reply via Claude
    flashcards/route.ts           # POST → generate/grade flashcard review
    pronunciation/route.ts        # POST → pronunciation scoring
    graded-input/route.ts         # POST → rewrite content at target level

lib/
  vocab/
    chinese.ts                    # HSK vocab A1–C1 with pinyin + English
  prompts/
    conversation.ts               # Shared Claude prompt templates
    reader.ts
    graded-input.ts
  types/
    index.ts                      # Shared TypeScript interfaces

docs/
  ARCHITECTURE.md                 # This file
  AGENT_ROLES.md                  # Agent flywheel framework
  features/
    conversation.md               # Conversation feature spec
    reader.md                     # Adaptive reader spec
    flashcards.md                 # Flashcard/SRS spec
    pronunciation.md              # Pronunciation grading spec
    graded-input.md               # Graded content spec
```

---

## API Route Map

| Route | Method | Input | Output | Service |
|-------|--------|-------|--------|---------|
| `/api/generate` | POST | `{language, level, topic, choice, storyHistory}` | `{story, choices, question, answers, segments}` | Claude haiku-4-5 |
| `/api/audio` | POST | `{text}` | `audio/mpeg` blob | OpenAI tts-1 |
| `/api/transcribe` | POST | `FormData {audio}` | `{text, language}` | OpenAI whisper-1 |
| `/api/conversation` | POST | `{messages, language, level, topic?}` | `{reply, translation}` | Claude haiku-4-5 |
| `/api/flashcards` | POST | `{words, language, level}` | `{cards[]}` | Claude haiku-4-5 |
| `/api/pronunciation` | POST | `{audio, target, language}` | `{score, feedback}` | Whisper + Claude |
| `/api/graded-input` | POST | `{content, targetLevel, language}` | `{rewritten, segments}` | Claude haiku-4-5 |

---

## AI Services

| Service | Model | Use Case | Cost tier |
|---------|-------|----------|-----------|
| Anthropic Claude | `claude-haiku-4-5-20251001` | Story gen, conversation, rewriting | Low |
| OpenAI TTS | `tts-1`, voice `alloy` | Text-to-speech playback | Low |
| OpenAI Whisper | `whisper-1` | Speech-to-text transcription | Low |

---

## Environment Variables

```
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

---

## Languages Supported

| Language | Code | Vocab module | Notes |
|----------|------|-------------|-------|
| Chinese (Mandarin) | `zh` | `lib/vocab/chinese.ts` | HSK levels mapped to CEFR |
| English | `en` | — | Target language for Chinese speakers |
| French | `fr` | — | Planned |
| Spanish | `es` | — | Planned |
| Japanese | `ja` | — | Planned |

---

## Data & State

- **V1:** Fully stateless — no database, no auth. Session state in React.
- **V2 (planned):** Supabase for user accounts, progress tracking, cached generations
- **Caching strategy:** Cache by `(language, level, topic)` key — same prompt returns same story for cost control

---

## Deployment

- Platform: Vercel
- Branch: `master` → auto-deploy
- Environment: Production env vars in Vercel Project Settings
- No CI/CD pipeline yet — direct deploy on push
