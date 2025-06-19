import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/config/constants';

const RATE_LIMIT_STORE = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30; // Hobbyist plan limit
  
  const current = RATE_LIMIT_STORE.get(clientId) || { count: 0, resetTime: now + windowMs };
  
  // Reset if window has passed
  if (now > current.resetTime) {
    current.count = 0;
    current.resetTime = now + windowMs;
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }
  
  current.count++;
  RATE_LIMIT_STORE.set(clientId, current);
  
  return { 
    allowed: true, 
    remaining: maxRequests - current.count,
    resetTime: current.resetTime 
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || '4h';
    const limit = searchParams.get('limit') || '100';
    
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    // Rate limiting check
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'default';
    const rateCheck = checkRateLimit(clientId);
    
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before making more requests.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateCheck.resetTime.toString(),
          }
        }
      );
    }

    // Build API URL
    let apiUrl = `${API_CONFIG.coinglass.baseUrl}${endpoint}`;
    const params = new URLSearchParams();
    
    // Handle different parameter requirements for different endpoints
    if (endpoint.includes('/liquidation/history')) {
      // Note: Liquidation endpoints may not be available for HOBBYIST plan
      if (symbol) {
        params.append('instrument', `${symbol.toUpperCase()}USDT`);
        params.append('symbol', symbol.toUpperCase());
      }
      params.append('exchange', 'binance'); // Default to Binance
      if (interval) params.append('interval', interval);
    } else if (endpoint.includes('/funding-rate/history')) {
      // Note: Funding rate endpoints may not be available for HOBBYIST plan
      if (symbol) params.append('symbol', symbol.toUpperCase());
      params.append('exchange', 'binance'); // Add exchange parameter
      if (interval) params.append('interval', interval);
    } else if (endpoint.includes('/long-short-ratio')) {
      // Long-short ratio endpoints
      if (symbol) params.append('symbol', symbol.toUpperCase());
      if (interval && !endpoint.includes('/global-account')) params.append('interval', interval);
    } else {
      // Default parameter handling
      if (symbol) params.append('symbol', symbol.toUpperCase());
      if (interval) params.append('interval', interval);
      if (limit) params.append('limit', limit);
    }
    
    if (params.toString()) {
      apiUrl += `?${params.toString()}`;
    }

    console.log(`Making CoinGlass API request to: ${apiUrl}`);

    // Make the API request
    const response = await fetch(apiUrl, {
      headers: {
        'CG-API-KEY': API_CONFIG.coinglass.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'CryptoDashboard/1.0',
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      console.error(`CoinGlass API error: ${response.status} ${response.statusText}`);
      
      // Handle specific endpoint limitations for HOBBYIST plan
      if (endpoint.includes('/liquidation/history') || endpoint.includes('/funding-rate/history')) {
        return NextResponse.json({
          code: "403",
          msg: "Hobbyist plan limitations",
          error: "Liquidation and funding rate endpoints require Professional+ plan",
          fallback: true,
          data: {
            message: "This feature requires CoinGlass Professional+ plan",
            limitation: "HOBBYIST plan supports ≥4h intervals only for basic market data",
            upgrade: "Consider upgrading to access real-time liquidation and funding rate data"
          }
        }, { status: 200 }); // Return 200 so frontend can handle gracefully
      }
      
      return NextResponse.json(
        { error: `API request failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Check if the response indicates an error despite 200 status
    if (data.code !== "0" && data.code !== 0) {
      console.error(`CoinGlass API returned error: ${data.msg}`);
      
      // Handle instrument/parameter errors for hobbyist plan
      if (data.msg === "instrument" || data.msg?.includes("instrument")) {
        return NextResponse.json({
          code: "403",
          msg: "Hobbyist plan limitations",
          error: "This endpoint is not available with HOBBYIST plan",
          fallback: true,
          data: {
            message: "This feature requires CoinGlass Professional+ plan",
            limitation: "HOBBYIST plan has limited access to liquidation and funding rate data",
            upgrade: "Consider upgrading to access real-time institutional trading data"
          }
        }, { status: 200 });
      }
    }
    
    return NextResponse.json(data, {
      headers: {
        'X-RateLimit-Remaining': rateCheck.remaining.toString(),
        'X-RateLimit-Reset': rateCheck.resetTime.toString(),
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      }
    });

  } catch (error) {
    console.error('CoinGlass proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 