import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { getVocab, formatVocabForPrompt } from '@/lib/vocab/chinese'

const client = new Anthropic()

interface HistoryEntry {
  story: string
  choice: string
  summary: string
}

interface GenerateRequest {
  language: string
  level: string
  sublevel: number
  topic: string
  internalLevel: number
  choice?: string
  storyHistory?: HistoryEntry[]
  runningSummary?: string
  stepNumber: number
}

function getDifficultyDescription(n: number): string {
  if (n <= 14)
    return 'absolute beginner — very short sentences (3–5 words each), only the most common everyday words, present tense only, direct literal meaning, heavy repetition'
  if (n <= 24)
    return 'beginner — short simple sentences, basic everyday vocabulary, present and simple past tense, minimal grammar complexity'
  if (n <= 39)
    return 'lower intermediate — moderate sentence length, common vocabulary with some less frequent words, varied tenses, occasional compound sentences'
  if (n <= 59)
    return 'intermediate — natural sentence length, varied vocabulary, complex sentences, some idiomatic phrases'
  if (n <= 79)
    return 'upper intermediate — longer natural sentences, precise vocabulary, rich idioms, nuanced meaning, complex grammar structures'
  return 'advanced — sophisticated vocabulary, complex grammar, natural idioms, implied meaning, near-native phrasing'
}

function getTargetLength(n: number): string {
  if (n <= 24) return '1 short paragraph (3–5 sentences)'
  if (n <= 59) return '1 to 2 short paragraphs'
  return '2 to 3 paragraphs'
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json()
    const { language, level, sublevel, topic, internalLevel, choice, storyHistory, runningSummary, stepNumber } = body

    if (!level || !topic || internalLevel == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const difficultyDesc = getDifficultyDescription(internalLevel)
    const targetLength = getTargetLength(internalLevel)
    const isFirstStep = stepNumber === 1 || !choice

    const languageInstruction =
      language === 'Chinese'
        ? 'Write the story scene entirely in Simplified Chinese (Mandarin).'
        : `Write the story scene in ${language}.`

    // Inject Chinese vocab if available
    const vocabWords = language === 'Chinese' ? getVocab(level, Number(sublevel) || 1) : []
    const vocabSection =
      vocabWords.length > 0
        ? `\nTarget vocabulary — try to use these words naturally:\n${formatVocabForPrompt(vocabWords)}\n`
        : ''

    // Build story context for continuation
    let contextSection = ''
    if (!isFirstStep && storyHistory && storyHistory.length > 0) {
      const recentScenes = storyHistory
        .slice(-3)
        .map((h) => `Scene: ${h.story}\nChoice made: "${h.choice}"`)
        .join('\n\n')
      const summary = runningSummary?.trim()
        ? `Story so far: ${runningSummary}\n\n`
        : ''
      contextSection = `\n${summary}Recent scenes:\n${recentScenes}\n\nThe player just chose: "${choice}"\n`
    }

    const prompt = `You are generating an interactive language learning story.

${languageInstruction}
DIFFICULTY: ${internalLevel}/100 — ${difficultyDesc}
TOPIC/SETTING: ${topic}
STEP: ${stepNumber}
${contextSection}${vocabSection}
${isFirstStep ? 'Start a new short story scene.' : 'Continue the story based on the choice made. Keep continuity with prior events.'}

Rules:
- Write ONLY in ${language} — no translations or explanations
- Match the difficulty level precisely (sentence length, vocabulary, grammar)
- Length: ${targetLength}
- End the scene at a natural decision point
- Keep the story engaging, coherent, and fun

After the scene, provide exactly 3 choices:
- Choice A: a sensible, grounded action
- Choice B: another sensible action
- Choice C: a slightly surprising or playful option (still fits the context)

Also provide:
1. A 1–2 sentence English summary of key events for internal continuity tracking.
2. A reading comprehension question about the story scene in ${language} with exactly 4 answer options. One must be correct. The question should test understanding of the story content and be written at the same difficulty level as the story.
3. A "segments" array that breaks the story text into individual words/tokens. Each segment is {"text":"...","translation":"..."}.
   - ${language === 'Chinese' ? 'Segment the Chinese text into individual words (词语). Each segment\'s "translation" is the English meaning.' : 'Segment the English text word by word. Each segment\'s "translation" is the Simplified Chinese (Mandarin) meaning.'}
   - Include spaces and punctuation as their own segments with empty translation "".
   - When concatenated, all segment "text" values must exactly reproduce the "story" field character-for-character.

Respond with valid JSON only — no markdown, no code fences:
{"story":"...","choices":["...","...","..."],"summary":"...","question":"...","answers":["...","...","...","..."],"correctAnswer":0,"segments":[{"text":"...","translation":"..."},...]}`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    let parsed: { story: string; choices: string[]; summary: string; question: string; answers: string[]; correctAnswer: number; segments: { text: string; translation: string }[] }
    try {
      parsed = JSON.parse(text)
    } catch {
      // Attempt to extract JSON if model added surrounding text
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('No valid JSON in response')
      parsed = JSON.parse(match[0])
    }

    if (!parsed.story || !Array.isArray(parsed.choices) || parsed.choices.length !== 3) {
      throw new Error('Invalid response structure from model')
    }

    if (!parsed.question || !Array.isArray(parsed.answers) || parsed.answers.length !== 4 || typeof parsed.correctAnswer !== 'number') {
      throw new Error('Invalid question structure from model')
    }

    return NextResponse.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Story generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
