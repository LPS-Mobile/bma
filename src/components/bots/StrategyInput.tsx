'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Lightbulb } from 'lucide-react';

interface StrategyInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function StrategyInput({ 
  value, 
  onChange, 
  onGenerate, 
  isGenerating 
}: StrategyInputProps) {
  const [showTips, setShowTips] = useState(false);
  const charCount = value.length;
  const minChars = 50;
  const isValid = charCount >= minChars;

  return (
    <div className="space-y-4">
      {/* Main Input Area */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Example: Buy when RSI drops below 30 and the 50-day moving average is above the 200-day moving average. Sell when RSI goes above 70 or price drops 2% below entry..."
          className="w-full h-48 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
          disabled={isGenerating}
        />
        
        {/* Character Counter */}
        <div className="absolute bottom-3 right-3 text-xs text-gray-500">
          {charCount} / {minChars} characters
        </div>
      </div>

      {/* Tips Toggle */}
      <button
        onClick={() => setShowTips(!showTips)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
      >
        <Lightbulb className="w-4 h-4" />
        {showTips ? 'Hide' : 'Show'} tips for better results
      </button>

      {/* Tips Panel */}
      {showTips && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Tips for Better Strategies
          </h3>
          
          <div className="space-y-3 text-sm text-gray-300">
            <TipItem 
              title="Be Specific About Indicators"
              example='Instead of "use moving averages", say "when 50-day SMA crosses above 200-day SMA"'
            />
            <TipItem 
              title="Define Clear Entry/Exit Rules"
              example='Include both conditions: "Buy when X happens, sell when Y happens"'
            />
            <TipItem 
              title="Mention Timeframes"
              example='Specify if you want "5-minute chart" or "daily chart" analysis'
            />
            <TipItem 
              title="Include Risk Management"
              example='Add "stop loss at 2%" or "take profit at 5%"'
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {!isValid && `Need ${minChars - charCount} more characters to generate`}
        </div>
        <Button
          onClick={onGenerate}
          disabled={!isValid || isGenerating}
          loading={isGenerating}
          iconLeft={<Sparkles className="w-4 h-4" />}
          size="lg"
        >
          {isGenerating ? 'Generating Strategy...' : 'Generate Bot with AI'}
        </Button>
      </div>

      {/* What Happens Next */}
      {isValid && !isGenerating && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-blue-300 mb-1">Ready to generate</div>
              <div className="text-gray-300">
                Our AI will analyze your description and generate optimized PineScript code 
                with customizable parameters. This usually takes 10-15 seconds.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TipItem({ title, example }: { title: string; example: string }) {
  return (
    <div>
      <div className="font-medium text-white mb-1">{title}</div>
      <div className="text-gray-400 italic">"{example}"</div>
    </div>
  );
}