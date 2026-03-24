import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: 'absolute beginner — very short sentences, ~100 words, very simple everyday vocabulary',
  A2: 'elementary — simple sentences, ~150 words, basic everyday vocabulary',
  B1: 'intermediate — varied sentences, ~200 words, common vocabulary',
  B2: 'upper intermediate — more complex sentences, ~250 words, wider vocabulary',
  C1: 'advanced — sophisticated language, ~300 words, rich and nuanced vocabulary',
}

export async function POST(req: NextRequest) {
  const client = new Anthropic()
  try {
    const { level, topic } = await req.json()

    if (!level || !topic) {
      return NextResponse.json({ error: 'Missing level or topic' }, { status: 400 })
    }

    const description = LEVEL_DESCRIPTIONS[level] ?? LEVEL_DESCRIPTIONS['B1']

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `Write a short story for a language learner at ${level} level (${description}) about the topic: "${topic}".

The story should be engaging and easy to follow. Use vocabulary and grammar exactly appropriate for ${level} level. Do not include a title, heading, or any explanation — just the story itself.`,
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
