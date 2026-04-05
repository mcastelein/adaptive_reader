'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useProfile } from '@/lib/hooks/useProfile'
import { useConversationSessions, type ConversationSession } from '@/lib/hooks/useConversationSessions'
import { useSaveWord } from '@/lib/hooks/useSaveWord'

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS = [
  { value: 'A1', label: 'A1 – Beginner' },
  { value: 'A2', label: 'A2 – Elementary' },
  { value: 'B1', label: 'B1 – Intermediate' },
  { value: 'B2', label: 'B2 – Upper Intermediate' },
  { value: 'C1', label: 'C1 – Advanced' },
]

const LANGUAGES = [
  { value: 'Chinese', label: '中文', code: 'zh' },
  { value: 'Dutch', label: 'Nederlands', code: 'nl' },
  { value: 'French', label: 'Français', code: 'fr' },
  { value: 'Japanese', label: '日本語', code: 'ja' },
  { value: 'Korean', label: '한국어', code: 'ko' },
  { value: 'Spanish', label: 'Español', code: 'es' },
]

const TOPICS = [
  'Free conversation',
  'Ordering food',
  'Meeting someone new',
  'Asking for directions',
  'Shopping',
  'Daily routine',
  'Travel plans',
  'Weather',
]

const VOICE_MAP: Record<string, string> = {
  Chinese: 'nova',
  Dutch: 'nova',
  French: 'nova',
  Japanese: 'nova',
  Korean: 'nova',
  Spanish: 'nova',
  English: 'alloy',
}

