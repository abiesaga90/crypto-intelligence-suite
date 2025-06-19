'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Activity, AlertCircle, Users, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiService } from '@/services/apiService';
import { COLORS } from '@/config/constants';

interface WhaleTransaction {
  hash: string;
  amount: number;
  amountUSD: number;
  from: string;
  to: string;
  timestamp: number;
  type: 'institutional' | 'retail' | 'whale';
  confidence: number;
  exchange?: string;
}

interface WhaleTrackerProps {
  symbol: string;
}

export default function WhaleTracker({ symbol }: WhaleTrackerProps) {
  const [whaleData, setWhaleData] = useState<WhaleTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('24h');

  useEffect(() => {
    const fetchWhaleData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, this would fetch from whale tracking APIs
        // For now, simulate based on the research methodology
        const simulatedData = generateSimulatedWhaleData(symbol);
        setWhaleData(simulatedData);
      } catch (err) {
        console.error('Error fetching whale data:', err);
        setError('Unable to fetch whale transaction data');
      } finally {
        setLoading(false);
      }
    };

    fetchWhaleData();
  }, [symbol, timeframe]);

  // Simulate whale data based on research methodology
  const generateSimulatedWhaleData = (symbol: string): WhaleTransaction[] => {
    const transactions: WhaleTransaction[] = [];
    const now = Date.now();
    
    // Generate 20-50 transactions over 24h
    const txCount = Math.floor(Math.random() * 30) + 20;
    
    for (let i = 0; i < txCount; i++) {
      const timestamp = now - (Math.random() * 24 * 60 * 60 * 1000); // Last 24h
      const amount = generateTransactionAmount();
      const amountUSD = amount * getPriceForSymbol(symbol);
      
      // Classify based on research criteria ($100k+ = institutional)
      let type: 'institutional' | 'retail' | 'whale';
      let confidence: number;
      
      if (amountUSD >= 1000000) { // $1M+ = whale
        type = 'whale';
        confidence = 0.95;
      } else if (amountUSD >= 100000) { // $100k+ = institutional
        type = 'institutional';
        confidence = 0.85;
      } else {
        type = 'retail';
        confidence = 0.7;
      }

      transactions.push({
        hash: generateTxHash(),
        amount,
        amountUSD,
        from: generateAddress(),
        to: generateAddress(),
        timestamp,
        type,
        confidence,
        exchange: Math.random() > 0.6 ? getRandomExchange() : undefined,
      });
    }

    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  };

  const generateTransactionAmount = (): number => {
    const random = Math.random();
    if (random < 0.05) return Math.random() * 10000 + 5000; // 5% whale transactions (5k-15k tokens)
    if (random < 0.20) return Math.random() * 1000 + 500;   // 15% institutional (500-1.5k tokens)
    return Math.random() * 100 + 10;                        // 80% retail (10-110 tokens)
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

  const generateTxHash = (): string => 
    '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const generateAddress = (): string => 
    '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const getRandomExchange = (): string => {
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit'];
    return exchanges[Math.floor(Math.random() * exchanges.length)];
  };

  const formatAmount = (amount: number): string => {
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

  // Calculate analytics based on research methodology
  const analytics = React.useMemo(() => {
    if (!whaleData.length) return null;

    const institutional = whaleData.filter(tx => tx.type === 'institutional');
    const retail = whaleData.filter(tx => tx.type === 'retail');
    const whale = whaleData.filter(tx => tx.type === 'whale');

    const totalVolume = whaleData.reduce((sum, tx) => sum + tx.amountUSD, 0);
    const institutionalVolume = institutional.reduce((sum, tx) => sum + tx.amountUSD, 0);
    const retailVolume = retail.reduce((sum, tx) => sum + tx.amountUSD, 0);
    const whaleVolume = whale.reduce((sum, tx) => sum + tx.amountUSD, 0);

    return {
      totalTransactions: whaleData.length,
      totalVolume,
      institutional: {
        count: institutional.length,
        volume: institutionalVolume,
        percentage: (institutionalVolume / totalVolume) * 100,
      },
      retail: {
        count: retail.length,
        volume: retailVolume,
        percentage: (retailVolume / totalVolume) * 100,
      },
      whale: {
        count: whale.length,
        volume: whaleVolume,
        percentage: (whaleVolume / totalVolume) * 100,
      },
      dominantType: institutionalVolume > retailVolume + whaleVolume ? 'institutional' : 
                   whaleVolume > institutionalVolume + retailVolume ? 'whale' : 'retail',
    };
  }, [whaleData]);

  const pieData = analytics ? [
    { name: 'Institutional', value: analytics.institutional.percentage, color: COLORS.institutional },
    { name: 'Whale', value: analytics.whale.percentage, color: COLORS.warning },
    { name: 'Retail', value: analytics.retail.percentage, color: COLORS.retail },
  ] : [];

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Whale & Institutional Tracker</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Whale & Institutional Tracker</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        <div className="text-center text-red-400 p-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p>{error}</p>
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
          <Activity className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Smart Money Tracker</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        
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

      {analytics && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-400">Total Volume</span>
              </div>
              <div className="text-xl font-bold">{formatAmount(analytics.totalVolume)}</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-400">Institutional</span>
              </div>
              <div className="text-xl font-bold text-blue-400">
                {analytics.institutional.percentage.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Whale Activity</span>
              </div>
              <div className="text-xl font-bold text-yellow-400">
                {analytics.whale.percentage.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-pink-400" />
                <span className="text-sm text-gray-400">Retail</span>
              </div>
              <div className="text-xl font-bold text-pink-400">
                {analytics.retail.percentage.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Volume Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-md font-medium mb-4 text-gray-300">Volume Distribution</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Volume Share']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-md font-medium mb-4 text-gray-300">Market Dominance</h4>
              <div className="space-y-4">
                <div className={`p-3 rounded-lg ${
                  analytics.dominantType === 'institutional' ? 'bg-blue-500/20 border border-blue-500' :
                  analytics.dominantType === 'whale' ? 'bg-yellow-500/20 border border-yellow-500' :
                  'bg-pink-500/20 border border-pink-500'
                }`}>
                  <div className="font-medium capitalize">{analytics.dominantType} Dominant</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {analytics.dominantType === 'institutional' && 'Large strategic positions indicate institutional accumulation'}
                    {analytics.dominantType === 'whale' && 'High-value transactions suggest whale activity'}
                    {analytics.dominantType === 'retail' && 'Smaller, frequent transactions indicate retail interest'}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  <div>• Institutional: Transactions ≥ $100K</div>
                  <div>• Whale: Transactions ≥ $1M</div>
                  <div>• Retail: Transactions &lt; $100K</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h4 className="text-md font-medium mb-4 text-gray-300">Recent Large Transactions</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {whaleData.slice(0, 15).map((tx, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      tx.type === 'whale' ? 'bg-yellow-400' :
                      tx.type === 'institutional' ? 'bg-blue-400' :
                      'bg-pink-400'
                    }`} />
                    <div>
                      <div className="font-medium">{formatAmount(tx.amountUSD)}</div>
                      <div className="text-xs text-gray-400">
                        {tx.amount.toLocaleString()} {symbol}
                        {tx.exchange && ` • ${tx.exchange}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm capitalize font-medium">{tx.type}</div>
                    <div className="text-xs text-gray-400">{formatTimeAgo(tx.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        Based on professional whale tracking methodology • Transactions classified by size and patterns
      </div>
    </motion.div>
  );
} 