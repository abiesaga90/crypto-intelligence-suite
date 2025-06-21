'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  RefreshCw,
  AlertCircle,
  BarChart3,
  Activity,
  Building2,
  Clock,
  Search,
  ChevronDown,
  Users,
  LineChart,
  Newspaper,
  Info
} from 'lucide-react';
import { COLORS } from '@/config/constants';
import TeroxxLogo from '@/components/TeroxxLogo';
import ExchangeSelector from '@/components/ExchangeSelector';
import InvestmentCalculator from '@/components/InvestmentCalculator';

interface FundingRate {
  exchange: string;
  rate: number;
  interval: number;
  nextFunding?: string;
}

interface ArbitrageOpportunity {
  symbol: string;
  exchangeHigh: string;
  exchangeLow: string;
  binanceFundingRate: number; // highest rate
  krakenFundingRate: number;  // lowest rate
  arbitrageOpportunity: number;
  direction: string;
  hasArbitrage: boolean;
  confidence: string;
  openInterestHigh: number;
  openInterestLow: number;
  volumeHigh: number;
  volumeLow: number;
  volume24h: number;
  openInterest: number;
  marketCap: number;
  priceChange24h: number;
  availableExchanges: number;
  allRates: FundingRate[];
  lastUpdated: string;
}

interface FundingArbitrageData {
  opportunities: ArbitrageOpportunity[];
  lastUpdated: string | null;
  isUpdating: boolean;
  totalSymbols: number;
  processedSymbols: number;
  realOpportunities: number;
  errors: number;
  selectedExchanges: string[];
}

// Available exchanges
const ALL_EXCHANGES = [
  'Binance', 'OKX', 'dYdX', 'Bybit', 'Vertex', 'Bitget', 'CoinEx', 
  'Bitfinex', 'Kraken', 'HTX', 'BingX', 'Gate', 'Crypto.com', 
  'Coinbase', 'Hyperliquid', 'Bitunix', 'MEXC', 'WhiteBIT'
];