const ACCENT = '#22d3ee'
const GLOW = 'rgba(34,211,238,0.55)'
const USER_ACCENT = '#818cf8'
const BG_STYLE = { background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #0d1f4e 0%, #060b18 55%, #020408 100%)' }

// ─── Types ────────────────────────────────────────────────────────────────────

interface Segment {
  text: string
  translation: string
}

interface Coaching {
  pinyin: string
  notes: string[]
  focus: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  translation: string
  segments?: Segment[]
  coaching?: Coaching | null
  audioUrl?: string
  // user messages only
  userTranslation?: string
  userSegments?: Segment[]
}

// ─── Hover-translation renderer (same pattern as reader) ──────────────────────

function SegmentedText({ segments, fallback, isUser, onWordClick }: { segments: Segment[]; fallback: string; isUser?: boolean; onWordClick?: (word: string, translation: string) => void }) {
  if (!segments || segments.length === 0) return <span>{fallback}</span>
  return (
    <>
      {segments.map((seg, i) =>
        seg.translation ? (
          <span key={i} className="relative group">
            <span
              className="cursor-pointer border-b border-dotted transition-colors"
              style={{ borderColor: isUser ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)' }}
              onClick={() => onWordClick?.(seg.text, seg.translation)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = isUser ? USER_ACCENT : ACCENT; e.currentTarget.style.color = isUser ? USER_ACCENT : ACCENT }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = isUser ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '' }}
            >
              {seg.text}
            </span>
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-xl border border-white/10">
              {seg.translation}
            </span>
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  )
}

// ─── Coaching panel ───────────────────────────────────────────────────────────

function CoachingPanel({ coaching }: { coaching: Coaching }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', borderColor: 'rgba(251,191,36,0.2)' }}>
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.15)' }}>
        <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
        <span className="text-sm font-semibold" style={{ color: '#fbbf24' }}>Pronunciation Coach</span>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Pinyin</p>
          <p className="text-sm font-mono leading-relaxed rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)', color: '#e2e8f0' }}>
            {coaching.pinyin}
          </p>
        </div>
        {coaching.notes?.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Feedback</p>
            <ul className="space-y-2">
              {coaching.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-0.5 flex-shrink-0" style={{ color: '#fbbf24' }}>•</span>
                  <span className="leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {coaching.focus && (
          <div className="rounded-xl px-3 py-3" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#fbbf24' }}>Focus on</p>
            <p className="text-sm leading-relaxed" style={{ color: '#fde68a' }}>{coaching.focus}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ConversationPage() {
  const { profile, updateProfile } = useProfile()
  const { sessions, loading: sessionsLoading, createSession, appendMessage } = useConversationSessions()
  const { saveWord } = useSaveWord()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [language, setLanguage] = useState('Chinese')
  const [level, setLevel] = useState('A1')

  // Load saved preferences from profile
  useEffect(() => {
    if (profile) {
      setLanguage(profile.preferred_language)
      setLevel(profile.current_level)
    }
  }, [profile])
  const [topic, setTopic] = useState(TOPICS[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [textInput, setTextInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState('')
  const [started, setStarted] = useState(false)
  const [micError, setMicError] = useState('')
  const [activeCoaching, setActiveCoaching] = useState<Coaching | null>(null)
  const [showCoachingMobile, setShowCoachingMobile] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // ── Audio playback ─────────────────────────────────────────────────────────

  async function playAudio(text: string): Promise<string | undefined> {
    try {
      const voice = VOICE_MAP[language] || 'alloy'
      const res = await fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      })
      if (!res.ok) return undefined
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      return new Promise<string>((resolve) => {
        const audio = new Audio(url)
        setIsPlaying(true)
        audio.onended = () => { setIsPlaying(false); resolve(url) }
        audio.onerror = () => { setIsPlaying(false); resolve(url) }
        audio.play()
      })
    } catch {
      return undefined
    }
  }

  // ── Send message ───────────────────────────────────────────────────────────

  async function sendMessage(userText: string, fromMic?: boolean) {
    const userMsg: Message = { role: 'user', content: userText, translation: '' }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setIsThinking(true)
    setError('')

    // Save user message to Supabase
    if (sessionId) {
      appendMessage(sessionId, { role: 'user', content: userText, translation: '' })
    }

    try {
      const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          language, level, topic,
          lastUserInput: fromMic ? userText : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Conversation failed')

      // Attach translation, segments, and coaching back onto the user message
      if (data.coaching || data.userTranslation) {
        setMessages((prev) =>
          prev.map((m, i) => i === prev.length - 1 ? {
            ...m,
            coaching: data.coaching ?? undefined,
            userTranslation: data.userTranslation ?? undefined,
            userSegments: data.userSegments ?? undefined,
          } : m)
        )
        if (data.coaching) {
          setActiveCoaching(data.coaching)
          setShowCoachingMobile(true)
        }
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply,
        translation: data.translation,
        segments: data.segments || [],
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsThinking(false)

      // Save assistant message to Supabase
      if (sessionId) {
        appendMessage(sessionId, { role: 'assistant', content: data.reply, translation: data.translation })
      }

      const audioUrl = await playAudio(data.reply)
      if (audioUrl) {
        setMessages((prev) =>
          prev.map((m, i) => i === prev.length - 1 ? { ...m, audioUrl } : m)
        )
      }
    } catch (err) {
      setIsThinking(false)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  // ── Microphone ─────────────────────────────────────────────────────────────

  async function startRecording() {
    setMicError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setIsThinking(true)
        try {
          const formData = new FormData()
          formData.append('audio', blob, 'recording.webm')
          const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          if (data.text.trim()) {
            setIsThinking(false)
            await sendMessage(data.text, true)
          } else {
            setIsThinking(false)
            setError("Couldn't hear that, try again")
          }
        } catch {
          setIsThinking(false)
          setError("Couldn't hear that, try again")
        }
      }
      mediaRecorder.start()
      setIsRecording(true)
    } catch {
      setMicError('Microphone access denied. Please allow mic access in your browser settings.')
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
    setIsRecording(false)
  }

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!textInput.trim() || isThinking || isPlaying) return
    const text = textInput.trim()
    setTextInput('')
    sendMessage(text, false)
  }

  async function handleStart() {
    setStarted(true)
    setMessages([])
    setActiveCoaching(null)
    setIsThinking(true)
    setError('')

    // Save language/level preference to profile
    updateProfile({ preferred_language: language, current_level: level })

    // Create a new conversation session in Supabase
    const newSessionId = await createSession(language, level, topic)
    setSessionId(newSessionId)

    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Please start the conversation with a greeting.' }],
          language, level, topic,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start')
      const greeting: Message = {
        role: 'assistant',
        content: data.reply,
        translation: data.translation,
        segments: data.segments || [],
      }
      setMessages([greeting])
      setIsThinking(false)

      // Save greeting to Supabase
      if (newSessionId) {
        appendMessage(newSessionId, { role: 'assistant', content: data.reply, translation: data.translation })
      }

      const audioUrl = await playAudio(data.reply)
      if (audioUrl) setMessages((prev) => prev.map((m, i) => i === prev.length - 1 ? { ...m, audioUrl } : m))
    } catch (err) {
      setIsThinking(false)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  // Resume a previous conversation
  function handleResume(session: ConversationSession) {
    setLanguage(session.language)
    setLevel(session.level)
    setTopic(session.topic)
    setSessionId(session.id)
    setMessages(session.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
      translation: m.translation,
    })))
    setStarted(true)
  }

  // ─── Setup screen ──────────────────────────────────────────────────────────

  if (!started) {
    return (
      <main className="min-h-screen flex flex-col items-center px-4 py-14" style={BG_STYLE}>
        <div className="w-full max-w-xl">
          <div className="flex items-center gap-3 mb-10">
            <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #67e8f9 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 20px rgba(34,211,238,0.3))' }}>AI Conversation</h1>
              <p className="text-slate-500 text-sm">Speak with an AI partner</p>
            </div>
          </div>
          <div className="rounded-2xl border p-6" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Language</label>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button key={lang.value} onClick={() => setLanguage(lang.value)}
                    className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={language === lang.value ? { background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`, color: '#fff', boxShadow: `0 0 20px ${GLOW}` } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 text-slate-200"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {LEVELS.map((l) => <option key={l.value} value={l.value} style={{ background: '#0f172a' }}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Topic</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 text-slate-200"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {TOPICS.map((t) => <option key={t} value={t} style={{ background: '#0f172a' }}>{t}</option>)}
              </select>
            </div>
            <button onClick={handleStart}
              className="w-full py-3 rounded-xl font-semibold text-white active:scale-95 transition-all"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`, boxShadow: `0 0 25px ${GLOW}` }}
            >
              Start Conversation
            </button>
            </div>
          </div>

          {/* Past conversations */}
          {!sessionsLoading && sessions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Recent Conversations</h3>
              <div className="space-y-2">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleResume(s)}
                    className="w-full text-left rounded-xl px-4 py-3 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${ACCENT}55`; e.currentTarget.style.boxShadow = `0 0 15px ${GLOW}` }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-slate-200">{s.topic}</span>
                        <span className="text-xs text-slate-500 ml-2">{s.language} · {s.level}</span>
                      </div>
                      <span className="text-xs text-slate-600">{s.message_count} msgs</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {new Date(s.updated_at).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    )
  }

  // ─── Conversation screen ───────────────────────────────────────────────────

  return (
    <main className="min-h-screen flex flex-col" style={BG_STYLE}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b px-4 py-3" style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { setStarted(false); setMessages([]); setError(''); setActiveCoaching(null) }}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h1 className="text-lg font-bold" style={{ color: ACCENT }}>Conversation</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: `${ACCENT}20`, color: ACCENT }}>{language}</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>{level}</span>
            {activeCoaching && (
              <button onClick={() => setShowCoachingMobile((v) => !v)}
                className="lg:hidden text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}
              >
                Coach {showCoachingMobile ? '▾' : '▸'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile coaching panel */}
      {activeCoaching && showCoachingMobile && (
        <div className="lg:hidden px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <CoachingPanel coaching={activeCoaching} />
        </div>
      )}

      {/* Body */}
      <div className="flex-1 flex gap-5 max-w-5xl mx-auto w-full px-4 py-4 items-start">

        {/* Chat */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="text-center">
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>{topic}</span>
          </div>

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[82%] rounded-2xl px-4 py-3" style={msg.role === 'assistant' ? { background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)', border: '1px solid rgba(255,255,255,0.08)' } : { background: `linear-gradient(135deg, ${USER_ACCENT}40, ${USER_ACCENT}20)`, border: `1px solid ${USER_ACCENT}50` }}>
                {/* Main text — both sides get hover translations */}
                <p className={`text-base leading-relaxed ${msg.role === 'assistant' ? 'text-slate-200' : 'text-slate-100'}`}>
                  {msg.role === 'assistant' && msg.segments?.length
                    ? <SegmentedText segments={msg.segments} fallback={msg.content} onWordClick={(word, translation) => saveWord({ language, word, translation, source: 'conversation', cefr_level: level })} />
                    : msg.role === 'user' && msg.userSegments?.length
                    ? <SegmentedText segments={msg.userSegments} fallback={msg.content} isUser onWordClick={(word, translation) => saveWord({ language, word, translation, source: 'conversation', cefr_level: level })} />
                    : msg.content
                  }
                </p>
                {/* English translation */}
                {(msg.translation || msg.userTranslation) && (
                  <p className="text-xs mt-1.5 leading-relaxed text-slate-500">
                    {msg.role === 'assistant' ? msg.translation : msg.userTranslation}
                  </p>
                )}
                {/* Coaching badge on user mic messages */}
                {msg.role === 'user' && msg.coaching && (
                  <button
                    onClick={() => { setActiveCoaching(msg.coaching!); setShowCoachingMobile(true) }}
                    className="mt-2 text-xs flex items-center gap-1 font-medium transition-colors"
                    style={{ color: '#fbbf24' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                    </svg>
                    Pronunciation tips
                  </button>
                )}
                {/* Replay for assistant */}
                {msg.role === 'assistant' && msg.audioUrl && (
                  <button onClick={() => playAudio(msg.content)}
                    className="mt-2 text-xs flex items-center gap-1 transition-colors"
                    style={{ color: ACCENT }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                    </svg>
                    Replay
                  </button>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: ACCENT, animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: ACCENT, animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: ACCENT, animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Desktop coaching panel — sticky right column */}
        <div className="hidden lg:block w-72 flex-shrink-0 sticky top-[65px]">
          {activeCoaching ? (
            <CoachingPanel coaching={activeCoaching} />
          ) : (
            <div className="rounded-2xl border p-5 text-center" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(251,191,36,0.1)' }}>
                <svg className="w-5 h-5" style={{ color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-300 mb-1">Pronunciation Coach</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use the mic to speak — coaching tips will appear here after each turn.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error bar */}
      {(error || micError) && (
        <div className="px-4 pb-2 max-w-5xl mx-auto w-full">
          <div className="text-sm px-4 py-2 rounded-xl flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span>{micError || error}</span>
            {error && !micError && (
              <button onClick={() => setError('')} className="ml-2 transition-colors" style={{ color: '#f87171' }}>Dismiss</button>
            )}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="sticky bottom-0 border-t px-4 py-3" style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <form onSubmit={handleTextSubmit} className="flex-1 flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`Type in ${language}…`}
              disabled={isThinking || isPlaying}
              className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 text-slate-200 placeholder-slate-600 disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button type="submit" disabled={!textInput.trim() || isThinking || isPlaying}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`, boxShadow: textInput.trim() ? `0 0 15px ${GLOW}` : 'none' }}
            >
              Send
            </button>
          </form>
          <button
            onClick={() => isRecording ? stopRecording() : startRecording()}
            disabled={isThinking || isPlaying}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
            style={isRecording ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', boxShadow: '0 0 20px rgba(239,68,68,0.5)' } : { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  )
}
