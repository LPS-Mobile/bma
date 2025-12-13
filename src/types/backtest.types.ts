export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
  id: string;
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  type: 'LONG' | 'SHORT';
  quantity: number;
  pnl: number;        // Realized PnL in currency
  pnlPercent: number; // Realized PnL in percentage
  status: 'OPEN' | 'CLOSED';
}

export interface BacktestMetrics {
  // --- Profitability ---
  netProfit: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  returnOnCapital: number; // Percentage return on starting capital

  // --- Risk Analysis ---
  maxDrawdown: number;     // Percentage max drawdown
  maxDrawdownAbs: number;  // Absolute currency drawdown
  sharpeRatio: number;     // Risk-adjusted return (StdDev based)
  sortinoRatio: number;    // Downside risk-adjusted return
  calmarRatio: number;     // Annualized Return / Max Drawdown

  // --- Trade Statistics ---
  totalTrades: number;
  winRate: number;         // Percentage (0-100)
  avgWin: number;          // Average winning trade ($)
  avgLoss: number;         // Average losing trade ($)
  winLossRatio: number;    // Avg Win / Avg Loss
  largestWin: number;
  largestLoss: number;

  // --- Efficiency & Streaks ---
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  expectancy: number;      // Mathematical expectancy per trade ($)
  sqn: number;             // System Quality Number (Van Tharp)
  averageHoldingBars: number; // Average duration of a trade in bars
}

export interface BacktestResult {
  trades: Trade[];
  metrics: BacktestMetrics;
  equityCurve: { time: number; equity: number }[];
}

// Function signature for defining a strategy logic block
export type StrategyFunction = (
  candle: Candle,           // Current candle
  index: number,            // Current index in the array
  allCandles: Candle[],     // Full history up to this point
  currentPosition: Trade | null // Current open position (if any)
) => 'BUY' | 'SELL' | 'HOLD';