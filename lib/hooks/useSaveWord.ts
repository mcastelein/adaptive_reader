'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SaveWordParams {
  language: string
  word: string
  translation: string
  pinyin?: string
  source: 'reader' | 'conversation' | 'graded-input'
  cefr_level?: string
}

export function useSaveWord() {
  const saveWord = useCallback(async (params: SaveWordParams) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Upsert: if word already exists for this user+language, update source/level
    await supabase
      .from('vocabulary')
      .upsert(
        {
          user_id: user.id,
          language: params.language,
          word: params.word,
          translation: params.translation,
          pinyin: params.pinyin || null,
          source: params.source,
          cefr_level: params.cefr_level || null,
        },
        { onConflict: 'user_id,language,word' }
      )
  }, [])

  return { saveWord }
}
