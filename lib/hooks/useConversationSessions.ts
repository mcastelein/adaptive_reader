'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ConversationSession {
  id: string
  language: string
  level: string
  topic: string
  messages: Array<{ role: string; content: string; translation: string }>
  message_count: number
  created_at: string
  updated_at: string
}

export function useConversationSessions() {
  const [sessions, setSessions] = useState<ConversationSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20)

    if (data) setSessions(data)
    setLoading(false)
  }

  const createSession = useCallback(async (language: string, level: string, topic: string): Promise<string | null> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('conversation_sessions')
      .insert({
        user_id: user.id,
        language,
        level,
        topic,
        messages: [],
        message_count: 0,
      })
      .select()
      .single()

    if (error || !data) return null
    setSessions((prev) => [data, ...prev])
    return data.id
  }, [])

  const appendMessage = useCallback(async (
    sessionId: string,
    message: { role: string; content: string; translation: string }
  ) => {
    const supabase = createClient()

    // Fetch current messages to append
    const { data: current } = await supabase
      .from('conversation_sessions')
      .select('messages, message_count')
      .eq('id', sessionId)
      .single()

    if (!current) return

    const updatedMessages = [...(current.messages as ConversationSession['messages']), message]

    await supabase
      .from('conversation_sessions')
      .update({
        messages: updatedMessages,
        message_count: current.message_count + 1,
      })
      .eq('id', sessionId)
  }, [])

  return { sessions, loading, createSession, appendMessage, reload: loadSessions }
}
