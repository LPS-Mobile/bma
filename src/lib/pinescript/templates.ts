// src/lib/pinescript/templates.ts

/**
 * PineScript Templates and Boilerplate Code
 * Provides base templates for different strategy types
 */

export interface PineScriptTemplate {
  name: string;
  description: string;
  category: 'momentum' | 'trend' | 'mean_reversion' | 'breakout' | 'scalping';
  code: string;
  parameters: Record<string, any>;
}

/**
 * Base PineScript v5 template
 */
export const BASE_TEMPLATE = `
//@version=5
strategy("{{STRATEGY_NAME}}", 
         overlay={{OVERLAY}}, 
         initial_capital={{INITIAL_CAPITAL}},
         default_qty_type=strategy.percent_of_equity,
         default_qty_value={{POSITION_SIZE}},
         commission_type=strategy.commission.percent,
         commission_value={{COMMISSION}})

// Risk Management
stopLossPercent = input.float({{STOP_LOSS}}, "Stop Loss %", minval=0.1, maxval=10, step=0.1) / 100
takeProfitPercent = input.float({{TAKE_PROFIT}}, "Take Profit %", minval=0.1, maxval=20, step=0.1) / 100

// Strategy Logic
{{STRATEGY_LOGIC}}

// Risk Management
if strategy.position_size > 0
    strategy.exit("Exit Long", "Long", 
                  stop=strategy.position_avg_price * (1 - stopLossPercent),
                  limit=strategy.position_avg_price * (1 + takeProfitPercent))

if strategy.position_size < 0
    strategy.exit("Exit Short", "Short",
                  stop=strategy.position_avg_price * (1 + stopLossPercent),
                  limit=strategy.position_avg_price * (1 - takeProfitPercent))
`.trim();

/**
 * RSI Momentum Template
 */
export const RSI_TEMPLATE: PineScriptTemplate = {
  name: 'RSI Momentum',
  description: 'Classic RSI oversold/overbought momentum strategy',
  category: 'momentum',
  code: `
//@version=5
strategy("RSI Momentum Strategy", overlay=true, initial_capital=10000)

// Inputs
rsiLength = input.int(14, "RSI Length", minval=2, maxval=50)
rsiOversold = input.int(30, "RSI Oversold", minval=10, maxval=50)
rsiOverbought = input.int(70, "RSI Overbought", minval=50, maxval=90)
stopLoss = input.float(2.0, "Stop Loss %", minval=0.5, maxval=10) / 100
takeProfit = input.float(4.0, "Take Profit %", minval=1, maxval=20) / 100

// Calculate RSI
rsi = ta.rsi(close, rsiLength)

// Entry Conditions
longCondition = ta.crossover(rsi, rsiOversold)
shortCondition = ta.crossunder(rsi, rsiOverbought)

// Execute Trades
if longCondition
    strategy.entry("Long", strategy.long)

if shortCondition
    strategy.entry("Short", strategy.short)

// Exit Management
if strategy.position_size > 0
    strategy.exit("Exit Long", "Long",
                  stop=strategy.position_avg_price * (1 - stopLoss),
                  limit=strategy.position_avg_price * (1 + takeProfit))

if strategy.position_size < 0
    strategy.exit("Exit Short", "Short",
                  stop=strategy.position_avg_price * (1 + stopLoss),
                  limit=strategy.position_avg_price * (1 - takeProfit))

// Plot RSI
plot(rsi, "RSI", color=color.blue, linewidth=2)
hline(rsiOversold, "Oversold", color=color.green, linestyle=hline.style_dashed)
hline(rsiOverbought, "Overbought", color=color.red, linestyle=hline.style_dashed)
hline(50, "Midline", color=color.gray, linestyle=hline.style_dotted)
`.trim(),
  parameters: {
    rsiLength: { type: 'number', default: 14, min: 2, max: 50 },
    rsiOversold: { type: 'number', default: 30, min: 10, max: 50 },
    rsiOverbought: { type: 'number', default: 70, min: 50, max: 90 },
    stopLoss: { type: 'number', default: 2.0, min: 0.5, max: 10 },
    takeProfit: { type: 'number', default: 4.0, min: 1, max: 20 }
  }
};

