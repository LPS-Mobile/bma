'use client';

import { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface Props {
  data: { time: number; equity: number }[] | undefined;
}

export default function EquityCurveChart({ data }: Props) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // 1. Downsample Data (Max 1000 points) to prevent Stack Overflow
    const targetPoints = 1000;
    const step = Math.ceil(data.length / targetPoints);
    
    return data
      .filter((_, i) => i % step === 0) // Take every Nth point
      .map((d, i) => ({
        time: d.time || i, 
        equity: Number(d.equity),
      }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="h-96 w-full flex items-center justify-center bg-[#0F1115] rounded-2xl border border-gray-800">
        <p className="text-gray-500 text-sm">No equity data available</p>
      </div>
    );
  }

  // Calculate Min/Max safely (Manual loop instead of spread to avoid stack limit)
  let minVal = chartData[0].equity;
  let maxVal = chartData[0].equity;
  for (let i = 1; i < chartData.length; i++) {
    const v = chartData[i].equity;
    if (v < minVal) minVal = v;
    if (v > maxVal) maxVal = v;
  }
  
  const range = maxVal - minVal;
  const padding = range === 0 ? maxVal * 0.005 : range * 0.1; 
  const domainMin = Math.floor(minVal - padding);
  const domainMax = Math.ceil(maxVal + padding);

  const startEq = chartData[0].equity;
  const endEq = chartData[chartData.length - 1].equity;
  const totalReturn = ((endEq - startEq) / startEq) * 100;
  const isPositive = totalReturn >= 0;
  const color = isPositive ? "#10b981" : "#ef4444"; 
  const gradientId = `colorEquity-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="h-96 w-full bg-[#0F1115] rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Equity Curve</h3>
            <div className="flex items-baseline gap-2">
              <p className={`text-2xl font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(endEq)}
              </p>
            </div>
        </div>
        <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {isPositive ? '+' : ''}{totalReturn.toFixed(2)}%
        </div>
      </div>
      
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="99%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis 
              dataKey="time" 
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(tick) => {
                if (tick > 1600000000) return new Date(tick).toLocaleDateString();
                return '';
              }}
              stroke="#6b7280" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={50}
            />
            <YAxis 
              stroke="#6b7280" 
              domain={[domainMin, domainMax]} 
              allowDataOverflow={true}
              fontSize={11} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
              width={45}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#374151', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              labelFormatter={(label) => {
                 if (typeof label === 'number' && label > 1600000000) return new Date(label).toLocaleString();
                 return `Index ${label}`;
              }}
              formatter={(value: number) => [
                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value), 
                'Equity'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="equity" 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#${gradientId})`} 
              baseValue="dataMin"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}