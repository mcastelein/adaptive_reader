'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useProfile } from '@/lib/hooks/useProfile'
import { useReaderSession } from '@/lib/hooks/useReaderSession'
import { useSaveWord } from '@/lib/hooks/useSaveWord'

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS = [
  { value: 'A1', label: 'A1 – Beginner' },
  { value: 'A2', label: 'A2 – Elementary' },
  { value: 'B1', label: 'B1 – Intermediate' },
  { value: 'B2', label: 'B2 – Upper Intermediate' },
  { value: 'C1', label: 'C1 – Advanced' },
]

const PRESET_TOPICS = [
  'Daily life',
  'Travel',
  'Food & cooking',
  'Mystery',
  'Fantasy',
  'School / Work',
  'Comedy',
  'Custom…',
]

const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Chinese', label: '中文' },
  { value: 'French', label: 'Français' },
  { value: 'Spanish', label: 'Español' },
]

const FREE_STEPS = 10

const ACCENT = '#3b82f6'
const GLOW = 'rgba(59,130,246,0.55)'

// ─── Internal level system ───────────────────────────────────────────────────

const CEFR_MIN: Record<string, number> = {
  A1: 5,
  A2: 15,
  B1: 30,
  B2: 50,
  C1: 70,
  C2: 85,
}

function getInternalLevel(cefr: string, sublevel: number): number {
  return (CEFR_MIN[cefr] ?? 10) + (sublevel - 1)
}

function getCefrLabel(n: number): string {
  if (n <= 14) return 'A1'
  if (n <= 24) return 'A2'
  if (n <= 44) return 'B1'
  if (n <= 64) return 'B2'
  if (n <= 84) return 'C1'
  return 'C2'
}

// ─── Shared dark theme helpers ───────────────────────────────────────────────

