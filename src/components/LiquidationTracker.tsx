'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '@/services/apiService';
import { COLORS } from '@/config/constants';

interface LiquidationTrackerProps {
  symbol: string;
}

export default function LiquidationTracker({ symbol }: LiquidationTrackerProps) {
  const [liquidationData, setLiquidationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiquidationData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch liquidation history with 4h interval (hobbyist plan limitation)
        const data = await apiService.getLiquidationHistory(symbol, '4h');
        
        // Check if this is a fallback response due to plan limitations
        if (data?.fallback === true) {
          setError(data.data?.message || 'This feature requires CoinGlass Professional+ plan');
          setLiquidationData({
            planLimitation: true,
            message: data.data?.message,
            limitation: data.data?.limitation,
            upgrade: data.data?.upgrade
          });
        } else {
          setLiquidationData(data);
        }
      } catch (err) {
        console.error('Error fetching liquidation data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch liquidation data');
      } finally {
        setLoading(false);
      }
    };

    fetchLiquidationData();
  }, [symbol]);

  const formatChartData = (data: any) => {
    if (!data?.data) return [];
    
    return data.data.slice(-24).map((item: any) => ({
      time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: item.time,
      longLiquidation: parseFloat(item.long_liquidation_usd) / 1000000, // Convert to millions
      shortLiquidation: parseFloat(item.short_liquidation_usd) / 1000000,
      total: (parseFloat(item.long_liquidation_usd) + parseFloat(item.short_liquidation_usd)) / 1000000,
    }));
  };

  const calculateRetailIndicator = (data: any[]) => {
    if (!data || data.length === 0) return { score: 0, interpretation: 'No data' };
    
    const totalLongs = data.reduce((sum: number, item: any) => sum + item.longLiquidation, 0);
    const totalShorts = data.reduce((sum: number, item: any) => sum + item.shortLiquidation, 0);
    const total = totalLongs + totalShorts;
    
    // High liquidation volume often indicates retail over-leverage
    const liquidationIntensity = total / data.length; // Average liquidation per period
    
    let score = 0;
    let interpretation = '';
    
    if (liquidationIntensity > 50) {
      score = 85;
      interpretation = 'High retail activity - Heavy liquidations suggest over-leveraged positions';
    } else if (liquidationIntensity > 20) {
      score = 65;
      interpretation = 'Moderate retail activity - Some over-leverage detected';
    } else if (liquidationIntensity > 5) {
      score = 35;
      interpretation = 'Mixed signals - Moderate liquidation levels';
    } else {
      score = 15;
      interpretation = 'Low retail activity - Controlled liquidation levels';
    }
    
    return { score, interpretation };
  };

  const formatValue = (value: number) => {
    return `$${value.toFixed(2)}M`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Liquidation Tracker</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Liquidation Tracker</h3>
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

  const chartData = formatChartData(liquidationData);
  const retailIndicator = calculateRetailIndicator(chartData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Liquidation Tracker</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">Retail Activity Score</div>
          <div className={`text-lg font-bold ${
            retailIndicator.score > 70 ? 'text-red-400' :
            retailIndicator.score > 40 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {retailIndicator.score}/100
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
                  tickFormatter={formatValue}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: COLORS.surface,
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: number, name: string) => [
                    formatValue(value),
                    name === 'longLiquidation' ? 'Long Liquidations' :
                    name === 'shortLiquidation' ? 'Short Liquidations' : 'Total'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="longLiquidation" 
                  stroke={COLORS.success}
                  strokeWidth={2}
                  dot={{ fill: COLORS.success, strokeWidth: 2, r: 3 }}
                  name="longLiquidation"
                />
                <Line 
                  type="monotone" 
                  dataKey="shortLiquidation" 
                  stroke={COLORS.error}
                  strokeWidth={2}
                  dot={{ fill: COLORS.error, strokeWidth: 2, r: 3 }}
                  name="shortLiquidation"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-400">Long Liquidations</span>
              </div>
              <div className="text-lg font-bold text-green-400">
                {formatValue(chartData.reduce((sum: number, item: any) => sum + item.longLiquidation, 0))}
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-400">Short Liquidations</span>
              </div>
              <div className="text-lg font-bold text-red-400">
                {formatValue(chartData.reduce((sum: number, item: any) => sum + item.shortLiquidation, 0))}
              </div>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="text-sm text-gray-400 mb-1">Analysis</div>
            <div className="text-sm text-gray-300">{retailIndicator.interpretation}</div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-400 py-8">
          <TrendingDown className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No liquidation data available</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Data shows 4-hour intervals • Hobbyist plan limitation
      </div>
    </motion.div>
  );
} 