import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt, timeframe = '1D' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    console.log("\n🧠 AI PARSING PROMPT:", prompt);

    // FIX: Refactored Schema to satisfy OpenAI Strict Mode rules
    // Strict Mode Rule: All defined properties MUST be required.
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: `You are a Trading Strategy Compiler. 
          Output STRICT JSON matching the schema provided.
          - Default to RSI(14) and SMA(20) if periods missing.
          - Output percentages as decimals (e.g. 0.02).`
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "strategy_logic",
          strict: true,
          schema: {
            type: "object",
            properties: {
              strategyName: { type: "string" },
              description: { type: "string" },
              stopLossPercentage: { type: ["number", "null"] },
              takeProfitPercentage: { type: ["number", "null"] },
              conditions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["greaterThan", "lessThan", "crossesAbove", "crossesBelow", "equals"] },
                    left: {
                      type: "object",
                      description: "The left side of the comparison (Indicator or Value)",
                      properties: {
                        type: { type: "string", enum: ["indicator", "value"] },
                        name: { type: ["string", "null"], enum: ["price", "sma", "ema", "rsi", "atr", "macd", "volume", "vwap", null] },
                        params: { type: ["array", "null"], items: { type: "number" } },
                        value: { type: ["number", "null"] }
                      },
                      required: ["type", "name", "params", "value"],
                      additionalProperties: false
                    },
                    right: {
                      type: "object",
                      description: "The right side of the comparison (Indicator or Value)",
                      properties: {
                        type: { type: "string", enum: ["indicator", "value"] },
                        name: { type: ["string", "null"], enum: ["price", "sma", "ema", "rsi", "atr", "macd", "volume", "vwap", null] },
                        params: { type: ["array", "null"], items: { type: "number" } },
                        value: { type: ["number", "null"] }
                      },
                      required: ["type", "name", "params", "value"],
                      additionalProperties: false
                    }
                  },
                  required: ["type", "left", "right"],
                  additionalProperties: false
                }
              }
            },
            required: ["strategyName", "description", "conditions", "stopLossPercentage", "takeProfitPercentage"],
            additionalProperties: false
          }
        }
      }
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    // Clean up nulls for the legacy frontend/backend format
    const cleanOperand = (op: any) => {
      if (op.type === 'value') return { type: 'value', value: op.value };
      return { type: 'indicator', name: op.name, params: op.params || [] };
    };

    const cleanConditions = result.conditions.map((c: any) => ({
      type: c.type,
      left: cleanOperand(c.left),
      right: cleanOperand(c.right)
    }));

    const strategy = {
      name: result.strategyName,
      description: result.description,
      category: "Custom AI",
      timeframes: [timeframe],
      entry: cleanConditions.length > 1 
        ? [{ type: "and", conditions: cleanConditions }]
        : cleanConditions,
      exit: [],
      stopLoss: {
        type: "percentage",
        value: result.stopLossPercentage ?? 0.02
      },
      takeProfit: {
        type: "percentage",
        value: result.takeProfitPercentage ?? 0.04
      },
      riskManagement: {
        positionSize: "1% account equity",
        maxRiskPerTrade: 0.01
      },
      metadata: {
        complexity: "ai-generated",
        parserVersion: "gpt-4o-strict-v2"
      }
    };

    return NextResponse.json({ 
      success: true, 
      strategy 
    });

  } catch (error: any) {
    console.error("AI Parser Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}