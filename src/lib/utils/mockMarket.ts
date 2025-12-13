import { Candle } from '@/types/backtest.types';

export function generateMockData(count: number = 200): Candle[] {
  const candles: Candle[] = [];
  let price = 100;
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    // Sine wave trend + random noise
    const trend = Math.sin(i / 10) * 5; 
    const noise = (Math.random() - 0.5) * 2;
    
    const close = price + trend + noise;
    const open = close - (Math.random() - 0.5);
    const high = Math.max(open, close) + Math.random();
    const low = Math.min(open, close) - Math.random();

    candles.push({
      time: now + i * 60000, 
      open, high, low, close,
      volume: Math.floor(Math.random() * 1000),
    });
    price = close; // continuity
  }
  return candles;
}