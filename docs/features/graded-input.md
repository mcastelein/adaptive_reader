# Feature Spec: Graded Input (Reading + Listening)

## Purpose

Bring real-world content (news, articles, podcasts) to learners at their exact CEFR level. Content is sourced externally and rewritten by Claude to match the target level — real vocabulary, real topics, learnable difficulty.

---

## Content Types

| Type | Source | Format |
|------|--------|--------|
| News articles | RSS feeds, NewsAPI, or curated sources | Short article (200–400 words) |
| Podcast transcripts | Manual upload or scrape | Passage with audio |
| Wikipedia snippets | Wikipedia API | Factual short-form |
| Custom paste | User pastes any text | Any length |

---

## User Flow

1. User selects "Graded Input" from home
2. Chooses: language, level, content type (News / Wiki / Custom)
3. App fetches/receives raw content
4. POST to `/api/graded-input` → Claude rewrites at target level
5. Display: rewritten text with hover translations (same `segments` format as reader)
6. "Listen" button → TTS audio of rewritten text
7. Unknown words → "Add to flashcards" button per word

---

## API: `POST /api/graded-input`

**Input:**
```json
{
  "content": "raw article text",
  "targetLevel": "A2",
  "language": "Chinese",
  "contentType": "news"
}
```

**Claude prompt:**
```
Rewrite the following {language} content for a {targetLevel} CEFR learner.

Rules:
- Preserve the key facts and meaning
- Replace complex vocabulary with {targetLevel}-appropriate words
- Shorten complex sentences into simpler structures
- Keep it engaging and natural — not dumbed down, just accessible
- Target length: 150-250 words
- Also tokenize the output into segments with translations

Return JSON:
{
  "title": "simplified title",
  "rewritten": "the rewritten text",
  "segments": [{"text": "word", "translation": "meaning"}, ...]
}
```

**Output:**
```json
{
  "title": "China's New Space Station",
  "rewritten": "中国有一个新的太空站...",
  "segments": [
    {"text": "太空站", "translation": "space station"},
    ...
  ]
}
```

---

## News Sources (starting point)

For Chinese content:
- BBC Chinese: `https://feeds.bbci.co.uk/chinese/simp/rss.xml`
- VOA Chinese: publically available RSS
- ChinaDaily (English → rewrite in Chinese at target level)

For English content (for Chinese learners learning English):
- BBC News RSS
- Reuters RSS

**V1 approach:** Hardcode 3-5 RSS URLs, fetch server-side, pick a random recent article.

---

## UI Layout

```
┌─────────────────────────────────────┐
│  Graded Input  🇨🇳 A2                │
├─────────────────────────────────────┤
│  [News]  [Wikipedia]  [Paste]       │  ← content type tabs
├─────────────────────────────────────┤
│  [Refresh for new article]          │
│                                     │
│  中国的新太空站                       │  ← title
│                                     │
│  中国有一个新的太空站。它叫"天宫"。   │  ← rewritten text
│  这个太空站很大，有三个部分...        │  ← hover translations available
│                                     │
│  [▶ Listen]                         │
│                                     │
│  [Add unknown words to flashcards]  │
└─────────────────────────────────────┘
```

---

## Grammar Drills Integration

After reading, offer: "Practice grammar from this article"
- Extracts 2-3 grammar patterns from the rewritten text
- Generates fill-in-the-blank or transformation exercises
- Feeds into grammar drills feature

---

## Out of Scope (V1)

- Podcast audio sourcing (text-only for V1, TTS for listen mode)
- User-submitted content curation
- Offline reading
- Bookmarking articles