/**
 * MACD Trend Following Template
 */
export const MACD_TEMPLATE: PineScriptTemplate = {
  name: 'MACD Trend Follower',
  description: 'MACD crossover with signal line confirmation',
  category: 'trend',
  code: `
//@version=5
strategy("MACD Trend Strategy", overlay=true, initial_capital=10000)

// Inputs
fastLength = input.int(12, "Fast Length", minval=5, maxval=50)
slowLength = input.int(26, "Slow Length", minval=10, maxval=100)
signalLength = input.int(9, "Signal Length", minval=3, maxval=30)
stopLoss = input.float(2.5, "Stop Loss %", minval=0.5, maxval=10) / 100
takeProfit = input.float(5.0, "Take Profit %", minval=1, maxval=20) / 100

// Calculate MACD
[macdLine, signalLine, histLine] = ta.macd(close, fastLength, slowLength, signalLength)

// Entry Conditions
longCondition = ta.crossover(macdLine, signalLine) and histLine > 0
shortCondition = ta.crossunder(macdLine, signalLine) and histLine < 0

// Execute Trades
if longCondition
    strategy.entry("Long", strategy.long)

if shortCondition
    strategy.entry("Short", strategy.short)

// Exit Management
if strategy.position_size > 0
    strategy.exit("Exit Long", "Long",
                  stop=strategy.position_avg_price * (1 - stopLoss),
                  limit=strategy.position_avg_price * (1 + takeProfit))

if strategy.position_size < 0
    strategy.exit("Exit Short", "Short",
                  stop=strategy.position_avg_price * (1 + stopLoss),
                  limit=strategy.position_avg_price * (1 - takeProfit))

// Plot signals
plotshape(longCondition, "Buy Signal", shape.triangleup, location.belowbar, color.green, size=size.small)
plotshape(shortCondition, "Sell Signal", shape.triangledown, location.abovebar, color.red, size=size.small)
`.trim(),
  parameters: {
    fastLength: { type: 'number', default: 12, min: 5, max: 50 },
    slowLength: { type: 'number', default: 26, min: 10, max: 100 },
    signalLength: { type: 'number', default: 9, min: 3, max: 30 },
    stopLoss: { type: 'number', default: 2.5, min: 0.5, max: 10 },
    takeProfit: { type: 'number', default: 5.0, min: 1, max: 20 }
  }
};

/**
 * Bollinger Bands Mean Reversion Template
 */
export const BOLLINGER_TEMPLATE: PineScriptTemplate = {
  name: 'Bollinger Band Reversal',
  description: 'Mean reversion at Bollinger Band extremes',
  category: 'mean_reversion',
  code: `
//@version=5
strategy("Bollinger Band Reversal", overlay=true, initial_capital=10000)

// Inputs
bbLength = input.int(20, "BB Length", minval=10, maxval=100)
bbStdDev = input.float(2.0, "BB StdDev", minval=1, maxval=4, step=0.5)
rsiLength = input.int(14, "RSI Length", minval=5, maxval=30)
rsiOversold = input.int(30, "RSI Oversold", minval=20, maxval=40)
rsiOverbought = input.int(70, "RSI Overbought", minval=60, maxval=80)
stopLoss = input.float(3.0, "Stop Loss %", minval=0.5, maxval=10) / 100
takeProfit = input.float(4.0, "Take Profit %", minval=1, maxval=20) / 100

// Calculate Indicators
[bbMiddle, bbUpper, bbLower] = ta.bb(close, bbLength, bbStdDev)
rsi = ta.rsi(close, rsiLength)

// Entry Conditions (Buy at lower band, Sell at upper band)
longCondition = close <= bbLower and rsi < rsiOversold
shortCondition = close >= bbUpper and rsi > rsiOverbought

// Execute Trades
if longCondition
    strategy.entry("Long", strategy.long)

if shortCondition
    strategy.entry("Short", strategy.short)

// Exit Management
if strategy.position_size > 0
    strategy.exit("Exit Long", "Long",
                  stop=strategy.position_avg_price * (1 - stopLoss),
                  limit=strategy.position_avg_price * (1 + takeProfit))

if strategy.position_size < 0
    strategy.exit("Exit Short", "Short",
                  stop=strategy.position_avg_price * (1 + stopLoss),
                  limit=strategy.position_avg_price * (1 - takeProfit))

// Plot Bollinger Bands
plot(bbMiddle, "BB Middle", color=color.blue)
plot(bbUpper, "BB Upper", color=color.red)
plot(bbLower, "BB Lower", color=color.green)
plotshape(longCondition, "Buy", shape.triangleup, location.belowbar, color.green, size=size.small)
plotshape(shortCondition, "Sell", shape.triangledown, location.abovebar, color.red, size=size.small)
`.trim(),
  parameters: {
    bbLength: { type: 'number', default: 20, min: 10, max: 100 },
    bbStdDev: { type: 'number', default: 2.0, min: 1, max: 4, step: 0.5 },
    rsiLength: { type: 'number', default: 14, min: 5, max: 30 },
    rsiOversold: { type: 'number', default: 30, min: 20, max: 40 },
    rsiOverbought: { type: 'number', default: 70, min: 60, max: 80 },
    stopLoss: { type: 'number', default: 3.0, min: 0.5, max: 10 },
    takeProfit: { type: 'number', default: 4.0, min: 1, max: 20 }
  }
};

