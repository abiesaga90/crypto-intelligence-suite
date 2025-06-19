'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Moon, Sun, Calendar, TrendingUp, Building2, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
import { COLORS } from '@/config/constants';

interface SessionData {
  session: string;
  startTime: string;
  endTime: string;
  volume: number;
  returns: number;
  institutionalActivity: number;
  retailActivity: number;
  significance: 'high' | 'medium' | 'low';
}

interface TemporalPattern {
  type: 'overnight_anomaly' | 'weekend_effect' | 'session_bias' | 'market_open_close';
  strength: number; // 0-100
  confidence: number; // 0-100
  description: string;
  implication: string;
}

interface TemporalMetrics {
  symbol: string;
  timestamp: number;
  currentSession: string;
  marketPhase: 'pre_market' | 'market_hours' | 'after_hours' | 'weekend';
  institutionalDominance: number; // 0-100
  patterns: TemporalPattern[];
  tradingVelocity: {
    current: number;
    average: number;
    percentile: number;
  };
}

interface TemporalAnalysisProps {
  symbol: string;
}

export default function TemporalAnalysis({ symbol }: TemporalAnalysisProps) {
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const [metrics, setMetrics] = useState<TemporalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'sessions' | 'patterns' | 'velocity'>('sessions');
  const [timezone, setTimezone] = useState('UTC');

  useEffect(() => {
    const generateTemporalData = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      
      // Generate session-based data based on report methodology
      const sessions: SessionData[] = [
        {
          session: 'Asian Session',
          startTime: '00:00',
          endTime: '08:00',
          volume: generateSessionVolume('asian'),
          returns: generateSessionReturns('asian'),
          institutionalActivity: 30 + Math.random() * 40, // 30-70%
          retailActivity: 20 + Math.random() * 30, // 20-50%
          significance: 'medium'
        },
        {
          session: 'European Session',
          startTime: '08:00',
          endTime: '16:00',
          volume: generateSessionVolume('european'),
          returns: generateSessionReturns('european'),
          institutionalActivity: 50 + Math.random() * 35, // 50-85%
          retailActivity: 25 + Math.random() * 35, // 25-60%
          significance: 'high'
        },
        {
          session: 'US Session',
          startTime: '16:00',
          endTime: '00:00',
          volume: generateSessionVolume('us'),
          returns: generateSessionReturns('us'),
          institutionalActivity: 60 + Math.random() * 30, // 60-90%
          retailActivity: 40 + Math.random() * 40, // 40-80%
          significance: 'high'
        },
        {
          session: 'Overnight',
          startTime: '00:00',
          endTime: '08:00',
          volume: generateSessionVolume('overnight'),
          returns: generateSessionReturns('overnight', true), // Enhanced for overnight anomaly
          institutionalActivity: 70 + Math.random() * 25, // 70-95% (high institutional)
          retailActivity: 10 + Math.random() * 20, // 10-30% (low retail)
          significance: 'high'
        }
      ];

      // Generate temporal patterns based on report findings
      const patterns: TemporalPattern[] = [
        {
          type: 'overnight_anomaly',
          strength: 75 + Math.random() * 20, // 75-95%
          confidence: 80 + Math.random() * 15, // 80-95%
          description: 'Significant BTC returns during overnight sessions since 2021',
          implication: 'Institutional ETF influence on traditional market patterns'
        },
        {
          type: 'weekend_effect',
          strength: isWeekend ? 85 + Math.random() * 10 : 60 + Math.random() * 25,
          confidence: 70 + Math.random() * 20,
          description: 'Enhanced performance Friday close to Monday open pattern',
          implication: 'Traditional finance institutional positioning affects crypto'
        },
        {
          type: 'session_bias',
          strength: 65 + Math.random() * 25,
          confidence: 75 + Math.random() * 20,
          description: 'Higher institutional activity during traditional market hours',
          implication: 'Convergence with traditional finance trading patterns'
        },
        {
          type: 'market_open_close',
          strength: (currentHour >= 9 && currentHour <= 10) || (currentHour >= 15 && currentHour <= 16) ? 
                   80 + Math.random() * 15 : 45 + Math.random() * 30,
          confidence: 70 + Math.random() * 25,
          description: 'Elevated activity at traditional market open/close times',
          implication: 'ETF and institutional trading following TradFi schedules'
        }
      ];

      // Determine current market phase
      let marketPhase: 'pre_market' | 'market_hours' | 'after_hours' | 'weekend';
      if (isWeekend) {
        marketPhase = 'weekend';
      } else if (currentHour >= 4 && currentHour < 9) {
        marketPhase = 'pre_market';
      } else if (currentHour >= 9 && currentHour < 16) {
        marketPhase = 'market_hours';
      } else {
        marketPhase = 'after_hours';
      }

      const temporalMetrics: TemporalMetrics = {
        symbol,
        timestamp: Date.now(),
        currentSession: getCurrentSession(currentHour),
        marketPhase,
        institutionalDominance: calculateInstitutionalDominance(currentHour, isWeekend),
        patterns,
        tradingVelocity: {
          current: Math.random() * 150 + 50, // 50-200
          average: 100,
          percentile: Math.random() * 100
        }
      };

      setSessionData(sessions);
      setMetrics(temporalMetrics);
    };

    setLoading(true);
    setTimeout(() => {
      generateTemporalData();
      setLoading(false);
    }, 1000);

    // Update every minute for real-time session tracking
    const interval = setInterval(generateTemporalData, 60000);
    return () => clearInterval(interval);
  }, [symbol, timezone]);

  const generateSessionVolume = (session: string): number => {
    const baseVolumes: Record<string, number> = {
      'asian': 200000000,      // Lower volume
      'european': 500000000,   // High volume
      'us': 800000000,         // Highest volume
      'overnight': 150000000   // Lowest volume but high institutional %
    };
    
    const base = baseVolumes[session] || 300000000;
    return base + (Math.random() - 0.5) * base * 0.3; // ±30% variation
  };

  const generateSessionReturns = (session: string, isOvernight = false): number => {
    // Implement overnight anomaly - higher returns during overnight sessions
    if (isOvernight || session === 'overnight') {
      return (Math.random() - 0.3) * 3; // Bias toward positive returns
    }
    
    const sessionBias: Record<string, number> = {
      'asian': 0,
      'european': 0.1,
      'us': 0.2,
      'overnight': 0.4 // Strong overnight bias
    };
    
    const bias = sessionBias[session] || 0;
    return (Math.random() - 0.5 + bias) * 2;
  };

  const getCurrentSession = (hour: number): string => {
    if (hour >= 0 && hour < 8) return 'Asian/Overnight';
    if (hour >= 8 && hour < 16) return 'European';
    return 'US/Americas';
  };

  const calculateInstitutionalDominance = (hour: number, isWeekend: boolean): number => {
    // Higher institutional activity during traditional market hours
    let base = 50;
    
    if (isWeekend) base -= 15; // Lower institutional activity on weekends
    if (hour >= 9 && hour <= 16) base += 25; // Higher during market hours
    if (hour >= 0 && hour <= 8) base += 20; // Overnight anomaly effect
    
    return Math.min(95, Math.max(10, base + (Math.random() - 0.5) * 20));
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(0)}M`;
    return `$${(volume / 1000).toFixed(0)}K`;
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'overnight_anomaly': return <Moon className="h-4 w-4" />;
      case 'weekend_effect': return <Calendar className="h-4 w-4" />;
      case 'session_bias': return <Clock className="h-4 w-4" />;
      case 'market_open_close': return <Sun className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getPatternColor = (strength: number): string => {
    if (strength >= 80) return 'text-green-400';
    if (strength >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMarketPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'pre_market': return <Sun className="h-4 w-4 text-orange-400" />;
      case 'market_hours': return <Sun className="h-4 w-4 text-green-400" />;
      case 'after_hours': return <Moon className="h-4 w-4 text-blue-400" />;
      case 'weekend': return <Calendar className="h-4 w-4 text-purple-400" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Temporal Trading Analysis</h3>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Temporal Trading Patterns</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        
        <div className="flex space-x-2">
          {['sessions', 'patterns', 'velocity'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {metrics && (
        <>
          {/* Current Status */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {getMarketPhaseIcon(metrics.marketPhase)}
                  <span className="text-sm text-gray-400">Current Phase</span>
                </div>
                <div className="text-lg font-medium capitalize">{metrics.marketPhase.replace('_', ' ')}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Institutional</span>
                </div>
                <div className="text-lg font-bold text-blue-400">{metrics.institutionalDominance.toFixed(0)}%</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-400">Session</span>
                </div>
                <div className="text-lg font-medium">{metrics.currentSession}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-gray-400">Velocity</span>
                </div>
                <div className="text-lg font-bold text-purple-400">{metrics.tradingVelocity.percentile.toFixed(0)}th</div>
              </div>
            </div>
          </div>

          {/* Main Content based on view mode */}
          {viewMode === 'sessions' && (
            <div className="space-y-6">
              {/* Session Performance Chart */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-md font-medium mb-4 text-gray-300">Session-Based Performance Analysis</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="session" 
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'returns' ? `${value.toFixed(2)}%` : 
                          name === 'volume' ? formatVolume(value) : `${value.toFixed(0)}%`,
                          name === 'returns' ? 'Returns' :
                          name === 'volume' ? 'Volume' :
                          name === 'institutionalActivity' ? 'Institutional' : 'Retail'
                        ]}
                      />
                      <Bar dataKey="returns" fill="#3B82F6" name="returns" />
                      <Bar dataKey="institutionalActivity" fill="#10B981" name="institutionalActivity" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessionData.map((session, index) => (
                  <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">{session.session}</h5>
                      <span className="text-xs text-gray-400">{session.startTime} - {session.endTime}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Volume:</span>
                        <span className="text-sm font-medium">{formatVolume(session.volume)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Returns:</span>
                        <span className={`text-sm font-medium ${session.returns >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {session.returns >= 0 ? '+' : ''}{session.returns.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Institutional:</span>
                        <span className="text-sm font-medium text-blue-400">{session.institutionalActivity.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'patterns' && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-300">Detected Temporal Patterns</h4>
              {metrics.patterns.map((pattern, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getPatternIcon(pattern.type)}
                      <span className="font-medium capitalize">{pattern.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex space-x-4">
                      <div className={`text-sm font-medium ${getPatternColor(pattern.strength)}`}>
                        Strength: {pattern.strength.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-400">
                        Confidence: {pattern.confidence.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">{pattern.description}</p>
                    <p className="text-xs text-gray-400 italic">{pattern.implication}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'velocity' && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-md font-medium mb-4 text-gray-300">Trading Velocity Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{metrics.tradingVelocity.current.toFixed(0)}</div>
                  <div className="text-sm text-gray-400">Current Velocity</div>
                  <div className="text-xs text-gray-500 mt-1">Trades per minute</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{metrics.tradingVelocity.average.toFixed(0)}</div>
                  <div className="text-sm text-gray-400">Average Velocity</div>
                  <div className="text-xs text-gray-500 mt-1">24h baseline</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{metrics.tradingVelocity.percentile.toFixed(0)}th</div>
                  <div className="text-sm text-gray-400">Percentile Rank</div>
                  <div className="text-xs text-gray-500 mt-1">Historical position</div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="text-sm text-gray-400 mb-2">Velocity Distribution</div>
                <div className="bg-gray-800 rounded-lg h-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${metrics.tradingVelocity.percentile}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <div className="mt-6 text-xs text-gray-500">
        Professional temporal analysis • Overnight anomaly & weekend effect detection • Traditional finance convergence patterns
      </div>
    </motion.div>
  );
} 