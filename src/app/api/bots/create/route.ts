// src/app/api/bots/create/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription limits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single()

    // Count existing bots
    const { count } = await supabase
      .from('bots')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .neq('status', 'archived')

    // Free trial: max 1 bot
    if (subscription?.tier === 'free_trial' && (count || 0) >= 1) {
      return NextResponse.json(
        { error: 'Free trial limited to 1 bot. Please upgrade.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, strategyPrompt, generatedCode, indicators, parameters } = body

    // Create bot
    const { data: bot, error } = await supabase
      .from('bots')
      .insert({
        user_id: user.id,
        name,
        description,
        strategy_prompt: strategyPrompt,
        generated_code: generatedCode,
        indicators,
        parameters,
        platform: 'tradingview',
        status: 'draft',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ bot })
  } catch (error) {
    console.error('Bot creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create bot' },
      { status: 500 }
    )
  }
}