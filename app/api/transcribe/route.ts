import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const openai = new OpenAI()
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File | null
    const language = (formData.get('language') as string) || 'zh'

    if (!audioFile) {
      return NextResponse.json({ error: 'Missing audio' }, { status: 400 })
    }

    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioFile,
      language,
    })

    return NextResponse.json({
      text: transcription.text,
      language,
    })
  } catch (err) {
    console.error('Transcription error:', err)
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 })
  }
}
