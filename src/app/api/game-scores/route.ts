import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const scoreInputSchema = z
  .object({
    correctCount: z.number().int().min(0).max(10_000),
    employeeId: z.string().regex(/^\d{7}$/),
    mode: z.enum(['challenge', 'learn', 'practice']),
    score: z.number().int().min(0).max(10_000),
    sortedCount: z.number().int().min(0).max(10_000),
  })
  .refine((value) => value.correctCount <= value.sortedCount, {
    message: 'correctCount must not exceed sortedCount',
  })
  .refine((value) => value.score === value.correctCount, {
    message: 'score must equal correctCount',
  })

type SupabaseScore = {
  accuracy: number
  correct_count: number
  employee_id: string
  mode: 'challenge' | 'learn' | 'practice'
  played_at: string
  score: number
  sorted_count: number
}

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

let supabaseAdmin: SupabaseClient | undefined

export const dynamic = 'force-dynamic'

class SupabaseConfigurationError extends Error {}

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('waste_sort_scores')
      .select(
        'employee_id, score, correct_count, sorted_count, accuracy, mode, played_at'
      )
      .order('score', { ascending: false })
      .order('accuracy', { ascending: false })
      .order('played_at', { ascending: true })

    if (error) throw error
    const scores = data as SupabaseScore[]

    return NextResponse.json(scores.map(toGameScore), {
      headers: NO_STORE_HEADERS,
    })
  } catch (error) {
    return handleSupabaseError(error, 'ไม่สามารถโหลดตารางคะแนนได้')
  }
}

export async function POST(request: Request) {
  const parsed = scoreInputSchema.safeParse(await readJson(request))

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'ข้อมูลคะแนนหรือรหัสพนักงานไม่ถูกต้อง' },
      { status: 400 }
    )
  }

  const { correctCount, employeeId, mode, score, sortedCount } = parsed.data
  const accuracy =
    sortedCount === 0 ? 0 : Math.round((correctCount / sortedCount) * 100)
  const playedAt = new Date().toISOString()

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('waste_sort_scores')
      .upsert(
        {
          accuracy,
          correct_count: correctCount,
          employee_id: employeeId,
          mode,
          played_at: playedAt,
          score,
          sorted_count: sortedCount,
          updated_at: playedAt,
        },
        { onConflict: 'employee_id' }
      )
      .select(
        'employee_id, score, correct_count, sorted_count, accuracy, mode, played_at'
      )
      .single()

    if (error) throw error
    const savedScore = data as SupabaseScore

    return NextResponse.json(toGameScore(savedScore), {
      headers: NO_STORE_HEADERS,
    })
  } catch (error) {
    return handleSupabaseError(error, 'ไม่สามารถบันทึกคะแนนได้')
  }
}

function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin

  const { key, url } = getSupabaseConfig()
  supabaseAdmin = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })

  return supabaseAdmin
}

function getSupabaseConfig() {
  const key =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '')

  if (!key || !url) {
    throw new SupabaseConfigurationError()
  }

  return { key, url }
}

function handleSupabaseError(error: unknown, message: string) {
  if (error instanceof SupabaseConfigurationError) {
    return NextResponse.json(
      { error: 'ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase บนเซิร์ฟเวอร์' },
      { status: 503 }
    )
  }

  // Avoid returning Supabase response details or credentials to the client.
  // eslint-disable-next-line no-console
  console.error(message, error)
  return NextResponse.json({ error: message }, { status: 502 })
}

async function readJson(request: Request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function toGameScore(score: SupabaseScore) {
  return {
    accuracy: score.accuracy,
    correctCount: score.correct_count,
    employeeId: score.employee_id,
    mode: score.mode,
    playedAt: score.played_at,
    score: score.score,
    sortedCount: score.sorted_count,
  }
}
