import { BacktestMetrics as MetricsType } from '@/types/backtest.types';
import { 
  TrendingUp, TrendingDown, Activity, BarChart2, 
  Target, ShieldAlert, Award, Clock
} from 'lucide-react';

interface Props {
  metrics: MetricsType | null;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const MetricCard = ({ label, value, subValue, colorClass }: any) => (
  <div className="p-3 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-lg font-mono font-bold ${colorClass}`}>{value}</p>
    {subValue && <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>}
  </div>
);

const SectionHeader = ({ icon, title }: any) => (
  <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0 text-gray-400">
    {icon}
    <h4 className="text-xs font-bold uppercase tracking-widest">{title}</h4>
    <div className="h-px bg-gray-800 flex-1 ml-2"></div>
  </div>
);

export default function BacktestMetrics({ metrics }: Props) {
  if (!metrics) {
    return (
      <div className="w-full p-8 text-center border border-dashed border-gray-800 rounded-lg bg-gray-900/30">
        <p className="text-gray-500 text-sm">Run a backtest to analyze performance.</p>
      </div>
    );
  }

  const isProfitable = metrics.netProfit >= 0;

  return (
    <div className="w-full">
      
      {/* 1. PROFITABILITY SECTION */}
      <SectionHeader icon={<TrendingUp className="w-4 h-4" />} title="Profitability" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard 
          label="Net Profit"
          value={`${isProfitable ? '+' : ''}${currencyFormatter.format(metrics.netProfit)}`}
          subValue={`${metrics.returnOnCapital}% Return`}
          colorClass={isProfitable ? 'text-emerald-400' : 'text-red-400'}
        />
        <MetricCard 
          label="Profit Factor"
          value={metrics.profitFactor}
          subValue={`Gross: ${currencyFormatter.format(metrics.grossProfit)}`}
          colorClass={metrics.profitFactor >= 1.5 ? 'text-blue-400' : 'text-gray-300'}
        />
        <MetricCard 
          label="Expectancy"
          value={currencyFormatter.format(metrics.expectancy)}
          subValue="Per Trade"
          colorClass={metrics.expectancy > 0 ? 'text-green-400' : 'text-red-400'}
        />
        <MetricCard 
          label="SQN Score"
          value={metrics.sqn}
          subValue={metrics.sqn > 2.5 ? 'Excellent' : metrics.sqn > 1.0 ? 'Average' : 'Poor'}
          colorClass={metrics.sqn > 2.0 ? 'text-purple-400' : 'text-gray-400'}
        />
      </div>

      {/* 2. RISK ANALYSIS */}
      <SectionHeader icon={<ShieldAlert className="w-4 h-4" />} title="Risk Analysis" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard 
          label="Max Drawdown"
          value={`${metrics.maxDrawdown}%`}
          subValue={`-$${metrics.maxDrawdownAbs.toFixed(0)}`}
          colorClass="text-red-400"
        />
        <MetricCard 
          label="Sharpe Ratio"
          value={metrics.sharpeRatio}
          subValue="Risk Adjusted"
          colorClass={metrics.sharpeRatio > 1 ? 'text-blue-300' : 'text-gray-400'}
        />
        <MetricCard 
          label="Sortino Ratio"
          value={metrics.sortinoRatio}
          subValue="Downside Risk"
          colorClass={metrics.sortinoRatio > 1 ? 'text-blue-300' : 'text-gray-400'}
        />
        <MetricCard 
          label="Calmar Ratio"
          value={metrics.calmarRatio}
          subValue="Ret/DD"
          colorClass="text-gray-300"
        />
      </div>

      {/* 3. TRADE STATISTICS */}
      <SectionHeader icon={<Award className="w-4 h-4" />} title="Trade Stats" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard 
          label="Win Rate"
          value={`${metrics.winRate}%`}
          subValue={`${metrics.totalTrades} Trades`}
          colorClass="text-white"
        />
        <MetricCard 
          label="Avg Win"
          value={currencyFormatter.format(metrics.avgWin)}
          subValue={`Max: ${currencyFormatter.format(metrics.largestWin)}`}
          colorClass="text-green-400"
        />
        <MetricCard 
          label="Avg Loss"
          value={currencyFormatter.format(metrics.avgLoss)}
          subValue={`Max: -${currencyFormatter.format(Math.abs(metrics.largestLoss))}`}
          colorClass="text-red-400"
        />
        <MetricCard 
          label="Win/Loss Ratio"
          value={metrics.winLossRatio}
          subValue={`Streak: ${metrics.maxConsecutiveWins}W / ${metrics.maxConsecutiveLosses}L`}
          colorClass="text-gray-300"
        />
      </div>

    </div>
  );
}