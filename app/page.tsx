'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const FEATURES = [
  {
    name: 'Adaptive Reader',
    description: 'Read stories at your level',
    href: '/reader',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    available: true,
    accent: '#3b82f6',
    glow: 'rgba(59,130,246,0.55)',
  },
  {
    name: 'AI Conversation',
    description: 'Speak with an AI partner',
    href: '/conversation',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    available: true,
    accent: '#22d3ee',
    glow: 'rgba(34,211,238,0.55)',
  },
  {
    name: 'Flashcards',
    description: 'Spaced repetition review',
    href: '/flashcards',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
      </svg>
    ),
    available: false,
    accent: '#a78bfa',
    glow: 'rgba(167,139,250,0.55)',
  },
  {
    name: 'Graded News',
    description: 'Real content at your level',
    href: '/graded-input',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
      </svg>
    ),
    available: false,
    accent: '#fb923c',
    glow: 'rgba(251,146,60,0.55)',
  },
  {
    name: 'Pronunciation',
    description: 'Score your tones and speech',
    href: '/pronunciation',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
      </svg>
    ),
    available: false,
    accent: '#f472b6',
    glow: 'rgba(244,114,182,0.55)',
  },
]

export default function HomePage() {
  const [hovered, setHovered] = useState<number | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 py-14"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #0d1f4e 0%, #060b18 55%, #020408 100%)' }}
    >
      <div className="w-full max-w-xl">

        {/* Logo / header */}
        <div className="text-center mb-14">
          <div className="inline-block mb-4">
            <h1
              className="text-7xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #38bdf8 40%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 30px rgba(96,165,250,0.4))',
              }}
            >
              I CAN
            </h1>
          </div>
          <p className="text-slate-400 text-base tracking-wide">AI-powered language learning</p>
          {user && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="text-sm text-slate-400">
                {user.user_metadata?.full_name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-xs text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 px-3 py-1 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* 2-column feature grid */}
        <div className="grid grid-cols-2 gap-4">
          {FEATURES.map((f, i) => {
            const isHovered = hovered === i && f.available
            const isLast = i === FEATURES.length - 1 && FEATURES.length % 2 !== 0

            const card = (
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: isHovered
                    ? `linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)`
                    : `linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`,
                  borderColor: isHovered ? `${f.accent}55` : 'rgba(255,255,255,0.07)',
                  boxShadow: isHovered
                    ? `0 0 0 1px ${f.accent}40, 0 0 25px ${f.glow}, 0 0 60px ${f.glow.replace('0.55', '0.2')}`
                    : '0 0 0 1px rgba(255,255,255,0.06)',
                  transition: 'all 0.25s ease',
                }}
                className={`relative rounded-2xl border p-5 flex flex-col gap-4 ${
                  f.available ? 'cursor-pointer' : 'cursor-default'
                } ${isLast ? 'col-span-2' : ''}`}
              >
                {/* Icon circle */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${f.accent}25, ${f.accent}08)`,
                    boxShadow: isHovered ? `0 0 18px ${f.glow}` : 'none',
                    transition: 'box-shadow 0.25s ease',
                  }}
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                >
                  <span style={{ color: isHovered ? f.accent : `${f.accent}bb` }}>
                    {f.icon}
                  </span>
                </div>

                {/* Text */}
                <div>
                  <h2
                    className="text-sm font-semibold transition-colors duration-200"
                    style={{ color: isHovered ? '#f1f5f9' : '#cbd5e1' }}
                  >
                    {f.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.description}</p>
                </div>

                {/* Coming soon pill */}
                {!f.available && (
                  <span
                    className="absolute top-3.5 right-3.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.25)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    Soon
                  </span>
                )}

                {/* Arrow for available cards */}
                {f.available && (
                  <svg
                    className="absolute bottom-4 right-4 w-4 h-4 transition-all duration-200"
                    style={{
                      color: isHovered ? f.accent : 'rgba(255,255,255,0.15)',
                      transform: isHovered ? 'translateX(2px)' : 'none',
                    }}
                    fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                )}
              </div>
            )

            return f.available ? (
              <Link key={f.name} href={f.href} className={`block ${isLast ? 'col-span-2' : ''}`}>
                {card}
              </Link>
            ) : (
              <div key={f.name} className={`opacity-40 ${isLast ? 'col-span-2' : ''}`}>
                {card}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-700 text-xs mt-12 tracking-widest uppercase">
          Powered by Claude · OpenAI
        </p>
      </div>
    </main>
  )
}
