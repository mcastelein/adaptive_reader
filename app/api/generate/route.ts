import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: 'absolute beginner — very short sentences, very simple everyday vocabulary',
  A2: 'elementary — simple sentences, basic everyday vocabulary',
  B1: 'intermediate — varied sentences, common vocabulary',
  B2: 'upper intermediate — more complex sentences, wider vocabulary',
  C1: 'advanced — sophisticated language, rich and nuanced vocabulary',
}

// Describes where sub-level sits within the CEFR band.
// Vocab lists will be injected here in a future update.
function sublevelDescription(sublevel: number): string {
  if (sublevel <= 3) return `early ${sublevel}/10 — foundational vocabulary for this level`
  if (sublevel <= 6) return `mid ${sublevel}/10 — mid-range vocabulary for this level`
  return `upper ${sublevel}/10 — more challenging vocabulary for this level`
}

export async function POST(req: NextRequest) {
  const client = new Anthropic()
  try {
    const { language, level, sublevel, topic } = await req.json()

    if (!level || !topic) {
      return NextResponse.json({ error: 'Missing level or topic' }, { status: 400 })
    }

    const levelDesc = LEVEL_DESCRIPTIONS[level] ?? LEVEL_DESCRIPTIONS['B1']
    const sublevelDesc = sublevel ? sublevelDescription(Number(sublevel)) : ''

    const languageInstruction =
      language === 'Chinese'
        ? 'Write the story entirely in Simplified Chinese (Mandarin).'
        : 'Write the story in English.'

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `${languageInstruction}

Write a short story for a language learner at ${level} level (${levelDesc}), sub-level ${sublevel} (${sublevelDesc}), about the topic: "${topic}".

The story should be engaging and easy to follow. Use vocabulary and grammar exactly appropriate for ${level}.${sublevel ? ` Aim for the vocabulary difficulty of sub-level ${sublevel}/10 within ${level}.` : ''} Do not include a title, heading, or any explanation — just the story itself.`,
        },
      ],
    })

    const story = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ story })
  } catch (err) {
    console.error('Story generation error:', err)
    return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 })
  }
}
