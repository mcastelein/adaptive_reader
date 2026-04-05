# QA Audit: Conversation Feature

**Date:** 2026-04-05
**Status:** Implemented — 2 issues found, 1 critical

---

## Checklist

### Spec Compliance

- [x] Messages display target language (large) + English translation (small, muted)
- [x] User messages right-aligned, AI messages left-aligned
- [x] Only AI's Chinese text sent to TTS — English translation never sent to audio
- [x] Audio auto-plays after each AI response
- [x] Mic button triggers MediaRecorder → blob → /api/transcribe
- [x] Text input fallback exists
- [x] Language selector and level selector present
- [x] Typing indicator shown while waiting for AI response

### API Correctness

- [x] /api/transcribe accepts FormData with `audio` field
- [ ] /api/transcribe passes language hint to Whisper — **FAIL, see Issue #1**
- [x] /api/conversation returns {reply, translation} JSON
- [x] /api/audio accepts optional `voice` param, defaults appropriately
- [x] All routes return 400 for missing inputs, 500 for API errors

### Edge Cases

- [x] Mic permission denied → shows instructions message
- [x] Empty transcription → shows "Couldn't hear that, try again"
- [ ] /api/conversation fails mid-conversation → **FAIL, see Issue #2**
- [x] Audio playback fails → handled silently, doesn't block conversation
- [x] Chat scrolls to bottom on new messages

### TypeScript

- [x] No `any` types
- [x] Message interface matches spec

---

## Issues

### #1 — `/api/transcribe` language hint hardcoded to `'zh'`
- **File:** `app/api/transcribe/route.ts`, line 17
- **Spec says:** "Pass `language` hint if known (improves accuracy for Chinese)" — should accept language from the request
- **Actual:** `language: 'zh'` is hardcoded. The frontend doesn't send a `language` field in the FormData either. Switching to French or Spanish would still hint Whisper to expect Chinese, degrading transcription accuracy.
- **Severity:** Critical
- **Fix:** Read optional `language` field from FormData, map language name to ISO code, pass to Whisper. Update frontend `startRecording()` to append language to FormData.

### #2 — No retry button on conversation failure
- **File:** `app/(features)/conversation/page.tsx`, lines 456–472
- **Spec says:** "Conversation API fails → show 'Something went wrong' with retry button"
- **Actual:** Shows error with a "Dismiss" button only. User has no way to re-send the failed message without retyping it.
- **Severity:** Minor
- **Fix:** Track the last failed user message. Show a "Retry" button in the error bar that re-calls `sendMessage()` with the failed text.

---

## Files to Modify

| Action | File | Issue |
|--------|------|-------|
| **Modify** | `app/api/transcribe/route.ts` | #1 — accept language param, map to ISO code |
| **Modify** | `app/(features)/conversation/page.tsx` | #1 — send language in FormData; #2 — add retry button |
