import BacktestPanel from '@/components/bots/BacktestPanel';

export default function TestPanelPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-blue-500">Backtest Component Test</h1>
          <p className="text-gray-400">Isolated environment for testing the simulation engine.</p>
        </div>

        {/* The Component We Built */}
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
          <BacktestPanel />
        </div>

      </div>
    </div>
  );
}