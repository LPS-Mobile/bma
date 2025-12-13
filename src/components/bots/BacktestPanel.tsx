'use client';

import { useState, useCallback } from 'react';
import { Play, RefreshCw, AlertCircle } from 'lucide-react'; 

import BacktestMetrics from './BacktestMetrics';
import EquityCurveChart from './EquityCurveChart';
import { Button } from '@/components/ui/button'; // Note: lowercase 'b' based on your dump

import { BacktestEngine } from '@/lib/backtesting/engine';
import { SMA, crossover, crossunder } from '@/lib/backtesting/indicators';
import { StrategyFunction, BacktestResult, Candle } from '@/types/backtest.types';

export default function BacktestPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BacktestResult | null>(null);

  const handleRunBacktest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Real Data
      const response = await fetch('/api/market-data?symbol=ES.c.0');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch market data');
      }

      const data = await response.json();
      const candles: Candle[] = data.candles;

      if (!candles || candles.length === 0) {
        throw new Error("No data returned from market data provider.");
      }

      // 2. Define Strategy (SMA 9/21 Crossover)
      const strategy: StrategyFunction = (candle, index, allCandles) => {
        const fastMA = SMA(allCandles, 9, index);
        const slowMA = SMA(allCandles, 21, index);
        const prevFast = SMA(allCandles, 9, index - 1);
        const prevSlow = SMA(allCandles, 21, index - 1);

        if (!fastMA || !slowMA || !prevFast || !prevSlow) return 'HOLD';

        if (crossover(fastMA, slowMA, prevFast, prevSlow)) return 'BUY';
        if (crossunder(fastMA, slowMA, prevFast, prevSlow)) return 'SELL';
        
        return 'HOLD';
      };

      // 3. Run Engine
      const engine = new BacktestEngine(10000); 
      const simulationResults = engine.run(candles, strategy);

      setResults(simulationResults);

    } catch (err: any) {
      console.error("Backtest failed:", err);
      setError(err.message || "An error occurred while running the simulation.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-900 p-4 rounded-lg border border-gray-800 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Backtest Simulation</h2>
          <p className="text-sm text-gray-400">Strategy: SMA Crossover (ES Futures)</p>
        </div>
        
        <div className="flex items-center gap-4">
            {results && (
                <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-500">Last Run</p>
                    <p className="text-xs text-gray-300">{new Date().toLocaleTimeString()}</p>
                </div>
            )}
            
            <Button 
              onClick={handleRunBacktest} 
              disabled={loading} 
              variant="default" 
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                  'Fetching Data...'
              ) : (
                  <>
                  {results ? <RefreshCw className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {results ? 'Run Again' : 'Run Test'}
                  </>
              )}
            </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {results && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <BacktestMetrics metrics={results.metrics} />
          <EquityCurveChart data={results.equityCurve} />
          
          <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-300">Trade History</h3>
              <span className="text-xs text-gray-500">{results.trades.length} Trades Executed</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-gray-500 uppercase bg-gray-950/50">
                  <tr>
                    <th className="px-4 py-3">Side</th>
                    <th className="px-4 py-3">Entry Price</th>
                    <th className="px-4 py-3">Exit Price</th>
                    <th className="px-4 py-3 text-right">PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {results.trades.slice().reverse().slice(0, 10).map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            trade.type === 'LONG' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                            {trade.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 font-mono">${trade.entryPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-300 font-mono">${trade.exitPrice.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${trade.pnl > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {results.trades.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No trades.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}