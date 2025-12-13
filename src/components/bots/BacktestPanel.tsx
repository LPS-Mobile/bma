'use client';

import { useState, useCallback, useEffect } from 'react';
import { Play, RefreshCw, AlertCircle, Code, ArrowRight } from 'lucide-react'; 

import BacktestMetrics from './BacktestMetrics';
import EquityCurveChart from './EquityCurveChart';
// ✅ FIX 1: Ensure lowercase 'button' matches your file system
import { Button } from '@/components/ui/button'; 

import { BacktestEngine } from '@/lib/backtesting/engine';
import { SMA, crossover, crossunder } from '@/lib/backtesting/indicators';
import { StrategyFunction, BacktestResult, Candle } from '@/types/backtest.types';

interface BacktestPanelProps {
  code?: string;
  parameters?: any;
  onResults?: (results: any) => void;
  onExport?: () => void;
}

export default function BacktestPanel({ 
  code = '', 
  parameters = {}, 
  onResults, 
  onExport 
}: BacktestPanelProps) {
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BacktestResult | null>(null);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (Object.keys(parameters).length > 0 && !results) {
       // Optional: Auto-run logic
    }
  }, [parameters]);

  const handleRunBacktest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const symbol = parameters.symbol || 'ES.c.0';
      const response = await fetch(`/api/market-data?symbol=${symbol}`);
      
      let candles: Candle[] = [];
      
      if (!response.ok) {
        console.warn("API failed, using mock data for demo purposes");
      }

      if (response.ok) {
        const data = await response.json();
        candles = data.candles;
      } else {
        // Fallback: Generate synthetic data
        const now = new Date();
        let price = 5000;
        for (let i = 0; i < 365; i++) {
            price = price * (1 + (Math.random() - 0.45) * 0.02);
            candles.push({
                // ✅ FIX 2: Return a Number (Timestamp) instead of String
                time: new Date(now.getTime() - (365 - i) * 86400000).getTime(), 
                open: price,
                high: price * 1.01,
                low: price * 0.99,
                close: price * (1 + (Math.random() - 0.5) * 0.01),
                volume: 1000
            });
        }
      }

      if (!candles || candles.length === 0) {
        throw new Error("No data returned from market data provider.");
      }

      const strategy: StrategyFunction = (candle, index, allCandles) => {
        const fastPeriod = Number(parameters.fastPeriod) || 9;
        const slowPeriod = Number(parameters.slowPeriod) || 21;

        const fastMA = SMA(allCandles, fastPeriod, index);
        const slowMA = SMA(allCandles, slowPeriod, index);
        const prevFast = SMA(allCandles, fastPeriod, index - 1);
        const prevSlow = SMA(allCandles, slowPeriod, index - 1);

        if (!fastMA || !slowMA || !prevFast || !prevSlow) return 'HOLD';

        if (crossover(fastMA, slowMA, prevFast, prevSlow)) return 'BUY';
        if (crossunder(fastMA, slowMA, prevFast, prevSlow)) return 'SELL';
        
        return 'HOLD';
      };

      const engine = new BacktestEngine(10000); 
      const simulationResults = engine.run(candles, strategy);

      setResults(simulationResults);

      if (onResults) {
        onResults(simulationResults.metrics);
      }

    } catch (err: any) {
      console.error("Backtest failed:", err);
      setError(err.message || "An error occurred while running the simulation.");
    } finally {
      setLoading(false);
    }
  }, [parameters, onResults]);

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-900 p-4 rounded-xl border border-gray-800 gap-4 shadow-lg">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            Simulation Engine
            <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">Active</span>
          </h2>
          <div className="flex gap-4 text-sm text-gray-400 mt-1">
             <span>Fast MA: <b className="text-white">{parameters.fastPeriod || 9}</b></span>
             <span>Slow MA: <b className="text-white">{parameters.slowPeriod || 21}</b></span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCode(!showCode)}
                className="hidden sm:flex border-gray-700 hover:bg-gray-800"
            >
                <Code className="w-4 h-4 mr-2" />
                {showCode ? 'Hide Code' : 'View Code'}
            </Button>

            <Button 
              onClick={handleRunBacktest} 
              disabled={loading} 
              variant="default" 
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
            >
              {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
              ) : (
                  <>
                  {results ? <RefreshCw className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {results ? 'Rerun Test' : 'Start Simulation'}
                  </>
              )}
            </Button>
        </div>
      </div>

      {/* Code Toggle View */}
      {showCode && code && (
          <div className="bg-black border border-gray-800 rounded-lg p-4 animate-in slide-in-from-top-2">
              <pre className="text-xs text-gray-400 font-mono overflow-x-auto p-2">
                  {code}
              </pre>
          </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {results && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          
          <BacktestMetrics metrics={results.metrics} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <EquityCurveChart data={results.equityCurve} />
            </div>
            
            <div className="lg:col-span-1 rounded-xl border border-gray-800 bg-gray-900/50 flex flex-col h-[400px]">
                <div className="px-4 py-3 border-b border-gray-800 bg-gray-900 rounded-t-xl">
                  <h3 className="text-sm font-medium text-gray-300">Recent Trades</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-0">
                    <table className="w-full text-xs text-left">
                        <thead className="text-gray-500 bg-gray-950/50 sticky top-0">
                        <tr>
                            <th className="px-3 py-2">Type</th>
                            <th className="px-3 py-2">Entry</th>
                            <th className="px-3 py-2 text-right">PnL</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                        {results.trades.slice().reverse().map((trade) => (
                            <tr key={trade.id} className="hover:bg-gray-800/50">
                            <td className="px-3 py-2">
                                <span className={`font-bold ${trade.type === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>
                                    {trade.type}
                                </span>
                            </td>
                            <td className="px-3 py-2 text-gray-400">${trade.entryPrice.toFixed(2)}</td>
                            <td className={`px-3 py-2 text-right font-mono font-bold ${trade.pnl > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-800">
             <Button 
                size="lg" 
                onClick={onExport}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20"
             >
                Deploy Strategy <ArrowRight className="w-5 h-5 ml-2" />
             </Button>
          </div>
          
        </div>
      )}
    </div>
  );
}