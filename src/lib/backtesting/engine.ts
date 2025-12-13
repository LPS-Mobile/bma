import { Candle, Trade, BacktestResult, StrategyFunction } from '@/types/backtest.types';
import { calculateMetrics } from './metrics';

export class BacktestEngine {
  private initialCapital: number;
  private equity: number;
  private trades: Trade[] = [];
  private currentPosition: Trade | null = null;
  private equityCurve: { time: number; equity: number }[] = [];

  constructor(initialCapital: number = 10000) {
    this.initialCapital = initialCapital;
    this.equity = initialCapital;
  }

  public run(candles: Candle[], strategy: StrategyFunction): BacktestResult {
    // Reset state
    this.equity = this.initialCapital;
    this.trades = [];
    this.currentPosition = null;
    this.equityCurve = [{ time: candles[0].time, equity: this.initialCapital }];

    // Main Simulation Loop
    for (let i = 0; i < candles.length; i++) {
      const candle = candles[i];
      const action = strategy(candle, i, candles, this.currentPosition);

      // Logic: Execute Orders
      if (this.currentPosition) {
        // If we have a position, check for exit signals
        if (action === 'SELL' && this.currentPosition.type === 'LONG') {
          this.closePosition(candle);
        }
        // (Add logic here if you want to support Shorting, currently Long-only for simplicity)
      } else {
        // No position, check for entry signals
        if (action === 'BUY') {
          this.openPosition(candle, 'LONG');
        }
      }

      // Track Equity Curve (Mark to Market)
      // Note: Real equity curve updates on every candle close, even if trade isn't closed
      // For simplicity, we just push current equity + unrealized PnL? 
      // Let's just push realized equity for this MVP to keep it fast.
      this.equityCurve.push({ time: candle.time, equity: this.equity });
    }

    // Force close any open position at the end of data
    if (this.currentPosition) {
      this.closePosition(candles[candles.length - 1]);
    }

    // Calculate final metrics
    const metrics = calculateMetrics(this.trades, this.initialCapital);

    return {
      trades: this.trades,
      metrics,
      equityCurve: this.equityCurve,
    };
  }

  private openPosition(candle: Candle, type: 'LONG' | 'SHORT') {
    // Simple sizing: Use 100% of equity (Compounding) or Fixed?
    // Let's use 100% of current equity to buy
    const price = candle.close;
    const quantity = this.equity / price; 

    this.currentPosition = {
      id: Math.random().toString(36).substr(2, 9),
      entryTime: candle.time,
      exitTime: 0,
      entryPrice: price,
      exitPrice: 0,
      type: type,
      quantity: quantity,
      pnl: 0,
      pnlPercent: 0,
      status: 'OPEN',
    };
  }

  private closePosition(candle: Candle) {
    if (!this.currentPosition) return;

    const price = candle.close;
    this.currentPosition.exitTime = candle.time;
    this.currentPosition.exitPrice = price;
    this.currentPosition.status = 'CLOSED';

    // Calculate PnL
    if (this.currentPosition.type === 'LONG') {
      this.currentPosition.pnl = (price - this.currentPosition.entryPrice) * this.currentPosition.quantity;
      this.currentPosition.pnlPercent = ((price - this.currentPosition.entryPrice) / this.currentPosition.entryPrice) * 100;
    }

    // Update Wallet
    this.equity += this.currentPosition.pnl;
    
    // Save to history
    this.trades.push(this.currentPosition);
    this.currentPosition = null;
  }
}