export default function FundingArbitragePage() {
  const [data, setData] = useState<FundingArbitrageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(ALL_EXCHANGES);
  const [totalInvestment, setTotalInvestment] = useState(100000);
  const [sortConfig, setSortConfig] = useState({
    column: 'arbitrageOpportunity',
    direction: 'desc' as 'asc' | 'desc'
  });

  // Fetch real funding arbitrage data from our API
  const fetchArbitrageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Fetching funding arbitrage data...');
      
      const response = await fetch('/api/funding-arbitrage', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiData = await response.json();
      
      if (apiData.error) {
        throw new Error(apiData.error);
      }
      
      // Transform API response to match our interface
      const transformedData: FundingArbitrageData = {
        opportunities: apiData.opportunities || [],
        lastUpdated: apiData.stats?.lastUpdated || null,
        isUpdating: false,
        totalSymbols: apiData.stats?.totalSymbols || 0,
        processedSymbols: apiData.stats?.processedSymbols || 0,
        realOpportunities: apiData.stats?.realOpportunities || 0,
        errors: 0,
        selectedExchanges: selectedExchanges
      };
      
      setData(transformedData);
      console.log(`✅ Loaded ${transformedData.realOpportunities} arbitrage opportunities`);
    } catch (err) {
      setError('Failed to fetch arbitrage data. Please try again.');
      console.error('Error fetching arbitrage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArbitrageData();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchArbitrageData, 30000);
    
    return () => clearInterval(interval);
  }, [selectedExchanges]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      try {
        // Only trigger on key combinations to avoid interfering with typing
        if (event.altKey || event.ctrlKey || event.metaKey) {
          switch (event.key.toLowerCase()) {
            case 'h':
              event.preventDefault();
              window.location.href = '/';
              break;
            case 'r':
              event.preventDefault();
              window.location.href = '/?tab=analysis';
              break;
            case 'm':
              event.preventDefault();
              window.location.href = '/?tab=gainers-losers';
              break;
            case 'n':
              event.preventDefault();
              window.location.href = '/?tab=news';
              break;
            case 'f':
              event.preventDefault();
              fetchArbitrageData();
              break;
          }
        }
      } catch (error) {
        console.error('Keyboard navigation error:', error);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  // Sort opportunities and limit to top 10
  const sortedOpportunities = useMemo(() => {
    if (!data?.opportunities) return [];
    
    const sorted = [...data.opportunities].sort((a, b) => {
      const aValue = a[sortConfig.column as keyof ArbitrageOpportunity];
      const bValue = b[sortConfig.column as keyof ArbitrageOpportunity];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'desc' ? bValue - aValue : aValue - bValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'desc' 
          ? bValue.localeCompare(aValue) 
          : aValue.localeCompare(bValue);
      }
      
      return 0;
    });
    
    // Limit to top 10 opportunities only
    return sorted.slice(0, 10);
  }, [data?.opportunities, sortConfig]);

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const formatRate = (rate: number) => {
    return `${(rate * 100).toFixed(4)}%`;
  };

  const formatCurrency = (value: number) => {
    // Show raw numbers with comma formatting (same format as we fetch it)
    return `$${value.toLocaleString()}`;
  };

  const calculateTeroxxInvestment = (opportunity: ArbitrageOpportunity) => {
    // Distribute investment uniformly across TOP 10 opportunities only
    const topOpportunities = Math.min(sortedOpportunities.length, 10);
    
    if (topOpportunities === 0) return 0;
    
    // Split total investment uniformly across top 10 opportunities
    return totalInvestment / topOpportunities;
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white" style={{ backgroundColor: COLORS.background }}>
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: COLORS.electricSky }}></div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: COLORS.sandstone }}>Loading Funding Arbitrage Data</h2>
              <p style={{ color: COLORS.neutral }}>Scanning cross-exchange opportunities...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: COLORS.background }}>
      {/* Navigation Header - Matching Main Dashboard */}
      <header className="border-b" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.deepIndigo }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 space-y-4 sm:space-y-0">
            {/* Left: Logo and Title */}
            <div className="flex items-center space-x-4">
              <TeroxxLogo className="h-8 w-8 sm:h-10 sm:w-10" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.sandstone }}>
                  Teroxx Terminal
                </h1>
                <p className="text-sm" style={{ color: COLORS.neutral }}>
                  Professional Crypto Analytics Dashboard
                </p>
              </div>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2 text-sm" style={{ color: COLORS.neutral }}>
                 <Activity className="h-4 w-4" style={{ color: COLORS.electricSky }} />
                 <span>Real-time data active</span>
               </div>
               
               {/* Keyboard Shortcuts Info */}
               <div className="relative group">
                 <div className="flex items-center space-x-1 text-xs px-2 py-1 rounded" style={{ 
                   backgroundColor: COLORS.deepIndigo + '40',
                   color: COLORS.neutral + '80'
                 }}>
                   <span>⌘</span>
                   <span>Shortcuts</span>
                 </div>
                 
                 {/* Tooltip */}
                 <div className="absolute bottom-full right-0 mb-2 w-48 p-3 rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity z-50"
                      style={{ 
                        backgroundColor: COLORS.surface,
                        borderColor: COLORS.deepIndigo 
                      }}>
                   <div className="text-xs space-y-1" style={{ color: COLORS.neutral }}>
                     <div className="flex justify-between">
                       <span>⌘+H</span>
                       <span>Home</span>
                     </div>
                     <div className="flex justify-between">
                       <span>⌘+R</span>
                       <span>Research</span>
                     </div>
                     <div className="flex justify-between">
                       <span>⌘+M</span>
                       <span>Market</span>
                     </div>
                     <div className="flex justify-between">
                       <span>⌘+F</span>
                       <span>Refresh</span>
                     </div>
                   </div>
                 </div>
               </div>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: COLORS.electricSky + '20',
                  color: COLORS.electricSky,
                  border: `1px solid ${COLORS.electricSky}30`
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.electricSky + '30'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.electricSky + '20'}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 overflow-x-auto pb-2">
            {/* Home Tab */}
            <button 
              onClick={() => {
                try {
                  window.location.href = '/';
                } catch (error) {
                  console.error('Navigation error:', error);
                  window.location.assign('/');
                }
              }}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-t-lg font-medium border-b-2 text-sm whitespace-nowrap flex-shrink-0 transition-all focus-mobile"
              style={{ 
                backgroundColor: 'transparent', 
                color: COLORS.neutral,
                borderColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.electricSky + '20';
                e.currentTarget.style.color = COLORS.electricSky;
                e.currentTarget.style.borderColor = COLORS.electricSky;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.neutral;
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Home</span>
              </div>
            </button>
            
            {/* News Tab */}
            <button 
              onClick={() => {
                try {
                  window.location.href = '/?tab=news';
                } catch (error) {
                  console.error('Navigation error:', error);
                  window.location.assign('/?tab=news');
                }
              }}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-t-lg font-medium border-b-2 text-sm whitespace-nowrap flex-shrink-0 transition-all focus-mobile"
              style={{ 
                backgroundColor: 'transparent',
                color: COLORS.neutral,
                borderColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.electricSky + '20';
                e.currentTarget.style.color = COLORS.electricSky;
                e.currentTarget.style.borderColor = COLORS.electricSky;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.neutral;
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>📰 News</span>
              </div>
            </button>
            
            {/* Market Tab */}
            <button 
              onClick={() => {
                try {
                  window.location.href = '/?tab=gainers-losers';
                } catch (error) {
                  console.error('Navigation error:', error);
                  window.location.assign('/?tab=gainers-losers');
                }
              }}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-t-lg font-medium border-b-2 text-sm whitespace-nowrap flex-shrink-0 transition-all focus-mobile"
              style={{ 
                backgroundColor: 'transparent',
                color: COLORS.neutral,
                borderColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.electricSky + '20';
                e.currentTarget.style.color = COLORS.electricSky;
                e.currentTarget.style.borderColor = COLORS.electricSky;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.neutral;
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Market</span>
              </div>
            </button>
            
            {/* Research Tab */}
            <button 
              onClick={() => {
                try {
                  window.location.href = '/?tab=analysis';
                } catch (error) {
                  console.error('Navigation error:', error);
                  window.location.assign('/?tab=analysis');
                }
              }}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-t-lg font-medium border-b-2 text-sm whitespace-nowrap flex-shrink-0 transition-all focus-mobile"
              style={{ 
                backgroundColor: 'transparent',
                color: COLORS.neutral,
                borderColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.sunsetEmber + '20';
                e.currentTarget.style.color = COLORS.sunsetEmber;
                e.currentTarget.style.borderColor = COLORS.sunsetEmber;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.neutral;
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Research</span>
              </div>
            </button>
            
            {/* Funding Arbitrage Tab - Active */}
            <button 
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-t-lg font-medium border-b-2 text-sm whitespace-nowrap flex-shrink-0 transition-all focus-mobile"
              style={{ 
                backgroundColor: COLORS.sunsetEmber + '20',
                color: COLORS.sunsetEmber,
                borderColor: COLORS.sunsetEmber
              }}
            >
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Funding Arbitrage</span>
                <span className="text-xs px-2 py-1 rounded animate-pulse font-bold" style={{ 
                  backgroundColor: COLORS.electricSky + '40',
                  color: COLORS.electricSky,
                  border: `1px solid ${COLORS.electricSky}50`
                }}>
                  Live
                </span>
              </div>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 mb-6 text-sm" style={{ color: COLORS.neutral }}>
          <button 
            onClick={() => window.location.href = '/'}
            className="hover:underline transition-colors"
            style={{ color: COLORS.electricSky }}
          >
            Home
          </button>
          <span>/</span>
          <button 
            onClick={() => window.location.href = '/?tab=analysis'}
            className="hover:underline transition-colors"
            style={{ color: COLORS.electricSky }}
          >
            Research
          </button>
          <span>/</span>
          <span style={{ color: COLORS.sandstone }}>Funding Arbitrage</span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: `${COLORS.sunsetEmber}20`, borderColor: COLORS.sunsetEmber }}>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" style={{ color: COLORS.sunsetEmber }} />
              <span style={{ color: COLORS.sunsetEmber }}>{error}</span>
            </div>
          </div>
        )}

        {data && (
          <>
            {/* Top Controls Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Exchange Selection */}
              <ExchangeSelector 
                selectedExchanges={selectedExchanges}
                onExchangeUpdate={(exchanges) => {
                  setSelectedExchanges(exchanges);
                  // Trigger data refresh after exchange selection
                  setTimeout(() => {
                    fetchArbitrageData();
                  }, 100);
                }}
              />
              
              {/* Investment Calculator */}
              <InvestmentCalculator 
                totalInvestment={totalInvestment}
                setTotalInvestment={setTotalInvestment}
              />
            </div>

            {/* Page Title Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.sandstone }}>
                Funding Rate Arbitrage
              </h2>
              <p className="text-lg" style={{ color: COLORS.neutral }}>
                Real-time cross-exchange funding rate opportunities • {sortedOpportunities.length} active arbitrage positions detected
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg p-4"
                style={{ backgroundColor: COLORS.surface }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-5 w-5" style={{ color: COLORS.electricSky }} />
                  <span className="text-sm" style={{ color: COLORS.neutral }}>Opportunities</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: COLORS.sandstone }}>
                  {data.realOpportunities}
                </div>
                <div className="text-xs" style={{ color: COLORS.neutral }}>
                  from {data.selectedExchanges.length} exchanges
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-lg p-4"
                style={{ backgroundColor: COLORS.surface }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-5 w-5" style={{ color: COLORS.electricSky }} />
                  <span className="text-sm" style={{ color: COLORS.neutral }}>Symbols Scanned</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: COLORS.sandstone }}>
                  {data.processedSymbols}
                </div>
                <div className="text-xs" style={{ color: COLORS.neutral }}>
                  of {data.totalSymbols} total
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg p-4"
                style={{ backgroundColor: COLORS.surface }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-5 w-5" style={{ color: COLORS.electricSky }} />
                  <span className="text-sm" style={{ color: COLORS.neutral }}>Investment Pool</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: COLORS.sandstone }}>
                  {formatCurrency(totalInvestment)}
                </div>
                <div className="text-xs" style={{ color: COLORS.neutral }}>
                  total allocation
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-lg p-4"
                style={{ backgroundColor: COLORS.surface }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5" style={{ color: COLORS.electricSky }} />
                  <span className="text-sm" style={{ color: COLORS.neutral }}>Last Updated</span>
                </div>
                <div className="text-sm font-medium" style={{ color: COLORS.sandstone }}>
                  {data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'Never'}
                </div>
                <div className="text-xs" style={{ color: COLORS.neutral }}>
                  Auto-refresh: 30s
                </div>
              </motion.div>
            </div>

            {/* Enhanced Arbitrage Table */}
            <div className="rounded-lg border shadow-sm" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.deepIndigo }}>
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold" style={{ color: COLORS.sandstone }}>
                  Top 10 Arbitrage Opportunities ({sortedOpportunities.length})
                </h3>
                <p className="text-sm mt-1" style={{ color: COLORS.neutral }}>
                  Real-time funding rate differences across selected exchanges • Top opportunities only
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b" style={{ borderColor: COLORS.deepIndigo }}>
                    <tr style={{ backgroundColor: COLORS.deepIndigo + '20' }}>
                      <th className="px-3 py-3 text-left font-medium" style={{ color: COLORS.neutral }}>#</th>
                      <th className="px-3 py-3 text-left font-medium" style={{ color: COLORS.neutral }}>Symbol</th>
                      <th 
                        className="px-3 py-3 text-center font-bold border-l-2 border-r-2" 
                        style={{ 
                          color: COLORS.sunsetEmber,
                          backgroundColor: COLORS.sunsetEmber + '15',
                          borderColor: COLORS.sunsetEmber 
                        }}
                      >
                        Teroxx Investment
                      </th>
                      <th className="px-3 py-3 text-right font-medium" style={{ color: COLORS.neutral }}>High Rate Exchange</th>
                      <th className="px-3 py-3 text-right font-medium" style={{ color: COLORS.neutral }}>Low Rate Exchange</th>
                      <th className="px-3 py-3 text-right font-medium" style={{ color: COLORS.neutral }}>Vol High</th>
                      <th className="px-3 py-3 text-right font-medium" style={{ color: COLORS.neutral }}>Vol Low</th>
                      <th className="px-3 py-3 text-right font-medium" style={{ color: COLORS.neutral }}>OI High</th>
                      <th className="px-3 py-3 text-right font-medium" style={{ color: COLORS.neutral }}>OI Low</th>
                      <th className="px-3 py-3 text-right font-medium" style={{ color: COLORS.neutral }}>8H Spread</th>
                      <th className="px-3 py-3 text-right font-medium" style={{ color: COLORS.neutral }}>Annual %</th>
                      <th className="px-3 py-3 text-center font-medium" style={{ color: COLORS.neutral }}>Direction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOpportunities.map((opportunity, index) => {
                      const investment = calculateTeroxxInvestment(opportunity);
                      const annualReturn = opportunity.arbitrageOpportunity * 3 * 365; // 3 times per day * 365 days
                      
                      return (
                        <tr 
                          key={`${opportunity.symbol}-${index}`}
                          className="border-b hover:bg-opacity-50 transition-colors"
                          style={{ 
                            borderColor: COLORS.deepIndigo + '30',
                            ...(index % 2 === 0 ? { backgroundColor: COLORS.deepIndigo + '05' } : {})
                          }}
                        >
                          {/* Rank */}
                          <td className="px-3 py-3">
                            <span className="text-xs" style={{ color: COLORS.neutral + '80' }}>
                              {index + 1}
                            </span>
                          </td>
                          
                          {/* Symbol */}
                          <td className="px-3 py-3">
                            <div className="flex flex-col">
                              <span className="font-semibold" style={{ color: COLORS.sandstone }}>
                                {opportunity.symbol}
                              </span>
                              <span className="text-xs" style={{ color: COLORS.neutral + '60' }}>
                                {opportunity.availableExchanges} exchanges
                              </span>
                            </div>
                          </td>
                          
                          {/* Teroxx Investment - Highlighted Column */}
                          <td 
                            className="px-3 py-3 text-center font-bold border-l-2 border-r-2"
                            style={{ 
                              backgroundColor: COLORS.sunsetEmber + '15',
                              borderColor: COLORS.sunsetEmber,
                              color: COLORS.sunsetEmber
                            }}
                          >
                            ${investment.toLocaleString()}
                          </td>
                          
                          {/* High Rate Exchange */}
                          <td className="px-3 py-3 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-medium" style={{ color: COLORS.electricSky }}>
                                {opportunity.exchangeHigh}
                              </span>
                              <span className="text-xs" style={{ color: COLORS.electricSky + '80' }}>
                                {(opportunity.binanceFundingRate * 100).toFixed(4)}%
                              </span>
                            </div>
                          </td>
                          
                          {/* Low Rate Exchange */}
                          <td className="px-3 py-3 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-medium" style={{ color: COLORS.emeraldGreen }}>
                                {opportunity.exchangeLow}
                              </span>
                              <span className="text-xs" style={{ color: COLORS.emeraldGreen + '80' }}>
                                {(opportunity.krakenFundingRate * 100).toFixed(4)}%
                              </span>
                            </div>
                          </td>
                          
                          {/* Volume High */}
                          <td className="px-3 py-3 text-right">
                            <span style={{ color: COLORS.neutral }}>
                              ${(opportunity.volumeHigh / 1e6).toFixed(1)}M
                            </span>
                          </td>
                          
                          {/* Volume Low */}
                          <td className="px-3 py-3 text-right">
                            <span style={{ color: COLORS.neutral }}>
                              ${(opportunity.volumeLow / 1e6).toFixed(1)}M
                            </span>
                          </td>
                          
                          {/* Open Interest High */}
                          <td className="px-3 py-3 text-right">
                            <span style={{ color: COLORS.neutral }}>
                              ${(opportunity.openInterestHigh / 1e6).toFixed(1)}M
                            </span>
                          </td>
                          
                          {/* Open Interest Low */}
                          <td className="px-3 py-3 text-right">
                            <span style={{ color: COLORS.neutral }}>
                              ${(opportunity.openInterestLow / 1e6).toFixed(1)}M
                            </span>
                          </td>
                          
                          {/* 8H Spread */}
                          <td className="px-3 py-3 text-right">
                            <span 
                              className="font-bold"
                              style={{ 
                                color: opportunity.arbitrageOpportunity > 0.005 ? COLORS.sunsetEmber : 
                                       opportunity.arbitrageOpportunity > 0.001 ? COLORS.electricSky : COLORS.emeraldGreen
                              }}
                            >
                              {(opportunity.arbitrageOpportunity * 100).toFixed(4)}%
                            </span>
                          </td>
                          
                          {/* Annual % */}
                          <td className="px-3 py-3 text-right">
                            <span 
                              className="font-bold"
                              style={{ 
                                color: annualReturn > 50 ? COLORS.sunsetEmber : 
                                       annualReturn > 10 ? COLORS.electricSky : COLORS.emeraldGreen
                              }}
                            >
                              {annualReturn.toFixed(1)}%
                            </span>
                          </td>
                          
                          {/* Direction */}
                          <td className="px-3 py-3 text-center">
                            <span 
                              className="text-xs px-2 py-1 rounded-full"
                              style={{ 
                                backgroundColor: COLORS.emeraldGreen + '20',
                                color: COLORS.emeraldGreen
                              }}
                            >
                              {opportunity.direction.split(',')[0]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Data Methodology Explanation */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div 
          className="rounded-lg p-6 border"
          style={{ 
            backgroundColor: COLORS.surface,
            borderColor: COLORS.deepIndigo + '30'
          }}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2" style={{ color: COLORS.electricSky }}>
            <Info className="h-5 w-5" />
            <span>Data Methodology & Explanations</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Volume Data Explanation */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: COLORS.sunsetEmber }}>
                📊 Volume Data (High/Low)
              </h3>
              <div className="space-y-2 text-sm" style={{ color: COLORS.neutral }}>
                <p>
                  <strong>Volume High/Low are estimated</strong> based on exchange market share:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Volume High:</strong> Total 24h volume × High-rate exchange market share</li>
                  <li><strong>Volume Low:</strong> Total 24h volume × Low-rate exchange market share</li>
                  <li><strong>Market Shares:</strong> OKX (25%), Bybit (20%), dYdX (12%), Bitget (10%), etc.</li>
                </ul>
                <p className="mt-2 text-xs" style={{ color: COLORS.neutral + '80' }}>
                  <em>Example: If BADGER has $45M total volume and arbitrage is between Bybit (20%) and dYdX (12%), 
                  then Volume High = $9M, Volume Low = $5.4M</em>
                </p>
              </div>
            </div>

            {/* Open Interest Explanation */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: COLORS.sunsetEmber }}>
                🎯 Open Interest Data
              </h3>
              <div className="space-y-2 text-sm" style={{ color: COLORS.neutral }}>
                <p>
                  <strong>Open Interest sources</strong> (in priority order):
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>1st:</strong> CoinGlass API (real data for top symbols)</li>
                  <li><strong>2nd:</strong> CoinGecko derivatives data</li>
                  <li><strong>3rd:</strong> Estimated as 40% of daily volume</li>
                </ul>
                <p className="mt-2 text-xs" style={{ color: COLORS.neutral + '80' }}>
                  <em>OI High/Low calculated using same market share methodology as volume</em>
                </p>
              </div>
            </div>

            {/* Funding Rates Explanation */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: COLORS.sunsetEmber }}>
                ⚡ Funding Rate Data
              </h3>
              <div className="space-y-2 text-sm" style={{ color: COLORS.neutral }}>
                <p>
                  <strong>Funding rates are real-time</strong> from CoinGlass API:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Source:</strong> CoinGlass v4 API (premium data)</li>
                  <li><strong>Coverage:</strong> 828+ symbols across 17 exchanges</li>
                  <li><strong>Update Frequency:</strong> Every 8 hours (00:00, 08:00, 16:00 UTC)</li>
                  <li><strong>Accuracy:</strong> Direct from exchange APIs</li>
                </ul>
              </div>
            </div>

            {/* Arbitrage Calculations */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: COLORS.sunsetEmber }}>
                🔄 Arbitrage Calculations
              </h3>
              <div className="space-y-2 text-sm" style={{ color: COLORS.neutral }}>
                <p>
                  <strong>How spreads are calculated:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>8H Spread:</strong> |Highest Rate - Lowest Rate|</li>
                  <li><strong>Annual %:</strong> 8H Spread × 3 × 365 (3 funding periods/day)</li>
                  <li><strong>Direction:</strong> Long low-rate exchange, Short high-rate exchange</li>
                </ul>
                <p className="mt-2 text-xs" style={{ color: COLORS.neutral + '80' }}>
                  <em>Example: BADGER 32% spread = 32% every 8 hours = 351% annually</em>
                </p>
              </div>
            </div>
          </div>

          {/* Data Sources Summary */}
          <div className="mt-6 pt-4 border-t" style={{ borderColor: COLORS.deepIndigo + '20' }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: COLORS.electricSky }}>
              📡 Data Sources Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.emeraldGreen }}></div>
                <span style={{ color: COLORS.neutral }}>
                  <strong>Funding Rates:</strong> CoinGlass (Real-time)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.sunsetEmber }}></div>
                <span style={{ color: COLORS.neutral }}>
                  <strong>Volume:</strong> CoinGecko + CoinLore (Estimated)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.electricSky }}></div>
                <span style={{ color: COLORS.neutral }}>
                  <strong>Open Interest:</strong> Mixed (Real + Estimated)
                </span>
              </div>
            </div>
          </div>

          {/* Important Disclaimers */}
          <div className="mt-6 pt-4 border-t" style={{ borderColor: COLORS.deepIndigo + '20' }}>
            <div 
              className="p-4 rounded-lg border-l-4"
              style={{ 
                backgroundColor: COLORS.sunsetEmber + '10',
                borderColor: COLORS.sunsetEmber
              }}
            >
              <h4 className="font-semibold mb-2" style={{ color: COLORS.sunsetEmber }}>
                ⚠️ Important Disclaimers
              </h4>
              <ul className="text-sm space-y-1" style={{ color: COLORS.neutral }}>
                <li>• <strong>Volume/OI estimates</strong> are approximations based on market share - not exact exchange data</li>
                <li>• <strong>Actual arbitrage capacity</strong> may be lower due to liquidity constraints</li>
                <li>• <strong>Funding rates change</strong> every 8 hours - timing is critical</li>
                <li>• <strong>Transaction costs</strong> (fees, slippage) not included in calculations</li>
                <li>• <strong>Market conditions</strong> can change rapidly - always verify before trading</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Navigation Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
        {/* Quick Nav Menu */}
        <div className="flex flex-col space-y-2 opacity-80 hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              try {
                window.location.href = '/?tab=analysis';
              } catch (error) {
                console.error('Navigation error:', error);
                window.location.assign('/?tab=analysis');
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 text-sm"
            style={{ 
              backgroundColor: COLORS.sunsetEmber,
              color: COLORS.white,
              boxShadow: `0 4px 15px ${COLORS.sunsetEmber}30`
            }}
          >
            <Building2 className="h-4 w-4" />
            <span>Research</span>
          </button>
          
          <button
            onClick={() => {
              try {
                window.location.href = '/?tab=gainers-losers';
              } catch (error) {
                console.error('Navigation error:', error);
                window.location.assign('/?tab=gainers-losers');
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 text-sm"
            style={{ 
              backgroundColor: COLORS.electricSky,
              color: COLORS.white,
              boxShadow: `0 4px 15px ${COLORS.electricSky}30`
            }}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Market</span>
          </button>
        </div>
        
        {/* Primary Back Button */}
        <button
          onClick={() => {
            try {
              window.location.href = '/';
            } catch (error) {
              console.error('Navigation error:', error);
              window.location.assign('/');
            }
          }}
          className="flex items-center space-x-2 px-6 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          style={{ 
            backgroundColor: COLORS.sandstone,
            color: COLORS.background,
            boxShadow: `0 8px 25px ${COLORS.sandstone}40`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 12px 35px ${COLORS.sandstone}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 8px 25px ${COLORS.sandstone}40`;
          }}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="font-medium">Back to Home</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t mt-8" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.deepIndigo }}>
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="text-center text-xs sm:text-sm" style={{ color: COLORS.neutral }}>
            Funding Rate Arbitrage Dashboard • Powered by <span className="font-medium">Coinglass API</span> • 
            Created by <span className="font-medium">Aleksander Biesaga</span> for <span className="font-medium">Teroxx Team</span>
          </div>
        </div>
      </footer>
    </div>
  );
}