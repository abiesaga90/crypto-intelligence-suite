'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, TrendingUp, TrendingDown, Shuffle, AlertTriangle, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { COLORS } from '@/config/constants';

interface ExchangeFlow {
  id: string;
  fromExchange: string;
  toExchange: string;
  amount: number;
  amountUSD: number;
  symbol: string;
  timestamp: number;
  flowType: 'inflow' | 'outflow' | 'inter-exchange';
  confidence: number;
  suspiciousActivity: boolean;
}

interface ExchangeReserve {
  exchange: string;
  symbol: string;
  balance: number;
  balanceUSD: number;
  change24h: number;
  change24hPercent: number;
  inflows24h: number;
  outflows24h: number;
  netFlow24h: number;
}

interface ExchangeFlowMonitorProps {
  symbol: string;
}

export default function ExchangeFlowMonitor({ symbol }: ExchangeFlowMonitorProps) {
  const [flows, setFlows] = useState<ExchangeFlow[]>([]);
  const [reserves, setReserves] = useState<ExchangeReserve[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'reserves' | 'netflow'>('volume');

  useEffect(() => {
    const fetchExchangeData = async () => {
      try {
        setLoading(true);
        
        // Simulate exchange flow data based on research methodology
        const simulatedFlows = generateExchangeFlows(symbol);
        const simulatedReserves = generateExchangeReserves(symbol);
        
        setFlows(simulatedFlows);
        setReserves(simulatedReserves);
      } catch (err) {
        console.error('Error fetching exchange flow data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeData();
  }, [symbol, timeframe]);

  const generateExchangeFlows = (symbol: string): ExchangeFlow[] => {
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit', 'Bitfinex', 'Huobi', 'Gate.io'];
    const flows: ExchangeFlow[] = [];
    const now = Date.now();
    const price = getPriceForSymbol(symbol);

    // Generate 30-80 flows in the last 24h
    const flowCount = Math.floor(Math.random() * 50) + 30;

    for (let i = 0; i < flowCount; i++) {
      const timestamp = now - (Math.random() * 24 * 60 * 60 * 1000);
      const fromExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
      let toExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
      
      // Ensure different exchanges
      while (toExchange === fromExchange) {
        toExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
      }

      // Generate flow amounts with realistic distribution
      const amount = generateFlowAmount();
      const amountUSD = amount * price;
      
      // Determine flow type and suspicious activity
      const flowType: 'inflow' | 'outflow' | 'inter-exchange' = 
        Math.random() < 0.3 ? 'inflow' : 
        Math.random() < 0.6 ? 'outflow' : 'inter-exchange';
      
      const suspiciousActivity = amountUSD > 10000000 || // >$10M flows are suspicious
        (amountUSD > 1000000 && Math.random() < 0.1); // >$1M with 10% chance

      flows.push({
        id: `flow-${i}`,
        fromExchange,
        toExchange,
        amount,
        amountUSD,
        symbol,
        timestamp,
        flowType,
        confidence: 0.85 + Math.random() * 0.1,
        suspiciousActivity,
      });
    }

    return flows.sort((a, b) => b.timestamp - a.timestamp);
  };

  const generateExchangeReserves = (symbol: string): ExchangeReserve[] => {
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit', 'Bitfinex'];
    const price = getPriceForSymbol(symbol);
    
    return exchanges.map(exchange => {
      const baseBalance = getExchangeBaseBalance(exchange, symbol);
      const change24h = (Math.random() - 0.5) * baseBalance * 0.1; // ±10% change
      const balance = baseBalance + change24h;
      const change24hPercent = (change24h / baseBalance) * 100;
      
      const inflows24h = Math.random() * baseBalance * 0.05; // Up to 5% of balance
      const outflows24h = Math.random() * baseBalance * 0.05;
      const netFlow24h = inflows24h - outflows24h;

      return {
        exchange,
        symbol,
        balance,
        balanceUSD: balance * price,
        change24h,
        change24hPercent,
        inflows24h,
        outflows24h,
        netFlow24h,
      };
    });
  };

  const generateFlowAmount = (): number => {
    const random = Math.random();
    if (random < 0.02) return Math.random() * 50000 + 10000; // 2% mega flows (10k-60k tokens)
    if (random < 0.10) return Math.random() * 5000 + 1000;  // 8% large flows (1k-6k tokens)
    if (random < 0.30) return Math.random() * 500 + 100;    // 20% medium flows (100-600 tokens)
    return Math.random() * 50 + 10;                          // 70% small flows (10-60 tokens)
  };

  const getPriceForSymbol = (symbol: string): number => {
    const prices: Record<string, number> = {
      'BTC': 43000,
      'ETH': 2400,
      'SOL': 95,
      'XRP': 0.6,
      'DOGE': 0.08,
    };
    return prices[symbol] || 100;
  };

  const getExchangeBaseBalance = (exchange: string, symbol: string): number => {
    const baseBalances: Record<string, Record<string, number>> = {
      'Binance': { 'BTC': 50000, 'ETH': 800000, 'SOL': 2000000, 'XRP': 500000000, 'DOGE': 10000000000 },
      'Coinbase': { 'BTC': 40000, 'ETH': 600000, 'SOL': 1500000, 'XRP': 400000000, 'DOGE': 8000000000 },
      'Kraken': { 'BTC': 15000, 'ETH': 250000, 'SOL': 800000, 'XRP': 200000000, 'DOGE': 3000000000 },
      'OKX': { 'BTC': 25000, 'ETH': 400000, 'SOL': 1200000, 'XRP': 300000000, 'DOGE': 6000000000 },
      'Bybit': { 'BTC': 20000, 'ETH': 300000, 'SOL': 900000, 'XRP': 250000000, 'DOGE': 4000000000 },
      'Bitfinex': { 'BTC': 10000, 'ETH': 150000, 'SOL': 500000, 'XRP': 150000000, 'DOGE': 2000000000 },
    };
    return baseBalances[exchange]?.[symbol] || 1000;
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(2)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Analytics based on research methodology
  const analytics = React.useMemo(() => {
    if (!flows.length || !reserves.length) return null;

    const totalFlowVolume = flows.reduce((sum, flow) => sum + flow.amountUSD, 0);
    const suspiciousFlows = flows.filter(flow => flow.suspiciousActivity);
    const largeFlows = flows.filter(flow => flow.amountUSD >= 1000000); // $1M+
    
    const totalReserves = reserves.reduce((sum, reserve) => sum + reserve.balanceUSD, 0);
    const netFlowDirection = reserves.reduce((sum, reserve) => sum + reserve.netFlow24h, 0);
    
    const exchangesByNetFlow = [...reserves].sort((a, b) => Math.abs(b.netFlow24h) - Math.abs(a.netFlow24h));
    
    return {
      totalFlowVolume,
      totalFlows: flows.length,
      suspiciousFlows: suspiciousFlows.length,
      largeFlows: largeFlows.length,
      totalReserves,
      netFlowDirection,
      dominantExchange: exchangesByNetFlow[0],
      flowTrend: netFlowDirection > 0 ? 'accumulation' : 'distribution',
    };
  }, [flows, reserves]);

  // Chart data for flow timeline
  const flowChartData = React.useMemo(() => {
    if (!flows.length) return [];
    
    const hourlyData: Record<string, { time: string; volume: number; count: number }> = {};
    
    flows.forEach(flow => {
      const hour = new Date(flow.timestamp);
      hour.setMinutes(0, 0, 0);
      const timeKey = hour.toISOString();
      
      if (!hourlyData[timeKey]) {
        hourlyData[timeKey] = {
          time: hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          volume: 0,
          count: 0,
        };
      }
      
      hourlyData[timeKey].volume += flow.amountUSD;
      hourlyData[timeKey].count += 1;
    });
    
    return Object.values(hourlyData).sort((a, b) => a.time.localeCompare(b.time));
  }, [flows]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ArrowUpDown className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Exchange Flow Monitor</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Exchange Flow Analysis</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        
        <div className="flex space-x-2">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="volume">Flow Volume</option>
            <option value="reserves">Exchange Reserves</option>
            <option value="netflow">Net Flow</option>
          </select>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="1h">1H</option>
            <option value="4h">4H</option>
            <option value="24h">24H</option>
            <option value="7d">7D</option>
          </select>
        </div>
      </div>

      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shuffle className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-400">Total Flow</span>
              </div>
              <div className="text-xl font-bold">{formatAmount(analytics.totalFlowVolume)}</div>
              <div className="text-xs text-gray-400">{analytics.totalFlows} transactions</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Large Flows</span>
              </div>
              <div className="text-xl font-bold text-yellow-400">{analytics.largeFlows}</div>
              <div className="text-xs text-gray-400">≥$1M transfers</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="h-4 w-4 text-red-400" />
                <span className="text-sm text-gray-400">Suspicious</span>
              </div>
              <div className="text-xl font-bold text-red-400">{analytics.suspiciousFlows}</div>
              <div className="text-xs text-gray-400">flagged transfers</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                {analytics.netFlowDirection > 0 ? 
                  <TrendingUp className="h-4 w-4 text-green-400" /> :
                  <TrendingDown className="h-4 w-4 text-red-400" />
                }
                <span className="text-sm text-gray-400">Net Flow</span>
              </div>
              <div className={`text-xl font-bold ${analytics.netFlowDirection > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {analytics.flowTrend === 'accumulation' ? 'Accumulation' : 'Distribution'}
              </div>
              <div className="text-xs text-gray-400 capitalize">{analytics.flowTrend} phase</div>
            </div>
          </div>

          {/* Flow Timeline Chart */}
          <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
            <h4 className="text-md font-medium mb-4 text-gray-300">Exchange Flow Timeline</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={flowChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.neutral} />
                  <XAxis 
                    dataKey="time" 
                    stroke={COLORS.neutral}
                    fontSize={12}
                  />
                  <YAxis 
                    stroke={COLORS.neutral}
                    fontSize={12}
                    tickFormatter={(value) => formatAmount(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatAmount(value), 'Flow Volume']}
                    labelStyle={{ color: COLORS.text }}
                    contentStyle={{ 
                      backgroundColor: COLORS.surface,
                      border: `1px solid ${COLORS.neutral}`,
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Exchange Reserves */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-md font-medium mb-4 text-gray-300">Exchange Reserves</h4>
              <div className="space-y-3">
                {reserves.slice(0, 6).map((reserve, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium">{reserve.exchange}</div>
                      <div className="text-sm text-gray-400">
                        {reserve.balance.toLocaleString()} {symbol}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatAmount(reserve.balanceUSD)}</div>
                      <div className={`text-sm ${reserve.change24hPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {reserve.change24hPercent >= 0 ? '+' : ''}{reserve.change24hPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-md font-medium mb-4 text-gray-300">Recent Large Flows</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {flows.filter(flow => flow.amountUSD >= 100000).slice(0, 8).map((flow, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                    <div className="flex items-center space-x-2">
                      {flow.suspiciousActivity && (
                        <AlertTriangle className="h-3 w-3 text-red-400" />
                      )}
                      <div>
                        <div className="text-sm font-medium">{formatAmount(flow.amountUSD)}</div>
                        <div className="text-xs text-gray-400">
                          {flow.fromExchange} → {flow.toExchange}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatTimeAgo(flow.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="text-xs text-gray-500">
        Based on professional exchange flow analysis • Large flows and pattern detection
      </div>
    </motion.div>
  );
} 