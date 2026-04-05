# Feature Spec: Flashcard / SRS System

## Purpose

Spaced repetition vocabulary practice. Words flow in from stories, conversations, and news. Users review cards on a schedule that maximizes long-term retention.

---

## Word Sources

| Source | How words enter queue |
|--------|----------------------|
| Adaptive Reader | User taps unknown word in hover translation |
| Conversation | User flags a word mid-conversation |
| Graded News | Auto-extracted from segments array |
| Manual | User types a word to add |

---

## Card Format (Chinese)

**Front:**
```
饺子
jiǎo zi
```

**Back:**
```
dumpling / potsticker

Example: 我想要饺子。
         I'd like dumplings.
```

- Front: target language word + pinyin (for Chinese)
- Back: English meaning + example sentence from context where it was encountered

---

## SRS Algorithm

Start simple — SM-2 inspired (same as Anki):

- New cards: show immediately
- Rating: Again / Hard / Good / Easy (4 buttons)
- Interval multipliers: 1d → 3d → 7d → 21d → ...
- "Again" resets interval to 1 day

State stored client-side (localStorage) in V1. Supabase in V2.

---

## UI Layout

```
┌─────────────────────────────────────┐
│  Flashcards  [12 due today]         │
├─────────────────────────────────────┤
│                                     │
│            饺子                      │  ← large character
│           jiǎo zi                   │  ← pinyin
│                                     │
│  [Show Answer]                      │
│                                     │
├─────────────────────────────────────┤
│  [Again]  [Hard]  [Good]  [Easy]    │
└─────────────────────────────────────┘
```

- Card flips on "Show Answer"
- Rating buttons only appear after flip
- Progress shown: "5 / 12 cards done today"
- After session: summary (new, review, learned counts)

---

## API: `POST /api/flashcards`

For generating example sentences for new cards (Claude).

**Input:** `{word: string, language: string, level: string}`

**Output:**
```json
{
  "example_target": "我想要饺子。",
  "example_english": "I'd like dumplings.",
  "definition": "dumpling / potsticker",
  "pinyin": "jiǎo zi"
}
```

Card data otherwise lives client-side.

---

## Out of Scope (V1)

- Audio pronunciation of card (add in V2 — use `/api/audio`)
- Image cards
- Cloud sync / cross-device (V2 — Supabase)
- Leaderboards / streaks
