import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { getVocab, formatVocabForPrompt } from '@/lib/vocab/chinese'

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: 'absolute beginner — very short sentences, very simple everyday vocabulary',
  A2: 'elementary — simple sentences, basic everyday vocabulary',
  B1: 'intermediate — varied sentences, common vocabulary',
  B2: 'upper intermediate — more complex sentences, wider vocabulary',
  C1: 'advanced — sophisticated language, rich and nuanced vocabulary',
}

export async function POST(req: NextRequest) {
  const client = new Anthropic()
  try {
    const { language, level, sublevel, topic } = await req.json()

    if (!level || !topic) {
      return NextResponse.json({ error: 'Missing level or topic' }, { status: 400 })
    }

    const levelDesc = LEVEL_DESCRIPTIONS[level] ?? LEVEL_DESCRIPTIONS['B1']
    const sublevelNum = Number(sublevel) || 1

    const languageInstruction =
      language === 'Chinese'
        ? 'Write the story entirely in Simplified Chinese (Mandarin).'
        : 'Write the story in English.'

    // Inject vocab list if available for this level + sub-level
    const vocabWords = language === 'Chinese' ? getVocab(level, sublevelNum) : []
    const vocabSection =
      vocabWords.length > 0
        ? `\n\nTarget vocabulary for ${level}.${sublevelNum} — try to use these words naturally in the story:\n${formatVocabForPrompt(vocabWords)}`
        : ''

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `${languageInstruction}

Write a short story for a language learner at ${level} level (${levelDesc}), sub-level ${sublevelNum}/10, about the topic: "${topic}".

The story should be engaging and easy to follow. Use vocabulary and grammar appropriate for ${level}.${sublevelNum ? ` Aim for vocabulary difficulty at sub-level ${sublevelNum}/10 within ${level}.` : ''}${vocabSection}

Do not include a title, heading, or any explanation — just the story itself.`,
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
