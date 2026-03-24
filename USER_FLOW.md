# USER_FLOW.md – I CAN App

## Overview

This document defines the core user experience and flow through the I CAN app. The goal is to create a simple, repeatable daily learning loop that encourages consistent usage.

---

# CORE USER JOURNEY (DAILY LOOP)

## Step 1: Open App

### First-Time User

* User opens app

* Sees simple onboarding:

  * Select English level:

    * Beginner
    * Intermediate
    * Advanced (optional for MVP)
  * (Optional) Select interests/topics:

    * Daily life
    * Travel
    * Business
    * Default if skipped

* User lands on Home Screen

---

### Returning User

* Opens app
* Lands directly on Home Screen
* Sees:

  * Current streak
  * “Generate Today’s Story” button

---

# HOME SCREEN

## Elements

* Streak counter (top)
* Progress summary (optional for MVP)
* Primary CTA:
  → “Generate Story”

---

## Action

User taps:
→ “Generate Story”

---

# STORY GENERATION FLOW

## Step 2: Generate Story

### Optional Inputs (MVP can simplify)

* Topic selection (optional)
* Difficulty auto-based on user level

---

### System Action

* Generate story using AI
* Slightly above user level (~3% harder)

---

## Step 3: Story Screen

### UI Elements

* Story text (scrollable)
* Highlighted difficult words
* Buttons:

  * “Play Audio”
  * “Shadow Mode”
  * “Practice Words”

---

## Interaction

### Tap Word

* Shows:

  * Definition
  * Pronunciation (audio)

---

# AUDIO FLOW

## Step 4: Listen

User taps:
→ “Play Audio”

### Options

* Full story playback
* Sentence-by-sentence playback

---

# SHADOWING FLOW

## Step 5: Speak / Repeat

User taps:
→ “Shadow Mode”

---

### Mode Selection

#### Mode 1: Phrase-by-Phrase

* Play short phrase
* Pause
* User repeats

#### Mode 2: Sentence-Level

* Play full sentence
* Pause
* User repeats

#### Mode 3: Full Listening

* Continuous playback

---

# VOCABULARY PRACTICE FLOW

## Step 6: Practice Words

User taps:
→ “Practice Words”

---

### Flashcard UI

#### Word Card

* Word
* Meaning
* Audio button

#### Sentence Card

* Sentence
* Audio
* Repeat prompt

---

# SESSION COMPLETE

## Step 7: Completion

After finishing:

* Show:

  * “Session Complete”
  * Words learned
  * Time spent

---

### Update:

* Streak increases
* Progress saved

---

# RETURN LOOP

User returns next day:
→ repeats flow

---

# OPTIONAL FLOWS (V2)

## Pronunciation Feedback

After speaking:

* App analyzes speech
* Shows:

  * weak sounds
  * suggested practice

---

## AI Podcast Mode

User selects:
→ “Listen Mode”

* Plays generated audio content
* Passive learning option

---

# EDGE CASES

## No Internet

* Show message:
  → “Connection required”

---

## API Limit Reached (Free Users)

* Show:
  → “You’ve reached today’s limit”
  → Option to upgrade

---

# DESIGN PRINCIPLES

* Minimize friction (few clicks)
* One clear action per screen
* Fast transitions
* Mobile-first simplicity

---

# SUCCESSFUL USER EXPERIENCE

A successful session should:

* Take 5–10 minutes
* Feel smooth and guided
* Provide small but noticeable progress
* Encourage daily return
