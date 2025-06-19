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
  const [apiSource, setApiSource] = useState<string>('');

  useEffect(() => {
    fetchTopGainersLosers();
  }, []);

  const fetchTopGainersLosers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.getTopGainersAndLosers(10);
      
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

  const formatPercentage = (percentage: number): string => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const CoinListItem: React.FC<{ coin: Coin; rank: number; type: 'gainer' | 'loser' }> = ({ coin, rank, type }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.02 }}
      className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
    >
      {/* Left side: Rank and Coin Info */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0 w-6 text-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {rank}
          </span>
        </div>
        
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
            {coin.symbol.charAt(0)}
          </span>
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
            {coin.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
            {coin.symbol}
          </div>
        </div>
      </div>

      {/* Right side: Price and Change */}
      <div className="flex flex-col items-end space-y-1 flex-shrink-0">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {formatPrice(coin.current_price)}
        </span>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            type === 'gainer'
              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
              : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
          }`}
        >
          {formatPercentage(coin.price_change_percentage_24h)}
        </span>
      </div>
    </motion.div>
  );

  const ListSection: React.FC<{ title: string; coins: Coin[]; type: 'gainer' | 'loser'; color: string }> = ({ 
    title, 
    coins, 
    type, 
    color 
  }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <span>{title}</span>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({coins.length})
          </span>
        </h3>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto">
        {coins.length > 0 ? (
          coins.map((coin, index) => (
            <CoinListItem
              key={coin.id}
              coin={coin}
              rank={index + 1}
              type={type}
            />
          ))
        ) : (
          <div className="py-8 text-center">
            <div className="text-gray-400 text-2xl mb-2">📊</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No {type === 'gainer' ? 'gainers' : 'losers'} data available
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        
        {/* Lists Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(10)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Top 10 Crypto Gainers & Losers
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time market performance • 24-hour change
          </p>
        </div>
        {apiSource && (
          <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded mt-2 lg:mt-0">
            Data: {apiSource}
          </span>
        )}
      </div>

      {/* Side-by-side Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <ListSection
          title="Top 10 Gainers"
          coins={data.gainers}
          type="gainer"
          color="bg-green-500"
        />

        {/* Top Losers */}
        <ListSection
          title="Top 10 Losers"
          coins={data.losers}
          type="loser"
          color="bg-red-500"
        />
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          * CoinGecko API returns top 10 each • Only coins with &gt;$50,000 24h volume • Updates every 5 minutes
        </p>
      </div>
    </div>
  );
};

export default TopGainersLosers; 