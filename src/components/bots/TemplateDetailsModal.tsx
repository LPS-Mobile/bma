'use client';

import { X, TrendingUp, Target, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TemplateDetailsModalProps {
  template: any;
  onClose: () => void;
  onSelect: () => void;
}

const templateDetails: Record<string, any> = {
  'liquidity-sweep': {
    fullDescription: "The Liquidity Sweep Hunter strategy is based on Smart Money Concepts (SMC) and institutional trading behavior. It identifies when market makers 'sweep' liquidity pools at key levels before reversing direction.",
    howItWorks: [
      {
        title: "1. Identify Key Liquidity Levels",
        description: "The strategy scans for swing highs and swing lows where retail traders typically place their stop losses. These areas contain 'liquidity pools' - clusters of pending orders that institutions target.",
        example: "If price makes a swing high at $50,000, retail traders place stops just above at $50,100. This creates a liquidity pool."
      },
      {
        title: "2. Detect Liquidity Sweep",
        description: "When price briefly spikes above the swing high (or below swing low), it triggers retail stop losses, providing liquidity for smart money to enter large positions in the opposite direction.",
        example: "Price spikes to $50,150, triggers stops, then immediately reverses. This is the 'liquidity grab'."
      },
      {
        title: "3. Entry on Reversal",
        description: "After the sweep, the bot enters when price shows reversal confirmation with a strong candle close back inside the range, often accompanied by increased volume.",
        example: "After hitting $50,150, price closes at $49,800 with strong bearish momentum - entry signal confirmed."
      },
      {
        title: "4. Target & Exit",
        description: "Targets the opposite liquidity pool or a predetermined reward ratio. Stop loss is placed just beyond the sweep level to protect against genuine breakouts.",
        example: "Target: $48,000 (opposite liquidity). Stop: $50,200 (just above sweep)."
      }
    ],
    keyFeatures: [
      "Identifies swing high/low liquidity pools automatically",
      "Confirms sweep with wick analysis and volume",
      "Multiple timeframe validation (HTF structure + LTF entry)",
      "Dynamic stop loss based on market structure",
      "Risk-reward ratio: Minimum 1:2, optimal 1:3+",
      "Works best in trending and ranging markets"
    ],
    idealFor: [
      "Traders familiar with Smart Money Concepts",
      "Those who understand institutional order flow",
      "Swing traders and day traders",
      "Markets with clear liquidity levels (crypto, forex, indices)"
    ],
    riskWarnings: [
      "Requires patience - not every level gets swept",
      "False sweeps can occur in choppy markets",
      "Best results on higher timeframes (15m+)",
      "Needs understanding of market structure"
    ],
    parameters: [
      { name: "Sweep Distance", description: "How far beyond level constitutes a sweep", default: "5-10 pips/points" },
      { name: "Lookback Period", description: "How many candles to identify swing points", default: "20-50 bars" },
      { name: "Volume Confirmation", description: "Require volume spike on reversal", default: "1.5x average" },
      { name: "Risk-Reward Ratio", description: "Minimum R:R for trade entry", default: "1:2" }
    ]
  },
  'fvg-scalper': {
    fullDescription: "The FVG (Fair Value Gap) Scalper exploits price inefficiencies or 'imbalances' in the market. When price moves rapidly, it leaves gaps between candle bodies that often get filled when price returns, providing high-probability entry zones.",
    howItWorks: [
      {
        title: "1. Identify Fair Value Gaps",
        description: "An FVG forms when there's a 3-candle pattern where the middle candle's high doesn't overlap with the next candle's low (bullish FVG) or vice versa (bearish FVG). This gap represents unfilled orders.",
        example: "Candle 1 high: $100, Candle 2 range: $101-$105, Candle 3 low: $107. Gap between $101-$107 is the FVG."
      },
      {
        title: "2. Wait for Price Return",
        description: "The strategy waits for price to return to the FVG zone. Market makers often fill these gaps as they represent fair value areas where institutional orders are waiting.",
        example: "Price rallies to $120, then retraces back into the $101-$107 FVG zone."
      },
      {
        title: "3. Confirm with Order Blocks",
        description: "Entry is confirmed when price reaches the FVG AND there's an order block (last down candle before bullish move) nearby, showing institutional interest.",
        example: "Price enters FVG at $105, finds support exactly at an order block from previous accumulation."
      },
      {
        title: "4. Precise Entry & Exit",
        description: "Enter at 50% of FVG with stop below/above the gap. Target either the next FVG, liquidity level, or 1:3 risk-reward ratio.",
        example: "Enter: $104 (mid FVG), Stop: $100 (below FVG), Target: $116 (1:3 R:R)."
      }
    ],
    keyFeatures: [
      "Automatically identifies FVG patterns on chart",
      "Filters FVGs by size and proximity to order blocks",
      "Multi-timeframe analysis (HTF FVG = stronger)",
      "Partial gap fills vs full fills tracking",
      "High probability entries at 50% FVG fill",
      "Works in all market conditions"
    ],
    idealFor: [
      "Scalpers and day traders",
      "Those comfortable with SMC terminology",
      "Traders seeking high-probability setups",
      "Markets with clear price action (crypto, forex)"
    ],
    riskWarnings: [
      "Not all FVGs get filled immediately",
      "Small gaps may not be significant",
      "Best on liquid markets with tight spreads",
      "Requires quick execution for scalping"
    ],
    parameters: [
      { name: "Minimum FVG Size", description: "Smallest gap to consider (in pips/points)", default: "10 pips" },
      { name: "Fill Percentage", description: "How much of FVG must be filled for entry", default: "50%" },
      { name: "Order Block Distance", description: "Max distance between FVG and OB", default: "20 pips" },
      { name: "Timeframe", description: "Primary timeframe for FVG identification", default: "5m-15m" }
    ]
  },
  'rsi-momentum': {
    fullDescription: "The RSI Momentum Scalper uses the Relative Strength Index to identify oversold and overbought conditions in fast-moving markets. It's designed for quick entries and exits in volatile conditions.",
    howItWorks: [
      {
        title: "1. RSI Calculation",
        description: "RSI measures the speed and magnitude of price changes on a scale of 0-100. Values below 30 indicate oversold conditions, above 70 indicates overbought.",
        example: "RSI drops to 25 - market is oversold, potential bounce incoming."
      },
      {
        title: "2. Entry Signal",
        description: "When RSI crosses above 30, it signals momentum shifting from oversold to neutral/bullish. This crossover is the entry trigger for long positions.",
        example: "RSI crosses from 28 to 32 - buy signal triggered."
      },
      {
        title: "3. Exit Signal",
        description: "When RSI crosses below 70, it signals momentum weakening from overbought conditions. This is the exit signal to close longs.",
        example: "RSI crosses from 72 to 68 - sell signal triggered."
      },
      {
        title: "4. Position Management",
        description: "Uses fixed stop loss percentage and takes profit at exit signal or target level, whichever comes first.",
        example: "Entry: $100, Stop: $98 (2%), Target: $105 (5%), or exit when RSI < 70."
      }
    ],
    keyFeatures: [
      "Simple, clear entry and exit rules",
      "Works in trending and ranging markets",
      "Customizable RSI period and thresholds",
      "Optional confirmation filters (volume, trend)",
      "Quick trades - typically closed within hours",
      "Beginner-friendly with proven track record"
    ],
    idealFor: [
      "Beginner to intermediate traders",
      "Those seeking simple, rule-based strategies",
      "Volatile market environments",
      "Crypto and forex scalpers"
    ],
    riskWarnings: [
      "Can give false signals in strong trends",
      "Frequent trades = higher commission costs",
      "Works best in volatile, not ranging markets",
      "Requires strict risk management"
    ],
    parameters: [
      { name: "RSI Period", description: "Number of periods for RSI calculation", default: "14" },
      { name: "Oversold Level", description: "RSI level considered oversold", default: "30" },
      { name: "Overbought Level", description: "RSI level considered overbought", default: "70" },
      { name: "Stop Loss %", description: "Fixed stop loss percentage", default: "2%" }
    ]
  }
};

export default function TemplateDetailsModal({ template, onClose, onSelect }: TemplateDetailsModalProps) {
  const details = templateDetails[template.id] || {};

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="border-b border-gray-800 p-6 flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{template.icon}</div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{template.name}</h2>
              <div className="flex items-center gap-3">
                <span className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${template.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                  ${template.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400' : ''}
                  ${template.difficulty === 'advanced' ? 'bg-red-500/10 text-red-400' : ''}
                `}>
                  {template.difficulty.toUpperCase()}
                </span>
                <span className="text-gray-500 text-sm">•</span>
                <span className="text-gray-400 text-sm">{template.category}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-700">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-black/30 rounded-lg border border-gray-800">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Win Rate</div>
              <div className="text-xl font-bold text-emerald-400">{template.stats.winRate}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Profit Factor</div>
              <div className="text-xl font-bold">{template.stats.profitFactor}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Avg Return</div>
              <div className="text-xl font-bold text-blue-400">+{template.stats.avgReturn}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Total Trades</div>
              <div className="text-xl font-bold">{template.stats.trades}</div>
            </div>
          </div>

          {/* Full Description */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              Strategy Overview
            </h3>
            <p className="text-gray-300 leading-relaxed">{details.fullDescription}</p>
          </div>

          {/* How It Works */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              How It Works (Step by Step)
            </h3>
            <div className="space-y-4">
              {details.howItWorks?.map((step: any, i: number) => (
                <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="font-semibold text-white mb-2">{step.title}</div>
                  <p className="text-sm text-gray-400 mb-3">{step.description}</p>
                  <div className="bg-blue-500/10 border-l-2 border-blue-500 pl-3 py-2">
                    <div className="text-xs text-gray-500 mb-1">Example:</div>
                    <div className="text-sm text-gray-300 font-mono">{step.example}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Key Features
            </h3>
            <ul className="grid md:grid-cols-2 gap-2">
              {details.keyFeatures?.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Parameters */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Customizable Parameters
            </h3>
            <div className="space-y-3">
              {details.parameters?.map((param: any, i: number) => (
                <div key={i} className="bg-gray-800/30 border border-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-white">{param.name}</span>
                    <span className="text-xs font-mono text-blue-400">{param.default}</span>
                  </div>
                  <p className="text-xs text-gray-400">{param.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ideal For */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Ideal For
              </h3>
              <ul className="space-y-2">
                {details.idealFor?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-blue-400 mt-1">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Risk Warnings
              </h3>
              <ul className="space-y-2">
                {details.riskWarnings?.map((warning: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-red-400 mt-1">!</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-800 p-6 bg-gray-900/50">
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {/* ✅ FIXED: Use 'default' instead of 'primary', styled with tailwind */}
            <Button 
                variant="default" 
                onClick={onSelect} 
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white" 
                size="lg"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Use This Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}