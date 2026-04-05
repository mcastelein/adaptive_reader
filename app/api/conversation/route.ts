import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ConversationRequest {
  messages: ConversationMessage[]
  language: string
  level: string
  topic?: string
  lastUserInput?: string  // raw transcribed text — used for coaching (mic only)
}

export async function POST(req: NextRequest) {
  try {
    const body: ConversationRequest = await req.json()
    const { messages, language, level, topic, lastUserInput } = body

    if (!messages || !language || !level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userInputBlock = lastUserInput
      ? `"userTranslation": "<natural English translation of: ${lastUserInput}>",
  "userSegments": [{"text": "<word or short phrase from user input>", "translation": "<English meaning>"}],
  "coaching": {
    "pinyin": "<full pinyin with tone marks for: ${lastUserInput}>",
    "notes": ["<specific note about a word, tone, or phrase — be encouraging and precise>", "<another note if needed>"],
    "focus": "<the single most important thing to improve, one sentence>"
  }`
      : '"userTranslation": null, "userSegments": null, "coaching": null'

    const systemPrompt = `You are a friendly ${language} conversation partner for a ${level} CEFR learner.
${topic ? `Context/topic: ${topic}` : ''}

Rules:
- Respond ONLY in ${language}. Never use English in your reply field.
- Use vocabulary and grammar appropriate for ${level} level
- Keep responses to 2–3 sentences maximum
- Be warm, natural, and encouraging

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "reply": "<your conversational response in ${language}>",
  "translation": "<natural English translation of your reply>",
  "segments": [
    {"text": "<word or short phrase>", "translation": "<English meaning>"}
  ],
  ${userInputBlock}
}

For segments: break your reply into meaningful words and short phrases. Every character should appear in a segment. Include a translation for each segment.
${lastUserInput ? `For userSegments: do the same segmentation for the user's input "${lastUserInput}". For coaching: analyze the pronunciation and tones in "${lastUserInput}" with specific, actionable feedback.` : ''}`

    const anthropicMessages = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

    let parsed: {
      reply: string
      translation: string
      segments: { text: string; translation: string }[]
      userTranslation: string | null
      userSegments: { text: string; translation: string }[] | null
      coaching: {
        pinyin: string
        notes: string[]
        focus: string
      } | null
    }

    try {
      parsed = JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('No valid JSON in response')
      parsed = JSON.parse(match[0])
    }

    if (!parsed.reply || !parsed.translation) {
      throw new Error('Invalid response structure from model')
    }

    return NextResponse.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Conversation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
