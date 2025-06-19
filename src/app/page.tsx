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
  RefreshCw,
  Database,
  Clock,
  Target,
  DollarSign
} from 'lucide-react';

// Re-enable API service
import { apiService } from '@/services/apiService';
import { COLORS, TOP_CRYPTOS, ERROR_MESSAGES } from '@/config/constants';

// Add back MarketOverview component
import MarketOverview from '@/components/MarketOverview';

// Add back retail vs institutional components
import CryptoCard from '@/components/CryptoCard';
import RetailVsInstitutionalChart from '@/components/RetailVsInstitutionalChart';

// Import Teroxx Logo
import TeroxxLogo from '@/components/TeroxxLogo';

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
    loading: true,
    error: null,
    lastUpdate: 0,
  });

  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC');
  const [refreshing, setRefreshing] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState({ remaining: 30, resetTime: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis'>('overview');

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setData(prev => ({ ...prev, loading: true, error: null }));

      console.log('Starting dashboard data fetch...');

      setRateLimitInfo({
        remaining: 30, // Free APIs - no rate limiting needed
        resetTime: 0,
      });

      // Add timeout to prevent hanging
      const FETCH_TIMEOUT = 30000; // 30 seconds
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), FETCH_TIMEOUT);
      });

      // Fetch basic market data first with better mobile handling
      console.log('Fetching basic market data...');
      console.log('User agent:', typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side');
      
      const [coinGeckoData, binanceData] = await Promise.race([
        Promise.all([
          apiService.getCoinGeckoTopCoins(30).catch((error) => {
            console.error('CoinGecko error:', error);
            console.error('CoinGecko error details:', {
              message: error.message,
              code: error.code,
              status: error.response?.status,
              statusText: error.response?.statusText,
              timeout: error.code === 'ECONNABORTED',
              network: error.message?.includes('Network Error')
            });
            return null;
          }),
          apiService.getBinance24hrTicker().catch((error) => {
            console.error('Binance error:', error);
            console.error('Binance error details:', {
              message: error.message,
              code: error.code,
              status: error.response?.status,
              statusText: error.response?.statusText,
              timeout: error.code === 'ECONNABORTED',
              network: error.message?.includes('Network Error')
            });
            return null;
          }),
        ]),
        timeoutPromise
      ]) as [any, any];

      console.log('CoinGecko data:', coinGeckoData ? `Success (${coinGeckoData.length} coins)` : 'Failed');
      console.log('Binance data:', binanceData ? 'Success' : 'Failed');

      // If both APIs fail on mobile, provide fallback data
      if (!coinGeckoData && !binanceData) {
        console.log('Both APIs failed, using fallback data for mobile compatibility');
        const fallbackData = [
          { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 43500, price_change_percentage_24h: 2.5, market_cap: 850000000000, total_volume: 25000000000, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', market_cap_rank: 1 },
          { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 2600, price_change_percentage_24h: 1.8, market_cap: 320000000000, total_volume: 15000000000, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', market_cap_rank: 2 },
          { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 98, price_change_percentage_24h: 4.2, market_cap: 45000000000, total_volume: 2500000000, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', market_cap_rank: 3 },
          { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.55, price_change_percentage_24h: -1.2, market_cap: 30000000000, total_volume: 1800000000, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', market_cap_rank: 4 },
          { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.095, price_change_percentage_24h: 3.1, market_cap: 13500000000, total_volume: 950000000, image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', market_cap_rank: 5 }
        ];
        
        setData({
          marketOverview: {
            coinGecko: fallbackData,
            binance: [],
          },
          topCoins: fallbackData,
          retailVsInstitutional: [],
          globalStats: {
            total_market_cap: { usd: 1750000000000 },
            total_volume: { usd: 65000000000 },
            market_cap_percentage: { btc: 48.5 },
            active_cryptocurrencies: 12500
          },
          loading: false,
          error: 'Using cached data - APIs temporarily unavailable on mobile',
          lastUpdate: Date.now(),
        });
        return;
      }

      // Fetch retail vs institutional analysis
      const retailVsInstitutionalData = [];
      
      console.log('Fetching BTC analysis...');
      try {
        const btcAnalysis = await Promise.race([
          apiService.getRetailVsInstitutionalAnalysis('BTC'),
          timeoutPromise
        ]);
        console.log('BTC analysis result:', btcAnalysis);
        if (btcAnalysis) {
          retailVsInstitutionalData.push(btcAnalysis);
        }
      } catch (error) {
        console.error(`Error fetching BTC analysis:`, error);
      }

      // Try to fetch a few more popular coins
      const additionalCoins = ['ETH', 'SOL'];
      for (const coin of additionalCoins) {
        try {
          console.log(`Fetching ${coin} analysis...`);
          const analysis = await Promise.race([
            apiService.getRetailVsInstitutionalAnalysis(coin),
            timeoutPromise
          ]);
          console.log(`${coin} analysis result:`, analysis);
          if (analysis) {
            retailVsInstitutionalData.push(analysis);
          }
        } catch (error) {
          console.warn(`Error fetching data for ${coin}:`, error);
        }
      }

      const validData = retailVsInstitutionalData;
      console.log('Total valid analysis data points:', validData.length);

      // Fetch global stats
      console.log('Fetching global stats...');
      const globalStats = await Promise.race([
        apiService.getCoinGeckoGlobalData().catch((error) => {
          console.error('Global stats error:', error);
          return null;
        }),
        timeoutPromise
      ]);

      console.log('Final data summary:');
      console.log('- Market overview data:', coinGeckoData ? 'Available' : 'Not available');
      console.log('- Top coins:', coinGeckoData ? coinGeckoData.length : 0);
      console.log('- Retail vs institutional data points:', validData.length);
      console.log('- Global stats:', globalStats ? 'Available' : 'Not available');

      setData({
        marketOverview: {
          coinGecko: coinGeckoData,
          binance: Array.isArray(binanceData) ? binanceData.slice(0, 30) : binanceData ? [binanceData] : [],
        },
        topCoins: coinGeckoData || [],
        retailVsInstitutional: validData,
        globalStats: globalStats?.data || null,
        loading: false,
        error: null,
        lastUpdate: Date.now(),
      });

      console.log('Dashboard data fetch completed successfully');

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

  useEffect(() => {
    console.log('Dashboard component mounted');
    console.log('Starting initial data fetch...');
    fetchDashboardData();
    
    const interval = setInterval(() => {
      console.log('Auto-refresh triggered');
      fetchDashboardData(true);
    }, 120000);

    return () => {
      console.log('Dashboard component unmounting, clearing interval');
      clearInterval(interval);
    };
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
              
              {/* Debug Test Button */}
              <div className="mt-6">
                <button
                  onClick={async () => {
                    console.log('Testing frontend API call...');
                    try {
                      const response = await fetch('/api/debug');
                      const result = await response.json();
                      console.log('Frontend API test result:', result);
                      alert(`API Test: ${result.success ? 'SUCCESS' : 'FAILED'}\nMessage: ${result.message || result.error}`);
                    } catch (error) {
                      console.error('Frontend API test failed:', error);
                      alert(`API Test FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                  }}
                  className="px-4 py-2 rounded-lg transition-colors mr-2"
                  style={{ 
                    backgroundColor: COLORS.sunsetEmber,
                    color: COLORS.white
                  }}
                >
                  Test API
                </button>
                
                <button
                  onClick={async () => {
                    console.log('Testing direct API service call from frontend...');
                    try {
                      const coinGeckoTest = await apiService.getCoinGeckoTopCoins(5);
                      console.log('Direct API service test result:', coinGeckoTest);
                      alert(`Direct API Test: SUCCESS\nReceived ${coinGeckoTest?.length || 0} coins`);
                    } catch (error) {
                      console.error('Direct API service test failed:', error);
                      alert(`Direct API Test FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                  }}
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: COLORS.electricSky,
                    color: COLORS.white
                  }}
                >
                  Test Direct
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="min-h-screen text-white" style={{ backgroundColor: COLORS.background }}>
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <AlertCircle className="h-16 w-16 mx-auto mb-4" style={{ color: COLORS.sunsetEmber }} />
              <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.sandstone }}>Network Error</h2>
              <p className="mb-4" style={{ color: COLORS.neutral }}>{data.error}</p>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors mx-auto"
                style={{ 
                  backgroundColor: refreshing ? COLORS.deepIndigo : COLORS.electricSky,
                  color: COLORS.white
                }}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Retry</span>
              </button>
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: COLORS.surface }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: COLORS.sandstone }}>Debug Info</h3>
                <p className="text-xs" style={{ color: COLORS.neutral }}>
                  API Remaining: {rateLimitInfo.remaining}/30<br/>
                  Last Update: {data.lastUpdate ? formatTimeAgo(data.lastUpdate) : 'Never'}<br/>
                  Error: {data.error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <header className="border-b sticky top-0 z-50" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.deepIndigo }}>
        <div className="container mx-auto px-4 sm:px-6">
          {/* Main Title Row */}
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="flex items-center space-x-3 min-w-0">
                <TeroxxLogo 
                  height={28} 
                  width={110}
                  showText={false}
                  color={COLORS.electricSky}
                  className="sm:hidden flex-shrink-0"
                />
                <TeroxxLogo 
                  height={32} 
                  width={140}
                  showText={true}
                  color={COLORS.electricSky}
                  className="hidden sm:block flex-shrink-0"
                />
                <span className="text-lg sm:text-2xl font-bold" style={{ color: COLORS.sandstone }}>Terminal</span>
                <span className="hidden sm:inline text-xs sm:text-sm px-2 py-1 rounded flex-shrink-0" style={{ backgroundColor: COLORS.sunsetEmber, color: COLORS.white }}>
                  Prototype
                </span>
              </div>
              <div className="hidden lg:block text-sm flex-shrink-0" style={{ color: COLORS.neutral }}>
                Advanced Crypto Market Intelligence
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="hidden sm:block text-xs sm:text-sm" style={{ color: COLORS.neutral }}>
                <div className="flex items-center space-x-2">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: COLORS.electricSky }} />
                  <span>API: {rateLimitInfo.remaining}/30</span>
                </div>
              </div>
              
              <div className="hidden md:block text-xs sm:text-sm" style={{ color: COLORS.neutral }}>
                Last update: {data.lastUpdate ? formatTimeAgo(data.lastUpdate) : 'Never'}
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors focus-mobile"
                style={{ 
                  backgroundColor: refreshing ? COLORS.deepIndigo : COLORS.electricSky,
                  color: COLORS.white
                }}
                aria-label="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs Row */}
          <div className="border-t" style={{ borderColor: COLORS.deepIndigo }}>
            <nav className="flex space-x-1 py-2 overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setActiveTab('overview')}
                className="px-3 sm:px-6 py-2 sm:py-3 rounded-t-lg font-medium border-b-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-all focus-mobile"
                style={{ 
                  backgroundColor: activeTab === 'overview' ? COLORS.electricSky + '20' : 'transparent', 
                  color: activeTab === 'overview' ? COLORS.electricSky : COLORS.neutral,
                  borderColor: activeTab === 'overview' ? COLORS.electricSky : 'transparent'
                }}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Dashboard</span>
                </div>
              </button>
              
              <button 
                onClick={() => setActiveTab('analysis')}
                className="px-3 sm:px-6 py-2 sm:py-3 rounded-t-lg font-medium text-xs sm:text-sm transition-all border-b-2 flex-shrink-0 whitespace-nowrap focus-mobile"
                style={{ 
                  backgroundColor: activeTab === 'analysis' ? COLORS.sunsetEmber : COLORS.sunsetEmber + '60',
                  color: COLORS.white,
                  borderColor: activeTab === 'analysis' ? COLORS.sunsetEmber : 'transparent',
                  boxShadow: activeTab === 'analysis' ? `0 0 20px ${COLORS.sunsetEmber}40` : 'none'
                }}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-semibold">Analysis Details</span>
                </div>
              </button>
              
              <div 
                className="px-3 sm:px-6 py-2 sm:py-3 rounded-t-lg font-medium text-xs sm:text-sm opacity-50 cursor-not-allowed border-b-2 border-transparent flex-shrink-0 whitespace-nowrap"
                style={{ 
                  backgroundColor: COLORS.deepIndigo + '50',
                  color: COLORS.neutral
                }}
                title="Coming Soon"
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Market Analysis</span>
                </div>
              </div>
              
              <div 
                className="px-6 py-3 rounded-t-lg font-medium text-sm opacity-50 cursor-not-allowed border-b-2 border-transparent flex-shrink-0 whitespace-nowrap"
                style={{ 
                  backgroundColor: COLORS.deepIndigo + '50',
                  color: COLORS.neutral
                }}
                title="Coming Soon"
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Advanced Metrics</span>
                </div>
              </div>
              
              <div 
                className="px-6 py-3 rounded-t-lg font-medium text-sm opacity-50 cursor-not-allowed border-b-2 border-transparent flex-shrink-0 whitespace-nowrap"
                style={{ 
                  backgroundColor: COLORS.deepIndigo + '50',
                  color: COLORS.neutral
                }}
                title="Coming Soon"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Risk Analysis</span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {data.error && (
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: `${COLORS.sunsetEmber}20`, borderColor: COLORS.sunsetEmber }}>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" style={{ color: COLORS.sunsetEmber }} />
              <span style={{ color: COLORS.sunsetEmber }}>{data.error}</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <DashboardOverviewTab 
            data={data} 
            selectedCrypto={selectedCrypto} 
            setSelectedCrypto={setSelectedCrypto} 
          />
        )}
        
        {activeTab === 'analysis' && (
          <AnalysisDetailsTab 
            data={data}
            selectedCrypto={selectedCrypto}
            setSelectedCrypto={setSelectedCrypto}
          />
        )}
      </main>
    </div>
  );
}

