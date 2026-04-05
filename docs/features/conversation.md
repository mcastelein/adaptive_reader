# Feature Spec: AI Conversation Partner

## Purpose

Let users have a back-and-forth spoken conversation with an AI in their target language. The AI speaks and responds naturally in the target language (e.g., Chinese), while displaying both the target language text and an English translation. Only the target language audio plays — the English translation is silent.

---

## User Flow

1. User opens Conversation page
2. Selects target language (default: Chinese) and CEFR level (default: A1)
3. Optionally sets a conversation topic/context (e.g., "ordering food", "meeting someone new")
4. Taps mic button → speaks in target language
5. Recording stops → audio sent to Whisper → transcription appears as user message
6. Each message shows: **target language text** (large) + *English translation* (small, muted)
7. Claude generates a natural reply in target language (CEFR-appropriate vocabulary)
8. AI reply shown: target language + English translation
9. AI reply audio (target language only) plays automatically
10. User taps mic again to continue

---

## UI Layout

```
┌─────────────────────────────────────┐
│  🇨🇳 Chinese  [A1 ▾]  [Food & Dining] │  ← header bar
├─────────────────────────────────────┤
│                                     │
│  [AI] 你好！你想吃什么？             │  ← AI bubble (Chinese, large)
│       Hello! What would you like    │  ← English translation (small, gray)
│       to eat?                       │
│                                     │
│  [Me] 我想要饺子。                   │  ← User bubble (right-aligned)
│       I'd like dumplings.           │
│                                     │
│  [AI] 好的！饺子很好吃。你要...      │
│       Great! Dumplings are deli...  │
│                                     │
├─────────────────────────────────────┤
│  [Text input]         [🎤 Hold]      │  ← input bar
└─────────────────────────────────────┘
```

- AI messages: left-aligned, blue accent
- User messages: right-aligned, green accent
- Both show target language (large, primary) + English (small, muted gray)
- Mic button: tap to start, tap again to stop (or hold-to-record)
- Text input fallback for users who prefer typing

---

## State

```typescript
interface Message {
  role: 'user' | 'assistant'
  content: string        // target language text
  translation: string    // English translation
  audioUrl?: string      // only for assistant messages
}

interface ConversationState {
  messages: Message[]
  language: string       // 'Chinese', 'French', etc.
  level: string          // 'A1'–'C1'
  topic: string          // optional context
  isRecording: boolean
  isThinking: boolean
  isPlaying: boolean
}
```

---

## API Routes

### `POST /api/transcribe`

Converts user audio to text using OpenAI Whisper.

**Input:** `FormData` with field `audio` (blob, webm or mp4 format from MediaRecorder)

**Output:**
```json
{
  "text": "我想要饺子",
  "language": "zh"
}
```

**Implementation:**
- Use OpenAI `whisper-1` model
- Pass `language` hint if known (improves accuracy for Chinese)
- Return 400 if no audio, 500 on API error

---

### `POST /api/conversation`

Generates an AI reply in the target language with English translation.

**Input:**
```json
{
  "messages": [
    { "role": "user", "content": "你好" },
    { "role": "assistant", "content": "你好！很高兴认识你。" }
  ],
  "language": "Chinese",
  "level": "A1",
  "topic": "ordering food"
}
```

**Output:**
```json
{
  "reply": "好的！饺子很好吃。你要多少个？",
  "translation": "Great! Dumplings are delicious. How many would you like?"
}
```

**Claude system prompt:**
```
You are a friendly {language} conversation partner for a {level} CEFR learner.
Context/topic: {topic}

Rules:
- Always respond ONLY in {language}. Never use English in your reply.
- Use vocabulary and grammar appropriate for {level} level
- Keep responses to 2-3 sentences maximum
- Be encouraging and natural — like a patient native speaker friend
- Also provide an English translation of your response

Respond in this exact JSON format:
{"reply": "<response in {language}>", "translation": "<English translation>"}
```

**Implementation:**
- Model: `claude-haiku-4-5-20251001`
- Parse JSON from Claude response
- Return 400 for missing fields, 500 on API error

---

### `POST /api/audio` (existing — reuse with voice parameter)

Converts AI reply text to speech. Only called with the target language text, never the English translation.

Voice selection by language:
- Chinese → `nova` (handles tones better than `alloy`)
- English → `alloy`
- French / Spanish / Japanese → `nova`

Pass `voice` as a parameter when calling `/api/audio`.

---

## Frontend: `app/(features)/conversation/page.tsx`

**Key behaviors:**
- On AI reply: auto-call `/api/audio` with `reply` text → play audio
- While audio plays: `isPlaying = true`, mic button disabled
- While thinking: `isThinking = true`, show typing indicator in chat
- Mic recording: use `MediaRecorder` API, collect chunks, create blob on stop
- Send blob as `FormData` to `/api/transcribe`
- After transcription: add user message to state, then call `/api/conversation`
- Scroll to bottom on each new message
- Text input: on submit, skip transcription and go directly to `/api/conversation`

**Error handling:**
- Mic permission denied → show instructions toast
- Transcription fails → show "Couldn't hear that, try again"
- Conversation API fails → show "Something went wrong" with retry button
- Audio fails → show message but don't block conversation

---

## Out of Scope (V1)

- Pronunciation scoring (separate feature — see `pronunciation.md`)
- Saving conversation history across sessions
- Grammar correction / explicit feedback
- Multiple simultaneous conversations
