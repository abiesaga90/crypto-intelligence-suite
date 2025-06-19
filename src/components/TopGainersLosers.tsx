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
      
      console.log('Fetching top gainers and losers...');
      const result = await apiService.getTopGainersAndLosers(10);
      console.log('API result:', result);
      
      // Ensure the result has the expected structure
      if (result && typeof result === 'object') {
        const gainers = Array.isArray(result.gainers) ? result.gainers : [];
        const losers = Array.isArray(result.losers) ? result.losers : [];
        
        setData({ gainers, losers });
        
        // Determine API source
        if (gainers.length > 0 && gainers[0].source) {
          setApiSource(gainers[0].source);
        } else {
          setApiSource('Unknown');
        }
      } else {
        throw new Error('Invalid API response format');
      }
      
    } catch (err) {
      console.error('Error fetching gainers/losers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      
      // Set fallback data on error
      setData({ gainers: [], losers: [] });
      setApiSource('Error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (typeof price !== 'number' || isNaN(price)) {
      return '$0.00';
    }
    
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

  const formatPercentage = (percentage: number | null | undefined): string => {
    if (typeof percentage !== 'number' || isNaN(percentage)) {
      return '0.00%';
    }
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const CoinListItem: React.FC<{ coin: Coin; rank: number; type: 'gainer' | 'loser' }> = ({ coin, rank, type }) => {
    // Safety checks for coin data
    if (!coin || !coin.symbol || !coin.name) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: rank * 0.02 }}
        className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border-b border-gray-100 dark:border-gray-800 last:border-b-0 group"
      >
        {/* Left side: Rank and Coin Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Rank */}
          <div className="flex-shrink-0 w-8 text-center">
            <span className={`text-sm font-bold ${
              rank <= 3 
                ? type === 'gainer' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              #{rank}
            </span>
          </div>
          
          {/* Crypto Logo */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            {coin.image ? (
              <img 
                src={coin.image} 
                alt={coin.name}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to letter if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-sm font-bold text-gray-600 dark:text-gray-300">${coin.symbol?.charAt(0).toUpperCase() || '?'}</span>`;
                  }
                }}
              />
            ) : (
              <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                {coin.symbol ? coin.symbol.charAt(0).toUpperCase() : '?'}
              </span>
            )}
          </div>
          
          {/* Coin Info */}
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {coin.name || 'Unknown'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium tracking-wide">
              {coin.symbol || 'N/A'}
            </div>
          </div>
        </div>

        {/* Right side: Price and Change */}
        <div className="flex flex-col items-end space-y-2 flex-shrink-0">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            {formatPrice(coin.current_price)}
          </span>
          <div
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
              type === 'gainer'
                ? 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                : 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
            }`}
          >
            <span className={type === 'gainer' ? 'text-green-600' : 'text-red-600'}>
              {type === 'gainer' ? '↗' : '↘'}
            </span>
            <span>{formatPercentage(coin.price_change_percentage_24h)}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const ListSection: React.FC<{ title: string; coins: Coin[]; type: 'gainer' | 'loser'; color: string }> = ({ 
    title, 
    coins, 
    type, 
    color 
  }) => {
    // Safety check for coins array
    const validCoins = Array.isArray(coins) ? coins.filter(coin => coin && coin.id) : [];

    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className={`p-5 ${
          type === 'gainer' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200 dark:border-green-800' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-b border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${color} shadow-sm`}></div>
              <span>{title}</span>
            </h3>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              type === 'gainer'
                ? 'text-green-700 dark:text-green-300 bg-green-200/50 dark:bg-green-800/30'
                : 'text-red-700 dark:text-red-300 bg-red-200/50 dark:bg-red-800/30'
            }`}>
              {validCoins.length} coins
            </div>
          </div>
        </div>

        {/* List */}
        <div className="max-h-[500px] overflow-y-auto">
          {validCoins.length > 0 ? (
            validCoins.map((coin, index) => (
              <CoinListItem
                key={coin.id || `${type}-${index}`}
                coin={coin}
                rank={index + 1}
                type={type}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="text-gray-400 text-4xl mb-3">
                {type === 'gainer' ? '📈' : '📉'}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                No {type === 'gainer' ? 'gainers' : 'losers'} data available
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                Refresh to try again
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

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
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((j) => (
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
          <div className="text-red-500 mb-2 text-4xl">⚠️</div>
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
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          🚀 Top 10 Crypto Gainers & Losers
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          Real-time market performance • 24-hour change
        </p>
        {apiSource && apiSource !== 'Error' && (
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Live data from {apiSource}
            </span>
          </div>
        )}
      </div>

      {/* Side-by-side Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <ListSection
          title="Top 10 Gainers"
          coins={data.gainers || []}
          type="gainer"
          color="bg-green-500"
        />

        {/* Top Losers */}
        <ListSection
          title="Top 10 Losers"
          coins={data.losers || []}
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