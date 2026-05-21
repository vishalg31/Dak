import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildPrompt } from '@/lib/prompt'
import { MODELS } from '@/lib/models'
import { isAllowedOrigin, originDenied, MAX_CONTENT_CHARS } from '@/lib/apiGuard'

export const runtime     = 'nodejs'
export const maxDuration = 60

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) return originDenied()

  let template: string, content: string, parts: number
  try {
    const body = await req.json()
    template = body.template
    content  = body.content
    parts    = body.parts
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!['launch', 'progress'].includes(template)) {
    return Response.json({ error: 'Invalid template' }, { status: 400 })
  }
  if (![1, 2, 3].includes(parts)) {
    return Response.json({ error: 'Invalid parts value' }, { status: 400 })
  }
  if (!content || content.length < 50) {
    return Response.json({ error: 'Content too short' }, { status: 400 })
  }
  if (content.length > MAX_CONTENT_CHARS) {
    return Response.json({ error: 'Content too long' }, { status: 400 })
  }

  const prompt = buildPrompt(template, content, parts)

  let result
  let usedModel = MODELS.primary

  try {
    console.log('[generate] Trying primary:', MODELS.primary)
    result = await genAI.getGenerativeModel({ model: MODELS.primary }).generateContent(prompt)
  } catch (err) {
    console.warn('[generate] Primary failed, trying fallback:', MODELS.fallback, err)
    try {
      result = await genAI.getGenerativeModel({ model: MODELS.fallback }).generateContent(prompt)
      usedModel = MODELS.fallback
    } catch (fallbackErr) {
      console.warn('[generate] Fallback failed, trying backup:', MODELS.backup, fallbackErr)
      try {
        result = await genAI.getGenerativeModel({ model: MODELS.backup }).generateContent(prompt)
        usedModel = MODELS.backup
      } catch (backupErr) {
        console.error('[generate] All models failed:', backupErr)
        const is503 = String(backupErr).includes('503') || String(backupErr).includes('high demand')
        return Response.json(
          { error: is503 ? 'AI service is temporarily unavailable. Please try again in a few minutes.' : 'Generation failed. Please try again.' },
          { status: 502 }
        )
      }
    }
  }

  const usage = result.response.usageMetadata
  console.log(
    `[generate] model=${usedModel} | in=${usage?.promptTokenCount ?? '?'} out=${usage?.candidatesTokenCount ?? '?'} total=${usage?.totalTokenCount ?? '?'}`
  )

  try {
    const text   = result.response.text()
    const clean  = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return Response.json(parsed)
  } catch {
    // Silent retry once on malformed JSON — same model
    console.warn('[generate] JSON parse failed, retrying once with:', usedModel)
    try {
      const retry      = await genAI.getGenerativeModel({ model: usedModel }).generateContent(prompt)
      const retryText  = retry.response.text()
      const retryClean = retryText.replace(/```json|```/g, '').trim()
      const retryParsed = JSON.parse(retryClean)
      return Response.json(retryParsed)
    } catch {
      return Response.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
    }
  }
}
