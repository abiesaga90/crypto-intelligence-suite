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

import { apiService } from '@/services/apiService';
import { COLORS, TOP_CRYPTOS, ERROR_MESSAGES } from '@/config/constants';
import CryptoCard from '@/components/CryptoCard';
import RetailVsInstitutionalChart from '@/components/RetailVsInstitutionalChart';
import MarketOverview from '@/components/MarketOverview';
import LiquidationTracker from '@/components/LiquidationTracker';
import FundingRateMonitor from '@/components/FundingRateMonitor';
import WhaleTracker from '@/components/WhaleTracker';
import ExchangeFlowMonitor from '@/components/ExchangeFlowMonitor';
import ProfessionalAnalysisSummary from '@/components/ProfessionalAnalysisSummary';
import OrderBookAnalysis from '@/components/OrderBookAnalysis';
import TemporalAnalysis from '@/components/TemporalAnalysis';
import AlgorithmicDetection from '@/components/AlgorithmicDetection';

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

  // Fetch dashboard data
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
      // Process one symbol at a time to avoid hitting rate limits
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

  // Auto-refresh data
  useEffect(() => {
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
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Loading Crypto Dashboard</h2>
              <p className="text-gray-400">Fetching real-time market data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                <h1 className="text-2xl font-bold">Professional Crypto Intelligence Suite</h1>
              </div>
              <div className="text-sm text-gray-400">
                Enterprise-Grade Institutional vs Retail Analysis • Advanced Trading Intelligence
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Rate Limit Indicator */}
              <div className="text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>API: {rateLimitInfo.remaining}/30</span>
                </div>
              </div>
              
              {/* Last Update */}
              <div className="text-sm text-gray-400">
                Last update: {data.lastUpdate ? formatTimeAgo(data.lastUpdate) : 'Never'}
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Error Display */}
        {data.error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-400">{data.error}</span>
            </div>
          </motion.div>
        )}

        {/* Global Market Stats */}
        {data.globalStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-2">
                <PieChart className="h-5 w-5 text-blue-500" />
                <span className="text-gray-400 text-sm">Total Market Cap</span>
              </div>
              <div className="text-2xl font-bold">
                ${data.globalStats.total_market_cap?.usd ? 
                  (data.globalStats.total_market_cap.usd / 1e12).toFixed(2) + 'T' : 
                  'N/A'
                }
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-5 w-5 text-green-500" />
                <span className="text-gray-400 text-sm">24h Volume</span>
              </div>
              <div className="text-2xl font-bold">
                ${data.globalStats.total_volume?.usd ? 
                  (data.globalStats.total_volume.usd / 1e9).toFixed(0) + 'B' : 
                  'N/A'
                }
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span className="text-gray-400 text-sm">BTC Dominance</span>
              </div>
              <div className="text-2xl font-bold">
                {data.globalStats.market_cap_percentage?.btc?.toFixed(1) || 'N/A'}%
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-yellow-500" />
                <span className="text-gray-400 text-sm">Active Cryptos</span>
              </div>
              <div className="text-2xl font-bold">
                {data.globalStats.active_cryptocurrencies?.toLocaleString() || 'N/A'}
              </div>
            </div>
          </motion.div>
        )}

        {/* Market Overview */}
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
              <Users className="h-6 w-6 text-blue-500" />
              <span className="text-blue-500">Retail</span>
            </div>
            <span className="text-gray-400">vs</span>
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-purple-500" />
              <span className="text-purple-500">Institutional</span>
            </div>
            <span className="text-gray-400">Analysis</span>
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

        {/* Advanced Analysis Components */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <LiquidationTracker symbol={selectedCrypto} />
          <FundingRateMonitor symbol={selectedCrypto} />
        </div>

        {/* Professional Analysis Suite */}
        <div className="mb-8">
          <ProfessionalAnalysisSummary symbol={selectedCrypto} />
        </div>

        {/* Professional Institutional Tracking */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <Activity className="h-6 w-6 text-yellow-500" />
            <span>Smart Money & Exchange Flow Analysis</span>
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <WhaleTracker symbol={selectedCrypto} />
            <ExchangeFlowMonitor symbol={selectedCrypto} />
          </div>
        </div>

        {/* Advanced Professional Analytics (Based on Comprehensive Report) */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-purple-500" />
            <span>Professional Trading Intelligence</span>
            <span className="text-sm text-gray-400 ml-2">(Enterprise-Grade Analysis)</span>
          </h2>
          
          {/* Order Book & Volume Profile Analysis */}
          <div className="mb-8">
            <OrderBookAnalysis symbol={selectedCrypto} />
          </div>
          
          {/* Temporal & Algorithmic Analysis */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <TemporalAnalysis symbol={selectedCrypto} />
            <AlgorithmicDetection symbol={selectedCrypto} />
          </div>
        </div>

        {/* Detailed Charts */}
        {data.retailVsInstitutional.length > 0 && (
          <RetailVsInstitutionalChart 
            data={data.retailVsInstitutional} 
            selectedSymbol={selectedCrypto}
            onSymbolChange={setSelectedCrypto}
          />
        )}

        {/* Professional Analytics Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500 rounded-lg p-4 mt-8"
        >
          <div className="flex items-start space-x-3">
            <Building2 className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-medium mb-1">Professional Trading Intelligence Suite</h4>
              <p className="text-blue-300 text-sm">
                Advanced analytical framework implementing enterprise-grade methodologies for differentiating retail vs institutional crypto activity. 
                Features include: Transaction Size Analysis ($100K+ threshold), Order Book & Volume Profile (HVN/LVN), Temporal Pattern Recognition (Overnight Anomaly, Weekend Effect), 
                Algorithmic Detection (HFT, Arbitrage, Mean Reversion), Smart Money Tracking, and Real-time Market Microstructure Analysis.
                <br />
                <span className="text-blue-400">API Status: {rateLimitInfo.remaining}/30 requests remaining • Data Sources: CoinGlass, Simulated Professional Analytics</span>
              </p>
              <div className="mt-2 text-xs text-blue-200">
                <strong>Methodology:</strong> Based on Chainalysis, Nansen, CryptoQuant, and Amberdata professional standards • 
                Implements findings from institutional trading behavior research
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
