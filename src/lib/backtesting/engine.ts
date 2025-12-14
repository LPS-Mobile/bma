import { Candle, Trade, BacktestResult, StrategyFunction } from '@/types/backtest.types';
import { calculateMetrics } from './metrics';

// Helper interface to track internal state with bar index
interface InternalTrade extends Trade {
  entryIndex: number;
}

export class BacktestEngine {
  private initialCapital: number;
  private equity: number;
  private trades: Trade[] = [];
  // Use InternalTrade to track entry index for duration calc
  private currentPosition: InternalTrade | null = null;
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
      
      // Pass the current position snapshot to the strategy
      // Cast InternalTrade back to Trade to match StrategyFunction signature
      const action = strategy(candle, i, candles, this.currentPosition);

      // ✅ FIX: Explicitly cast 'this.currentPosition' to 'InternalTrade | null'
      // This stops TypeScript from narrowing it to 'never' incorrectly
      const activeTrade = this.currentPosition as InternalTrade | null;

      if (activeTrade) {
        // --- Manage Open Position ---
        if (action === 'SELL' && activeTrade.type === 'LONG') {
          this.closePosition(candle, i);
        }
        // Add SHORT exit logic here if needed:
        // else if (action === 'BUY' && activeTrade.type === 'SHORT') { ... }
        
      } else {
        // --- Check for Entry ---
        if (action === 'BUY') {
          this.openPosition(candle, i, 'LONG');
        }
      }

      // Track Equity Curve
      this.equityCurve.push({ time: candle.time, equity: this.equity });
    }

    // Force close any open position at the end of data
    if (this.currentPosition) {
      this.closePosition(candles[candles.length - 1], candles.length - 1);
    }

    // Calculate final metrics using our new robust calculator
    const metrics = calculateMetrics(this.trades, this.initialCapital);

    return {
      trades: this.trades,
      metrics,
      equityCurve: this.equityCurve,
    };
  }

  private openPosition(candle: Candle, index: number, type: 'LONG' | 'SHORT') {
    const price = candle.close;
    if (price <= 0) return;
    
    // Simple sizing: Use 100% of available equity
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
      entryIndex: index, // Track index for bar duration
    };
  }

  private closePosition(candle: Candle, index: number) {
    if (!this.currentPosition) return;

    const price = candle.close;
    this.currentPosition.exitTime = candle.time;
    this.currentPosition.exitPrice = price;
    this.currentPosition.status = 'CLOSED';

    // Calculate PnL
    if (this.currentPosition.type === 'LONG') {
      const diff = price - this.currentPosition.entryPrice;
      this.currentPosition.pnl = diff * this.currentPosition.quantity;
      this.currentPosition.pnlPercent = (diff / this.currentPosition.entryPrice) * 100;
    }

    // Update Wallet
    this.equity += this.currentPosition.pnl;
    
    // Save to history
    this.trades.push(this.currentPosition);
    this.currentPosition = null;
  }
}