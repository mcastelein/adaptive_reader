# TASKS.md – I CAN App (MVP Build Plan)

## Overview

This document defines the step-by-step tasks to build the MVP of the I CAN app. Claude should complete tasks sequentially and update this file as progress is made.

---

# PHASE 1 – PROJECT SETUP ✅

## 1. Initialize Project ✅

* Create Next.js app
* Set up TypeScript
* Install dependencies:

  * Tailwind CSS
  * Axios (or use fetch)

---

## 2. Project Structure ✅

Set up basic folders:

* /app (pages)
* /components
* /lib (utilities)
* /api (AI calls if needed)

---

## 3. Basic UI Setup ✅

* Set up Tailwind
* Create simple layout:

  * Header
  * Main content area
* Ensure mobile-first design

---

# PHASE 2 – CORE FEATURE: STORY GENERATION ✅

## 4. Create Home Page ✅

* Title: "I CAN"
* Button: "Generate Story"
* Level selector (dropdown or buttons)

---

## 5. Build Story Generation API ✅

Create API route:

POST /api/generate

### Input

* level
* topic (optional)

### Output

* story text

---

## 6. Integrate Story Generation ✅

* On button click:

  * call API
  * show loading state
  * display generated story

---

## 7. Story Display Component ✅

* Scrollable text
* Clean typography
* Mobile-friendly

---

# PHASE 3 – AUDIO (TTS) ✅

## 8. Build Audio Generation API ✅

POST /api/audio

### Input

* story text

### Output

* audio URL or file

---

## 9. Add Audio Player ✅

* "Play Audio" button
* Basic controls:

  * play / pause

---

# PHASE 4 – POLISH ✅

## 10. Loading States ✅

* Show spinner while generating story/audio

---

## 11. Error Handling ✅

* Show message if API fails

---

## 12. Basic Styling Improvements ✅

* Improve spacing
* Improve typography
* Make it feel clean and modern

---

# PHASE 5 – OPTIONAL ✅

## 13. Topic Selector ✅

* Dropdown with preset topics (Daily life, Travel, Food & cooking, Nature & animals, Business, Health & fitness, Technology, Culture & traditions)
* "Custom…" option reveals free-text input

---

## 14. Cache Stories ✅

* localStorage cache keyed by (level + topic)
* Cached stories load instantly with "↺ Regenerate" button to get a fresh one

---

# NON-TASKS (DO NOT BUILD YET)

* Pronunciation feedback
* Flashcards
* Authentication
* Streak system
* Payment system
* Mobile app version

---

# DEVELOPMENT RULES

* Complete tasks in order
* Keep implementations simple
* Avoid unnecessary complexity
* Ask for clarification if unclear
* Do NOT build extra features beyond this scope

---

# SUCCESS CRITERIA ✅

The MVP is complete when:

* User can generate a story ✅
* Story displays cleanly ✅
* User can play audio of the story ✅
* App works smoothly on mobile ✅

---

# NEXT STEPS AFTER MVP

* Add shadowing mode
* Add vocabulary features
* Add pronunciation feedback
* Add user accounts