// Dashboard Overview Tab Component
function DashboardOverviewTab({ data, selectedCrypto, setSelectedCrypto }: {
  data: DashboardData;
  selectedCrypto: string;
  setSelectedCrypto: (crypto: string) => void;
}) {
  return (
    <>
      {/* Status Message */}
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

      {/* Global Market Stats */}
      {data.globalStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="rounded-lg p-3 sm:p-6" style={{ backgroundColor: COLORS.surface }}>
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
              <PieChart className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLORS.electricSky }} />
              <span className="text-xs sm:text-sm" style={{ color: COLORS.neutral }}>Market Cap</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold" style={{ color: COLORS.sandstone }}>
              ${data.globalStats.total_market_cap?.usd ? 
                (data.globalStats.total_market_cap.usd / 1e12).toFixed(2) + 'T' : 
                'N/A'
              }
            </div>
          </div>
          
          <div className="rounded-lg p-3 sm:p-6" style={{ backgroundColor: COLORS.surface }}>
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLORS.electricSky }} />
              <span className="text-xs sm:text-sm" style={{ color: COLORS.neutral }}>24h Volume</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold" style={{ color: COLORS.sandstone }}>
              ${data.globalStats.total_volume?.usd ? 
                (data.globalStats.total_volume.usd / 1e9).toFixed(0) + 'B' : 
                'N/A'
              }
            </div>
          </div>
          
          <div className="rounded-lg p-3 sm:p-6" style={{ backgroundColor: COLORS.surface }}>
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLORS.sunsetEmber }} />
              <span className="text-xs sm:text-sm" style={{ color: COLORS.neutral }}>BTC Dom.</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold" style={{ color: COLORS.sandstone }}>
              {data.globalStats.market_cap_percentage?.btc?.toFixed(1) || 'N/A'}%
            </div>
          </div>
          
          <div className="rounded-lg p-3 sm:p-6" style={{ backgroundColor: COLORS.surface }}>
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLORS.sunsetEmber }} />
              <span className="text-xs sm:text-sm" style={{ color: COLORS.neutral }}>Cryptos</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold" style={{ color: COLORS.sandstone }}>
              {data.globalStats.active_cryptocurrencies?.toLocaleString() || 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Market Overview Component */}
      <MarketOverview data={data.marketOverview} />



      {/* Top Coins Display */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Top Cryptocurrencies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {data.topCoins.slice(0, 12).map((coin: any, index: number) => (
            <div key={coin.id || index} className="bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center space-x-2 sm:space-x-3">
                {coin.image && (
                  <img src={coin.image} alt={coin.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{coin.symbol?.toUpperCase()}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">{coin.name}</p>
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-base sm:text-lg font-bold truncate">
                  ${coin.current_price?.toLocaleString() || 'N/A'}
                </div>
                <div className={`text-xs sm:text-sm flex items-center space-x-1 ${
                  coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  <span>{coin.price_change_percentage_24h >= 0 ? '↗' : '↘'}</span>
                  <span>{Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Analysis Details Tab Component  
function AnalysisDetailsTab({ data, selectedCrypto, setSelectedCrypto }: {
  data: DashboardData;
  selectedCrypto: string;
  setSelectedCrypto: (crypto: string) => void;
}) {
  return (
    <div>
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-4" style={{ color: COLORS.sandstone }}>
          Retail vs Institutional Analysis Deep Dive
        </h1>
        <p className="text-lg" style={{ color: COLORS.neutral }}>
          Understanding market behavior through data-driven analysis of trading patterns and investor psychology
        </p>
      </motion.div>

      {/* Methodology Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 p-6 rounded-lg" 
        style={{ backgroundColor: COLORS.surface }}
      >
        <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-2">
          <Database className="h-6 w-6" style={{ color: COLORS.electricSky }} />
          <span style={{ color: COLORS.sandstone }}>Analysis Methodology</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: COLORS.sandstone }}>Data Sources</h3>
            <ul className="space-y-2 text-sm" style={{ color: COLORS.neutral }}>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.electricSky }}></div>
                <span><strong>Binance Public API:</strong> Real-time trading data, volume, price movements</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.electricSky }}></div>
                <span><strong>CoinGecko Free Tier:</strong> Market capitalization, rankings, historical data</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.electricSky }}></div>
                <span><strong>Real-time Processing:</strong> Live analysis updated every 2 minutes</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: COLORS.sandstone }}>Analysis Frequency</h3>
            <ul className="space-y-2 text-sm" style={{ color: COLORS.neutral }}>
              <li className="flex items-center space-x-2">
                <Clock className="h-4 w-4" style={{ color: COLORS.electricSky }} />
                <span>Real-time data processing</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="h-4 w-4" style={{ color: COLORS.electricSky }} />
                <span>24-hour rolling analysis windows</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="h-4 w-4" style={{ color: COLORS.electricSky }} />
                <span>Continuous confidence scoring</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Current Analysis Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
          <Activity className="h-6 w-6" style={{ color: COLORS.electricSky }} />
          <span style={{ color: COLORS.sandstone }}>Current Analysis Results</span>
        </h2>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center space-x-2 mb-3 lg:mb-0">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6" style={{ color: COLORS.sunsetEmber }} />
              <span style={{ color: COLORS.sunsetEmber }}>Retail</span>
            </div>
            <span style={{ color: COLORS.neutral }}>vs</span>
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6" style={{ color: COLORS.electricSky }} />
              <span style={{ color: COLORS.electricSky }}>Institutional</span>
            </div>
            <span style={{ color: COLORS.neutral }}>Live Analysis</span>
          </h3>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs" style={{ color: COLORS.neutral }}>Data Sources:</span>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded border" style={{ 
                backgroundColor: `${COLORS.electricSky}20`, 
                borderColor: COLORS.electricSky,
                color: COLORS.electricSky 
              }}>
                CoinGlass Hobbyist
              </span>
              <span className="text-xs px-2 py-1 rounded border" style={{ 
                backgroundColor: `${COLORS.sunsetEmber}20`, 
                borderColor: COLORS.sunsetEmber,
                color: COLORS.sunsetEmber 
              }}>
                CoinGecko Free
              </span>
              <span className="text-xs px-2 py-1 rounded border" style={{ 
                backgroundColor: `${COLORS.neutral}20`, 
                borderColor: COLORS.neutral,
                color: COLORS.neutral 
              }}>
                Binance Public
              </span>
            </div>
          </div>
        </div>
        
        {data.retailVsInstitutional.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.retailVsInstitutional.map((analysis: any, index: number) => (
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
            
            {/* Detailed Charts */}
            <RetailVsInstitutionalChart 
              data={data.retailVsInstitutional} 
              selectedSymbol={selectedCrypto}
              onSymbolChange={setSelectedCrypto}
            />
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

      {/* Five Analysis Factors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
          <Zap className="h-6 w-6" style={{ color: COLORS.electricSky }} />
          <span style={{ color: COLORS.sandstone }}>Five Analysis Factors</span>
        </h2>
        
        <div className="space-y-6">
          {/* Factor 1: Volume vs Market Cap Ratio */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-lg border"
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.deepIndigo }}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo, color: COLORS.electricSky }}>
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.sandstone }}>
                  Volume vs Market Cap Ratio
                </h3>
                <p className="mb-4" style={{ color: COLORS.neutral }}>
                  Measures the relationship between trading volume and market capitalization
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4" style={{ color: COLORS.sunsetEmber }} />
                      <span className="font-medium" style={{ color: COLORS.sunsetEmber }}>Retail Indicator</span>
                    </div>
                    <p className="text-sm" style={{ color: COLORS.neutral }}>
                      High ratio (&gt;0.1) suggests heavy retail activity with frequent smaller trades
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="h-4 w-4" style={{ color: COLORS.electricSky }} />
                      <span className="font-medium" style={{ color: COLORS.electricSky }}>Institutional Indicator</span>
                    </div>
                    <p className="text-sm" style={{ color: COLORS.neutral }}>
                      Low ratio (&lt;0.05) indicates institutional accumulation with larger, less frequent trades
                    </p>
                  </div>
                </div>
                
                <div className="text-sm" style={{ color: COLORS.neutral }}>
                  <strong>Data Sources:</strong> CoinGecko market cap data, Binance 24hr volume statistics
                </div>
              </div>
            </div>
          </motion.div>

          {/* Factor 2: Price Volatility Patterns */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-lg border"
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.deepIndigo }}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo, color: COLORS.electricSky }}>
                <Activity className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.sandstone }}>
                  Price Volatility Patterns
                </h3>
                <p className="mb-4" style={{ color: COLORS.neutral }}>
                  Analyzes price movement patterns and volatility characteristics
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4" style={{ color: COLORS.sunsetEmber }} />
                      <span className="font-medium" style={{ color: COLORS.sunsetEmber }}>Retail Indicator</span>
                    </div>
                    <p className="text-sm" style={{ color: COLORS.neutral }}>
                      High volatility (&gt;5% daily) suggests emotional trading and retail dominance
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="h-4 w-4" style={{ color: COLORS.electricSky }} />
                      <span className="font-medium" style={{ color: COLORS.electricSky }}>Institutional Indicator</span>
                    </div>
                    <p className="text-sm" style={{ color: COLORS.neutral }}>
                      Low volatility (&lt;2% daily) indicates institutional stability and strategic positioning
                    </p>
                  </div>
                </div>
                
                <div className="text-sm" style={{ color: COLORS.neutral }}>
                  <strong>Data Sources:</strong> Binance real-time price feeds, 24hr high/low ranges
                </div>
              </div>
            </div>
          </motion.div>

          {/* Factor 3: Trade Size Analysis */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-lg border"
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.deepIndigo }}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo, color: COLORS.electricSky }}>
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.sandstone }}>
                  Trade Size Analysis
                </h3>
                <p className="mb-4" style={{ color: COLORS.neutral }}>
                  Examines average trade sizes and transaction patterns
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4" style={{ color: COLORS.sunsetEmber }} />
                      <span className="font-medium" style={{ color: COLORS.sunsetEmber }}>Retail Indicator</span>
                    </div>
                    <p className="text-sm" style={{ color: COLORS.neutral }}>
                      High trade count with low average size indicates retail participation
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="h-4 w-4" style={{ color: COLORS.electricSky }} />
                      <span className="font-medium" style={{ color: COLORS.electricSky }}>Institutional Indicator</span>
                    </div>
                    <p className="text-sm" style={{ color: COLORS.neutral }}>
                      Low trade count with high average size suggests institutional block trading
                    </p>
                  </div>
                </div>
                
                <div className="text-sm" style={{ color: COLORS.neutral }}>
                  <strong>Data Sources:</strong> Binance trade count and volume metrics
                </div>
              </div>
            </div>
          </motion.div>

          {/* Factor 4: Market Cap Behavior */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-lg border"
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.deepIndigo }}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo, color: COLORS.electricSky }}>
                <PieChart className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.sandstone }}>
                  Market Cap Behavior Analysis
                </h3>
                <p className="mb-4" style={{ color: COLORS.neutral }}>
                  Studies market capitalization patterns and investor preferences
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4" style={{ color: COLORS.sunsetEmber }} />
                      <span className="font-medium" style={{ color: COLORS.sunsetEmber }}>Retail Indicator</span>
                    </div>
                    <p className="text-sm" style={{ color: COLORS.neutral }}>
                      Activity in small/mid-cap coins (&lt;$10B) suggests retail interest in high-growth potential
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="h-4 w-4" style={{ color: COLORS.electricSky }} />
                      <span className="font-medium" style={{ color: COLORS.electricSky }}>Institutional Indicator</span>
                    </div>
                    <p className="text-sm" style={{ color: COLORS.neutral }}>
                      Focus on large-cap established coins (&gt;$50B) indicates institutional risk management
                    </p>
                  </div>
                </div>
                
                <div className="text-sm" style={{ color: COLORS.neutral }}>
                  <strong>Data Sources:</strong> CoinGecko market cap rankings, historical cap analysis
                </div>
              </div>
            </div>
          </motion.div>

          {/* Factor 5: 24h Range Position */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-lg border"
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.deepIndigo }}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo, color: COLORS.electricSky }}>
                <Target className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.sandstone }}>
                  24h Range Position Analysis
                </h3>
                <p className="mb-4" style={{ color: COLORS.neutral }}>
                  Examines current price position within daily trading range
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4" style={{ color: COLORS.sunsetEmber }} />
                      <span className="font-medium" style={{ color: COLORS.sunsetEmber }}>Retail Indicator</span>
                    </div>
                    <p className="text-sm" style={{ color: COLORS.neutral }}>
                      Extreme positions (top 10% or bottom 10% of range) with high volatility suggest retail FOMO/panic
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="h-4 w-4" style={{ color: COLORS.electricSky }} />
                      <span className="font-medium" style={{ color: COLORS.electricSky }}>Institutional Indicator</span>
                    </div>
                    <p className="text-sm" style={{ color: COLORS.neutral }}>
                      Mid-range positions (40-60%) with controlled movements indicate institutional accumulation
                    </p>
                  </div>
                </div>
                
                <div className="text-sm" style={{ color: COLORS.neutral }}>
                  <strong>Data Sources:</strong> Binance 24hr high/low data, current price positioning
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Confidence Scoring System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8 p-6 rounded-lg"
        style={{ backgroundColor: COLORS.surface }}
      >
        <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-2">
          <Target className="h-6 w-6" style={{ color: COLORS.electricSky }} />
          <span style={{ color: COLORS.sandstone }}>Confidence Scoring System</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo }}>
            <div className="text-lg font-bold mb-2" style={{ color: COLORS.electricSky }}>85-100%</div>
            <div className="text-sm font-medium mb-1" style={{ color: COLORS.sandstone }}>Very High</div>
            <div className="text-xs" style={{ color: COLORS.neutral }}>4+ factors aligned, strong signal confidence</div>
          </div>
          
          <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo }}>
            <div className="text-lg font-bold mb-2" style={{ color: COLORS.electricSky }}>70-84%</div>
            <div className="text-sm font-medium mb-1" style={{ color: COLORS.sandstone }}>High</div>
            <div className="text-xs" style={{ color: COLORS.neutral }}>3+ factors aligned, reliable signal</div>
          </div>
          
          <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo }}>
            <div className="text-lg font-bold mb-2" style={{ color: COLORS.sunsetEmber }}>60-69%</div>
            <div className="text-sm font-medium mb-1" style={{ color: COLORS.sandstone }}>Moderate</div>
            <div className="text-xs" style={{ color: COLORS.neutral }}>2+ factors aligned, emerging trend</div>
          </div>
          
          <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.deepIndigo }}>
            <div className="text-lg font-bold mb-2" style={{ color: COLORS.neutral }}>30-59%</div>
            <div className="text-sm font-medium mb-1" style={{ color: COLORS.sandstone }}>Low</div>
            <div className="text-xs" style={{ color: COLORS.neutral }}>Mixed signals, inconclusive data</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
