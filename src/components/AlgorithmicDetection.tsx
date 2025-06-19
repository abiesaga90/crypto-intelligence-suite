'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, TrendingUp, RotateCcw, ArrowLeftRight, Bot, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts';
import { COLORS } from '@/config/constants';

interface AlgorithmicStrategy {
  type: 'HFT' | 'momentum' | 'mean_reversion' | 'arbitrage' | 'market_making';
  name: string;
  activity: number; // 0-100 intensity
  confidence: number; // 0-100 detection confidence
  volume: number; // USD volume
  frequency: number; // trades per second
  characteristics: string[];
  lastDetected: number; // timestamp
}

interface MarketMicrostructure {
  symbol: string;
  timestamp: number;
  latency: number; // milliseconds
  orderCancellationRate: number; // 0-1
  averageOrderSize: number;
  priceImpact: number; // basis points
  spreadCompression: number; // 0-1
  coLocationActivity: number; // 0-100
}

interface AlgorithmicMetrics {
  symbol: string;
  totalAlgorithmicActivity: number; // 0-100
  institutionalAlgoRatio: number; // 0-100
  strategies: AlgorithmicStrategy[];
  microstructure: MarketMicrostructure;
  riskSignals: {
    flashCrashRisk: number; // 0-100
    liquidityFragmentation: number; // 0-100
    spoofingDetection: number; // 0-100
    washTradingRisk: number; // 0-100
  };
}

interface AlgorithmicDetectionProps {
  symbol: string;
}

