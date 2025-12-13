// src/app/api/bots/backtest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

interface BacktestRequest {
  pythonCode: string;
  parameters: Record<string, any>;
  config: {
    symbol: string;
    timeframe: string;
    startDate: string;
    endDate: string;
    initialCapital: number;
    commission: number;
  };
}

interface BacktestResult {
  totalReturn: number;
  sharpeRatio: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  totalTrades: number;
  equityCurve: Array<{ date: string; equity: number; drawdown: number }>;
  trades: Array<{
    date: string;
    type: 'buy' | 'sell';
    price: number;
    pnl?: number;
  }>;
  metrics: {
    avgWin: number;
    avgLoss: number;
    largestWin: number;
    largestLoss: number;
    avgTradeDuration: number;
    expectancy: number;
  };
}

export async function POST(request: NextRequest) {
  const tempDir = join(process.cwd(), 'temp');
  let scriptPath: string | null = null;
  let dataPath: string | null = null;

  try {
    const body: BacktestRequest = await request.json();
    const { pythonCode, parameters, config } = body;

    // Validate inputs
    if (!pythonCode || !config) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create temp directory if it doesn't exist
    await mkdir(tempDir, { recursive: true });

    // Generate unique IDs for this backtest
    const backtestId = randomUUID();
    scriptPath = join(tempDir, `backtest_${backtestId}.py`);
    dataPath = join(tempDir, `data_${backtestId}.json`);

    // Fetch historical data for the symbol
    const historicalData = await fetchHistoricalData(
      config.symbol,
      config.timeframe,
      config.startDate,
      config.endDate
    );

    // Save data to temp file
    await writeFile(dataPath, JSON.stringify(historicalData));

    // Create the complete Python script
    const completeScript = buildPythonScript(
      pythonCode,
      parameters,
      config,
      dataPath
    );

    // Write Python script to temp file
    await writeFile(scriptPath, completeScript);

    // Execute Python script with timeout
    const timeout = 120000; // 2 minutes max
    const { stdout, stderr } = await execAsync(
      `python3 ${scriptPath}`,
      { timeout, maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
    );

    if (stderr) {
      console.error('Python stderr:', stderr);
    }

    // Parse results from stdout
    const results: BacktestResult = JSON.parse(stdout);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Backtest execution error:', error);
    
    let errorMessage = 'Backtest execution failed';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific error types
      if (error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Backtest timed out. Try a shorter date range.';
      } else if (error.message.includes('SyntaxError')) {
        errorMessage = 'Invalid Python code syntax';
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    // Clean up temp files
    if (scriptPath) {
      try {
        await unlink(scriptPath);
      } catch (e) {
        console.error('Failed to delete script file:', e);
      }
    }
    if (dataPath) {
      try {
        await unlink(dataPath);
      } catch (e) {
        console.error('Failed to delete data file:', e);
      }
    }
  }
}

async function fetchHistoricalData(
  symbol: string,
  timeframe: string,
  startDate: string,
  endDate: string
): Promise<any[]> {
  // TODO: Replace with real data source (Alpha Vantage, Yahoo Finance, etc.)
  // For now, return mock data structure
  
  // In production, you'd call an API like:
  // - Alpha Vantage
  // - Yahoo Finance (yfinance Python package)
  // - Binance (for crypto)
  // - Polygon.io
  
  const mockData = generateMockOHLCV(symbol, startDate, endDate);
  return mockData;
}

function generateMockOHLCV(symbol: string, startDate: string, endDate: string): any[] {
  // Generate realistic mock OHLCV data
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data = [];
  
  let currentPrice = symbol.includes('BTC') ? 45000 : 
                     symbol.includes('ETH') ? 3000 : 
                     150; // Default for stocks
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    // Random walk with trend
    const change = (Math.random() - 0.48) * currentPrice * 0.02;
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.random() * 1000000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(volume),
    });
    
    currentPrice = close;
  }
  
  return data;
}

function buildPythonScript(
  userCode: string,
  parameters: Record<string, any>,
  config: BacktestRequest['config'],
  dataPath: string
): string {
  return `
import json
import pandas as pd
import numpy as np
from datetime import datetime

# Load historical data
with open('${dataPath}', 'r') as f:
    data_json = json.load(f)

df = pd.DataFrame(data_json)
df['date'] = pd.to_datetime(df['date'])
df = df.set_index('date')

# User parameters
params = ${JSON.stringify(parameters)}

# Backtest configuration
config = ${JSON.stringify(config)}

# User strategy code
${userCode}

# Execute backtest
if 'backtest' in dir():
    results = backtest(df, params, config)
else:
    # Fallback if backtest function not defined
    results = {
        'totalReturn': 0,
        'sharpeRatio': 0,
        'winRate': 0,
        'profitFactor': 1,
        'maxDrawdown': 0,
        'totalTrades': 0,
        'equityCurve': [],
        'trades': [],
        'metrics': {
            'avgWin': 0,
            'avgLoss': 0,
            'largestWin': 0,
            'largestLoss': 0,
            'avgTradeDuration': 0,
            'expectancy': 0
        }
    }

# Output results as JSON
print(json.dumps(results))
`;
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'backtest-engine',
    version: '1.0.0',
    pythonVersion: process.version
  });
}