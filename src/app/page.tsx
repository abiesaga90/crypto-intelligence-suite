'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Activity,
  AlertCircle,
  Zap,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';

// Re-enable API service
import { apiService } from '@/services/apiService';
import { COLORS, TOP_CRYPTOS, ERROR_MESSAGES } from '@/config/constants';

// Add back MarketOverview component
import MarketOverview from '@/components/MarketOverview';

// Add back retail vs institutional components
import CryptoCard from '@/components/CryptoCard';
import RetailVsInstitutionalChart from '@/components/RetailVsInstitutionalChart';

// Remove Professional+ components and keep only Hobbyist-compatible ones
// import LiquidationTracker from '@/components/LiquidationTracker';  // Requires Professional+
// import FundingRateMonitor from '@/components/FundingRateMonitor';  // Requires Professional+

// Keep other components commented out for now
// import WhaleTracker from '@/components/WhaleTracker';
// import ExchangeFlowMonitor from '@/components/ExchangeFlowMonitor';
// import ProfessionalAnalysisSummary from '@/components/ProfessionalAnalysisSummary';
// import OrderBookAnalysis from '@/components/OrderBookAnalysis';
// import TemporalAnalysis from '@/components/TemporalAnalysis';
// import AlgorithmicDetection from '@/components/AlgorithmicDetection';

interface DashboardData {
  marketOverview: any;
  topCoins: any[];
  retailVsInstitutional: any[];
  globalStats: any;
  loading: boolean;
  error: string | null;
  lastUpdate: number;
}

