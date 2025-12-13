'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Play, 
  SlidersHorizontal, 
  BarChart2, 
  Cpu
} from 'lucide-react';
import { toast } from 'sonner';

// Type definition matches your Python backend's StrategyRequest
interface BacktestResult {
  metrics: {
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    totalTrades: number;
    totalReturn: number;
    equity: number;
  };
  chartImage: string; // Base64 string
  equityCurve: number[];
  dates: string[];
}

export default function CreateStrategyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BacktestResult | null>(null);

  // Form State matching backend/main.py StrategyRequest
  const [config, setConfig] = useState({
    symbol: 'ES.c.0', // Default to E-mini S&P 500 Continuous (Front Month)
    indicator: 'RSI',
    period: 14,
    buy_threshold: 30,
    sell_threshold: 70,
    start_date: '2023-01-01',
    end_date: '2023-06-01' // Shortened range for faster testing
  });

  const handleRunBacktest = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      // Calling the Python FastAPI Backend
      const response = await fetch('http://localhost:8000/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Backtest failed');
      }

      const data = await response.json();
      setResults(data);
      toast.success('Simulation complete!');
    } catch (error: any) {
      console.error('Backtest error:', error);
      // specific check for connection refused
      if (error.message.includes('fetch')) {
        toast.error('Cannot connect to Python Backend. Is it running on port 8000?');
      } else {
        toast.error(`Simulation failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 bg-gray-900 rounded-lg hover:bg-gray-800 transition">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Cpu className="w-6 h-6 text-blue-500" />
              Strategy Builder
            </h1>
            <p className="text-gray-400 text-sm">Design, backtest, and deploy your algorithm.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Configuration Panel */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-500" />
              Configuration
            </h2>

            <div className="space-y-5">
              {/* Symbol Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Asset Symbol</label>
                <select 
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={config.symbol}
                  onChange={(e) => setConfig({...config, symbol: e.target.value})}
                >
                  <optgroup label="Equity Index Futures">
                    <option value="ES.c.0">S&P 500 E-mini (ES.c.0)</option>
                    <option value="NQ.c.0">Nasdaq 100 E-mini (NQ.c.0)</option>
                    <option value="YM.c.0">Dow Jones E-mini (YM.c.0)</option>
                    <option value="RTY.c.0">Russell 2000 (RTY.c.0)</option>
                  </optgroup>
                  <optgroup label="Crypto Futures">
                    <option value="BTC.c.0">Bitcoin (BTC.c.0)</option>
                    <option value="ETH.c.0">Ethereum (ETH.c.0)</option>
                  </optgroup>
                  <optgroup label="Commodities">
                    <option value="GC.c.0">Gold (GC.c.0)</option>
                    <option value="CL.c.0">Crude Oil (CL.c.0)</option>
                  </optgroup>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  * Using Databento Continuous Contract Symbology
                </p>
              </div>

              {/* Indicator Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Primary Indicator</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setConfig({...config, indicator: 'RSI'})}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                      config.indicator === 'RSI' 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-black border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    RSI
                  </button>
                  <button 
                    onClick={() => setConfig({...config, indicator: 'SMA'})}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                      config.indicator === 'SMA' 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-black border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    SMA
                  </button>
                </div>
              </div>

              {/* Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Period / Length</label>
                  <input 
                    type="number" 
                    value={config.period}
                    onChange={(e) => setConfig({...config, period: Number(e.target.value)})}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Buy Threshold</label>
                  <input 
                    type="number" 
                    value={config.buy_threshold}
                    onChange={(e) => setConfig({...config, buy_threshold: Number(e.target.value)})}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Sell Threshold</label>
                  <input 
                    type="number" 
                    value={config.sell_threshold}
                    onChange={(e) => setConfig({...config, sell_threshold: Number(e.target.value)})}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button 
                  onClick={handleRunBacktest}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Play className="w-5 h-5" /> Run Simulation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Results Display */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard 
                label="Win Rate" 
                value={results ? `${(results.metrics.winRate * 100).toFixed(1)}%` : '-'} 
                color="text-emerald-400" 
              />
              <MetricCard 
                label="Profit Factor" 
                value={results ? results.metrics.profitFactor.toFixed(2) : '-'} 
                color="text-blue-400" 
              />
              <MetricCard 
                label="Max Drawdown" 
                value={results ? `${(results.metrics.maxDrawdown * 100).toFixed(1)}%` : '-'} 
                color="text-red-400" 
              />
              <MetricCard 
                label="Total Return" 
                value={results ? `${results.metrics.totalReturn}%` : '-'} 
                color={results?.metrics.totalReturn && results.metrics.totalReturn > 0 ? "text-green-400" : "text-gray-400"} 
              />
            </div>

            {/* 2. Chart Area */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 min-h-[400px] flex flex-col">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-gray-400" />
                Performance Chart
              </h3>
              
              <div className="flex-1 bg-black/50 rounded-xl border border-gray-800 flex items-center justify-center relative overflow-hidden">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-500 font-mono">Running Python Engine...</span>
                  </div>
                ) : results?.chartImage ? (
                  <div className="relative w-full h-full min-h-[350px]">
                    <Image 
                      src={results.chartImage} 
                      alt="Backtest Performance Chart" 
                      fill
                      className="object-contain p-4"
                      unoptimized // Important for Base64 Data URLs in some Next.js configs
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-600">
                    <p>Configure your strategy and click "Run Simulation"</p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. JSON Data (Debug / Advanced) */}
            {results && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <details>
                  <summary className="cursor-pointer text-xs text-gray-500 font-mono hover:text-gray-300">
                    View Raw Engine Response
                  </summary>
                  <pre className="mt-4 p-4 bg-black rounded-lg text-xs text-green-400 overflow-auto max-h-40 font-mono">
                    {JSON.stringify(results.metrics, null, 2)}
                  </pre>
                </details>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Sub-component for Metrics
function MetricCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}