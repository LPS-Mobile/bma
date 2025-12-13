'use client';

import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { 
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceDot, Bar, ReferenceArea
} from 'recharts';
import { Trade, Candle } from '@/types/backtest.types';

interface Props {
  trade: Trade;
  allCandles: Candle[];
  onClose: () => void;
}

// --- 1. LOCAL UI HELPERS ---
const Badge = ({ children, variant = 'default' }: any) => {
  const styles: any = {
    default: "bg-gray-800 text-gray-400",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-transparent ${styles[variant] || styles.default}`}>
      {children}
    </span>
  );
};

// --- 2. FIXED CANDLESTICK SHAPE ---
// We map the Bar to [Low, High] so 'y' is High and 'height' is the full range.
const Candlestick = (props: any) => {
  const { x, y, width, height, payload } = props;
  const { open, close, high, low } = payload;
  
  const isGreen = close >= open;
  const color = isGreen ? '#10b981' : '#ef4444';

  // 1. Calculate Pixel Ratio based on full High-Low range (Stable)
  const priceRange = high - low;
  const ratio = priceRange === 0 ? 0 : height / priceRange;

  // 2. Calculate Body Dimensions
  const bodyTopPrice = Math.max(open, close);
  const bodyHeightPrice = Math.abs(open - close);
  
  // Distance from High (y) to Top of Body
  const bodyOffset = (high - bodyTopPrice) * ratio;
  const bodyPixelHeight = Math.max(2, bodyHeightPrice * ratio); // Min 2px height

  // 3. Center the candle
  const candleWidth = Math.max(width * 0.5, 4); 
  const xOffset = (width - candleWidth) / 2;

  return (
    <g stroke={color} fill={color} strokeWidth="1.5">
      {/* Wick (Center Line) - Draws full height from High to Low */}
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} />
      
      {/* Body Rect - Positioned relative to the wick */}
      <rect 
        x={x + xOffset} 
        y={y + bodyOffset} 
        width={candleWidth} 
        height={bodyPixelHeight} 
        fill={isGreen ? '#0F1115' : color} 
      />
    </g>
  );
};

export default function TradeDetailModal({ trade, allCandles, onClose }: Props) {
  if (!allCandles || allCandles.length === 0) return null;

  // --- 1. LOCATE TRADE ---
  let entryIdx = -1;
  let exitIdx = -1;

  // Strategy A: Match Timestamps
  if (trade.entryTime > 1000000000) {
      entryIdx = allCandles.findIndex(c => Math.abs(c.time - trade.entryTime) < 300000); // 5m buffer
      exitIdx = trade.exitTime 
        ? allCandles.findIndex(c => Math.abs(c.time - trade.exitTime) < 300000)
        : allCandles.length - 1;
  }

  // Strategy B: Fallback to center if time fails
  if (entryIdx === -1) {
     entryIdx = Math.floor(allCandles.length / 2);
     exitIdx = entryIdx + 10;
  }
  if (exitIdx === -1) exitIdx = Math.min(entryIdx + 20, allCandles.length - 1);

  // --- 2. SLICE DATA (Zoom) ---
  const paddingBars = 15;
  const startIndex = Math.max(0, entryIdx - paddingBars);
  const endIndex = Math.min(allCandles.length, exitIdx + paddingBars);
  
  const chartData = allCandles.slice(startIndex, endIndex).map((c, i) => ({
    ...c,
    index: startIndex + i,
    // Create a [min, max] range for Recharts to draw the full height wick area
    fullRange: [c.low, c.high], 
    displayTime: c.time > 1000000000 ? c.time : startIndex + i
  }));

  // --- 3. SCALE CALCULATION ---
  const lows = chartData.map(d => d.low);
  const highs = chartData.map(d => d.high);
  const minPrice = Math.min(...lows);
  const maxPrice = Math.max(...highs);
  // Add 10% padding so candles don't touch edges
  const pricePadding = (maxPrice - minPrice) * 0.1;

  // --- 4. MARKERS ---
  const entryCandle = chartData.find(d => d.index === entryIdx);
  const exitCandle = chartData.find(d => d.index === exitIdx);
  const isWin = trade.pnl > 0;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0F1115] border border-gray-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50">
          <div>
            <div className="flex items-center gap-3">
               <h3 className="text-lg font-bold text-white">Trade Analysis</h3>
               <Badge variant={isWin ? 'success' : 'danger'}>{isWin ? 'WIN' : 'LOSS'}</Badge>
            </div>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
               <span className={`font-bold ${trade.type === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>{trade.type}</span>
               <span>•</span>
               {trade.entryTime > 1000000000 
                 ? new Date(trade.entryTime).toLocaleString() 
                 : `Bar #${entryIdx}`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-lg hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chart */}
        <div className="h-[450px] w-full p-4 bg-[#0A0A0A]">
           <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                 
                 <XAxis 
                    dataKey="displayTime" 
                    type="number" 
                    domain={['dataMin', 'dataMax']} 
                    tickFormatter={(t) => t > 1000000000 ? new Date(t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : `#${t}`}
                    stroke="#6b7280" 
                    fontSize={11}
                    tickLine={false} 
                    axisLine={false}
                    minTickGap={40}
                 />
                 
                 <YAxis 
                    domain={[minPrice - pricePadding, maxPrice + pricePadding]} 
                    stroke="#6b7280" 
                    fontSize={11}
                    tickLine={false} 
                    axisLine={false}
                    width={60}
                    tickFormatter={(val) => val.toFixed(2)}
                 />
                 
                 <Tooltip 
                    cursor={{ stroke: '#374151', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                                <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-xl text-xs z-50">
                                    <p className="text-gray-400 mb-2 border-b border-gray-800 pb-1">
                                        {d.time > 1000000000 ? new Date(d.time).toLocaleString() : `Bar #${d.index}`}
                                    </p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
                                        <span className="text-gray-500">O:</span> <span className="text-white">{d.open}</span>
                                        <span className="text-gray-500">H:</span> <span className="text-green-400">{d.high}</span>
                                        <span className="text-gray-500">L:</span> <span className="text-red-400">{d.low}</span>
                                        <span className="text-gray-500">C:</span> <span className="text-white">{d.close}</span>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                 />

                 {/* Duration Highlight Area */}
                 {entryCandle && exitCandle && (
                     <ReferenceArea 
                        x1={entryCandle.displayTime} 
                        x2={exitCandle.displayTime} 
                        fill={isWin ? "#10b981" : "#ef4444"} 
                        fillOpacity={0.08} 
                     />
                 )}

                 {/* Candles: We use dataKey="fullRange" which is [low, high] */}
                 <Bar 
                    dataKey="fullRange" 
                    shape={<Candlestick />} 
                    isAnimationActive={false}
                 />

                 {/* Entry Dot */}
                 {entryCandle && (
                     <ReferenceDot 
                        x={entryCandle.displayTime} 
                        y={trade.entryPrice} 
                        r={6} 
                        fill="#10b981" 
                        stroke="#000" 
                        strokeWidth={2}
                        isFront={true}
                     />
                 )}

                 {/* Exit Dot */}
                 {exitCandle && (
                     <ReferenceDot 
                        x={exitCandle.displayTime} 
                        y={trade.exitPrice} 
                        r={6} 
                        fill="#ef4444" 
                        stroke="#000" 
                        strokeWidth={2}
                        isFront={true}
                     />
                 )}

              </ComposedChart>
           </ResponsiveContainer>
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-950 border-t border-gray-800">
           <div>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Entry</p>
             <p className="font-mono text-white text-lg">${trade.entryPrice.toFixed(2)}</p>
           </div>
           <div>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Exit</p>
             <p className="font-mono text-white text-lg">${trade.exitPrice.toFixed(2)}</p>
           </div>
           <div>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Net PnL</p>
             <div className={`flex items-center gap-2 font-mono text-lg font-bold ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                {isWin ? '+' : ''}${trade.pnl.toFixed(2)}
             </div>
           </div>
           <div>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Bars Held</p>
             <p className="font-mono text-gray-400 text-lg">
                {exitIdx !== -1 && entryIdx !== -1 ? (exitIdx - entryIdx) : 'OPEN'}
             </p>
           </div>
        </div>

      </div>
    </div>
  );
}