# Feature Spec: Adaptive Reader

## Purpose

Generate personalized, branching short stories at the user's CEFR level. Stories adapt in difficulty based on comprehension quiz performance. Users can read, listen, and choose what happens next — pure comprehensible input at the right level.

---

## Current State (MVP complete)

- Language selector: English, Chinese, French, Spanish
- Level selector: A1–C1 with 10 sub-levels each
- Branching story with 3 choices per scene
- Comprehension quiz (4-choice MCQ) after each scene
- Hover-over word translations (segments array)
- Adaptive difficulty: +2 correct, -10 incorrect
- 10 free steps → paywall screen
- Audio route exists (`/api/audio`) but not wired to UI yet

---

## Planned Expansions

### 1. Audio playback for stories
Wire up the existing `/api/audio` route to the story display.
- "Listen" button → POST story text → play audio
- While playing: show progress bar, pause/resume button
- Chinese only: use a Chinese TTS voice if available (investigate OpenAI TTS voice options for Chinese)

### 2. Shadowing mode
After listening, user re-reads the sentence out loud.
- Highlight sentence being shadowed
- Record user audio → play back immediately for self-comparison
- (V2: send to pronunciation scoring)

### 3. Graded news stories
Pull real news headlines/articles and rewrite them at the target CEFR level.
- Source: RSS feeds or news APIs
- Rewriting: Claude rewrites at target level (see `graded-input.md`)
- Display: same reader UI, but "News" tab instead of "Story"
- New words from news → auto-add to flashcard queue

### 4. Listen mode (audio-first)
Audio plays first, user listens without seeing text.
- Then text reveals on tap (reading after listening)
- Comprehension question still shown
- Good for commuting / background listening

---

## API: `POST /api/generate` (existing)

Input: `{language, level, sublevel, topic, internalLevel, choice?, storyHistory?, runningSummary, stepNumber}`

Output: `{story, choices[3], summary, question, answers[4], correctAnswer, segments[]}`

No changes needed for V1 expansions except audio wiring.

---

## Vocabulary Pipeline

Words encountered in stories → candidate flashcards:
- Unknown words (from hover translations) flagged by user
- Auto-extract from `segments` array
- Feed into flashcard queue (see `flashcards.md`)

---

## Out of Scope

- User accounts / progress persistence (V2 — Supabase)
- Streak system (V2)
- Payment processing (V2 — integrate Stripe or Lemon Squeezy)
