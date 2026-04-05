'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

const LEVELS = [
  { value: 'A1', label: 'A1 – Beginner' },
  { value: 'A2', label: 'A2 – Elementary' },
  { value: 'B1', label: 'B1 – Intermediate' },
  { value: 'B2', label: 'B2 – Upper Intermediate' },
  { value: 'C1', label: 'C1 – Advanced' },
]

interface Segment {
  text: string
  translation: string
}

export default function GradedInputPage() {
  const [level, setLevel] = useState('B1')
  const [title, setTitle] = useState('')
  const [originalTitle, setOriginalTitle] = useState('')
  const [segments, setSegments] = useState<Segment[]>([])
  const [rewritten, setRewritten] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)

  async function fetchArticle() {
    setIsLoading(true)
    setError('')
    setTitle('')
    setOriginalTitle('')
    setSegments([])
    setRewritten('')
    stopAudio()

    try {
      const res = await fetch('/api/graded-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLevel: level, language: 'Chinese' }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch article')

      setTitle(data.title)
      setOriginalTitle(data.originalTitle || '')
      setSegments(data.segments || [])
      setRewritten(data.rewritten || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
    setIsPlaying(false)
  }

  async function handleListen() {
    if (isPlaying) {
      stopAudio()
      return
    }

    setAudioLoading(true)
    try {
      const res = await fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rewritten }),
      })

      if (!res.ok) throw new Error('Audio generation failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      audioUrlRef.current = url

      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => {
        setIsPlaying(false)
      }
      await audio.play()
      setIsPlaying(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audio error')
    } finally {
      setAudioLoading(false)
    }
  }

  const hasArticle = title && segments.length > 0

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-2xl font-bold text-orange-500 tracking-tight hover:opacity-80 transition-opacity">
            I CAN
          </Link>
          <span className="text-sm font-medium text-gray-500">Graded News</span>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">CEFR Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchArticle}
              disabled={isLoading}
              className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-orange-600 active:scale-95 transition-all whitespace-nowrap"
            >
              {isLoading ? 'Loading…' : hasArticle ? 'New Article' : 'Get Article'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2.5">
            Source: Wikipedia Chinese — rewritten at your level
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-sm">Fetching &amp; rewriting article…</span>
            </div>
          </div>
        )}

        {/* Article display */}
        {!isLoading && hasArticle && (
          <>
            {/* Title */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">{title}</h2>
              {originalTitle && (
                <p className="text-xs text-gray-400">
                  Original: {originalTitle}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs bg-orange-50 text-orange-600 font-semibold px-2 py-1 rounded-lg">
                  {level}
                </span>
                <span className="text-xs text-gray-400">Chinese</span>
              </div>
            </div>

            {/* Article text with hover translations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
              <p className="text-gray-800 leading-relaxed text-base">
                {segments.map((seg, i) =>
                  seg.translation ? (
                    <span key={i} className="relative group">
                      <span className="cursor-pointer border-b border-dotted border-gray-300 hover:border-orange-400 hover:text-orange-600 transition-colors">
                        {seg.text}
                      </span>
                      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                        {seg.translation}
                      </span>
                    </span>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  )
                )}
              </p>
            </div>

            {/* Listen button */}
            <button
              onClick={handleListen}
              disabled={audioLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all mb-4 ${
                isPlaying
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-600'
              } disabled:opacity-50`}
            >
              {audioLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  Generating audio…
                </>
              ) : isPlaying ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                  Stop
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Listen
                </>
              )}
            </button>
          </>
        )}

        {/* Empty state */}
        {!isLoading && !hasArticle && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <p className="text-gray-400 text-sm">
              Select your level and tap &quot;Get Article&quot; to read real Chinese content rewritten for your level.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-500 text-sm mt-4">{error}</p>
        )}
      </div>
    </main>
  )
}
