import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'ES.c.0';
    const apiKey = process.env.DATABENTO_API_KEY;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const start = searchParams.get('start') || twoDaysAgo.toISOString().split('T')[0];
    const end = searchParams.get('end') || yesterday.toISOString().split('T')[0];

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
    }

    // 1. Add Safety Limit (50k candles max ~ 2 months of 1m data)
    // This prevents the "ERR_STRING_TOO_LONG" crash
    const params = new URLSearchParams({
      dataset: 'GLBX.MDP3',       
      symbols: symbol,
      schema: 'ohlcv-1m',
      stype_in: 'continuous',
      encoding: 'json',           
      start: `${start}T00:00:00`, 
      end: `${end}T23:59:59`,
      limit: '50000' // <--- CRITICAL FIX
    });

    const authHeader = `Basic ${Buffer.from(apiKey + ':').toString('base64')}`;

    const response = await fetch(`https://hist.databento.com/v0/timeseries.get_range?${params.toString()}`, {
      headers: { 'Authorization': authHeader, 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Databento API Error', details: errorText }, { status: response.status });
    }

    const textData = await response.text();
    
    // 2. Safer Parsing
    const records = textData
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        try { return JSON.parse(line); } catch (e) { return null; }
      })
      .filter(record => record !== null);

    const candles = records.map((record: any) => ({
      time: parseInt(record.ts_event) / 1_000_000, 
      open: Number(record.open) / 1000000000,
      high: Number(record.high) / 1000000000,
      low: Number(record.low) / 1000000000,
      close: Number(record.close) / 1000000000,
      volume: Number(record.volume),
    }));

    return NextResponse.json({ candles });

  } catch (error: any) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}