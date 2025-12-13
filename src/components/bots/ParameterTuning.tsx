'use client';

import { useState } from 'react';
import { Settings, RotateCcw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Parameter {
  name: string;
  label: string;
  type: 'number' | 'boolean' | 'select';
  value: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description?: string;
  category?: string;
}

interface ParameterTuningProps {
  parameters: Record<string, Parameter>;
  onChange: (params: Record<string, Parameter>) => void;
}

export default function ParameterTuning({ parameters, onChange }: ParameterTuningProps) {
  const [defaults] = useState(parameters);
  
  // Group parameters by category
  const grouped = Object.entries(parameters).reduce((acc, [key, param]) => {
    const category = param.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push({ key, ...param });
    return acc;
  }, {} as Record<string, any[]>);

  const handleChange = (key: string, value: any) => {
    onChange({
      ...parameters,
      [key]: { ...parameters[key], value }
    });
  };

  const handleReset = () => {
    onChange(defaults);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">Strategy Parameters</span>
        </div>
        
        {/* ✅ FIXED: Removed iconLeft prop, put Icon inside children */}
        <Button
          onClick={handleReset}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <RotateCcw className="w-3 h-3 mr-2" />
          Reset
        </Button>
      </div>

      {/* Parameters */}
      <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
        {Object.entries(grouped).map(([category, params]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {category}
            </h3>
            <div className="space-y-4">
              {params.map((param) => (
                <ParameterControl
                  key={param.key}
                  param={param}
                  onChange={(value) => handleChange(param.key, value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Impact Notice */}
      <div className="bg-blue-500/10 border-t border-blue-500/20 px-4 py-3 text-xs text-blue-300">
        <div className="flex gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Changes will be applied when you run the next backtest</span>
        </div>
      </div>
      
      {/* Inject custom styles for range sliders */}
      <style jsx global>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
}

function ParameterControl({ param, onChange }: { param: any; onChange: (value: any) => void }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <label className="text-sm font-medium text-white flex items-center gap-1">
            {param.label}
            {param.description && (
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-gray-500 hover:text-gray-400"
              >
                <Info className="w-3 h-3" />
              </button>
            )}
          </label>
          {showTooltip && param.description && (
            <div className="absolute z-10 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-xs text-gray-300 max-w-xs mt-1 shadow-xl">
              {param.description}
            </div>
          )}
        </div>
        {param.type === 'number' && (
          <span className="text-sm font-mono text-blue-400">{param.value}</span>
        )}
      </div>

      {param.type === 'number' && (
        <div className="space-y-2">
          <input
            type="range"
            min={param.min}
            max={param.max}
            step={param.step || 1}
            value={param.value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{param.min}</span>
            <span>{param.max}</span>
          </div>
        </div>
      )}

      {param.type === 'boolean' && (
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={param.value}
              onChange={(e) => onChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
          <span className="text-sm text-gray-400">{param.value ? 'Enabled' : 'Disabled'}</span>
        </label>
      )}

      {param.type === 'select' && (
        <select
          value={param.value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {param.options?.map((option: string) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}