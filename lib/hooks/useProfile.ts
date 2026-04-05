'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  preferred_language: string
  current_level: string
  internal_level: number
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }

    load()
  }, [])

  const updateProfile = useCallback(async (updates: Partial<Pick<Profile, 'preferred_language' | 'current_level' | 'internal_level'>>) => {
    if (!profile) return
    const supabase = createClient()

    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single()

    if (data) setProfile(data)
  }, [profile])

  return { profile, loading, updateProfile }
}
