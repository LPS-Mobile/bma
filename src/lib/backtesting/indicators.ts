import { Candle } from '@/types/backtest.types';

export const SMA = (candles: Candle[], period: number, index: number): number | null => {
  if (index < period - 1) return null;
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[index - i].close;
  }
  return sum / period;
};

// Simple helper to check crossover
export const crossover = (val1: number, val2: number, prevVal1: number, prevVal2: number): boolean => {
  return prevVal1 <= prevVal2 && val1 > val2;
};

export const crossunder = (val1: number, val2: number, prevVal1: number, prevVal2: number): boolean => {
  return prevVal1 >= prevVal2 && val1 < val2;
};