import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { strategy, symbol, startDate, endDate, capital, timeframe } = await request.json();

    if (!strategy) {
      return NextResponse.json({ error: "Strategy JSON required" }, { status: 400 });
    }

    // Forward to Python backend
    // You'll need to set PYTHON_BACKEND_URL in your .env.local
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    
    console.log('📤 Sending to Python backend:', {
      url: `${pythonBackendUrl}/backtest`,
      strategy: strategy.name,
      symbol,
      timeframe
    });

    const pythonResponse = await fetch(`${pythonBackendUrl}/backtest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        strategy: strategy,
        symbol: symbol,
        start_date: startDate,
        end_date: endDate,
        capital: capital,
        timeframe: timeframe
      }),
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      throw new Error(`Python backend error: ${errorText}`);
    }

    const results = await pythonResponse.json();

    return NextResponse.json({
      success: true,
      results: results,
      candles: results.candles || []
    });

  } catch (error: any) {
    console.error("Backtest API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Backtest failed",
      details: error.toString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Backtest API Ready",
    pythonBackend: process.env.PYTHON_BACKEND_URL || 'Not configured',
    note: "Set PYTHON_BACKEND_URL in .env.local to connect to Python service"
  });
}