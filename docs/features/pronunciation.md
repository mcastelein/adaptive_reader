# Feature Spec: Pronunciation Grading

## Purpose

User speaks a target sentence → AI compares their audio to the reference → gives a score and tone-by-tone visual feedback. Chinese tones are the primary focus: show which tones the user got right vs. wrong with a visual tone contour comparison.

---

## TTS Voice Selection by Language

The "Hear it" reference audio must use a voice that handles the target language naturally:

| Language | OpenAI TTS Voice | Notes |
|----------|-----------------|-------|
| Chinese (Mandarin) | `nova` or `shimmer` | Both handle tones better than `alloy`; default to `nova` |
| English | `alloy` | Standard, clear |
| French | `nova` | Natural prosody |
| Spanish | `shimmer` | Good rhythm |
| Japanese | `nova` | — |

The `/api/audio` route should accept an optional `voice` parameter. When `language = "Chinese"`, default to `nova`.

---

## Chinese Tone System (Reference)

Mandarin has 4 tones + neutral tone:

| Tone | Mark | Contour | Description |
|------|------|---------|-------------|
| 1st | ā | ˉ (flat high) | Hold high and steady |
| 2nd | á | ˊ (rising) | Start mid, rise to high |
| 3rd | ǎ | ˇ (dip) | Fall then rise |
| 4th | à | ˋ (falling) | Sharp drop from high to low |
| Neutral | a | ˙ (short) | Short, unstressed |

---

## User Flow

1. User sees target sentence with characters + pinyin + tone numbers
2. Taps "Hear it" → reference audio plays (TTS, language-appropriate voice)
3. Taps "Speak" → records audio
4. Audio sent to backend:
   a. Whisper transcribes what they said
   b. Claude compares transcription to target, identifies tone/character mismatches
5. Results shown: per-character color coding + tone contour comparison diagram
6. Score (0–100) + natural language feedback
7. Tap to hear reference again, then retry

---

## Tone Visualization (V1 — text-based, no audio analysis)

V1 uses pinyin tone marks to show target vs. what was heard. True acoustic waveform comparison is V2.

**Per-character result display:**

Each syllable shows:
- Target tone (from pinyin of target sentence)
- What Whisper heard (from pinyin of transcription)
- Match status: ✓ correct / ⚠ wrong tone / ✗ wrong character

```
Target:      wǒ    xiǎng   yào    jiǎo   zi
             我     想      要     饺     子
             ˇ      ˇ       ˋ     ˇ      ·

You said:    wǒ    xiāng   yào    jiǎo   zi  
             我     想      要     饺     子
             ˇ      ˉ       ˋ     ˇ      ·

Result:      ✓      ⚠       ✓     ✓      ✓
```

Tone contour icons (SVG or Unicode-drawn):
- ˉ flat:    ────
- ˊ rising:  ╱
- ˇ dip:     ╲╱
- ˋ falling: ╲

**V2 (acoustic analysis):** Azure Speech Services has a Chinese pronunciation assessment API that returns actual pitch contour data per syllable — this enables true waveform overlay comparison. Migrate to this when ready.

---

## Scoring Approach (V1)

- Full character + tone match per syllable → 20 points per syllable (scaled)
- Correct character, wrong tone → 10 points (half credit)
- Wrong character → 0 points
- Score = (points earned / max points) × 100

Claude calibrates the final feedback based on the score and identified issues.

---

## API: `POST /api/pronunciation`

**Input:** `FormData { audio, target, targetPinyin, language, level }`
- `audio`: recorded blob
- `target`: target sentence in characters (e.g., `"我想要饺子"`)
- `targetPinyin`: pinyin with tone marks (e.g., `"wǒ xiǎng yào jiǎo zi"`)
- `language`: target language
- `level`: CEFR level

**Processing:**
1. Whisper transcription → `transcribedText` + `transcribedPinyin` (infer pinyin via lookup)
2. Syllable-by-syllable comparison: character match + tone match
3. Claude generates feedback

**Claude prompt:**
```
The learner was trying to say: "{target}" (pinyin: {targetPinyin})
Whisper heard: "{transcribedText}" (pinyin: {transcribedPinyin})
Language: Chinese, Level: {level}

Compare syllable by syllable. Return JSON:
{
  "score": 0-100,
  "syllables": [
    {
      "character": "想",
      "targetTone": 3,
      "heardTone": 1,
      "match": "wrong_tone"
    }
  ],
  "feedback": "2-3 sentences, encouraging and specific",
  "focus": ["想 — should be tone 3 (dip), you said tone 1 (flat)"]
}
```

**Output:**
```json
{
  "score": 78,
  "transcription": "我想要饺子",
  "syllables": [
    {"character": "我", "targetTone": 3, "heardTone": 3, "match": "correct"},
    {"character": "想", "targetTone": 3, "heardTone": 1, "match": "wrong_tone"},
    {"character": "要", "targetTone": 4, "heardTone": 4, "match": "correct"},
    {"character": "饺", "targetTone": 3, "heardTone": 3, "match": "correct"},
    {"character": "子", "targetTone": 0, "heardTone": 0, "match": "correct"}
  ],
  "feedback": "Great job overall! Your tones on 我, 要, and 饺子 were spot on. Work on 想 — it's tone 3 (the dip), but it sounded flat. Try: start a bit lower, dip down, then rise.",
  "focus": ["想 (xiǎng) — tone 3 (ˇ dip), heard as tone 1 (ˉ flat)"]
}
```

---

## UI Layout

```
┌─────────────────────────────────────┐
│  Pronunciation Practice  🇨🇳          │
├─────────────────────────────────────┤
│  我想要饺子。                         │  ← large characters
│  wǒ xiǎng yào jiǎo zi               │  ← pinyin with tone marks
│                                     │
│  [▶ Hear it (nova voice)]  [🎤 Speak]│
│                                     │
├─────────────────────────────────────┤
│  Results:  78 / 100                 │
│                                     │
│  我   想   要   饺   子              │
│  ✓    ⚠    ✓    ✓    ✓              │  ← per-character result
│  ˇ    ˉ→ˇ  ˋ    ˇ    ·             │  ← heard → target (for ⚠ only)
│                                     │
│  "Work on 想 — tone 3 (dip), you   │
│   said flat. Start mid, dip, rise." │
│                                     │
│  [▶ Hear 想 again]                  │  ← hear just the problem syllable
│                                     │
│  [Try Again]    [Next Sentence]     │
└─────────────────────────────────────┘
```

- Green: correct tone
- Yellow/orange: wrong tone (right character)
- Red: wrong character entirely
- "Hear again" plays TTS of just the problem syllable — focuses attention

---

## Sentence Sources

- Sentences from recent story scenes (passed from reader)
- Sentences from conversation history
- Flashcard example sentences
- Manual input / preset drills

---

## V2 Upgrade Path

When ready for acoustic analysis:
- **Azure Speech Services:** `pronunciation assessment` API returns per-phoneme accuracy + tone score for Chinese. Returns actual pitch contour data.
- Overlay user's recorded pitch contour vs. reference contour (SVG chart)
- This enables "your tone started too high" vs. just "wrong tone number"
