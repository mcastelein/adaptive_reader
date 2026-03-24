# TECH_STACK.md – I CAN App (Web-First, Mobile-Friendly)

## Overview

This document defines the technical architecture for the I CAN app, starting as a web application that is fully mobile-friendly. The goal is fast iteration, simple deployment, and easy transition to mobile later.

---

# HIGH-LEVEL ARCHITECTURE

Frontend (Next.js Web App)
↓
Backend (API routes or server functions)
↓
AI Services (Text, Audio, Speech)

---

# FRONTEND + BACKEND (COMBINED)

## Framework

* Next.js (React)

## Why

* Frontend and backend in one project
* Easy deployment (Vercel)
* Fast development with Claude
* Built-in API routes
* Mobile-friendly by default (responsive design)

---

## Responsibilities

### Frontend

* UI and navigation
* Display stories, audio player, flashcards
* Handle user input (level, topic)
* Mobile-first responsive design

### Backend (Next.js API routes)

* Handle AI requests
* Generate stories
* Generate audio
* Manage caching
* Enforce usage limits

---

## Key Libraries

* React
* Next.js App Router
* Tailwind CSS (UI styling)
* Axios or fetch (API calls)
* Audio player (HTML5 audio)

---

# AI SERVICES

## 1. Text Generation (Stories)

Purpose:

* Generate personalized stories

Input:

* level
* topic

Output:

* story text

---

## 2. Text-to-Speech (TTS)

Purpose:

* Convert story into audio

Output:

* audio file or URL

---

## 3. Speech-to-Text (V2)

Purpose:

* Analyze pronunciation

(Not required for MVP)

---

# DATA STORAGE

## V1 (Minimal)

* No database required initially

---

## Optional (recommended early)

* Supabase (Postgres + Auth)

---

## Data to store (when added)

* user level
* daily usage count
* streak data

---

# CACHING (CRITICAL)

## Why

Reduce AI costs

---

## Strategy

* Cache stories:

  * key = (level + topic)
* Cache audio:

  * reuse generated files

---

# AUTHENTICATION

## V1

* No login required

## V2

* Add login via Supabase

---

# DEPLOYMENT

## Platform

* Vercel

---

## Flow

* Push to GitHub
* Vercel auto-deploys
* App live instantly

---

# ENVIRONMENT VARIABLES

Store:

* AI API keys
* database credentials (if used)

---

# ERROR HANDLING

* Gracefully handle failed AI calls
* Show user-friendly messages
* Avoid breaking UI

---

# RESPONSIVE DESIGN

## Requirement

App must work well on:

* iPhone screens
* desktop

---

## Approach

* Mobile-first design
* Use Tailwind responsive utilities

---

# SCALABILITY (FUTURE)

* Move heavy logic to separate backend if needed
* Add rate limiting
* Add queue system for AI calls

---

# DEVELOPMENT PRINCIPLES

* Build fast, iterate quickly
* Keep everything in one repo (Next.js)
* Avoid over-engineering
* Focus on core learning loop

---

# MVP PRIORITY

Build ONLY:

1. Story generation
2. Story display UI
3. Audio playback

Everything else later
