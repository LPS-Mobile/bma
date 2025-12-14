'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Scatter } from 'recharts';

interface Trade {
  entryDate: string;
  entryPrice: number;
  exitDate: string;
  exitPrice: number;
  type: 'long' | 'short';
  profit: number;
}

interface TradeChartProps {
  priceData: Array<{ date: string; price: number }>;
  trades: Trade[];
}

export default function TradeChart({ priceData, trades }: TradeChartProps) {
  // Merge price data with trade points
  const chartData = priceData.map(p => {
    const entry = trades.find(t => t.entryDate === p.date);
    const exit = trades.find(t => t.exitDate === p.date);
    
    return {
      ...p,
      entryLong: entry?.type === 'long' ? entry.entryPrice : null,
      entryShort: entry?.type === 'short' ? entry.entryPrice : null,
      exit: exit ? exit.exitPrice : null,
    };
  });

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white">Trade Visualization</h3>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-gray-400">Long Entry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-400">Short Entry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-400">Exit</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: any, name: string) => {
              if (name === 'price') return [`$${value.toFixed(2)}`, 'Price'];
              if (name === 'entryLong') return [`$${value.toFixed(2)}`, 'Long Entry'];
              if (name === 'entryShort') return [`$${value.toFixed(2)}`, 'Short Entry'];
              if (name === 'exit') return [`$${value.toFixed(2)}`, 'Exit'];
              return [value, name];
            }}
          />
          
          {/* Price Line */}
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#6b7280" 
            strokeWidth={2}
            dot={false}
            name="price"
          />

          {/* Long Entry Points */}
          <Scatter
            dataKey="entryLong"
            fill="#10b981"
            shape={(props: any) => {
              const { cx, cy } = props;
              // ✅ FIX: Return empty SVG group instead of null
              if (!cx || !cy) return <g />; 
              return (
                <circle cx={cx} cy={cy} r={6} fill="#10b981" stroke="#000" strokeWidth={2} />
              );
            }}
            name="entryLong"
          />

          {/* Short Entry Points */}
          <Scatter
            dataKey="entryShort"
            fill="#ef4444"
            shape={(props: any) => {
              const { cx, cy } = props;
              // ✅ FIX: Return empty SVG group instead of null
              if (!cx || !cy) return <g />;
              return (
                <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#000" strokeWidth={2} />
              );
            }}
            name="entryShort"
          />

          {/* Exit Points */}
          <Scatter
            dataKey="exit"
            fill="#3b82f6"
            shape={(props: any) => {
              const { cx, cy } = props;
              // ✅ FIX: Return empty SVG group instead of null
              if (!cx || !cy) return <g />;
              return (
                <circle cx={cx} cy={cy} r={6} fill="#3b82f6" stroke="#000" strokeWidth={2} />
              );
            }}
            name="exit"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Trade Summary */}
      <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="text-gray-400 mb-1">Total Trades</div>
          <div className="text-white font-semibold">{trades.length}</div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">Winning Trades</div>
          <div className="text-emerald-400 font-semibold">
            {trades.filter(t => t.profit > 0).length}
          </div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">Losing Trades</div>
          <div className="text-red-400 font-semibold">
            {trades.filter(t => t.profit < 0).length}
          </div>
        </div>
      </div>
    </div>
  );
}