'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '@/services/apiService';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  source?: string;
  image?: string;
}

interface TopGainersLosersData {
  gainers: Coin[];
  losers: Coin[];
}

const TopGainersLosers: React.FC = () => {
  const [data, setData] = useState<TopGainersLosersData>({ gainers: [], losers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
  const [apiSource, setApiSource] = useState<string>('');

  useEffect(() => {
    fetchTopGainersLosers();
  }, []);

  const fetchTopGainersLosers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.getTopGainersAndLosers(30);
      
      setData(result);
      
      // Determine API source
      if (result.gainers.length > 0) {
        setApiSource(result.gainers[0].source || 'Unknown');
      }
      
    } catch (err) {
      console.error('Error fetching gainers/losers:', err);
      setError('Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else if (price < 100) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toLocaleString()}`;
    }
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`;
    } else {
      return `$${volume.toFixed(0)}`;
    }
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const CoinRow: React.FC<{ coin: Coin; rank: number; type: 'gainer' | 'loser' }> = ({ coin, rank, type }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.02 }}
      className="grid grid-cols-12 gap-2 lg:gap-4 py-3 px-2 lg:px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800"
    >
      {/* Rank */}
      <div className="col-span-1 flex items-center">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {rank}
        </span>
      </div>

      {/* Coin Info */}
      <div className="col-span-4 lg:col-span-3 flex items-center space-x-2">
        <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <span className="text-xs lg:text-sm font-bold text-gray-600 dark:text-gray-300">
            {coin.symbol.charAt(0)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 dark:text-white text-sm lg:text-base truncate">
            {coin.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
            {coin.symbol}
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="col-span-3 lg:col-span-2 flex items-center justify-end">
        <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">
          {formatPrice(coin.current_price)}
        </span>
      </div>

      {/* 24h Change */}
      <div className="col-span-2 flex items-center justify-end">
        <span
          className={`text-sm lg:text-base font-medium px-2 py-1 rounded ${
            type === 'gainer'
              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
              : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
          }`}
        >
          {formatPercentage(coin.price_change_percentage_24h)}
        </span>
      </div>

      {/* Volume (hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-2 items-center justify-end">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatVolume(coin.total_volume)}
        </span>
      </div>
    </motion.div>
  );

  const HeaderRow: React.FC = () => (
    <div className="grid grid-cols-12 gap-2 lg:gap-4 py-3 px-2 lg:px-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
      <div className="col-span-1">
        <span className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">#</span>
      </div>
      <div className="col-span-4 lg:col-span-3">
        <span className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">Coin</span>
      </div>
      <div className="col-span-3 lg:col-span-2 text-right">
        <span className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">Price</span>
      </div>
      <div className="col-span-2 text-right">
        <span className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">24h%</span>
      </div>
      <div className="hidden lg:block lg:col-span-2 text-right">
        <span className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">Volume</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4">
                <div className="col-span-1 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="col-span-3 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="col-span-2 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="col-span-2 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="col-span-2 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="col-span-2 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Data Unavailable
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchTopGainersLosers}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentData = activeTab === 'gainers' ? data.gainers : data.losers;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-0">
            Top 30 Crypto Gainers & Losers
          </h2>
          {apiSource && (
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
              Data: {apiSource}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('gainers')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'gainers'
                ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Top Gainers ({data.gainers.length})
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'losers'
                ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Top Losers ({data.losers.length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <HeaderRow />
        <div className="max-h-[500px] overflow-y-auto">
          {currentData.length > 0 ? (
            currentData.map((coin, index) => (
              <CoinRow
                key={coin.id}
                coin={coin}
                rank={index + 1}
                type={activeTab === 'gainers' ? 'gainer' : 'loser'}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <p className="text-gray-600 dark:text-gray-400">
                No {activeTab} data available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          * CoinGecko Pro API returns top 30 each • Only coins with &gt;$50,000 24h volume • Updates every 5 minutes
        </p>
      </div>
    </div>
  );
};

export default TopGainersLosers; 