const BG_STYLE = { background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #0d1f4e 0%, #060b18 55%, #020408 100%)' }

function GlassCard({ children, className = '', glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-6 ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        borderColor: glow ? `${ACCENT}40` : 'rgba(255,255,255,0.07)',
        boxShadow: glow ? `0 0 25px ${GLOW}, 0 0 60px rgba(59,130,246,0.15)` : '0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      {children}
    </div>
  )
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface HistoryEntry {
  story: string
  choice: string
  summary: string
}

type AppMode = 'setup' | 'reading' | 'paywall'
type DifficultyAdjust = 'easier' | 'same' | 'harder'

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home() {
  const { profile, updateProfile } = useProfile()
  const { createSession, updateProgress, endSession } = useReaderSession()
  const { saveWord } = useSaveWord()
  const [language, setLanguage] = useState('English')
  const [level, setLevel] = useState('B1')

  // Load saved preferences from profile
  useEffect(() => {
    if (profile) {
      setLanguage(profile.preferred_language)
      setLevel(profile.current_level)
    }
  }, [profile])
  const [sublevel] = useState(1)
  const [selectedTopic, setSelectedTopic] = useState(PRESET_TOPICS[0])
  const [customTopic, setCustomTopic] = useState('')

  const [mode, setMode] = useState<AppMode>('setup')

  const [internalLevel, setInternalLevel] = useState(30)
  const [currentStory, setCurrentStory] = useState('')
  const [currentChoices, setCurrentChoices] = useState<string[]>([])
  const [currentSummary, setCurrentSummary] = useState('')
  const [storyHistory, setStoryHistory] = useState<HistoryEntry[]>([])
  const [stepCount, setStepCount] = useState(0)
  const [difficultyAdjust, setDifficultyAdjust] = useState<DifficultyAdjust>('same')

  const [segments, setSegments] = useState<{ text: string; translation: string }[]>([])

  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState<string[]>([])
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [quizAnswered, setQuizAnswered] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isCustom = selectedTopic === 'Custom…'
  const topic = isCustom ? customTopic : selectedTopic
  const canGenerate = topic.trim().length > 0

  // ── Core generation function ─────────────────────────────────────────────

  async function generateScene(choice?: string, overrideLevel?: number) {
    setIsLoading(true)
    setError('')

    const baseLevel = overrideLevel ?? internalLevel
    let nextLevel = baseLevel
    if (choice) {
      if (difficultyAdjust === 'easier') nextLevel = Math.max(1, baseLevel - 2)
      if (difficultyAdjust === 'harder') nextLevel = Math.min(100, baseLevel + 2)
    }

    const newStepCount = stepCount + 1
    const historyToSend = storyHistory.slice(-5)
    const runningSummary = storyHistory.slice(-5).map((h) => h.summary).join(' ')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language, level, sublevel, topic,
          internalLevel: nextLevel, choice,
          storyHistory: historyToSend, runningSummary,
          stepNumber: newStepCount,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      if (choice && currentStory) {
        setStoryHistory((prev) =>
          [...prev, { story: currentStory, choice, summary: currentSummary }].slice(-5)
        )
      }

      setCurrentStory(data.story)
      setCurrentChoices(data.choices)
      setCurrentSummary(data.summary)
      setSegments(data.segments || [])
      setQuestion(data.question)
      setAnswers(data.answers)
      setCorrectAnswer(data.correctAnswer)
      setSelectedAnswer(null)
      setQuizAnswered(false)
      setInternalLevel(nextLevel)
      setStepCount(newStepCount)
      setDifficultyAdjust('same')
      setMode('reading')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleStart() {
    const startLevel = getInternalLevel(level, sublevel)
    setInternalLevel(startLevel)
    setStoryHistory([])
    setStepCount(0)
    setCurrentStory('')
    setCurrentSummary('')

    // Save language/level preference to profile
    updateProfile({ preferred_language: language, current_level: level })

    // Create reader session in Supabase
    const topic = isCustom ? customTopic : selectedTopic
    createSession(language, level, startLevel, topic)

    generateScene(undefined, startLevel)
  }

  function handleChoice(choice: string) {
    if (stepCount >= FREE_STEPS) {
      endSession(internalLevel)
      setMode('paywall')
      return
    }
    generateScene(choice)
  }

  function handleQuizAnswer(index: number) {
    setSelectedAnswer(index)
    setQuizAnswered(true)
    const isCorrect = index === correctAnswer
    if (isCorrect) {
      setInternalLevel((prev) => Math.min(100, prev + 2))
    } else {
      setInternalLevel((prev) => Math.max(1, prev - 10))
    }

    // Save quiz + step progress to Supabase
    updateProgress({
      steps_completed: stepCount,
      quiz_total: (quizAnswered ? 0 : 1) + stepCount, // approximate running total
      quiz_correct: isCorrect ? 1 : 0,
    })
  }

  function handleRestart() {
    endSession(internalLevel)
    setMode('setup')
    setCurrentStory('')
    setCurrentChoices([])
    setCurrentSummary('')
    setStoryHistory([])
    setStepCount(0)
    setDifficultyAdjust('same')
    setSegments([])
    setQuestion('')
    setAnswers([])
    setSelectedAnswer(null)
    setQuizAnswered(false)
    setError('')
  }

  // ── Render: Setup screen ─────────────────────────────────────────────────

  if (mode === 'setup') {
    return (
      <main className="min-h-screen flex flex-col items-center px-4 py-14" style={BG_STYLE}>
        <div className="w-full max-w-xl">
          {/* Back + header */}
          <div className="flex items-center gap-3 mb-10">
            <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div>
              <h1
                className="text-3xl font-black tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.3))',
                }}
              >
                Adaptive Reader
              </h1>
              <p className="text-slate-500 text-sm">Read stories at your level</p>
            </div>
          </div>

          <GlassCard>
            <div className="space-y-5">
              {/* Language */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Language</label>
                <div className="flex gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => setLanguage(lang.value)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={language === lang.value ? {
                        background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`,
                        color: '#fff',
                        boxShadow: `0 0 20px ${GLOW}`,
                      } : {
                        background: 'rgba(255,255,255,0.05)',
                        color: '#94a3b8',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 text-slate-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {LEVELS.map((l) => (
                    <option key={l.value} value={l.value} style={{ background: '#0f172a' }}>{l.label}</option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 text-slate-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {PRESET_TOPICS.map((t) => (
                    <option key={t} value={t} style={{ background: '#0f172a' }}>{t}</option>
                  ))}
                </select>
              </div>

              {isCustom && (
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && canGenerate && handleStart()}
                  placeholder="Enter your topic…"
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 text-slate-200 placeholder-slate-600"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  autoFocus
                />
              )}

              <button
                onClick={handleStart}
                disabled={isLoading || !canGenerate}
                className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`,
                  boxShadow: `0 0 25px ${GLOW}`,
                }}
              >
                {isLoading ? 'Generating…' : 'Start Story'}
              </button>
            </div>
          </GlassCard>

          {error && (
            <p className="mt-4 text-center text-red-400 text-sm">{error}</p>
          )}
        </div>
      </main>
    )
  }

  // ── Render: Paywall screen ───────────────────────────────────────────────

  if (mode === 'paywall') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-14" style={BG_STYLE}>
        <div className="w-full max-w-xl text-center">
          <h1
            className="text-5xl font-black tracking-tight mb-6"
            style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.3))',
            }}
          >
            I CAN
          </h1>
          <GlassCard glow>
            <div className="py-2">
              <h2 className="text-xl font-bold text-slate-100 mb-2">You&apos;ve reached the free limit</h2>
              <p className="text-slate-400 text-sm mb-6">
                You&apos;ve used all {FREE_STEPS} free story steps. Subscribe to keep reading and level up your language skills.
              </p>
              <button
                disabled
                className="w-full py-3 rounded-xl font-semibold text-white opacity-40 cursor-not-allowed mb-3"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)` }}
              >
                Subscribe — Coming Soon
              </button>
              <button
                onClick={handleRestart}
                className="w-full py-3 rounded-xl font-semibold text-slate-300 transition-colors hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Start a new story
              </button>
            </div>
          </GlassCard>
        </div>
      </main>
    )
  }

  // ── Render: Reading screen ───────────────────────────────────────────────

  const cefrLabel = getCefrLabel(internalLevel)
  const stepsLeft = FREE_STEPS - stepCount

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10" style={BG_STYLE}>
      <div className="w-full max-w-xl">

        {/* Header bar */}
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            I CAN
          </h1>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{ background: `${ACCENT}20`, color: ACCENT }}
            >
              {language}
            </span>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
            >
              Level {internalLevel}
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {cefrLabel} range
            </span>
          </div>
        </div>

        {/* Step counter */}
        <div className="flex items-center gap-1.5 mb-5">
          {Array.from({ length: FREE_STEPS }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{
                background: i < stepCount ? ACCENT : 'rgba(255,255,255,0.08)',
                boxShadow: i < stepCount ? `0 0 6px ${GLOW}` : 'none',
              }}
            />
          ))}
          <span className="text-xs text-slate-600 ml-1 whitespace-nowrap">
            {stepsLeft} left
          </span>
        </div>

        {/* Story card */}
        <GlassCard className="mb-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <div
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-3"
                style={{ borderColor: `${ACCENT} transparent ${ACCENT}40 ${ACCENT}40` }}
              />
              <span className="text-sm">Generating next scene…</span>
            </div>
          ) : (
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-base">
              {segments.length > 0
                ? segments.map((seg, i) =>
                    seg.translation ? (
                      <span key={i} className="relative group">
                        <span
                          className="cursor-pointer border-b border-dotted transition-colors"
                          style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '' }}
                          onClick={() => saveWord({
                            language,
                            word: seg.text,
                            translation: seg.translation,
                            source: 'reader',
                            cefr_level: level,
                          })}
                        >
                          {seg.text}
                        </span>
                        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xl border border-white/10">
                          {seg.translation}
                        </span>
                      </span>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    )
                  )
                : currentStory}
            </p>
          )}
        </GlassCard>

        {/* Comprehension question */}
        {!isLoading && question && (
          <GlassCard className="mb-5">
            <p className="text-[10px] font-semibold text-slate-500 mb-3 uppercase tracking-widest">Comprehension Check</p>
            <p className="text-slate-200 font-medium mb-4">{question}</p>
            <div className="space-y-2">
              {answers.map((answer, i) => {
                let bg = 'rgba(255,255,255,0.04)'
                let border = 'rgba(255,255,255,0.08)'
                let textColor = '#cbd5e1'
                if (quizAnswered) {
                  if (i === correctAnswer) {
                    bg = 'rgba(34,197,94,0.12)'; border = 'rgba(34,197,94,0.4)'; textColor = '#86efac'
                  } else if (i === selectedAnswer) {
                    bg = 'rgba(239,68,68,0.12)'; border = 'rgba(239,68,68,0.4)'; textColor = '#fca5a5'
                  } else {
                    bg = 'rgba(255,255,255,0.02)'; textColor = '#475569'
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={() => !quizAnswered && handleQuizAnswer(i)}
                    disabled={quizAnswered}
                    className="w-full text-left rounded-xl px-4 py-3 text-sm transition-all disabled:cursor-default"
                    style={{ background: bg, border: `1px solid ${border}`, color: textColor }}
                  >
                    <span className="font-semibold mr-2" style={{ color: quizAnswered ? textColor : ACCENT }}>
                      {['1', '2', '3', '4'][i]}.
                    </span>
                    {answer}
                  </button>
                )
              })}
            </div>
            {quizAnswered && (
              <p className={`mt-3 text-sm font-medium ${selectedAnswer === correctAnswer ? 'text-green-400' : 'text-red-400'}`}>
                {selectedAnswer === correctAnswer
                  ? `Correct! Level +2 → ${internalLevel}`
                  : `Incorrect! Level -10 → ${internalLevel}`}
              </p>
            )}
          </GlassCard>
        )}

        {/* Choices */}
        {!isLoading && quizAnswered && currentChoices.length > 0 && (
          <div className="space-y-2.5 mb-5">
            {currentChoices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleChoice(choice)}
                disabled={isLoading}
                className="w-full text-left rounded-xl px-4 py-3.5 text-sm active:scale-[0.99] transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#cbd5e1',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${ACCENT}55`
                  e.currentTarget.style.boxShadow = `0 0 15px ${GLOW}`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span className="font-semibold mr-2" style={{ color: ACCENT }}>{['A', 'B', 'C'][i]}.</span>
                {choice}
              </button>
            ))}
          </div>
        )}

        {/* Difficulty controls */}
        {!isLoading && (
          <GlassCard className="mb-4 !p-4">
            <p className="text-[10px] font-semibold text-slate-500 mb-2.5 uppercase tracking-widest">Next scene difficulty</p>
            <div className="flex gap-2">
              {(['easier', 'same', 'harder'] as DifficultyAdjust[]).map((opt) => {
                const isActive = difficultyAdjust === opt
                const colors: Record<DifficultyAdjust, { bg: string; text: string }> = {
                  easier: { bg: 'rgba(34,197,94,0.15)', text: '#86efac' },
                  same: { bg: `${ACCENT}20`, text: ACCENT },
                  harder: { bg: 'rgba(251,146,60,0.15)', text: '#fdba74' },
                }
                return (
                  <button
                    key={opt}
                    onClick={() => setDifficultyAdjust(opt)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                    style={isActive ? {
                      background: colors[opt].bg,
                      color: colors[opt].text,
                    } : {
                      background: 'rgba(255,255,255,0.04)',
                      color: '#64748b',
                    }}
                  >
                    {opt === 'easier' ? '↓ Easier' : opt === 'harder' ? '↑ Harder' : '= Same'}
                  </button>
                )
              })}
            </div>
          </GlassCard>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-400 text-sm mb-4">{error}</p>
        )}

        {/* Footer actions */}
        <button
          onClick={handleRestart}
          className="w-full text-sm text-slate-600 hover:text-slate-400 py-2 transition-colors"
        >
          ← Start over
        </button>
      </div>
    </main>
  )
}
