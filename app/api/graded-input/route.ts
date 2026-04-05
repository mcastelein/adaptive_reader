import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

interface WikiFeatured {
  tfa?: { title: string; extract: string }
  mostread?: { articles: { title: string; extract: string }[] }
}

async function fetchWikipediaContent(): Promise<{ title: string; text: string }> {
  const today = new Date()
  const url = `https://zh.wikipedia.org/api/rest_v1/feed/featured/${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'ICan-LanguageLearning/1.0' },
  })

  if (!res.ok) {
    throw new Error(`Wikipedia API returned ${res.status}`)
  }

  const data: WikiFeatured = await res.json()

  // Try featured article first
  if (data.tfa?.extract) {
    return { title: data.tfa.title, text: data.tfa.extract }
  }

  // Fall back to most-read articles — pick a random one with enough text
  if (data.mostread?.articles) {
    const viable = data.mostread.articles.filter((a) => a.extract && a.extract.length > 100)
    if (viable.length > 0) {
      const pick = viable[Math.floor(Math.random() * viable.length)]
      return { title: pick.title, text: pick.extract }
    }
  }

  throw new Error('No suitable Wikipedia content found for today')
}

export async function POST(req: NextRequest) {
  try {
    const { targetLevel, language } = await req.json()

    if (!targetLevel || !language) {
      return NextResponse.json({ error: 'Missing targetLevel or language' }, { status: 400 })
    }

    // Fetch raw content from Wikipedia
    const { title, text } = await fetchWikipediaContent()

    // Rewrite with Claude
    const prompt = `Rewrite the following Chinese content for a ${targetLevel} CEFR learner.

Original title: ${title}
Original text: ${text}

Rules:
- Preserve the key facts and meaning
- Replace complex vocabulary with ${targetLevel}-appropriate words
- Shorten complex sentences into simpler structures
- Keep it engaging and natural — not dumbed down, just accessible
- Target length: 150-250 words
- Write entirely in Simplified Chinese
- Also tokenize the output into segments with translations

Return JSON only — no markdown, no code fences:
{"title":"simplified title in Chinese","rewritten":"the rewritten text","segments":[{"text":"word","translation":"English meaning"},...],"originalTitle":"${title}"}

Segment rules:
- Break the rewritten text into individual Chinese words (词语)
- Each segment's "translation" is the English meaning
- Include punctuation as its own segment with empty translation ""
- When concatenated, all segment "text" values must exactly reproduce the "rewritten" field`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    let parsed: { title: string; rewritten: string; segments: { text: string; translation: string }[]; originalTitle: string }
    try {
      parsed = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('No valid JSON in response')
      parsed = JSON.parse(match[0])
    }

    if (!parsed.title || !parsed.rewritten || !Array.isArray(parsed.segments)) {
      throw new Error('Invalid response structure from model')
    }

    return NextResponse.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Graded input error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
