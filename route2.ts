import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic with proper error handling
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Comprehensive indicator and strategy types
interface IndicatorConfig {
  type: 'indicator' | 'value' | 'price' | 'calculated';
  name?: string;
  params?: (number | string)[];
  value?: number;
  calculation?: string;
}

interface ConditionRule {
  type: 'crossover' | 'crossunder' | 'greaterThan' | 'lessThan' | 
        'equals' | 'between' | 'and' | 'or' | 'divergence' | 'pattern';
  left?: IndicatorConfig;
  right?: IndicatorConfig;
  conditions?: ConditionRule[];
  pattern?: string;
  timeframe?: string;
}

interface StrategyOutput {
  name: string;
  description: string;
  category: string;
  timeframes: string[];
  entry: ConditionRule[];
  exit: ConditionRule[];
  stopLoss?: {
    type: 'fixed' | 'atr' | 'percentage' | 'swing' | 'orderBlock';
    value?: number;
    params?: any;
  };
  takeProfit?: {
    type: 'fixed' | 'riskReward' | 'trailing' | 'partial' | 'fvg';
    value?: number;
    params?: any;
  };
  riskManagement: {
    positionSize: string;
    maxRiskPerTrade: number;
    maxDailyLoss?: number;
  };
  filters?: ConditionRule[];
  metadata?: {
    smcConcepts?: string[];
    ictPrinciples?: string[];
    complexity: 'beginner' | 'intermediate' | 'advanced';
  };
}

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
      return NextResponse.json({ error: "Strategy prompt required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ 
        error: "ANTHROPIC_API_KEY not configured. Please add it to your .env.local file." 
      }, { status: 500 });
    }

    // Enhanced system prompt with comprehensive trading knowledge
    const systemPrompt = `You are an elite algorithmic trading architect with deep expertise in:
- Technical Analysis (TA)
- Smart Money Concepts (SMC): Order Blocks, Fair Value Gaps, Liquidity Pools, Market Structure
- ICT Methodology: Kill Zones, Power of 3, Optimal Trade Entries, Silver Bullet setups
- Traditional Indicators: Moving Averages, RSI, MACD, Bollinger Bands, ATR, Volume Profile
- Price Action: Support/Resistance, Trend Lines, Chart Patterns, Candlestick Patterns
- Risk Management: Position Sizing, Stop Loss placement, Take Profit strategies

Your task is to translate natural language trading strategies into a structured JSON format for a TypeScript backtesting engine.

SUPPORTED TIMEFRAMES:
- Intraday: '1m', '5m', '15m', '30m', '1h', '4h'
- Daily+: '1D', '1W', '1M'
Note: The system uses hourly candles for backtesting, but strategies should specify their intended timeframe for live deployment.

SUPPORTED INDICATORS:
Core:
- 'sma', 'ema', 'wma' (Moving Averages - params: [period])
- 'rsi' (Relative Strength Index - params: [period])
- 'macd' (MACD - params: [fast, slow, signal])
- 'bbands' (Bollinger Bands - params: [period, stdDev])
- 'atr' (Average True Range - params: [period])
- 'stochastic' (Stochastic Oscillator - params: [k, d, smooth])
- 'adx' (Average Directional Index - params: [period])
- 'obv' (On Balance Volume)
- 'vwap' (Volume Weighted Average Price)
- 'price' (Current/Close/Open/High/Low)

SMC/ICT Concepts:
- 'orderBlock' (Bullish/Bearish Order Blocks - params: [lookback])
- 'fvg' (Fair Value Gap - params: [minGapSize])
- 'liquidityPool' (Buy/Sell Side Liquidity - params: [lookback])
- 'marketStructure' (BOS/CHoCH - params: [swingPeriod])
- 'imbalance' (Price Imbalances/Inefficiencies)
- 'killZone' (London/NY Session timing - params: ["london" | "ny" | "asia"])
- 'displacement' (Strong directional moves - params: [threshold])
- 'sessionHigh' / 'sessionLow' (Session extremes for liquidity)

CONDITION TYPES:
- 'crossover', 'crossunder' (indicator crosses)
- 'greaterThan', 'lessThan', 'equals', 'between' (comparisons)
- 'and', 'or' (logical operators for multiple conditions)
- 'divergence' (price vs indicator divergence)
- 'pattern' (chart patterns: 'doubleTop', 'headAndShoulders', 'triangle', etc.)

OUTPUT ONLY VALID JSON. No markdown fences, no explanations, no preamble.

Example structure:
{
  "name": "ICT Silver Bullet Strategy",
  "description": "Enters on FVG retest during NY kill zone with confluence",
  "category": "SMC/ICT",
  "timeframes": ["5m", "15m"],
  "entry": [
    {
      "type": "and",
      "conditions": [
        {
          "type": "pattern",
          "pattern": "fvg",
          "params": [0.5]
        },
        {
          "type": "greaterThan",
          "left": { "type": "indicator", "name": "killZone", "params": ["ny"] },
          "right": { "type": "value", "value": 1 }
        },
        {
          "type": "greaterThan",
          "left": { "type": "indicator", "name": "adx", "params": [14] },
          "right": { "type": "value", "value": 25 }
        }
      ]
    }
  ],
  "exit": [
    {
      "type": "or",
      "conditions": [
        {
          "type": "greaterThan",
          "left": { "type": "indicator", "name": "rsi", "params": [14] },
          "right": { "type": "value", "value": 70 }
        },
        {
          "type": "pattern",
          "pattern": "takeProfitHit"
        }
      ]
    }
  ],
  "stopLoss": {
    "type": "orderBlock",
    "params": { "placement": "beyond", "buffer": 5 }
  },
  "takeProfit": {
    "type": "riskReward",
    "value": 2.0
  },
  "riskManagement": {
    "positionSize": "1% account equity",
    "maxRiskPerTrade": 0.01,
    "maxDailyLoss": 0.03
  },
  "filters": [
    {
      "type": "greaterThan",
      "left": { "type": "indicator", "name": "adx", "params": [14] },
      "right": { "type": "value", "value": 25 }
    }
  ],
  "metadata": {
    "smcConcepts": ["Fair Value Gap", "Kill Zone"],
    "ictPrinciples": ["Silver Bullet", "Market Structure"],
    "complexity": "advanced",
    "bestMarkets": ["Forex", "Indices"],
    "sessionPreference": "NY Kill Zone (13:00-16:00 UTC)"
  }
}

IMPORTANT GUIDELINES:
1. Parse the user's strategy intent carefully
2. Identify if they're using SMC/ICT concepts vs traditional TA
3. Add appropriate filters and risk management based on strategy type
4. Select optimal timeframes: 1m/5m for scalping, 15m/1h for intraday, 4h/1D for swing
5. Include stop loss and take profit logic appropriate to timeframe
6. For complex strategies, combine multiple conditions with 'and'/'or'
7. Always output valid JSON that can be parsed by TypeScript
8. For ICT strategies, include session timing and market structure elements
9. Adjust indicator periods based on timeframe (shorter periods for lower timeframes)
10. Include metadata about optimal market conditions and session preferences`;

    // Call Claude with extended context
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // Use latest Sonnet for better reasoning
      max_tokens: 4096,
      temperature: 0.3, // Lower temp for more consistent JSON output
      system: systemPrompt,
      messages: [
        { 
          role: "user", 
          content: `Generate a complete trading strategy based on this description:

Strategy: ${prompt}
Symbol: ${symbol || 'Any'}
Preferred Timeframe: ${timeframe}
Risk Profile: ${riskProfile}
${capital ? `Account Size: ${capital}` : ''}
${startDate && endDate ? `Backtest Period: ${startDate} to ${endDate}` : ''}

Consider:
- Match indicator periods to the ${timeframe} timeframe (shorter periods for lower timeframes)
- If the strategy mentions SMC/ICT concepts, prioritize those indicators and include session timing
- If it's traditional TA, use classic indicators with appropriate periods
- Include appropriate risk management for ${riskProfile} risk tolerance
- Add confluence filters to improve win rate
- Suggest optimal entry, exit, stop loss, and take profit logic for ${timeframe}
- For scalping (1m/5m), use tighter stops and quick exits
- For swing trading (4h/1D), use wider stops and longer holding periods

Return ONLY the JSON structure, no other text.` 
        }
      ],
    });

    // Extract content safely
    const block = message.content[0];
    if (block.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let content = block.text;

    // Clean potential markdown artifacts
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the strategy
    const strategyLogic: StrategyOutput = JSON.parse(content);

    // Validate structure
    if (!strategyLogic.name || !strategyLogic.entry || !strategyLogic.exit) {
      throw new Error('Invalid strategy structure returned from AI');
    }

    // Add generation metadata
    const response = {
      success: true,
      strategy: strategyLogic,
      meta: {
        model: "claude-sonnet-4-20250514",
        generatedAt: new Date().toISOString(),
        inputSymbol: symbol,
        inputTimeframe: timeframe,
        inputRiskProfile: riskProfile,
        backtestPeriod: startDate && endDate ? `${startDate} to ${endDate}` : 'Not specified',
        accountSize: capital,
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("AI Strategy Generation Error:", error);
    
    // Better error handling
    if (error.message?.includes('JSON')) {
      return NextResponse.json({ 
        error: "Failed to parse AI response. The strategy format may be invalid.",
        details: error.message 
      }, { status: 500 });
    }

    if (error.status === 401) {
      return NextResponse.json({ 
        error: "Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY." 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      error: "Strategy generation failed", 
      details: error.message 
    }, { status: 500 });
  }
}

// Optional: GET endpoint for testing and capability discovery
export async function GET() {
  return NextResponse.json({
    status: "AI Trading Strategy Generator Active",
    version: "2.0.0",
    supportedTimeframes: {
      intraday: ["1m", "5m", "15m", "30m", "1h", "4h"],
      daily: ["1D", "1W", "1M"],
      note: "Backtesting uses hourly candles; strategies specify intended deployment timeframe"
    },
    capabilities: [
      "Smart Money Concepts (SMC)",
      "ICT Methodology",
      "Traditional Technical Analysis",
      "Risk Management Integration",
      "Multi-timeframe Analysis",
      "Pattern Recognition",
      "Custom Indicator Combinations",
      "Session-based Trading (Kill Zones)",
      "Timeframe-adaptive Indicators"
    ],
    supportedIndicators: {
      traditional: ["SMA", "EMA", "WMA", "RSI", "MACD", "Bollinger Bands", "ATR", "Stochastic", "ADX", "OBV", "VWAP"],
      smc: ["Order Blocks", "Fair Value Gaps", "Liquidity Pools", "Market Structure", "Imbalances", "Session Highs/Lows"],
      ict: ["Kill Zones (London/NY/Asia)", "Displacement", "Optimal Trade Entry", "Power of 3", "Silver Bullet"]
    },
    strategyTypes: {
      scalping: "1m-5m timeframes with tight stops",
      dayTrading: "15m-1h timeframes with moderate stops",
      swingTrading: "4h-1D timeframes with wider stops",
      positionTrading: "1D-1W timeframes with dynamic stops"
    },
    riskProfiles: ["conservative", "moderate", "aggressive"],
    markets: ["Futures (ES, NQ, YM, RTY, GC, SI, CL, NG)", "Forex", "Stocks", "Crypto"]
  });
}