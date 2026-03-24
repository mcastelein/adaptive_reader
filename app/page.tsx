'use client'

import { useState } from 'react'

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
  'Nature & animals',
  'Business',
  'Health & fitness',
  'Technology',
  'Culture & traditions',
  'Custom…',
]

const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Chinese', label: '中文' },
]

const SUBLEVELS = Array.from({ length: 10 }, (_, i) => i + 1)

// Cache helpers — keyed by language + level + sublevel + topic
const CACHE_PREFIX = 'ican_story_'

function getCached(language: string, level: string, sublevel: number, topic: string): string | null {
  try {
    const key = `${CACHE_PREFIX}${language}_${level}_${sublevel}_${topic.toLowerCase().trim()}`
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function setCache(language: string, level: string, sublevel: number, topic: string, story: string) {
  try {
    const key = `${CACHE_PREFIX}${language}_${level}_${sublevel}_${topic.toLowerCase().trim()}`
    localStorage.setItem(key, story)
  } catch {
    // localStorage unavailable — fail silently
  }
}

export default function Home() {
  const [language, setLanguage] = useState('English')
  const [level, setLevel] = useState('B1')
  const [sublevel, setSublevel] = useState(1)
  const [selectedTopic, setSelectedTopic] = useState(PRESET_TOPICS[0])
  const [customTopic, setCustomTopic] = useState('')
  const [story, setStory] = useState('')
  const [fromCache, setFromCache] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')
  const [loadingStory, setLoadingStory] = useState(false)
  const [loadingAudio, setLoadingAudio] = useState(false)
  const [error, setError] = useState('')

  const isCustom = selectedTopic === 'Custom…'
  const topic = isCustom ? customTopic : selectedTopic
  const canGenerate = topic.trim().length > 0

  async function generateStory(forceNew = false) {
    if (!canGenerate) return
    setLoadingStory(true)
    setStory('')
    setAudioUrl('')
    setFromCache(false)
    setError('')

    if (!forceNew) {
      const cached = getCached(language, level, sublevel, topic)
      if (cached) {
        setStory(cached)
        setFromCache(true)
        setLoadingStory(false)
        return
      }
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, level, sublevel, topic }),
      })
      if (!res.ok) throw new Error('Failed to generate story')
      const data = await res.json()
      setStory(data.story)
      setCache(language, level, sublevel, topic, data.story)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoadingStory(false)
    }
  }

  async function generateAudio() {
    if (!story) return
    setLoadingAudio(true)
    setError('')
    try {
      const res = await fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: story }),
      })
      if (!res.ok) throw new Error('Failed to generate audio')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
    } catch {
      setError('Could not generate audio. Please try again.')
    } finally {
      setLoadingAudio(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-blue-600 tracking-tight">I CAN</h1>
          <p className="text-gray-500 mt-2">Read stories at your level</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

          {/* Language toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    language === lang.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Sub-level 1–10 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub-level
              <span className="ml-2 text-xs text-gray-400 font-normal">(vocabulary range within {level})</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {SUBLEVELS.map((n) => (
                <button
                  key={n}
                  onClick={() => setSublevel(n)}
                  className={`py-2 rounded-xl text-sm font-semibold transition-colors ${
                    sublevel === n
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PRESET_TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {isCustom && (
            <div>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateStory()}
                placeholder="Enter your topic…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          )}

          <button
            onClick={() => generateStory()}
            disabled={loadingStory || !canGenerate}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-95 transition-all"
          >
            {loadingStory ? 'Generating…' : 'Generate Story'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-4 text-center text-red-500 text-sm">{error}</p>
        )}

        {/* Story card */}
        {story && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-500">
                {language} · {level}.{sublevel} · {topic}
              </span>
              {fromCache && (
                <button
                  onClick={() => generateStory(true)}
                  className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
                  title="Generate a fresh story"
                >
                  ↺ Regenerate
                </button>
              )}
            </div>

            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">{story}</p>

            <div className="mt-5 pt-4 border-t border-gray-100">
              {!audioUrl ? (
                <button
                  onClick={generateAudio}
                  disabled={loadingAudio}
                  className="flex items-center gap-2 text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {loadingAudio ? '🎵 Generating audio…' : '🔊 Listen to story'}
                </button>
              ) : (
                <audio controls src={audioUrl} className="w-full" autoPlay />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
