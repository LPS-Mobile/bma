// src/types/bot.types.ts
export type BotStatus = 'draft' | 'testing' | 'active' | 'paused' | 'archived'
export type PlatformType = 'tradingview' | 'ninjatrader' | 'metatrader'

export interface Bot {
  id: string
  user_id: string
  name: string
  description?: string
  strategy_prompt: string
  generated_code?: string
  platform: PlatformType
  status: BotStatus
  parameters: Record<string, any>
  indicators: string[]
  license_key?: string
  created_at: string
  updated_at: string
}