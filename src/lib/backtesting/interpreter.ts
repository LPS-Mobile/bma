import { Candle, Trade, StrategyFunction } from '@/types/backtest.types';
import { SMA } from './indicators';

// Simple RSI implementation for the interpreter
function RSI(candles: Candle[], period: number, index: number): number {
  if (index < period) return 50; 
  let gains = 0, losses = 0;
  
  for (let i = 0; i < period; i++) {
    const diff = candles[index - i].close - candles[index - i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// The Parser: JSON -> Function
export function compileStrategy(logic: any): StrategyFunction {
  return (candle: Candle, index: number, allCandles: Candle[], position: Trade | null) => {
    
    // Helper to evaluate a "side" of the condition (Left or Right)
    const evaluate = (item: any) => {
      if (item.type === 'value') return item.value;
      if (item.type === 'indicator') {
        if (item.name === 'price') return candle.close;
        if (item.name === 'sma') return SMA(allCandles, item.params[0], index) || 0;
        if (item.name === 'rsi') return RSI(allCandles, item.params[0], index);
      }
      return 0;
    };

    // Helper to check a list of conditions
    const checkConditions = (conditions: any[]) => {
      if (!conditions || conditions.length === 0) return false;
      
      // Default to AND logic (all must be true)
      return conditions.every(cond => {
        const left = evaluate(cond.left);
        const right = evaluate(cond.right);
        
        switch (cond.type) {
          case 'greaterThan': return left > right;
          case 'lessThan': return left < right;
          case 'equals': return left === right;
          // Simplified crossover check (comparing current vs prev would require more state tracking)
          case 'crossover': return left > right; 
          case 'crossunder': return left < right;
          default: return false;
        }
      });
    };

    // MAIN LOGIC LOOP
    if (position) {
      // If we have a position, check EXIT conditions
      if (checkConditions(logic.exit)) {
        // If long and exit signal -> Sell
        if (position.type === 'LONG') return 'SELL';
      }
    } else {
      // If no position, check ENTRY conditions
      if (checkConditions(logic.entry)) {
        return 'BUY';
      }
    }

    return 'HOLD';
  };
}