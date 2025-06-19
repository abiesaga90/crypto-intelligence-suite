'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Percent, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '@/services/apiService';
import { COLORS } from '@/config/constants';

interface FundingRateMonitorProps {
  symbol: string;
}

interface ChartDataPoint {
  time: string;
  timestamp: number;
  fundingRate: number;
}

export default function FundingRateMonitor({ symbol }: FundingRateMonitorProps) {
  const [fundingData, setFundingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFundingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch funding rate history with 4h interval
        const data = await apiService.getFundingRateHistory(symbol, '4h');
        
        // Check if this is a fallback response due to plan limitations
        if (data?.fallback === true) {
          setError(data.data?.message || 'This feature requires CoinGlass Professional+ plan');
          setFundingData({
            planLimitation: true,
            message: data.data?.message,
            limitation: data.data?.limitation,
            upgrade: data.data?.upgrade
          });
        } else {
          setFundingData(data);
        }
      } catch (err) {
        console.error('Error fetching funding rate data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch funding rate data');
      } finally {
        setLoading(false);
      }
    };

    fetchFundingData();
  }, [symbol]);

  const formatChartData = (data: any): ChartDataPoint[] => {
    if (!data?.data) return [];
    
    return data.data.slice(-24).map((item: any) => ({
      time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: item.time,
      fundingRate: parseFloat(item.funding_rate) * 100, // Convert to percentage
    }));
  };

  const calculateSentimentIndicator = (data: ChartDataPoint[]) => {
    if (!data || data.length === 0) return { score: 50, interpretation: 'No data', sentiment: 'neutral' };
    
    const avgFundingRate = data.reduce((sum: number, item: ChartDataPoint) => sum + item.fundingRate, 0) / data.length;
    const recentRate = data[data.length - 1]?.fundingRate || 0;
    
    let score = 50; // Neutral
    let interpretation = '';
    let sentiment = 'neutral';
    
    if (recentRate > 0.1) {
      score = 75;
      sentiment = 'bullish_retail';
      interpretation = 'High positive funding rate - Retail likely over-leveraged long';
    } else if (recentRate > 0.05) {
      score = 65;
      sentiment = 'bullish';
      interpretation = 'Positive funding rate - More longs than shorts, moderate retail interest';
    } else if (recentRate < -0.1) {
      score = 25;
      sentiment = 'bearish_retail';
      interpretation = 'High negative funding rate - Retail likely over-leveraged short';
    } else if (recentRate < -0.05) {
      score = 35;
      sentiment = 'bearish';
      interpretation = 'Negative funding rate - More shorts than longs';
    } else {
      score = 50;
      sentiment = 'neutral';
      interpretation = 'Balanced funding rate - Equilibrium between longs and shorts';
    }
    
    return { score, interpretation, sentiment, avgFundingRate, recentRate };
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(4)}%`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish_retail':
      case 'bullish':
        return 'text-green-400';
      case 'bearish_retail':
      case 'bearish':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Percent className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-semibold">Funding Rate Monitor</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Percent className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-semibold">Funding Rate Monitor</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        <div className="text-center text-red-400 p-8">
          <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
          <p>{error}</p>
          <div className="mt-4 text-sm text-gray-400">
            <Info className="h-4 w-4 inline mr-1" />
            Hobbyist plan supports ≥4h intervals only
          </div>
        </div>
      </div>
    );
  }

  const chartData = formatChartData(fundingData);
  const sentimentIndicator = calculateSentimentIndicator(chartData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Percent className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-semibold">Funding Rate Monitor</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">Market Sentiment</div>
          <div className={`text-lg font-bold ${getSentimentColor(sentimentIndicator.sentiment)}`}>
            {sentimentIndicator.sentiment.replace('_', ' ').toUpperCase()}
          </div>
        </div>
      </div>

      {chartData.length > 0 ? (
        <>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.neutral} />
                <XAxis 
                  dataKey="time" 
                  stroke={COLORS.text}
                  fontSize={12}
                />
                <YAxis 
                  stroke={COLORS.text}
                  fontSize={12}
                  tickFormatter={formatPercentage}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: COLORS.surface,
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: number) => [formatPercentage(value), 'Funding Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="fundingRate" 
                  stroke={COLORS.secondary}
                  strokeWidth={2}
                  dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 3 }}
                />
                {/* Zero line reference */}
                <Line 
                  type="monotone" 
                  dataKey={() => 0}
                  stroke={COLORS.neutral}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Percent className="h-4 w-4 text-pink-400" />
                <span className="text-sm text-gray-400">Current Rate</span>
              </div>
              <div className={`text-lg font-bold ${getSentimentColor(sentimentIndicator.sentiment)}`}>
                {formatPercentage(sentimentIndicator.recentRate || 0)}
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-400">24h Average</span>
              </div>
              <div className="text-lg font-bold text-blue-400">
                {formatPercentage(sentimentIndicator.avgFundingRate || 0)}
              </div>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
            <div className="text-sm text-gray-400 mb-1">Analysis</div>
            <div className="text-sm text-gray-300">{sentimentIndicator.interpretation}</div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
            <div className="text-center">
              <div className="text-red-400 font-medium">Negative</div>
              <div>Shorts pay Longs</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 font-medium">Neutral</div>
              <div>Balanced</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-medium">Positive</div>
              <div>Longs pay Shorts</div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-400 py-8">
          <Percent className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No funding rate data available</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Updates every 8 hours • 4-hour intervals shown
      </div>
    </motion.div>
  );
} 