import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'mock-key',
});

export async function POST(request: Request) {
  try {
    const { 
      prompt, 
      symbol, 
      timeframe = '1h',
      riskProfile = 'moderate',
      capital = 50000,
      startDate,
      endDate
    } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    // Define the System Prompt
    const systemPrompt = `You are an expert algorithmic trading architect.
Your goal is to translate natural language trading ideas into a structured JSON format 
that a TypeScript backtesting engine can execute.

The engine supports these indicators:
- 'sma' (Simple Moving Average)
- 'ema' (Exponential Moving Average)
- 'rsi' (Relative Strength Index)
- 'macd' (MACD)
- 'bbands' (Bollinger Bands)
- 'atr' (Average True Range)
- 'price' (Current Close Price)

SMART MONEY CONCEPTS (SMC):
- 'orderBlock' (Order Blocks - params: [lookback])
- 'fvg' (Fair Value Gaps - params: [minGapSize])
- 'liquidityPool' (Liquidity zones - params: [lookback])
- 'marketStructure' (BOS/CHoCH - params: [swingPeriod])

ICT CONCEPTS:
- 'killZone' (Session timing - params: ["london" | "ny" | "asia"])
- 'displacement' (Strong moves - params: [threshold])

TIMEFRAME CONSIDERATIONS:
- For 1m/5m: Use faster indicators (RSI 5-9, EMA 8-20)
- For 15m/1h: Use standard periods (RSI 14, EMA 20-50)
- For 4h/1D: Use longer periods (RSI 14-21, EMA 50-200)

Output ONLY valid JSON. No markdown, no explanations.

Structure:
{
  "name": "Short descriptive name",
  "description": "What the strategy does",
  "category": "Trend Following" | "Mean Reversion" | "SMC/ICT" | "Breakout",
  "timeframes": ["${timeframe}"],
  "entry": [
    {
      "type": "crossover" | "crossunder" | "greaterThan" | "lessThan" | "and" | "or",
      "left": { "type": "indicator", "name": "sma" | "rsi" | "price", "params": [period] },
      "right": { "type": "indicator" | "value", "name": "...", "params": [...] | "value": number },
      "conditions": [ ... ] // for 'and'/'or' types
    }
  ],
  "exit": [ ... same structure as entry ... ],
  "stopLoss": {
    "type": "atr" | "percentage" | "fixed",
    "value": number
  },
  "takeProfit": {
    "type": "riskReward" | "fixed",
    "value": number
  },
  "riskManagement": {
    "positionSize": "1% account equity",
    "maxRiskPerTrade": 0.01
  },
  "metadata": {
    "complexity": "beginner" | "intermediate" | "advanced"
  }
}`;

    let content = "";
    
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'mock-key') {
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ 
          role: "user", 
          content: `Create a trading strategy for:

Prompt: ${prompt}
Symbol: ${symbol}
Timeframe: ${timeframe}
Risk Profile: ${riskProfile}
Account Size: $${capital}

Important:
- Adapt indicator periods for ${timeframe} timeframe
- Use ${riskProfile} risk management
- Include entry, exit, stop loss, and take profit rules
- Return ONLY JSON, no markdown` 
        }],
      });
      
      const block = msg.content[0];
      if (block.type === 'text') {
        content = block.text;
      }
    } else {
      // Mock response for development
      await new Promise(r => setTimeout(r, 1500));
      
      // Generate appropriate indicator periods based on timeframe
      let fastMA = 9, slowMA = 21, rsiPeriod = 14;
      if (timeframe === '1m' || timeframe === '5m') {
        fastMA = 5; slowMA = 13; rsiPeriod = 9;
      } else if (timeframe === '4h' || timeframe === '1D') {
        fastMA = 20; slowMA = 50; rsiPeriod = 14;
      }
      
      content = JSON.stringify({
        name: "AI Generated Strategy",
        description: `${riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)} strategy for ${timeframe} timeframe`,
        category: "Trend Following",
        timeframes: [timeframe],
        entry: [
          {
            type: "and",
            conditions: [
              {
                type: "crossover",
                left: { type: "indicator", name: "ema", params: [fastMA] },
                right: { type: "indicator", name: "ema", params: [slowMA] }
              },
              {
                type: "lessThan",
                left: { type: "indicator", name: "rsi", params: [rsiPeriod] },
                right: { type: "value", value: 70 }
              }
            ]
          }
        ],
        exit: [
          {
            type: "or",
            conditions: [
              {
                type: "crossunder",
                left: { type: "indicator", name: "ema", params: [fastMA] },
                right: { type: "indicator", name: "ema", params: [slowMA] }
              },
              {
                type: "greaterThan",
                left: { type: "indicator", name: "rsi", params: [rsiPeriod] },
                right: { type: "value", value: 80 }
              }
            ]
          }
        ],
        stopLoss: {
          type: "atr",
          value: riskProfile === 'conservative' ? 1.5 : riskProfile === 'moderate' ? 2.0 : 2.5
        },
        takeProfit: {
          type: "riskReward",
          value: riskProfile === 'conservative' ? 1.5 : riskProfile === 'moderate' ? 2.0 : 3.0
        },
        riskManagement: {
          positionSize: "1% account equity",
          maxRiskPerTrade: riskProfile === 'conservative' ? 0.005 : riskProfile === 'moderate' ? 0.01 : 0.02
        },
        metadata: {
          complexity: "intermediate",
          adaptedForTimeframe: timeframe,
          riskProfile: riskProfile
        }
      });
    }

    // Clean up potential Markdown code blocks
    const cleanJson = content.replace(/```json\n?|\n?```/g, "").trim();
    const strategyLogic = JSON.parse(cleanJson);

    return NextResponse.json({ 
      success: true, 
      strategy: strategyLogic,
      meta: {
        model: "claude-sonnet-4-20250514",
        generatedAt: new Date().toISOString(),
        inputSymbol: symbol,
        inputTimeframe: timeframe,
        inputRiskProfile: riskProfile
      }
    });

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ 
      error: error.message || "Strategy generation failed" 
    }, { status: 500 });
  }
}

// GET endpoint for capability testing
export async function GET() {
  return NextResponse.json({
    status: "AI Trading Strategy Generator",
    version: "2.0.0",
    features: [
      "Traditional Technical Analysis",
      "Smart Money Concepts (SMC)",
      "ICT Methodology",
      "Timeframe-adaptive indicators",
      "Risk profile customization"
    ],
    supportedTimeframes: ["1m", "5m", "15m", "30m", "1h", "4h", "1D", "1W", "1M"],
    supportedIndicators: ["SMA", "EMA", "RSI", "MACD", "Bollinger Bands", "ATR", "Order Blocks", "FVG", "Kill Zones"]
  });
}