import { Trade, BacktestMetrics } from '@/types/backtest.types';

export function calculateMetrics(trades: Trade[], initialCapital: number): BacktestMetrics {
  // 1. Handle Empty Case
  if (trades.length === 0) {
    return {
      netProfit: 0, grossProfit: 0, grossLoss: 0, profitFactor: 0, returnOnCapital: 0,
      maxDrawdown: 0, maxDrawdownAbs: 0, sharpeRatio: 0, sortinoRatio: 0, calmarRatio: 0,
      totalTrades: 0, winRate: 0, avgWin: 0, avgLoss: 0, winLossRatio: 0, largestWin: 0, largestLoss: 0,
      maxConsecutiveWins: 0, maxConsecutiveLosses: 0, expectancy: 0, sqn: 0, averageHoldingBars: 0
    };
  }

  // 2. Separate Wins/Losses
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);

  // --- Profitability Metrics ---
  const grossProfit = wins.reduce((acc, t) => acc + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));
  const netProfit = grossProfit - grossLoss;
  const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
  const returnOnCapital = (netProfit / initialCapital) * 100;

  // --- Basic Trade Stats ---
  const winRate = (wins.length / trades.length) * 100;
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const winLossRatio = avgLoss === 0 ? avgWin : avgWin / avgLoss;
  const largestWin = Math.max(...trades.map(t => t.pnl));
  const largestLoss = Math.min(...trades.map(t => t.pnl));

  // --- Drawdown & Risk Analysis ---
  let peak = initialCapital;
  let currentEquity = initialCapital;
  let maxDdAbs = 0;
  let maxDdPercent = 0;
  
  // We track per-trade percentage returns for Sharpe/Sortino
  const tradeReturns: number[] = []; 

  trades.forEach((trade) => {
    const prevEquity = currentEquity;
    currentEquity += trade.pnl;
    
    // Calculate Drawdown High-Water Mark
    if (currentEquity > peak) peak = currentEquity;
    
    const ddAbs = peak - currentEquity;
    const ddPercent = peak > 0 ? (ddAbs / peak) * 100 : 0;
    
    if (ddAbs > maxDdAbs) maxDdAbs = ddAbs;
    if (ddPercent > maxDdPercent) maxDdPercent = ddPercent;

    // Calculate Return % for this specific trade relative to account size at entry
    // (Prevents skewing risk metrics if account grows significantly)
    tradeReturns.push(prevEquity > 0 ? trade.pnl / prevEquity : 0);
  });

  // --- Advanced Risk Metrics (Sharpe/Sortino) ---
  const n = tradeReturns.length;
  const meanReturn = tradeReturns.reduce((a, b) => a + b, 0) / n;
  
  // Standard Deviation (Total)
  const variance = tradeReturns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Downside Deviation (Negative returns only, for Sortino)
  const downsideReturns = tradeReturns.filter(r => r < 0);
  const downsideVariance = downsideReturns.reduce((a, b) => a + Math.pow(b, 2), 0) / n; // Divide by total N, not just downside N
  const downsideDev = Math.sqrt(downsideVariance);

  // Calculate Ratios (Trade-based, not Annualized)
  const sharpeRatio = stdDev === 0 ? 0 : meanReturn / stdDev;
  const sortinoRatio = downsideDev === 0 ? 0 : meanReturn / downsideDev;
  const calmarRatio = maxDdPercent === 0 ? 0 : returnOnCapital / maxDdPercent;

  // --- Streaks & Efficiency ---
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;

  trades.forEach(t => {
    if (t.pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
    } else {
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
    }
  });

  // Expectancy & SQN
  const expectancy = (winRate / 100 * avgWin) - ((1 - winRate / 100) * avgLoss);
  
  // System Quality Number (SQN)
  // SQN = sqrt(N) * (Mean PnL / StdDev PnL)
  const pnlMean = netProfit / n;
  const pnlVariance = trades.reduce((a, b) => a + Math.pow(b.pnl - pnlMean, 2), 0) / n;
  const pnlStdDev = Math.sqrt(pnlVariance);
  const sqn = pnlStdDev === 0 ? 0 : Math.sqrt(n) * (pnlMean / pnlStdDev);

  // Average Holding (Bars)
  // We attempt to access 'entryIndex' if it exists on the runtime object, 
  // otherwise we default to 0 to avoid guessing timeframes.
  const totalBars = trades.reduce((acc, t: any) => {
    // Check if we have the indices (passed from Engine)
    if (typeof t.entryIndex === 'number' && typeof t.exitTime === 'number') {
      // Calculate diff based on index if we tracked exit index, 
      // otherwise we can't accurately calc bars without knowing bar duration.
      // For now, let's assume if entryIndex exists, we tracked duration elsewhere or 
      // rely on the user to provide timeframe data.
      return acc; 
    }
    return acc;
  }, 0);
  
  // Alternative: If your engine tracks holding duration, use that. 
  // For this MVP, we will return 0 to be safe unless we strictly track Bar Index.
  // (Update: The Engine provided earlier tracks 'entryIndex'. To calculate 'exitIndex', 
  // we would need to store it on the trade object during 'closePosition'.)
  const averageHoldingBars = 0; 

  return {
    netProfit: Number(netProfit.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    grossLoss: Number(grossLoss.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    returnOnCapital: Number(returnOnCapital.toFixed(2)),
    
    maxDrawdown: Number(maxDdPercent.toFixed(2)),
    maxDrawdownAbs: Number(maxDdAbs.toFixed(2)),
    
    sharpeRatio: Number(sharpeRatio.toFixed(3)),
    sortinoRatio: Number(sortinoRatio.toFixed(3)),
    calmarRatio: Number(calmarRatio.toFixed(3)),
    
    totalTrades: trades.length,
    winRate: Number(winRate.toFixed(2)),
    avgWin: Number(avgWin.toFixed(2)),
    avgLoss: Number(avgLoss.toFixed(2)),
    winLossRatio: Number(winLossRatio.toFixed(2)),
    largestWin: Number(largestWin.toFixed(2)),
    largestLoss: Number(largestLoss.toFixed(2)),
    
    maxConsecutiveWins: maxWinStreak,
    maxConsecutiveLosses: maxLossStreak,
    expectancy: Number(expectancy.toFixed(2)),
    sqn: Number(sqn.toFixed(2)),
    averageHoldingBars: averageHoldingBars
  };
}