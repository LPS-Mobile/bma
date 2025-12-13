import { Trade, BacktestMetrics } from '@/types/backtest.types';

export function calculateMetrics(trades: Trade[], initialCapital: number): BacktestMetrics {
  if (trades.length === 0) {
    // Return empty/zero metrics
    return {
      netProfit: 0, grossProfit: 0, grossLoss: 0, profitFactor: 0, returnOnCapital: 0,
      maxDrawdown: 0, maxDrawdownAbs: 0, sharpeRatio: 0, sortinoRatio: 0, calmarRatio: 0,
      totalTrades: 0, winRate: 0, avgWin: 0, avgLoss: 0, winLossRatio: 0, largestWin: 0, largestLoss: 0,
      maxConsecutiveWins: 0, maxConsecutiveLosses: 0, expectancy: 0, sqn: 0, averageHoldingBars: 0
    };
  }

  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);

  // --- 1. Profitability ---
  const grossProfit = wins.reduce((acc, t) => acc + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));
  const netProfit = grossProfit - grossLoss;
  const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
  const returnOnCapital = (netProfit / initialCapital) * 100;

  // --- 2. Trade Stats ---
  const winRate = (wins.length / trades.length) * 100;
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const winLossRatio = avgLoss === 0 ? avgWin : avgWin / avgLoss;
  const largestWin = Math.max(...trades.map(t => t.pnl));
  const largestLoss = Math.min(...trades.map(t => t.pnl));

  // --- 3. Drawdown & Risk ---
  let peak = initialCapital;
  let currentEquity = initialCapital;
  let maxDdAbs = 0;
  let maxDdPercent = 0;
  
  const tradeReturns: number[] = []; // % returns per trade for Sharpe/Sortino

  trades.forEach((trade) => {
    const prevEquity = currentEquity;
    currentEquity += trade.pnl;
    
    // Drawdown
    if (currentEquity > peak) peak = currentEquity;
    const ddAbs = peak - currentEquity;
    const ddPercent = (ddAbs / peak) * 100;
    
    if (ddAbs > maxDdAbs) maxDdAbs = ddAbs;
    if (ddPercent > maxDdPercent) maxDdPercent = ddPercent;

    // Return % for StdDev calcs
    tradeReturns.push(trade.pnl / prevEquity);
  });

  // Standard Deviation of Returns
  const meanReturn = tradeReturns.reduce((a, b) => a + b, 0) / tradeReturns.length;
  const variance = tradeReturns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / tradeReturns.length;
  const stdDev = Math.sqrt(variance);

  // Downside Deviation (for Sortino) - only negative returns
  const downsideReturns = tradeReturns.filter(r => r < 0);
  const downsideVariance = downsideReturns.reduce((a, b) => a + Math.pow(b, 2), 0) / tradeReturns.length; // Dividing by total N
  const downsideDev = Math.sqrt(downsideVariance);

  // Ratios (Annualized approximations assuming trade frequency, but kept raw here for simplicity)
  // To make these "real" Sharpe ratios, you'd usually annualize based on time. 
  // Here we calculate "Trade Sharpe" (Risk adjusted return per trade).
  const sharpeRatio = stdDev === 0 ? 0 : meanReturn / stdDev;
  const sortinoRatio = downsideDev === 0 ? 0 : meanReturn / downsideDev;
  const calmarRatio = maxDdPercent === 0 ? 0 : returnOnCapital / maxDdPercent;

  // --- 4. Streaks & Efficiency ---
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

  const expectancy = (winRate / 100 * avgWin) - ((1 - winRate / 100) * avgLoss);
  
  // SQN = square_root(trades) * (Expectancy / Stdev of PnL)
  // We need Stdev of $ PnL (not % returns) for standard SQN formula
  const pnlMean = netProfit / trades.length;
  const pnlVariance = trades.reduce((a, b) => a + Math.pow(b.pnl - pnlMean, 2), 0) / trades.length;
  const pnlStdDev = Math.sqrt(pnlVariance);
  const sqn = pnlStdDev === 0 ? 0 : Math.sqrt(trades.length) * (pnlMean / pnlStdDev);

  // Average Holding (Bars)
  const avgDuration = trades.reduce((acc, t) => acc + (t.exitTime - t.entryTime), 0) / trades.length;
  // Convert ms duration to bars (assuming 1m timeframe for simplicity or generic unit)
  const avgBars = avgDuration / 60000; // Rough estimate

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
    averageHoldingBars: Math.round(avgBars)
  };
}