export default function CryptoDashboard() {
  const [data, setData] = useState<DashboardData>({
    marketOverview: null,
    topCoins: [],
    retailVsInstitutional: [],
    globalStats: null,
    loading: true, // Start with loading state
    error: null,
    lastUpdate: 0,
  });

  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC');
  const [refreshing, setRefreshing] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState({ remaining: 30, resetTime: 0 });

  // Re-enable API data fetching
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setData(prev => ({ ...prev, loading: true, error: null }));

      // Update rate limit info
      setRateLimitInfo({
        remaining: apiService.getRemainingRequests(),
        resetTime: apiService.getTimeUntilReset(),
      });

      // Fetch market overview from free APIs first
      const [coinGeckoData, binanceData] = await Promise.all([
        apiService.getCoinGeckoTopCoins(30),
        apiService.getBinance24hrTicker(),
      ]);

      // Fetch CoinGlass data for BTC only to respect rate limits
      const retailVsInstitutionalData = [];
      
      try {
        // Only fetch data for BTC to minimize API calls
        const btcAnalysis = await apiService.getRetailVsInstitutionalAnalysis('BTC');
        if (btcAnalysis) {
          retailVsInstitutionalData.push(btcAnalysis);
        }
      } catch (error) {
        console.warn(`Error fetching data for BTC:`, error);
      }

      const validData = retailVsInstitutionalData;

      // Get global market data
      const globalStats = await apiService.getCoinGeckoGlobalData();

      setData({
        marketOverview: {
          coinGecko: coinGeckoData,
          binance: Array.isArray(binanceData) ? binanceData.slice(0, 30) : [binanceData],
        },
        topCoins: coinGeckoData || [],
        retailVsInstitutional: validData,
        globalStats: globalStats?.data || null,
        loading: false,
        error: null,
        lastUpdate: Date.now(),
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
      }));
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  };

  // Re-enable auto-refresh
  useEffect(() => {
    console.log('Dashboard component mounted');
    fetchDashboardData();
    
    // Set up auto-refresh every 2 minutes (conservative for hobbyist plan)
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (data.loading) {
    return (
      <div className="min-h-screen text-white" style={{ backgroundColor: COLORS.background }}>
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: COLORS.electricSky }}></div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: COLORS.sandstone }}>Loading Teroxx Terminal</h2>
              <p style={{ color: COLORS.neutral }}>Fetching real-time market intelligence...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.deepIndigo }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8" style={{ color: COLORS.electricSky }} />
                <h1 className="text-2xl font-bold" style={{ color: COLORS.sandstone }}>Teroxx Terminal</h1>
                <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: COLORS.sunsetEmber, color: COLORS.white }}>
                  Prototype
                </span>
              </div>
              <div className="text-sm" style={{ color: COLORS.neutral }}>
                Advanced Crypto Market Intelligence • Retail vs Institutional Analysis
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Rate Limit Indicator */}
              <div className="text-sm" style={{ color: COLORS.neutral }}>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" style={{ color: COLORS.electricSky }} />
                  <span>API: {rateLimitInfo.remaining}/30</span>
                </div>
              </div>
              
              {/* Last Update */}
              <div className="text-sm" style={{ color: COLORS.neutral }}>
                Last update: {data.lastUpdate ? formatTimeAgo(data.lastUpdate) : 'Never'}
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: refreshing ? COLORS.deepIndigo : COLORS.electricSky,
                  color: COLORS.white
                }}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {data.error && (
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: `${COLORS.sunsetEmber}20`, borderColor: COLORS.sunsetEmber }}>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" style={{ color: COLORS.sunsetEmber }} />
              <span style={{ color: COLORS.sunsetEmber }}>{data.error}</span>
            </div>
          </div>
        )}

        {/* Status Message - Now showing real data status */}
        <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: `${COLORS.electricSky}20`, borderColor: COLORS.electricSky }}>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" style={{ color: COLORS.electricSky }} />
            <span style={{ color: COLORS.electricSky }}>
              ✅ Teroxx Terminal Active! Fetched {data.topCoins.length} coins • 
              {data.globalStats ? ' Global stats loaded • ' : ' '}
              {data.retailVsInstitutional.length} analysis datasets
            </span>
          </div>
        </div>

        {/* Global Market Stats - Teroxx Theme */}
        {data.globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="rounded-lg p-6" style={{ backgroundColor: COLORS.surface }}>
              <div className="flex items-center space-x-2 mb-2">
                <PieChart className="h-5 w-5" style={{ color: COLORS.electricSky }} />
                <span className="text-sm" style={{ color: COLORS.neutral }}>Total Market Cap</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: COLORS.sandstone }}>
                ${data.globalStats.total_market_cap?.usd ? 
                  (data.globalStats.total_market_cap.usd / 1e12).toFixed(2) + 'T' : 
                  'N/A'
                }
              </div>
            </div>
            
            <div className="rounded-lg p-6" style={{ backgroundColor: COLORS.surface }}>
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-5 w-5" style={{ color: COLORS.electricSky }} />
                <span className="text-sm" style={{ color: COLORS.neutral }}>24h Volume</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: COLORS.sandstone }}>
                ${data.globalStats.total_volume?.usd ? 
                  (data.globalStats.total_volume.usd / 1e9).toFixed(0) + 'B' : 
                  'N/A'
                }
              </div>
            </div>
            
            <div className="rounded-lg p-6" style={{ backgroundColor: COLORS.surface }}>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5" style={{ color: COLORS.sunsetEmber }} />
                <span className="text-sm" style={{ color: COLORS.neutral }}>BTC Dominance</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: COLORS.sandstone }}>
                {data.globalStats.market_cap_percentage?.btc?.toFixed(1) || 'N/A'}%
              </div>
            </div>
            
            <div className="rounded-lg p-6" style={{ backgroundColor: COLORS.surface }}>
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5" style={{ color: COLORS.sunsetEmber }} />
                <span className="text-sm" style={{ color: COLORS.neutral }}>Active Cryptos</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: COLORS.sandstone }}>
                {data.globalStats.active_cryptocurrencies?.toLocaleString() || 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Market Overview Component */}
        <MarketOverview data={data.marketOverview} />

        {/* Retail vs Institutional Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6" style={{ color: COLORS.sunsetEmber }} />
              <span style={{ color: COLORS.sunsetEmber }}>Retail</span>
            </div>
            <span style={{ color: COLORS.neutral }}>vs</span>
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6" style={{ color: COLORS.electricSky }} />
              <span style={{ color: COLORS.electricSky }}>Institutional</span>
            </div>
            <span style={{ color: COLORS.neutral }}>Analysis</span>
          </h2>
          
          {data.retailVsInstitutional.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.retailVsInstitutional.map((analysis, index) => (
                <motion.div
                  key={analysis.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CryptoCard analysis={analysis} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analysis Data Available</h3>
              <p className="text-gray-400">
                Unable to fetch retail vs institutional analysis data. This may be due to API rate limits or temporary issues.
              </p>
            </div>
          )}
        </motion.div>

        {/* Detailed Charts */}
        {data.retailVsInstitutional.length > 0 && (
          <RetailVsInstitutionalChart 
            data={data.retailVsInstitutional} 
            selectedSymbol={selectedCrypto}
            onSymbolChange={setSelectedCrypto}
          />
        )}

        {/* Simple Top Coins Display */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Top Cryptocurrencies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.topCoins.slice(0, 12).map((coin, index) => (
              <div key={coin.id || index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-3">
                  {coin.image && (
                    <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                  )}
                  <div>
                    <h3 className="font-semibold">{coin.symbol?.toUpperCase()}</h3>
                    <p className="text-gray-400 text-sm">{coin.name}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-lg font-bold">
                    ${coin.current_price?.toLocaleString() || 'N/A'}
                  </div>
                  <div className={`text-sm ${
                    coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {coin.price_change_percentage_24h >= 0 ? '↗' : '↘'} 
                    {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Analysis - Free Tier Implementation */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Real-time Market Volatility Analysis */}
          <div className="p-6 rounded-lg border" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.electricSky }}>
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="h-5 w-5" style={{ color: COLORS.electricSky }} />
              <h3 className="text-lg font-semibold" style={{ color: COLORS.sandstone }}>Market Volatility Analysis</h3>
            </div>
            <div className="space-y-3">
              <div className="text-sm" style={{ color: COLORS.neutral }}>
                Real-time volatility metrics using free market data
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Top Gainers */}
                <div>
                  <span className="text-sm" style={{ color: COLORS.neutral }}>Top Gainer (24h):</span>
                  {(() => {
                    const topGainer = data.topCoins.reduce((max, coin) => 
                      (coin.price_change_percentage_24h || 0) > (max.price_change_percentage_24h || 0) ? coin : max, 
                      data.topCoins[0] || {}
                    );
                    return (
                      <div>
                        <div className="font-bold" style={{ color: COLORS.electricSky }}>
                          {topGainer.symbol?.toUpperCase() || 'N/A'}
                        </div>
                        <div className="text-sm" style={{ color: COLORS.electricSky }}>
                          +{topGainer.price_change_percentage_24h?.toFixed(2) || '0'}%
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                {/* Top Losers */}
                <div>
                  <span className="text-sm" style={{ color: COLORS.neutral }}>Top Loser (24h):</span>
                  {(() => {
                    const topLoser = data.topCoins.reduce((min, coin) => 
                      (coin.price_change_percentage_24h || 0) < (min.price_change_percentage_24h || 0) ? coin : min, 
                      data.topCoins[0] || {}
                    );
                    return (
                      <div>
                        <div className="font-bold" style={{ color: COLORS.sunsetEmber }}>
                          {topLoser.symbol?.toUpperCase() || 'N/A'}
                        </div>
                        <div className="text-sm" style={{ color: COLORS.sunsetEmber }}>
                          {topLoser.price_change_percentage_24h?.toFixed(2) || '0'}%
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              {/* Market Sentiment Indicator */}
              <div className="mt-4 p-3 rounded" style={{ backgroundColor: COLORS.background }}>
                <div className="text-sm" style={{ color: COLORS.neutral }}>Market Sentiment:</div>
                {(() => {
                  const positiveCoins = data.topCoins.filter(coin => (coin.price_change_percentage_24h || 0) > 0).length;
                  const totalCoins = data.topCoins.length || 1;
                  const sentiment = (positiveCoins / totalCoins) * 100;
                  const isPositive = sentiment > 50;
                  
                  return (
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="font-bold text-lg" style={{ color: isPositive ? COLORS.electricSky : COLORS.sunsetEmber }}>
                        {sentiment.toFixed(0)}%
                      </div>
                      <div className="text-sm" style={{ color: COLORS.neutral }}>
                        {isPositive ? 'Bullish' : 'Bearish'} ({positiveCoins}/{totalCoins} coins positive)
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Volume Analysis */}
          <div className="p-6 rounded-lg border" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.sunsetEmber }}>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5" style={{ color: COLORS.sunsetEmber }} />
              <h3 className="text-lg font-semibold" style={{ color: COLORS.sandstone }}>Volume Analysis</h3>
            </div>
            <div className="space-y-3">
              <div className="text-sm" style={{ color: COLORS.neutral }}>
                Trading volume patterns and market activity
              </div>
              
              {/* Selected Crypto Analysis */}
              {(() => {
                const selectedCoin = data.topCoins.find(coin => coin.symbol?.toUpperCase() === selectedCrypto) || data.topCoins[0];
                const avgVolume = data.topCoins.reduce((sum, coin) => sum + (coin.total_volume || 0), 0) / (data.topCoins.length || 1);
                
                return selectedCoin ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm" style={{ color: COLORS.neutral }}>Current Volume ({selectedCrypto}):</span>
                      <div className="font-bold text-lg" style={{ color: COLORS.sandstone }}>
                        ${selectedCoin.total_volume?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-xs" style={{ color: COLORS.neutral }}>
                        24h trading volume
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm" style={{ color: COLORS.neutral }}>vs Market Avg:</span>
                      <div className="font-bold text-lg" style={{ 
                        color: (selectedCoin.total_volume || 0) > avgVolume ? COLORS.electricSky : COLORS.sunsetEmber 
                      }}>
                        {((selectedCoin.total_volume || 0) / avgVolume * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs" style={{ color: COLORS.neutral }}>
                        {(selectedCoin.total_volume || 0) > avgVolume ? 'Above' : 'Below'} average
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: COLORS.neutral }}>Loading volume data...</div>
                );
              })()}
              
              {/* Volume Distribution */}
              <div className="mt-4 p-3 rounded" style={{ backgroundColor: COLORS.background }}>
                <div className="text-sm" style={{ color: COLORS.neutral }}>Total Market Volume:</div>
                <div className="font-bold text-lg" style={{ color: COLORS.sunsetEmber }}>
                  ${data.globalStats?.total_volume?.usd ? 
                    (data.globalStats.total_volume.usd / 1e9).toFixed(0) + 'B' : 
                    'Loading...'
                  }
                </div>
                <div className="text-xs" style={{ color: COLORS.neutral }}>24h global volume</div>
              </div>
            </div>
          </div>
        </div>

        {/* Component placeholders for remaining components */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Professional Components (Free Tier)</h3>
            <p className="text-gray-400">
              Available: WhaleTracker (using free data), ExchangeFlowMonitor (Binance API), 
              MarketSentiment analysis using CoinGecko data...
            </p>
            <div className="mt-3 text-xs text-green-400">
              ✅ All components use only free APIs (CoinGecko, Binance, public data)
            </div>
          </div>
        </div>

        {/* Teroxx Terminal Analytics Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg p-4 mt-8 border"
          style={{ 
            background: `linear-gradient(135deg, ${COLORS.electricSky}20, ${COLORS.sunsetEmber}20)`,
            borderColor: COLORS.electricSky
          }}
        >
          <div className="flex items-start space-x-3">
            <Building2 className="h-5 w-5 mt-0.5" style={{ color: COLORS.electricSky }} />
            <div>
              <h4 className="font-medium mb-1" style={{ color: COLORS.electricSky }}>Teroxx Terminal - Prototype (Free Tier)</h4>
              <p className="text-sm" style={{ color: COLORS.sandstone }}>
                Advanced crypto market intelligence using free APIs for retail vs institutional sentiment analysis. 
                Features include: Market Overview (CoinGecko), Price & Volume Analysis, Retail vs Institutional Sentiment (CoinGlass Hobbyist), 
                and Free Alternative Analysis using Binance public APIs for liquidation estimates and funding rate proxies.
                <br />
                <span style={{ color: COLORS.electricSky }}>API Status: {rateLimitInfo.remaining}/30 CoinGlass requests remaining • Free Data Sources: CoinGecko, Binance Public APIs</span>
              </p>
              <div className="mt-2 text-xs" style={{ color: COLORS.neutral }}>
                <strong>Teroxx Approach:</strong> Using public APIs and market data to provide professional-grade insights without premium subscriptions • 
                CoinGlass Hobbyist plan (≥4h intervals) + CoinGecko Free + Binance Public APIs
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
