'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Zap, Target, BarChart3, Flame, ArrowRight, Search, Filter, Info } from 'lucide-react';
import TemplateDetailsModal from './TemplateDetailsModal';

interface Template {
  id: string;
  name: string;
  category: 'momentum' | 'meanReversion' | 'trend' | 'scalping' | 'swing' | 'smartMoney';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  stats: {
    winRate: number;
    profitFactor: number;
    avgReturn: number;
    trades: number;
  };
  tags: string[];
  popular: boolean;
  icon: string;
}

interface TemplateMarketplaceProps {
  onSelectTemplate: (template: Template | null) => void;
  onSkip: () => void;
}

export default function TemplateMarketplace({ onSelectTemplate, onSkip }: TemplateMarketplaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const templates: Template[] = [
    {
      id: 'liquidity-sweep',
      name: 'Liquidity Sweep Hunter',
      category: 'smartMoney',
      description: 'Identifies liquidity grabs above/below key levels, enters on the reversal. Targets stop hunts at swing highs/lows before institutional moves.',
      difficulty: 'advanced',
      stats: { winRate: 73.8, profitFactor: 3.1, avgReturn: 45.2, trades: 89 },
      tags: ['SMC', 'Liquidity', 'Institutional', 'Stop Hunt'],
      popular: true,
      icon: '💎',
    },
    {
      id: 'fvg-scalper',
      name: 'FVG Scalper Pro',
      category: 'smartMoney',
      description: 'Trades Fair Value Gaps (imbalances) with precision entries. Enters when price returns to unfilled FVGs with confirmation from order blocks.',
      difficulty: 'advanced',
      stats: { winRate: 69.5, profitFactor: 2.7, avgReturn: 38.9, trades: 156 },
      tags: ['FVG', 'Imbalance', 'SMC', 'Order Blocks'],
      popular: true,
      icon: '🧠',
    },
    {
      id: 'rsi-momentum',
      name: 'RSI Momentum Scalper',
      category: 'momentum',
      description: 'Buy when RSI crosses above 30, sell when it crosses below 70. Perfect for volatile markets.',
      difficulty: 'beginner',
      stats: { winRate: 68.2, profitFactor: 2.3, avgReturn: 24.5, trades: 342 },
      tags: ['RSI', 'Scalping', 'Short-term'],
      popular: true,
      icon: '⚡',
    },
    {
      id: 'macd-crossover',
      name: 'MACD Trend Follower',
      category: 'trend',
      description: 'Classic MACD crossover strategy with signal line confirmation. Best for trending markets.',
      difficulty: 'beginner',
      stats: { winRate: 64.8, profitFactor: 1.9, avgReturn: 18.3, trades: 156 },
      tags: ['MACD', 'Trend', 'Mid-term'],
      popular: true,
      icon: '📈',
    },
    {
      id: 'bollinger-mean',
      name: 'Bollinger Band Reversal',
      category: 'meanReversion',
      description: 'Mean reversion strategy using Bollinger Bands. Buy at lower band, sell at upper band.',
      difficulty: 'intermediate',
      stats: { winRate: 71.5, profitFactor: 2.1, avgReturn: 31.2, trades: 89 },
      tags: ['Bollinger Bands', 'Mean Reversion', 'Range-bound'],
      popular: false,
      icon: '🎯',
    },
    {
      id: 'ema-golden',
      name: 'Golden Cross Strategy',
      category: 'trend',
      description: 'Long when 50 EMA crosses above 200 EMA, short on death cross. Long-term trend follower.',
      difficulty: 'beginner',
      stats: { winRate: 58.3, profitFactor: 2.8, avgReturn: 42.1, trades: 23 },
      tags: ['EMA', 'Golden Cross', 'Long-term'],
      popular: true,
      icon: '🏆',
    },
    {
      id: 'volume-breakout',
      name: 'Volume Breakout Hunter',
      category: 'momentum',
      description: 'Enters on high volume breakouts above resistance with momentum confirmation.',
      difficulty: 'advanced',
      stats: { winRate: 62.1, profitFactor: 3.2, avgReturn: 38.7, trades: 67 },
      tags: ['Volume', 'Breakout', 'Momentum'],
      popular: false,
      icon: '🚀',
    },
    {
      id: 'support-resistance',
      name: 'Support & Resistance Bounce',
      category: 'meanReversion',
      description: 'Identifies key S/R levels and trades bounces with confirmation candles.',
      difficulty: 'intermediate',
      stats: { winRate: 69.4, profitFactor: 2.0, avgReturn: 27.8, trades: 134 },
      tags: ['S/R', 'Price Action', 'Reversal'],
      popular: false,
      icon: '📊',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Templates', icon: Sparkles },
    { id: 'smartMoney', label: 'Smart Money Concepts', icon: Target },
    { id: 'momentum', label: 'Momentum', icon: Zap },
    { id: 'trend', label: 'Trend Following', icon: TrendingUp },
    { id: 'meanReversion', label: 'Mean Reversion', icon: BarChart3 },
    { id: 'scalping', label: 'Scalping', icon: Flame },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleContinue = () => {
    onSelectTemplate(selectedTemplate);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/50">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-3">Start with a Template</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Choose a proven strategy template to customize, or start from scratch with AI
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="outline" size="md">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            className={`
              relative bg-gray-900/50 border rounded-xl p-6 text-left transition-all hover:scale-105
              ${selectedTemplate?.id === template.id 
                ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105' 
                : 'border-gray-800 hover:border-gray-700'
              }
            `}
          >
            {/* Popular Badge */}
            {template.popular && (
              <div className="absolute top-4 right-4 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs font-mono text-yellow-400">
                🔥 POPULAR
              </div>
            )}

            {/* Icon & Name */}
            <div className="mb-4">
              <div className="text-4xl mb-3">{template.icon}</div>
              <h3 className="text-lg font-bold mb-2">{template.name}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{template.description}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-black/30 rounded-lg">
              <div>
                <div className="text-xs text-gray-500 mb-1">Win Rate</div>
                <div className="text-sm font-bold text-emerald-400">{template.stats.winRate}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Profit Factor</div>
                <div className="text-sm font-bold">{template.stats.profitFactor}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Avg Return</div>
                <div className="text-sm font-bold text-blue-400">+{template.stats.avgReturn}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Trades</div>
                <div className="text-sm font-bold">{template.stats.trades}</div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {template.tags.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>

            {/* Difficulty Badge */}
            <div className="flex items-center justify-between">
              <span className={`
                px-2 py-1 rounded text-xs font-medium
                ${template.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                ${template.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400' : ''}
                ${template.difficulty === 'advanced' ? 'bg-red-500/10 text-red-400' : ''}
              `}>
                {template.difficulty}
              </span>
              
              {selectedTemplate?.id === template.id && (
                <div className="text-blue-400 font-semibold text-sm">Selected ✓</div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No templates found</div>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-gray-800">
        <Button
          variant="outline"
          size="lg"
          onClick={onSkip}
          className="flex-1"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Start from Scratch with AI
        </Button>
        
        <Button
          variant="primary"
          size="lg"
          onClick={handleContinue}
          disabled={!selectedTemplate}
          className="flex-1"
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          {selectedTemplate ? `Customize ${selectedTemplate.name}` : 'Select a Template'}
        </Button>
      </div>

      {/* Help Text */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-400">
          💡 <span className="text-white font-medium">Pro Tip:</span> Templates are fully customizable. 
          You can modify any parameter after selection.
        </p>
      </div>
    </div>
  );
}