'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

interface MarketOverviewProps {
  data: {
    coinGecko: any[];
    binance: any[];
  } | null;
}

export default function MarketOverview({ data }: MarketOverviewProps) {
  if (!data || !data.coinGecko) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Market Overview</h2>
        <div className="text-center text-gray-400">
          <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm sm:text-base">Market data not available</p>
        </div>
      </div>
    );
  }

  const topCoins = data.coinGecko.slice(0, 10);

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toLocaleString()}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8"
    >
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center space-x-2">
        <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
        <span>Market Overview - Top 10 Cryptocurrencies</span>
      </h2>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {topCoins.map((coin, index) => (
          <motion.div
            key={coin.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <span className="text-gray-400 text-sm font-medium flex-shrink-0">
                  #{coin.market_cap_rank || index + 1}
                </span>
                {coin.image && (
                  <img 
                    src={coin.image} 
                    alt={coin.name}
                    className="w-6 h-6 rounded-full flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{coin.name}</div>
                  <div className="text-xs text-gray-400 uppercase">
                    {coin.symbol}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-medium text-sm">
                  {formatPrice(coin.current_price)}
                </div>
                <div className={`text-xs ${getPriceChangeColor(coin.price_change_percentage_24h)} flex items-center justify-end space-x-1`}>
                  {getPriceChangeIcon(coin.price_change_percentage_24h)}
                  <span>
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 block">Market Cap</span>
                <span className="font-medium">{formatMarketCap(coin.market_cap)}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Volume 24h</span>
                <span className="font-medium text-gray-300">{formatMarketCap(coin.total_volume)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-2 text-gray-400 font-medium">#</th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">Name</th>
              <th className="text-right py-3 px-2 text-gray-400 font-medium">Price</th>
              <th className="text-right py-3 px-2 text-gray-400 font-medium">24h %</th>
              <th className="text-right py-3 px-2 text-gray-400 font-medium">7d %</th>
              <th className="text-right py-3 px-2 text-gray-400 font-medium">Market Cap</th>
              <th className="text-right py-3 px-2 text-gray-400 font-medium">Volume (24h)</th>
            </tr>
          </thead>
          <tbody>
            {topCoins.map((coin, index) => (
              <motion.tr
                key={coin.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
              >
                <td className="py-4 px-2 text-gray-400">
                  {coin.market_cap_rank || index + 1}
                </td>
                
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-3">
                    {coin.image && (
                      <img 
                        src={coin.image} 
                        alt={coin.name}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium">{coin.name}</div>
                      <div className="text-sm text-gray-400 uppercase">
                        {coin.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="py-4 px-2 text-right font-medium">
                  {formatPrice(coin.current_price)}
                </td>
                
                <td className={`py-4 px-2 text-right font-medium ${getPriceChangeColor(coin.price_change_percentage_24h)}`}>
                  <div className="flex items-center justify-end space-x-1">
                    {getPriceChangeIcon(coin.price_change_percentage_24h)}
                    <span>
                      {coin.price_change_percentage_24h?.toFixed(2)}%
                    </span>
                  </div>
                </td>
                
                <td className={`py-4 px-2 text-right font-medium ${getPriceChangeColor(coin.price_change_percentage_7d_in_currency)}`}>
                  <div className="flex items-center justify-end space-x-1">
                    {getPriceChangeIcon(coin.price_change_percentage_7d_in_currency)}
                    <span>
                      {coin.price_change_percentage_7d_in_currency?.toFixed(2)}%
                    </span>
                  </div>
                </td>
                
                <td className="py-4 px-2 text-right font-medium">
                  {formatMarketCap(coin.market_cap)}
                </td>
                
                <td className="py-4 px-2 text-right font-medium text-gray-300">
                  {formatMarketCap(coin.total_volume)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 sm:mt-6 text-xs text-gray-500 flex items-center justify-between">
        <span>Data provided by CoinGecko API</span>
        <span className="hidden sm:inline">Prices in USD • Updated every minute</span>
      </div>
    </motion.div>
  );
} 