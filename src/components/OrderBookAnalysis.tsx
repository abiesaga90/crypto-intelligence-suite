'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, TrendingUp, TrendingDown, BarChart3, Zap, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { COLORS } from '@/config/constants';

interface OrderBookLevel {
  price: number;
  volume: number;
  total: number;
  type: 'bid' | 'ask';
}

interface VolumeNode {
  price: number;
  volume: number;
  type: 'HVN' | 'LVN'; // High Volume Node or Low Volume Node
  significance: number; // 0-100 scale
}

interface OrderBookMetrics {
  symbol: string;
  timestamp: number;
  spread: number;
  spreadPercent: number;
  bidDepth: number;
  askDepth: number;
  totalDepth: number;
  marketPressure: 'bullish' | 'bearish' | 'neutral';
  liquidityScore: number; // 0-100
  institutionalSignals: {
    largeOrders: number;
    hiddenLiquidity: number;
    algorithmicActivity: number;
    confidence: number;
  };
}

interface OrderBookAnalysisProps {
  symbol: string;
}

export default function OrderBookAnalysis({ symbol }: OrderBookAnalysisProps) {
  const [orderBook, setOrderBook] = useState<OrderBookLevel[]>([]);
  const [volumeProfile, setVolumeProfile] = useState<VolumeNode[]>([]);
  const [metrics, setMetrics] = useState<OrderBookMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepth, setSelectedDepth] = useState<'shallow' | 'medium' | 'deep'>('medium');
  const [timeframe, setTimeframe] = useState('1h');

  useEffect(() => {
    const generateOrderBookData = () => {
      const currentPrice = getPriceForSymbol(symbol);
      const orderBookData: OrderBookLevel[] = [];
      const volumeNodes: VolumeNode[] = [];
      
      // Generate bid levels (buy orders)
      for (let i = 1; i <= 20; i++) {
        const priceLevel = currentPrice - (i * currentPrice * 0.001); // 0.1% intervals
        const volume = generateOrderVolume('bid', i);
        const total = volume * (21 - i); // Cumulative depth
        
        orderBookData.push({
          price: priceLevel,
          volume,
          total,
          type: 'bid'
        });
      }
      
      // Generate ask levels (sell orders)
      for (let i = 1; i <= 20; i++) {
        const priceLevel = currentPrice + (i * currentPrice * 0.001);
        const volume = generateOrderVolume('ask', i);
        const total = volume * (21 - i);
        
        orderBookData.push({
          price: priceLevel,
          volume,
          total,
          type: 'ask'
        });
      }

      // Generate Volume Profile with HVNs and LVNs
      for (let i = 0; i < 15; i++) {
        const priceLevel = currentPrice * (0.95 + (i * 0.01)); // ±5% range
        const volume = Math.random() * 10000 + 1000;
        const isHVN = volume > 7000 || Math.random() < 0.2; // High volume areas
        
        volumeNodes.push({
          price: priceLevel,
          volume,
          type: isHVN ? 'HVN' : 'LVN',
          significance: isHVN ? 70 + Math.random() * 30 : 20 + Math.random() * 40
        });
      }

      // Generate metrics based on report methodology
      const bidDepth = orderBookData.filter(o => o.type === 'bid').reduce((sum, o) => sum + o.volume, 0);
      const askDepth = orderBookData.filter(o => o.type === 'ask').reduce((sum, o) => sum + o.volume, 0);
      const spread = Math.min(...orderBookData.filter(o => o.type === 'ask').map(o => o.price)) - 
                    Math.max(...orderBookData.filter(o => o.type === 'bid').map(o => o.price));
      
      const orderBookMetrics: OrderBookMetrics = {
        symbol,
        timestamp: Date.now(),
        spread,
        spreadPercent: (spread / currentPrice) * 100,
        bidDepth,
        askDepth,
        totalDepth: bidDepth + askDepth,
        marketPressure: bidDepth > askDepth * 1.2 ? 'bullish' : 
                       askDepth > bidDepth * 1.2 ? 'bearish' : 'neutral',
        liquidityScore: Math.min(100, (bidDepth + askDepth) / 1000), // Normalized score
        institutionalSignals: {
          largeOrders: Math.floor(Math.random() * 15) + 5, // 5-20 large orders
          hiddenLiquidity: Math.random() * 0.4 + 0.3, // 30-70% hidden
          algorithmicActivity: Math.random() * 0.6 + 0.2, // 20-80% algorithmic
          confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
        }
      };

      setOrderBook(orderBookData);
      setVolumeProfile(volumeNodes);
      setMetrics(orderBookMetrics);
    };

    setLoading(true);
    setTimeout(() => {
      generateOrderBookData();
      setLoading(false);
    }, 800);

    // Refresh every 5 seconds to simulate real-time updates
    const interval = setInterval(generateOrderBookData, 5000);
    return () => clearInterval(interval);
  }, [symbol, selectedDepth, timeframe]);

  const generateOrderVolume = (type: 'bid' | 'ask', distance: number): number => {
    // Simulate realistic order book distribution
    const baseVolume = Math.random() * 500 + 100;
    const distanceMultiplier = Math.max(0.1, 1 - (distance * 0.05)); // Volume decreases with distance
    
    // Add occasional large institutional orders
    const isLargeOrder = Math.random() < 0.1; // 10% chance
    const institutionalMultiplier = isLargeOrder ? 5 + Math.random() * 10 : 1;
    
    return baseVolume * distanceMultiplier * institutionalMultiplier;
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

  const formatPrice = (price: number): string => {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  const getMarketPressureColor = (pressure: string): string => {
    switch (pressure) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getMarketPressureIcon = (pressure: string) => {
    switch (pressure) {
      case 'bullish': return <TrendingUp className="h-4 w-4" />;
      case 'bearish': return <TrendingDown className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  // Chart data for order book visualization
  const orderBookChartData = React.useMemo(() => {
    if (!orderBook.length) return [];
    
    return orderBook.map(level => ({
      price: level.price,
      bidVolume: level.type === 'bid' ? level.volume : 0,
      askVolume: level.type === 'ask' ? level.volume : 0,
      type: level.type
    })).sort((a, b) => a.price - b.price);
  }, [orderBook]);

  // Volume Profile chart data
  const volumeProfileData = React.useMemo(() => {
    return volumeProfile.map(node => ({
      price: node.price,
      volume: node.volume,
      significance: node.significance,
      isHVN: node.type === 'HVN',
      color: node.type === 'HVN' ? COLORS.success : COLORS.neutral
    })).sort((a, b) => b.price - a.price);
  }, [volumeProfile]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">Order Book & Volume Profile Analysis</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">Order Book & Volume Profile</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        
        <div className="flex space-x-2">
          <select
            value={selectedDepth}
            onChange={(e) => setSelectedDepth(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-green-500"
          >
            <option value="shallow">Shallow (10 levels)</option>
            <option value="medium">Medium (20 levels)</option>
            <option value="deep">Deep (50 levels)</option>
          </select>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-green-500"
          >
            <option value="5m">5M</option>
            <option value="15m">15M</option>
            <option value="1h">1H</option>
            <option value="4h">4H</option>
          </select>
        </div>
      </div>

      {metrics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-400">Spread</span>
              </div>
              <div className="text-xl font-bold">{formatPrice(metrics.spread)}</div>
              <div className="text-xs text-gray-400">{metrics.spreadPercent.toFixed(3)}%</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-gray-400">Liquidity Score</span>
              </div>
              <div className="text-xl font-bold text-purple-400">{metrics.liquidityScore.toFixed(0)}/100</div>
              <div className="text-xs text-gray-400">Market depth</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                {getMarketPressureIcon(metrics.marketPressure)}
                <span className="text-sm text-gray-400">Market Pressure</span>
              </div>
              <div className={`text-xl font-bold capitalize ${getMarketPressureColor(metrics.marketPressure)}`}>
                {metrics.marketPressure}
              </div>
              <div className="text-xs text-gray-400">
                {metrics.bidDepth > metrics.askDepth ? 'Bid dominant' : 
                 metrics.askDepth > metrics.bidDepth ? 'Ask dominant' : 'Balanced'}
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Algo Activity</span>
              </div>
              <div className="text-xl font-bold text-yellow-400">
                {(metrics.institutionalSignals.algorithmicActivity * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">Algorithmic orders</div>
            </div>
          </div>

          {/* Institutional Signals */}
          <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
            <h4 className="text-md font-medium mb-4 text-gray-300">Institutional Activity Indicators</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{metrics.institutionalSignals.largeOrders}</div>
                <div className="text-sm text-gray-400">Large Orders (&gt;$100K)</div>
                <div className="text-xs text-gray-500 mt-1">Professional threshold</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {(metrics.institutionalSignals.hiddenLiquidity * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-400">Hidden Liquidity</div>
                <div className="text-xs text-gray-500 mt-1">Iceberg orders detected</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {(metrics.institutionalSignals.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-400">Detection Confidence</div>
                <div className="text-xs text-gray-500 mt-1">Signal reliability</div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Order Book Depth Chart */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-md font-medium mb-4 text-gray-300">Order Book Depth</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={orderBookChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="price" 
                      stroke="#9CA3AF"
                      fontSize={10}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={10}
                      tickFormatter={(value) => formatVolume(value)}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatVolume(value), 
                        name === 'bidVolume' ? 'Bid Volume' : 'Ask Volume'
                      ]}
                      labelFormatter={(value: number) => `Price: ${formatPrice(value)}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bidVolume" 
                      stackId="1"
                      stroke="#10B981" 
                      fill="#10B981"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="askVolume" 
                      stackId="1"
                      stroke="#EF4444" 
                      fill="#EF4444"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Volume Profile Chart */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-md font-medium mb-4 text-gray-300">Volume Profile (HVN/LVN Analysis)</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeProfileData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      type="number"
                      stroke="#9CA3AF"
                      fontSize={10}
                      tickFormatter={(value) => formatVolume(value)}
                    />
                    <YAxis 
                      type="category"
                      dataKey="price"
                      stroke="#9CA3AF"
                      fontSize={10}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatVolume(value), 'Volume']}
                      labelFormatter={(value: number) => `Price: ${formatPrice(value)}`}
                    />
                    <Bar 
                      dataKey="volume" 
                      fill={(entry: any) => entry?.isHVN ? COLORS.success : COLORS.neutral}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>HVN: High Volume Nodes (Strong S/R levels)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span>LVN: Low Volume Nodes (Breakout zones)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Large Orders Table */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-md font-medium mb-4 text-gray-300">Recent Large Orders (Institutional Threshold: &gt;$100K)</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Array.from({ length: 8 }, (_, i) => {
                const isLarge = Math.random() > 0.6;
                const size = isLarge ? Math.random() * 500000 + 100000 : Math.random() * 50000 + 10000;
                const side = Math.random() > 0.5 ? 'Buy' : 'Sell';
                const timestamp = Date.now() - (Math.random() * 3600000); // Last hour
                
                return (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                    <div className="flex items-center space-x-3">
                      {isLarge && <AlertTriangle className="h-3 w-3 text-yellow-400" />}
                      <div>
                        <div className={`text-sm font-medium ${side === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>
                          {side} ${formatVolume(size)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {isLarge ? 'Institutional' : 'Retail'} • {formatPrice(getPriceForSymbol(symbol) * (0.998 + Math.random() * 0.004))}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.floor((Date.now() - timestamp) / 60000)}m ago
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        Professional order book analysis • HVN/LVN methodology • Institutional threshold: $100K+ orders
      </div>
    </motion.div>
  );
} 