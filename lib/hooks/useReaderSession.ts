'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ReaderSession {
  id: string
  language: string
  level: string
  internal_level_start: number
  internal_level_end: number | null
  topic: string
  steps_completed: number
  quiz_correct: number
  quiz_total: number
  created_at: string
  ended_at: string | null
}

export function useReaderSession() {
  const [sessionId, setSessionId] = useState<string | null>(null)

  const createSession = useCallback(async (
    language: string,
    level: string,
    internalLevel: number,
    topic: string
  ): Promise<string | null> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from('reader_sessions')
      .insert({
        user_id: user.id,
        language,
        level,
        internal_level_start: internalLevel,
        topic,
      })
      .select()
      .single()

    if (data) {
      setSessionId(data.id)
      return data.id
    }
    return null
  }, [])

  const updateProgress = useCallback(async (updates: {
    steps_completed?: number
    quiz_correct?: number
    quiz_total?: number
    internal_level_end?: number
    ended_at?: string
  }) => {
    if (!sessionId) return
    const supabase = createClient()
    await supabase
      .from('reader_sessions')
      .update(updates)
      .eq('id', sessionId)
  }, [sessionId])

  const endSession = useCallback(async (internalLevelEnd: number) => {
    if (!sessionId) return
    const supabase = createClient()
    await supabase
      .from('reader_sessions')
      .update({
        internal_level_end: internalLevelEnd,
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
    setSessionId(null)
  }, [sessionId])

  return { sessionId, createSession, updateProgress, endSession }
}