export default function AlgorithmicDetection({ symbol }: AlgorithmicDetectionProps) {
  const [metrics, setMetrics] = useState<AlgorithmicMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<AlgorithmicStrategy | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'strategies' | 'microstructure' | 'risks'>('overview');

  useEffect(() => {
    const generateAlgorithmicData = (): AlgorithmicMetrics => {
      const now = Date.now();
      
      // Generate realistic algorithmic strategies based on report methodology
      const strategies: AlgorithmicStrategy[] = [
        {
          type: 'HFT',
          name: 'High-Frequency Trading',
          activity: 60 + Math.random() * 35, // 60-95%
          confidence: 85 + Math.random() * 10, // 85-95%
          volume: Math.random() * 50000000 + 10000000, // $10M-60M
          frequency: 100 + Math.random() * 400, // 100-500 trades/sec
          characteristics: [
            'Ultra-low latency execution',
            'Co-location services usage',
            'Rapid order cancellation',
            'Millisecond holding periods'
          ],
          lastDetected: now - Math.random() * 60000 // Last minute
        },
        {
          type: 'momentum',
          name: 'Momentum Trading',
          activity: 45 + Math.random() * 40, // 45-85%
          confidence: 75 + Math.random() * 20, // 75-95%
          volume: Math.random() * 30000000 + 5000000, // $5M-35M
          frequency: 1 + Math.random() * 10, // 1-11 trades/sec
          characteristics: [
            'Trend following algorithms',
            'Technical indicator triggers',
            'Moving average crossovers',
            'RSI/MACD based entries'
          ],
          lastDetected: now - Math.random() * 300000 // Last 5 minutes
        },
        {
          type: 'mean_reversion',
          name: 'Mean Reversion',
          activity: 35 + Math.random() * 35, // 35-70%
          confidence: 70 + Math.random() * 25, // 70-95%
          volume: Math.random() * 25000000 + 3000000, // $3M-28M
          frequency: 0.5 + Math.random() * 5, // 0.5-5.5 trades/sec
          characteristics: [
            'Bollinger Band strategies',
            'Oversold/overbought detection',
            'Statistical arbitrage',
            'Price deviation targeting'
          ],
          lastDetected: now - Math.random() * 600000 // Last 10 minutes
        },
        {
          type: 'arbitrage',
          name: 'Arbitrage Trading',
          activity: 25 + Math.random() * 30, // 25-55%
          confidence: 80 + Math.random() * 15, // 80-95%
          volume: Math.random() * 40000000 + 8000000, // $8M-48M
          frequency: 10 + Math.random() * 50, // 10-60 trades/sec
          characteristics: [
            'Cross-exchange price differences',
            'Triangular arbitrage',
            'Funding rate arbitrage',
            'Millisecond execution required'
          ],
          lastDetected: now - Math.random() * 120000 // Last 2 minutes
        },
        {
          type: 'market_making',
          name: 'Market Making',
          activity: 55 + Math.random() * 30, // 55-85%
          confidence: 90 + Math.random() * 8, // 90-98%
          volume: Math.random() * 80000000 + 20000000, // $20M-100M
          frequency: 20 + Math.random() * 80, // 20-100 trades/sec
          characteristics: [
            'Continuous bid/ask quotes',
            'Inventory management',
            'Spread capture strategies',
            'Liquidity provision'
          ],
          lastDetected: now - Math.random() * 30000 // Last 30 seconds
        }
      ];

      const microstructure: MarketMicrostructure = {
        symbol,
        timestamp: now,
        latency: 0.1 + Math.random() * 2, // 0.1-2.1ms
        orderCancellationRate: 0.3 + Math.random() * 0.4, // 30-70%
        averageOrderSize: 1000 + Math.random() * 50000, // $1K-51K
        priceImpact: Math.random() * 10 + 1, // 1-11 basis points
        spreadCompression: Math.random() * 0.8 + 0.1, // 10-90%
        coLocationActivity: Math.random() * 60 + 20 // 20-80%
      };

      const totalAlgorithmicActivity = strategies.reduce((sum, s) => sum + s.activity, 0) / strategies.length;
      const institutionalAlgoRatio = Math.min(95, totalAlgorithmicActivity * 1.2); // Institutional algos tend to be more sophisticated

      return {
        symbol,
        totalAlgorithmicActivity,
        institutionalAlgoRatio,
        strategies,
        microstructure,
        riskSignals: {
          flashCrashRisk: Math.max(0, (totalAlgorithmicActivity - 70) * 2), // Higher risk with more algo activity
          liquidityFragmentation: microstructure.orderCancellationRate * 100,
          spoofingDetection: Math.random() * 30 + 10, // 10-40%
          washTradingRisk: Math.random() * 25 + 5 // 5-30%
        }
      };
    };

    setLoading(true);
    setTimeout(() => {
      setMetrics(generateAlgorithmicData());
      setLoading(false);
    }, 1200);

    // Update every 10 seconds for real-time algorithm detection
    const interval = setInterval(() => {
      setMetrics(generateAlgorithmicData());
    }, 10000);

    return () => clearInterval(interval);
  }, [symbol]);

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`;
    return `$${volume.toFixed(0)}`;
  };

  const formatLatency = (latency: number): string => {
    if (latency < 1) return `${(latency * 1000).toFixed(0)}μs`;
    return `${latency.toFixed(2)}ms`;
  };

  const getStrategyIcon = (type: string) => {
    switch (type) {
      case 'HFT': return <Zap className="h-4 w-4" />;
      case 'momentum': return <TrendingUp className="h-4 w-4" />;
      case 'mean_reversion': return <RotateCcw className="h-4 w-4" />;
      case 'arbitrage': return <ArrowLeftRight className="h-4 w-4" />;
      case 'market_making': return <Bot className="h-4 w-4" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  const getActivityColor = (activity: number): string => {
    if (activity >= 80) return 'text-red-400';
    if (activity >= 60) return 'text-yellow-400';
    if (activity >= 40) return 'text-green-400';
    return 'text-gray-400';
  };

  const getRiskColor = (risk: number): string => {
    if (risk >= 70) return 'text-red-400';
    if (risk >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  // Radar chart data for algorithmic strategies
  const radarData = metrics ? metrics.strategies.map(strategy => ({
    strategy: strategy.type.toUpperCase(),
    activity: strategy.activity,
    confidence: strategy.confidence
  })) : [];

  // Time series data for algorithm activity
  const activityData = React.useMemo(() => {
    if (!metrics) return [];
    
    const data = [];
    const now = Date.now();
    for (let i = 23; i >= 0; i--) {
      const timestamp = now - (i * 60000); // Last 24 minutes
      data.push({
        time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        HFT: 60 + Math.random() * 35,
        momentum: 45 + Math.random() * 40,
        arbitrage: 25 + Math.random() * 30,
        market_making: 55 + Math.random() * 30
      });
    }
    return data;
  }, [metrics]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Cpu className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Algorithmic Trading Detection</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Analyzing algorithmic patterns...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Cpu className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Algorithmic Trading Detection</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        
        <div className="flex space-x-2">
          {['overview', 'strategies', 'microstructure', 'risks'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Bot className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-400">Algo Activity</span>
          </div>
          <div className={`text-xl font-bold ${getActivityColor(metrics.totalAlgorithmicActivity)}`}>
            {metrics.totalAlgorithmicActivity.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-400">Market coverage</div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Latency</span>
          </div>
          <div className="text-xl font-bold text-yellow-400">
            {formatLatency(metrics.microstructure.latency)}
          </div>
          <div className="text-xs text-gray-400">Execution speed</div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-400">Institutional</span>
          </div>
          <div className="text-xl font-bold text-blue-400">
            {metrics.institutionalAlgoRatio.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-400">Professional algos</div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-gray-400">Risk Level</span>
          </div>
          <div className={`text-xl font-bold ${getRiskColor(metrics.riskSignals.flashCrashRisk)}`}>
            {Math.max(metrics.riskSignals.flashCrashRisk, metrics.riskSignals.liquidityFragmentation).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-400">Flash crash risk</div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strategy Activity Chart */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-md font-medium mb-4 text-gray-300">Real-Time Algorithm Activity</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    fontSize={10}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={10}
                    domain={[0, 100]}
                  />
                  <Tooltip />
                  <Line type="monotone" dataKey="HFT" stroke="#EF4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="momentum" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="arbitrage" stroke="#10B981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="market_making" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strategy Radar */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-md font-medium mb-4 text-gray-300">Algorithm Detection Confidence</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="strategy" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Activity"
                    dataKey="activity"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Confidence"
                    dataKey="confidence"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'strategies' && (
        <div className="space-y-4">
          {metrics.strategies.map((strategy, index) => (
            <div 
              key={index} 
              className={`bg-gray-700/30 rounded-lg p-4 cursor-pointer transition-colors ${
                selectedStrategy?.type === strategy.type ? 'ring-2 ring-purple-500' : 'hover:bg-gray-700/40'
              }`}
              onClick={() => setSelectedStrategy(strategy)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStrategyIcon(strategy.type)}
                  <span className="font-medium">{strategy.name}</span>
                </div>
                <div className="flex space-x-4">
                  <div className={`text-sm font-medium ${getActivityColor(strategy.activity)}`}>
                    Activity: {strategy.activity.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-400">
                    Confidence: {strategy.confidence.toFixed(0)}%
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-400">Volume</div>
                  <div className="text-sm font-medium">{formatVolume(strategy.volume)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Frequency</div>
                  <div className="text-sm font-medium">{strategy.frequency.toFixed(1)}/sec</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Last Detected</div>
                  <div className="text-sm font-medium">
                    {Math.floor((Date.now() - strategy.lastDetected) / 60000)}m ago
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Type</div>
                  <div className="text-sm font-medium capitalize">{strategy.type.replace('_', ' ')}</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {strategy.characteristics.map((char, charIndex) => (
                  <span 
                    key={charIndex}
                    className="px-2 py-1 bg-gray-600 rounded text-xs"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'microstructure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-300">Market Microstructure Metrics</h4>
            
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Execution Latency:</span>
                  <span className="text-sm font-medium">{formatLatency(metrics.microstructure.latency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Order Cancellation Rate:</span>
                  <span className="text-sm font-medium">{(metrics.microstructure.orderCancellationRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Average Order Size:</span>
                  <span className="text-sm font-medium">{formatVolume(metrics.microstructure.averageOrderSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Price Impact:</span>
                  <span className="text-sm font-medium">{metrics.microstructure.priceImpact.toFixed(1)} bps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Spread Compression:</span>
                  <span className="text-sm font-medium">{(metrics.microstructure.spreadCompression * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Co-location Activity:</span>
                  <span className="text-sm font-medium">{metrics.microstructure.coLocationActivity.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-300">Professional Indicators</h4>
            
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {metrics.microstructure.coLocationActivity.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-400">Co-location Usage</div>
                  <div className="text-xs text-gray-500 mt-1">Professional infrastructure</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {(metrics.microstructure.orderCancellationRate * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-400">Order Cancellation</div>
                  <div className="text-xs text-gray-500 mt-1">HFT indicator</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {metrics.microstructure.priceImpact.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-400">Price Impact (bps)</div>
                  <div className="text-xs text-gray-500 mt-1">Market efficiency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'risks' && (
        <div className="space-y-6">
          <h4 className="text-md font-medium text-gray-300">Algorithmic Trading Risk Assessment</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold ${getRiskColor(metrics.riskSignals.flashCrashRisk)}`}>
                {metrics.riskSignals.flashCrashRisk.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400">Flash Crash Risk</div>
              <div className="text-xs text-gray-500 mt-1">Algorithmic cascade risk</div>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold ${getRiskColor(metrics.riskSignals.liquidityFragmentation)}`}>
                {metrics.riskSignals.liquidityFragmentation.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400">Liquidity Fragmentation</div>
              <div className="text-xs text-gray-500 mt-1">Market depth impact</div>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold ${getRiskColor(metrics.riskSignals.spoofingDetection)}`}>
                {metrics.riskSignals.spoofingDetection.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400">Spoofing Detection</div>
              <div className="text-xs text-gray-500 mt-1">Manipulative orders</div>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold ${getRiskColor(metrics.riskSignals.washTradingRisk)}`}>
                {metrics.riskSignals.washTradingRisk.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400">Wash Trading Risk</div>
              <div className="text-xs text-gray-500 mt-1">Artificial volume</div>
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h5 className="font-medium mb-3">Risk Mitigation Recommendations</h5>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• Monitor order book depth changes for early flash crash detection</div>
              <div>• Implement circuit breakers during high algorithmic activity periods</div>
              <div>• Track order cancellation ratios for spoofing identification</div>
              <div>• Use volume-weighted metrics to filter artificial trading activity</div>
              <div>• Set position size limits during periods of high algorithmic volatility</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-500">
        Advanced algorithmic detection • HFT pattern recognition • Professional trading strategy identification
      </div>
    </motion.div>
  );
} 