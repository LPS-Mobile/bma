'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import StrategyInput from '@/components/bots/StrategyInput';
import ParameterTuning from '@/components/bots/ParameterTuning';
import BacktestPanel from '@/components/bots/BacktestPanel';
import BacktestMetrics from '@/components/bots/BacktestMetrics';
import EquityCurveChart from '@/components/bots/EquityCurveChart';
import TradeChart from '@/components/bots/TradeChart';
import InviteLink from '@/components/bots/InviteLink';
import TemplateMarketplace from '@/components/bots/TemplateMarketplace';
import { Sparkles, Settings, TrendingUp, BarChart3, LineChart, Share2, Zap, Store } from 'lucide-react';

export default function BotComponentsPreview() {
  const [strategy, setStrategy] = useState('');
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const mockParameters = {
    rsiLength: {
      name: 'rsiLength',
      label: 'RSI Period',
      type: 'number' as const,
      value: 14,
      min: 5,
      max: 50,
      step: 1,
      description: 'Number of periods for RSI calculation',
      category: 'Indicators',
    },
    rsiOversold: {
      name: 'rsiOversold',
      label: 'Oversold Level',
      type: 'number' as const,
      value: 30,
      min: 10,
      max: 50,
      step: 5,
      description: 'RSI level considered oversold',
      category: 'Entry Signals',
    },
    rsiOverbought: {
      name: 'rsiOverbought',
      label: 'Overbought Level',
      type: 'number' as const,
      value: 70,
      min: 50,
      max: 90,
      step: 5,
      description: 'RSI level considered overbought',
      category: 'Exit Signals',
    },
    stopLoss: {
      name: 'stopLoss',
      label: 'Stop Loss %',
      type: 'number' as const,
      value: 2,
      min: 0.5,
      max: 10,
      step: 0.5,
      description: 'Stop loss percentage',
      category: 'Risk Management',
    },
    takeProfit: {
      name: 'takeProfit',
      label: 'Take Profit %',
      type: 'number' as const,
      value: 5,
      min: 1,
      max: 20,
      step: 1,
      description: 'Take profit percentage',
      category: 'Risk Management',
    },
    useTrailingStop: {
      name: 'useTrailingStop',
      label: 'Use Trailing Stop',
      type: 'boolean' as const,
      value: false,
      description: 'Enable trailing stop loss',
      category: 'Risk Management',
    },
  };

  const mockBacktestResults = {
    totalReturn: 24.5,
    winRate: 68.2,
    profitFactor: 2.3,
    totalTrades: 342,
    maxDrawdown: 8.4,
    sharpeRatio: 1.8,
    avgWin: 145.50,
    avgLoss: 63.20,
  };

  const mockEquityCurve = [
    { date: '2024-01', equity: 10000, drawdown: 0 },
    { date: '2024-02', equity: 10500, drawdown: -2.1 },
    { date: '2024-03', equity: 11200, drawdown: 0 },
    { date: '2024-04', equity: 10800, drawdown: -3.6 },
    { date: '2024-05', equity: 11800, drawdown: 0 },
    { date: '2024-06', equity: 12200, drawdown: 0 },
    { date: '2024-07', equity: 11900, drawdown: -2.5 },
    { date: '2024-08', equity: 12800, drawdown: 0 },
    { date: '2024-09', equity: 13200, drawdown: 0 },
    { date: '2024-10', equity: 12450, drawdown: -5.7 },
    { date: '2024-11', equity: 13800, drawdown: 0 },
    { date: '2024-12', equity: 14500, drawdown: 0 },
  ];

  const mockPriceData = [
    { date: '2024-01', price: 42000 },
    { date: '2024-02', price: 45000 },
    { date: '2024-03', price: 43000 },
    { date: '2024-04', price: 48000 },
    { date: '2024-05', price: 46000 },
    { date: '2024-06', price: 50000 },
    { date: '2024-07', price: 49000 },
    { date: '2024-08', price: 52000 },
    { date: '2024-09', price: 51000 },
    { date: '2024-10', price: 48000 },
    { date: '2024-11', price: 54000 },
    { date: '2024-12', price: 56000 },
  ];

  const mockTrades = [
    { entryDate: '2024-02', entryPrice: 44000, exitDate: '2024-03', exitPrice: 46000, type: 'long' as const, profit: 2000 },
    { entryDate: '2024-04', entryPrice: 47000, exitDate: '2024-05', exitPrice: 46500, type: 'short' as const, profit: 500 },
    { entryDate: '2024-06', entryPrice: 49000, exitDate: '2024-07', exitPrice: 51000, type: 'long' as const, profit: 2000 },
    { entryDate: '2024-08', entryPrice: 51500, exitDate: '2024-09', exitPrice: 52500, type: 'long' as const, profit: 1000 },
    { entryDate: '2024-10', entryPrice: 49000, exitDate: '2024-11', exitPrice: 53000, type: 'long' as const, profit: 4000 },
  ];

  const tabs = [
    { id: 'templates', label: 'Templates', icon: Store },
    { id: 'input', label: 'Strategy Input', icon: Sparkles },
    { id: 'params', label: 'Parameters', icon: Settings },
    { id: 'backtest', label: 'Backtest', icon: Zap },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    { id: 'equity', label: 'Equity Curve', icon: LineChart },
    { id: 'trades', label: 'Trade Chart', icon: TrendingUp },
    { id: 'invite', label: 'Deploy', icon: Share2 },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar - Terminal Style (Match Dashboard) */}
      <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left - Brand */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">B</span>
                </div>
                <span className="text-lg font-bold">Botman AI</span>
              </div>
              
              {/* Nav Links */}
              <div className="hidden md:flex items-center gap-1 text-sm">
                <a href="/dashboard-preview" className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">Dashboard</a>
                <a href="/bot-preview" className="px-3 py-1.5 text-white bg-gray-800 rounded-lg font-medium">Bot Builder</a>
                <a href="#" className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">Analytics</a>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg text-xs">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-gray-400">Preview Mode</span>
              </div>

              <Button variant="primary" size="sm">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Bot
              </Button>

              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-105 transition-transform">
                TU
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation - Terminal Style */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2
                    ${isActive 
                      ? 'text-white border-blue-500 bg-gray-800/50' 
                      : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-gray-800/30'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'templates' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-mono mb-2">TEMPLATE_MARKETPLACE</h2>
                <p className="text-gray-400 text-sm">Choose a proven strategy or start from scratch</p>
              </div>
              <TemplateMarketplace
                onSelectTemplate={(template) => {
                  console.log('Selected template:', template);
                  if (template) {
                    setStrategy(template.description);
                    setActiveTab('input');
                  }
                }}
                onSkip={() => setActiveTab('input')}
              />
            </div>
          )}

          {activeTab === 'input' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-mono mb-2">STRATEGY_INPUT</h2>
                <p className="text-gray-400 text-sm">Describe what you want in plain English - no coding required</p>
              </div>
              <StrategyInput
                value={strategy}
                onChange={setStrategy}
                onGenerate={() => alert('Generate clicked! (Mock)')}
                isGenerating={false}
              />
            </div>
          )}

          {activeTab === 'params' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-mono mb-2">PARAMETER_TUNING</h2>
                <p className="text-gray-400 text-sm">Optimize your strategy with interactive controls</p>
              </div>
              <ParameterTuning
                parameters={mockParameters}
                onChange={(params) => console.log('Parameters updated:', params)}
              />
            </div>
          )}

          {activeTab === 'backtest' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-mono mb-2">BACKTEST_ENGINE</h2>
                <p className="text-gray-400 text-sm">Test performance on historical data with Python backtesting</p>
              </div>
              <BacktestPanel
                code="python_code_here"
                parameters={mockParameters}
                onResults={(results) => console.log('Backtest results:', results)}
                onExport={() => alert('Export clicked!')}
              />
            </div>
          )}

          {activeTab === 'metrics' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-mono mb-2">PERFORMANCE_METRICS</h2>
                <p className="text-gray-400 text-sm">Comprehensive statistics: Win rate, Sharpe ratio, and more</p>
              </div>
              <BacktestMetrics results={mockBacktestResults} />
            </div>
          )}

          {activeTab === 'equity' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-mono mb-2">EQUITY_CURVE</h2>
                <p className="text-gray-400 text-sm">Visualize your strategy's performance over time</p>
              </div>
              <EquityCurveChart data={mockEquityCurve} />
            </div>
          )}

          {activeTab === 'trades' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-mono mb-2">TRADE_VISUALIZATION</h2>
                <p className="text-gray-400 text-sm">See exactly where your strategy enters and exits positions</p>
              </div>
              <TradeChart priceData={mockPriceData} trades={mockTrades} />
            </div>
          )}

          {activeTab === 'invite' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-mono mb-2">DEPLOY_TO_TRADINGVIEW</h2>
                <p className="text-gray-400 text-sm">Get your secure invite link and start trading</p>
              </div>
              <InviteLink
                botId="mock-bot-123"
                botName="RSI Momentum Strategy"
                onGenerate={() => console.log('Invite generated')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}