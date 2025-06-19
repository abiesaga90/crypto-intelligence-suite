'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Building2, TrendingUp, BarChart3 } from 'lucide-react';
import { COLORS } from '@/config/constants';

interface RetailVsInstitutionalChartProps {
  data: any[];
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

export default function RetailVsInstitutionalChart({ 
  data, 
  selectedSymbol, 
  onSymbolChange 
}: RetailVsInstitutionalChartProps) {
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <span>Retail vs Institutional Comparison</span>
        </h3>
        <div className="text-center text-gray-400 py-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No comparison data available</p>
        </div>
      </motion.div>
    );
  }

  // Prepare data for bar chart
  const chartData = data.map(item => ({
    symbol: item.symbol,
    retail: item.analysis.signals.retailSignals,
    institutional: item.analysis.signals.institutionalSignals,
    neutral: item.analysis.signals.neutralSignals,
    dominantType: item.analysis.dominantType,
    confidence: Math.round(item.analysis.confidence * 100),
  }));

  // Prepare data for pie chart (selected symbol)
  const selectedData = data.find(item => item.symbol === selectedSymbol);
  const pieData = selectedData ? [
    { name: 'Retail Signals', value: selectedData.analysis.signals.retailSignals, color: COLORS.retail },
    { name: 'Institutional Signals', value: selectedData.analysis.signals.institutionalSignals, color: COLORS.institutional },
    { name: 'Neutral Signals', value: selectedData.analysis.signals.neutralSignals, color: COLORS.mixed },
  ] : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey === 'retail' ? 'Retail Signals' :
               entry.dataKey === 'institutional' ? 'Institutional Signals' : 'Neutral Signals'}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
          <p className="text-white font-medium">{data.payload.name}</p>
          <p style={{ color: data.payload.color }} className="text-sm">
            Signals: {data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <span>Retail vs Institutional Analysis</span>
        </h3>
        
        {/* Symbol Selector */}
        <select
          value={selectedSymbol}
          onChange={(e) => onSymbolChange(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        >
          {data.map(item => (
            <option key={item.symbol} value={item.symbol}>
              {item.symbol}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart - All Symbols Comparison */}
        <div>
          <h4 className="text-md font-medium mb-4 text-gray-300">Signal Comparison Across Assets</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chart.grid} />
                <XAxis 
                  dataKey="symbol" 
                  stroke={COLORS.chart.text}
                  fontSize={12}
                />
                <YAxis 
                  stroke={COLORS.chart.text}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="retail" 
                  fill={COLORS.retail}
                  name="Retail Signals"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="institutional" 
                  fill={COLORS.institutional}
                  name="Institutional Signals"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="neutral" 
                  fill={COLORS.mixed}
                  name="Neutral Signals"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Selected Symbol Detail */}
        <div>
          <h4 className="text-md font-medium mb-4 text-gray-300">
            Signal Distribution for {selectedSymbol}
          </h4>
          {pieData.length > 0 ? (
            <div className="h-80 flex flex-col">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend and Details */}
              <div className="mt-4 space-y-2">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm">{entry.name}</span>
                    </div>
                    <span className="text-sm font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>

              {/* Selected Symbol Analysis */}
              {selectedData && (
                <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {selectedData.analysis.dominantType === 'retail' ? (
                        <Users className="h-4 w-4 text-blue-400" />
                      ) : selectedData.analysis.dominantType === 'institutional' ? (
                        <Building2 className="h-4 w-4 text-purple-400" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium capitalize">
                        {selectedData.analysis.dominantType === 'mixed' ? 'Mixed Signals' : 
                         `${selectedData.analysis.dominantType} Dominant`}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {Math.round(selectedData.analysis.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {selectedData.analysis.summary}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No data for {selectedSymbol}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-gray-400">Retail Dominated</span>
          </div>
          <div className="text-xl font-bold text-blue-400">
            {chartData.filter(item => item.dominantType === 'retail').length}
          </div>
          <div className="text-xs text-gray-500">out of {chartData.length} assets</div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Building2 className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-gray-400">Institutional Dominated</span>
          </div>
          <div className="text-xl font-bold text-purple-400">
            {chartData.filter(item => item.dominantType === 'institutional').length}
          </div>
          <div className="text-xs text-gray-500">out of {chartData.length} assets</div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-400">Mixed Signals</span>
          </div>
          <div className="text-xl font-bold text-gray-400">
            {chartData.filter(item => item.dominantType === 'mixed').length}
          </div>
          <div className="text-xs text-gray-500">out of {chartData.length} assets</div>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500 text-center">
        Analysis based on long-short ratios, liquidation patterns, funding rates, and trading volumes
      </div>
    </motion.div>
  );
} 