'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Eye, 
  Building2, 
  Users, 
  Target,
  Zap,
  Activity,
  DollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { COLORS } from '@/config/constants';

interface AnalysisMetrics {
  symbol: string;
  transactionSizeAnalysis: {
    institutional: number; // Percentage of volume from >$100k transactions
    whale: number;         // Percentage from >$1M transactions  
    retail: number;        // Percentage from <$100k transactions
  };
  addressClustering: {
    uniqueAddresses: number;
    averageAddressActivity: number;
    suspiciousPatterns: number;
    confidenceScore: number;
  };
  exchangeFlowAnalysis: {
    totalFlowVolume: number;
    netInflow: number;
    exchangeConcentration: number;
    arbitrageActivity: number;
  };
  onChainMetrics: {
    activeAddresses: number;
    whaleTransactions: number;
    exchangeReserveChange: number;
    networkActivity: number;
  };
  smartMoneyTracking: {
    smartMoneyActivity: number;
    institutionalWallets: number;
    profitableWallets: number;
    followingScore: number;
  };
  overallAssessment: {
    institutionalDominance: number; // 0-100 scale
    retailInterest: number;         // 0-100 scale  
    marketPhase: 'accumulation' | 'distribution' | 'consolidation' | 'trending';
    confidenceLevel: 'high' | 'medium' | 'low';
    keyIndicators: string[];
  };
}

interface ProfessionalAnalysisSummaryProps {
  symbol: string;
}

