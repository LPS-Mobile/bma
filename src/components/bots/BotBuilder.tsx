'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Settings, Share2, ArrowRight, CheckCircle2 } from 'lucide-react';
import StrategyInput from './StrategyInput';
import ParameterTuning from './ParameterTuning';
import BacktestPanel from './BacktestPanel';
import InviteLink from './InviteLink';

type BuildStep = 'template' | 'describe' | 'tune' | 'backtest' | 'deploy';

interface BotBuilderProps {
  botId?: string;
  initialData?: any;
}

export default function BotBuilder({ botId, initialData }: BotBuilderProps) {
  const [step, setStep] = useState<BuildStep>('template');
  const [strategy, setStrategy] = useState(initialData?.strategy || '');
  const [generatedCode, setGeneratedCode] = useState(initialData?.code || '');
  const [pythonCode, setPythonCode] = useState('');
  const [parameters, setParameters] = useState(initialData?.parameters || {});
  const [isGenerating, setIsGenerating] = useState(false);
  const [backtestResults, setBacktestResults] = useState(null);
  const [savedBotId, setSavedBotId] = useState(botId);

  const handleGenerateStrategy = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: strategy }),
      });
      
      const data = await response.json();
      setGeneratedCode(data.pinescriptCode);
      setPythonCode(data.pythonCode); // AI generates both PineScript + Python
      setParameters(data.parameters);
      
      // Auto-save bot
      const saveResponse = await fetch('/api/bots/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: extractBotName(strategy),
          description: strategy,
          pinescript_code: data.pinescriptCode,
          python_code: data.pythonCode,
          parameters: data.parameters,
        }),
      });
      
      const { botId: newBotId } = await saveResponse.json();
      setSavedBotId(newBotId);
      
      setStep('tune');
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBacktestComplete = (results: any) => {
    setBacktestResults(results);
    setStep('deploy');
  };

  const progressSteps = [
    { id: 'describe', label: 'Describe Strategy', icon: Sparkles, complete: ['tune', 'backtest', 'deploy'].includes(step) },
    { id: 'tune', label: 'Tune Parameters', icon: Settings, complete: ['backtest', 'deploy'].includes(step) },
    { id: 'backtest', label: 'Backtest', icon: TrendingUp, complete: step === 'deploy' },
    { id: 'deploy', label: 'Deploy', icon: Share2, complete: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Premium Header with Progress */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {progressSteps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = s.id === step;
              const isComplete = s.complete;
              
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300
                      ${isComplete ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/50' : ''}
                      ${isActive ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/50 scale-110' : ''}
                      ${!isActive && !isComplete ? 'bg-gray-800 border-gray-700' : ''}
                    `}>
                      {isComplete ? <CheckCircle2 className="w-6 h-6 text-white" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="hidden md:block">
                      <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-500'}`}>
                        {s.label}
                      </div>
                    </div>
                  </div>
                  {idx < progressSteps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-4 ${isComplete ? 'bg-emerald-500' : 'bg-gray-800'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Bot Name */}
          {savedBotId && (
            <div className="text-center">
              <div className="text-sm text-gray-500">Building:</div>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {extractBotName(strategy)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* STEP 1: Describe Strategy */}
        {step === 'describe' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl shadow-blue-500/50">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Describe Your Trading Strategy
              </h1>
              <p className="text-xl text-gray-400">
                Tell our AI what you want your bot to do in plain English
              </p>
            </div>
            
            <StrategyInput 
              value={strategy}
              onChange={setStrategy}
              onGenerate={handleGenerateStrategy}
              isGenerating={isGenerating}
            />
          </div>
        )}

        {/* STEP 2: Tune Parameters */}
        {step === 'tune' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6 shadow-2xl shadow-purple-500/50">
                <Settings className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Fine-Tune Your Strategy</h1>
              <p className="text-xl text-gray-400">
                Adjust parameters to optimize performance
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Parameters Panel */}
              <div className="lg:col-span-1">
                <ParameterTuning 
                  parameters={parameters}
                  onChange={setParameters}
                />
              </div>

              {/* Strategy Overview */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    Strategy Generated
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Your Strategy:</div>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-gray-300">
                        {strategy}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400">{Object.keys(parameters).length}</div>
                        <div className="text-sm text-gray-400 mt-1">Parameters</div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-purple-400">
                          {Object.values(parameters).filter((p: any) => p.category === 'Indicators').length}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Indicators</div>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-emerald-400">
                          {Object.values(parameters).filter((p: any) => p.category === 'Risk Management').length}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Risk Rules</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setStep('backtest')}
                  size="xl"
                  className="w-full"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Continue to Backtest
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Backtest */}
        {step === 'backtest' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-2xl shadow-emerald-500/50">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Backtest Your Strategy</h1>
              <p className="text-xl text-gray-400">
                Test performance on historical data using Python backtesting engine
              </p>
            </div>

            <BacktestPanel
              code={pythonCode}
              parameters={parameters}
              onResults={handleBacktestComplete}
              onExport={() => setStep('deploy')}
            />
          </div>
        )}

        {/* STEP 4: Deploy */}
        {step === 'deploy' && savedBotId && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-2xl shadow-blue-500/50 animate-pulse">
                <Share2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Deploy to TradingView</h1>
              <p className="text-xl text-gray-400">
                Generate your secure invite link
              </p>
            </div>

            {/* Backtest Summary */}
            {backtestResults && (
              <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-500/20 rounded-2xl p-8 mb-8">
                <h3 className="text-xl font-bold mb-6 text-emerald-300">✓ Backtest Complete</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-400">
                      {(backtestResults as any).winRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      {(backtestResults as any).profitFactor.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Profit Factor</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">
                      {(backtestResults as any).sharpeRatio.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Sharpe Ratio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">
                      {(backtestResults as any).totalTrades}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Total Trades</div>
                  </div>
                </div>
              </div>
            )}

            <InviteLink 
              botId={savedBotId}
              botName={extractBotName(strategy)}
              onGenerate={() => console.log('Invite generated')}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Helper
function extractBotName(description: string): string {
  const words = description.split(' ').slice(0, 5).join(' ');
  return words.length > 40 ? words.substring(0, 40) + '...' : words;
}