/**
 * Get all available templates
 */
export function getAllTemplates(): PineScriptTemplate[] {
  return [
    RSI_TEMPLATE,
    MACD_TEMPLATE,
    BOLLINGER_TEMPLATE
  ];
}

/**
 * Get template by name
 */
export function getTemplateByName(name: string): PineScriptTemplate | undefined {
  return getAllTemplates().find(t => t.name === name);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: PineScriptTemplate['category']
): PineScriptTemplate[] {
  return getAllTemplates().filter(t => t.category === category);
}

/**
 * Generate PineScript from template with custom parameters
 */
export function generateFromTemplate(
  template: PineScriptTemplate,
  customParams?: Record<string, any>
): string {
  let code = template.code;

  // Replace parameters if provided
  if (customParams) {
    for (const [key, value] of Object.entries(customParams)) {
      const regex = new RegExp(`input\\.\\w+\\(${template.parameters[key]?.default}`, 'g');
      code = code.replace(regex, `input.${template.parameters[key].type}(${value}`);
    }
  }

  return code;
}

/**
 * Validate PineScript code syntax
 * Basic validation - checks for common issues
 */
export function validatePineScript(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for version declaration
  if (!code.includes('//@version=5')) {
    errors.push('Missing PineScript version declaration (//@version=5)');
  }

  // Check for strategy or indicator declaration
  if (!code.includes('strategy(') && !code.includes('indicator(')) {
    errors.push('Missing strategy() or indicator() declaration');
  }

  // Check for balanced parentheses
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push('Unbalanced parentheses');
  }

  // Check for balanced brackets
  const openBrackets = (code.match(/\[/g) || []).length;
  const closeBrackets = (code.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push('Unbalanced brackets');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Extract strategy name from PineScript code
 */
export function extractStrategyName(code: string): string | null {
  const match = code.match(/(?:strategy|indicator)\s*\(\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

/**
 * Extract all input parameters from PineScript code
 */
export function extractInputParameters(code: string): Array<{
  name: string;
  type: string;
  defaultValue: any;
  label: string;
}> {
  const params: Array<{
    name: string;
    type: string;
    defaultValue: any;
    label: string;
  }> = [];

  const inputPattern = /(\w+)\s*=\s*input\.(int|float|bool|string)\s*\(\s*([^,]+),\s*["']([^"']+)["']/g;
  
  let match;
  while ((match = inputPattern.exec(code)) !== null) {
    params.push({
      name: match[1],
      type: match[2],
      defaultValue: match[3].trim(),
      label: match[4]
    });
  }

  return params;
}