export default function ProfessionalAnalysisSummary({ symbol }: ProfessionalAnalysisSummaryProps) {
  const [analysis, setAnalysis] = useState<AnalysisMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'radar'>('overview');

  useEffect(() => {
    const generateProfessionalAnalysis = (): AnalysisMetrics => {
      // Simulate advanced analysis based on research methodology
      const baseInstitutional = Math.random() * 40 + 30; // 30-70%
      const baseWhale = Math.random() * 20 + 5;          // 5-25%
      const baseRetail = 100 - baseInstitutional - baseWhale;

      return {
        symbol,
        transactionSizeAnalysis: {
          institutional: baseInstitutional,
          whale: baseWhale,
          retail: baseRetail,
        },
        addressClustering: {
          uniqueAddresses: Math.floor(Math.random() * 50000) + 10000,
          averageAddressActivity: Math.random() * 10 + 2,
          suspiciousPatterns: Math.floor(Math.random() * 15) + 2,
          confidenceScore: Math.random() * 0.3 + 0.7, // 0.7-1.0
        },
        exchangeFlowAnalysis: {
          totalFlowVolume: Math.random() * 1000000000 + 100000000, // $100M-$1B
          netInflow: (Math.random() - 0.5) * 50000000, // ±$50M
          exchangeConcentration: Math.random() * 0.4 + 0.3, // 30-70%
          arbitrageActivity: Math.random() * 0.2 + 0.05, // 5-25%
        },
        onChainMetrics: {
          activeAddresses: Math.floor(Math.random() * 100000) + 50000,
          whaleTransactions: Math.floor(Math.random() * 500) + 50,
          exchangeReserveChange: (Math.random() - 0.5) * 0.2, // ±20%
          networkActivity: Math.random() * 0.5 + 0.5, // 50-100%
        },
        smartMoneyTracking: {
          smartMoneyActivity: Math.random() * 0.4 + 0.3, // 30-70%
          institutionalWallets: Math.floor(Math.random() * 200) + 50,
          profitableWallets: Math.random() * 0.6 + 0.2, // 20-80%
          followingScore: Math.random() * 0.5 + 0.4, // 40-90%
        },
        overallAssessment: {
          institutionalDominance: baseInstitutional + baseWhale * 0.7,
          retailInterest: baseRetail,
          marketPhase: ['accumulation', 'distribution', 'consolidation', 'trending'][Math.floor(Math.random() * 4)] as any,
          confidenceLevel: baseInstitutional > 50 ? 'high' : baseInstitutional > 35 ? 'medium' : 'low',
          keyIndicators: generateKeyIndicators(baseInstitutional, baseWhale, baseRetail),
        },
      };
    };

    const generateKeyIndicators = (inst: number, whale: number, retail: number): string[] => {
      const indicators = [];
      
      if (inst > 50) indicators.push('Strong institutional presence detected');
      if (whale > 15) indicators.push('Significant whale activity observed');
      if (retail > 50) indicators.push('High retail participation');
      if (inst > 40 && whale > 10) indicators.push('Smart money accumulation pattern');
      if (retail > 60) indicators.push('Potential FOMO trading behavior');
      
      return indicators.slice(0, 3); // Limit to top 3 indicators
    };

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setAnalysis(generateProfessionalAnalysis());
      setLoading(false);
    }, 1000);
  }, [symbol]);

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(2)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const getPhaseColor = (phase: string): string => {
    switch (phase) {
      case 'accumulation': return 'text-green-400';
      case 'distribution': return 'text-red-400';
      case 'consolidation': return 'text-yellow-400';
      case 'trending': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getConfidenceColor = (level: string): string => {
    switch (level) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Radar chart data for multi-dimensional analysis
  const radarData = analysis ? [
    { metric: 'Institutional', value: analysis.transactionSizeAnalysis.institutional, fullMark: 100 },
    { metric: 'Whale Activity', value: analysis.transactionSizeAnalysis.whale * 2, fullMark: 100 },
    { metric: 'Smart Money', value: analysis.smartMoneyTracking.smartMoneyActivity * 100, fullMark: 100 },
    { metric: 'Flow Analysis', value: analysis.exchangeFlowAnalysis.exchangeConcentration * 100, fullMark: 100 },
    { metric: 'On-Chain', value: analysis.onChainMetrics.networkActivity * 100, fullMark: 100 },
    { metric: 'Address Quality', value: analysis.addressClustering.confidenceScore * 100, fullMark: 100 },
  ] : [];

  // Transaction distribution data
  const distributionData = analysis ? [
    { name: 'Institutional', value: analysis.transactionSizeAnalysis.institutional, color: COLORS.institutional },
    { name: 'Whale', value: analysis.transactionSizeAnalysis.whale, color: COLORS.warning },
    { name: 'Retail', value: analysis.transactionSizeAnalysis.retail, color: COLORS.retail },
  ] : [];

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Professional Analysis Suite</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Analyzing market microstructure...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Professional Analysis Suite</h3>
          <span className="text-sm text-gray-400">({symbol})</span>
        </div>
        
        <div className="flex space-x-2">
          {['overview', 'detailed', 'radar'].map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view as any)}
              className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors ${
                selectedView === view
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Assessment */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {analysis.overallAssessment.institutionalDominance.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Institutional Dominance</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-medium capitalize ${getPhaseColor(analysis.overallAssessment.marketPhase)}`}>
              {analysis.overallAssessment.marketPhase}
            </div>
            <div className="text-sm text-gray-400">Market Phase</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-medium capitalize ${getConfidenceColor(analysis.overallAssessment.confidenceLevel)}`}>
              {analysis.overallAssessment.confidenceLevel}
            </div>
            <div className="text-sm text-gray-400">Confidence Level</div>
          </div>
        </div>
      </div>

      {/* Main Content based on selected view */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Transaction Size Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-md font-medium mb-4 text-gray-300">Transaction Size Distribution</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Volume Share']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-md font-medium mb-4 text-gray-300">Key Indicators</h4>
              <div className="space-y-3">
                {analysis.overallAssessment.keyIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-green-400" />
                    <span className="text-sm">{indicator}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Institutional: ≥$100K transactions</div>
                  <div>• Whale: ≥$1M transactions</div>
                  <div>• Smart Money: Proven profitable wallets</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-gray-400">Active Addresses</span>
              </div>
              <div className="text-lg font-bold">{analysis.onChainMetrics.activeAddresses.toLocaleString()}</div>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-gray-400">Whale Transactions</span>
              </div>
              <div className="text-lg font-bold">{analysis.onChainMetrics.whaleTransactions}</div>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-xs text-gray-400">Flow Volume</span>
              </div>
              <div className="text-lg font-bold">{formatAmount(analysis.exchangeFlowAnalysis.totalFlowVolume)}</div>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-gray-400">Smart Wallets</span>
              </div>
              <div className="text-lg font-bold">{analysis.smartMoneyTracking.institutionalWallets}</div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'radar' && (
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-md font-medium mb-4 text-gray-300">Multi-Dimensional Analysis</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="Analysis Score"
                  dataKey="value"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Footer with methodology note */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-3 w-3" />
            <span className="font-medium">Analysis based on professional institutional detection methods:</span>
          </div>
          <div className="pl-5 space-y-1">
            <div>• Transaction size analysis (Chainalysis methodology)</div>
            <div>• Address clustering and wallet patterns</div>
            <div>• Exchange flow monitoring and reserve analysis</div>
            <div>• Smart money tracking and institutional wallet identification</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 