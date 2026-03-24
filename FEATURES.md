# FEATURES.md – I CAN App

## Overview

This document defines the core features of the I CAN app, focusing on MVP (V1) functionality. All features should be implemented in a simple, scalable way, prioritizing speed of development and user experience.

---

# V1 FEATURES (MVP)

## 1. Adaptive Story Generation

### Description

Generate a short English story tailored to the user’s level, slightly above their current ability (~3% harder).

### Inputs

* User level (e.g., beginner, intermediate)
* Known vocabulary set (optional for MVP)
* Topic (optional, default if not selected)

### Output

* Story (100–300 words)
* Highlighted “new” or more difficult words

### Requirements

* Keep sentences simple and clear
* Avoid overly complex grammar
* Maintain coherence and narrative flow
* Ensure difficulty is slightly above user level

### Constraints

* Limit to 1 story per day (free users)
* Cache stories when possible to reduce cost

---

## 2. Story Display UI

### Description

Display generated story in a clean, readable format.

### Features

* Highlight difficult/new words
* Tap word to see:

  * definition
  * pronunciation (audio)
* Scrollable reading experience

---

## 3. Audio Playback (Text-to-Speech)

### Description

Generate audio for each story.

### Modes

* Full story playback
* Sentence-by-sentence playback

### Requirements

* Natural sounding voice
* Clear pronunciation
* Optional accent selection (future)

### Constraints

* Cache audio to reduce API cost
* Limit usage for free users

---

## 4. Shadowing Mode

### Description

Allow users to repeat after audio to improve speaking.

### Modes

#### Mode 1: Phrase-by-Phrase

* Play short phrase
* Pause
* User repeats

#### Mode 2: Sentence-Level

* Play full sentence
* Pause
* User repeats

#### Mode 3: Full Playback

* Continuous listening (no pauses)

---

## 5. Vocabulary Flashcards

### Description

Simple flashcard system based on story content.

### Types

* Word flashcards
* Sentence flashcards

### Features

* Audio playback
* Repeat-after-me functionality

### Future (not required for MVP)

* Spaced repetition
* Difficulty tracking

---

## 6. Basic Progress Tracking

### Description

Track simple user activity.

### Metrics

* Daily streak
* Number of stories completed
* Time spent learning

### UI

* Simple dashboard or stats page

---

# V2 FEATURES (POST-MVP)

## 7. Pronunciation Feedback

### Description

Analyze user speech and provide feedback.

### Functionality

* Detect mispronounced sounds
* Identify repeated weaknesses
* Suggest targeted practice

### Example Feedback

* “You struggle with ‘th’ sounds”
* “Try repeating this sentence 5 times”

---

## 8. AI Podcast Mode

### Description

Generate audio-only learning sessions.

### Features

* Topic-based listening
* Adjustable difficulty
* Shadowing integrated

---

## 9. Personalization Engine

### Description

Adapt content based on user performance.

### Inputs

* Past mistakes
* vocabulary usage
* pronunciation errors

### Output

* tailored stories
* targeted exercises

---

# NON-GOALS (IMPORTANT)

Do NOT build in MVP:

* Video content generation
* Complex social features
* Gamification beyond simple streaks
* Advanced analytics dashboards

---

# DESIGN PRINCIPLES

* Keep UI minimal and intuitive
* Optimize for short daily sessions (5–15 minutes)
* Avoid overwhelming users with too many options
* Ensure fast response times (AI should feel instant)

---

# COST CONTROL STRATEGY

* Limit daily usage (stories, audio generation)
* Cache generated content whenever possible
* Reuse content for similar levels/topics
* Consider credit system for heavy users (future)

---

# SUCCESS CRITERIA (V1)

* User can generate and read a story
* User can listen to story audio
* User can repeat and practice speaking
* User returns daily (streak behavior)
