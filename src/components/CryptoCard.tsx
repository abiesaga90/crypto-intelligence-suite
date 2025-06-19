'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Building2, Activity, Zap } from 'lucide-react';
import { COLORS } from '@/config/constants';

interface CryptoCardProps {
  analysis: {
    symbol: string;
    timestamp: number;
    analysis: {
      dominantType: 'retail' | 'institutional' | 'mixed';
      confidence: number;
      signals: {
        retailSignals: number;
        institutionalSignals: number;
        neutralSignals: number;
      };
      summary: string;
    };
    rawData: any;
  };
}

export default function CryptoCard({ analysis }: CryptoCardProps) {
  const { symbol, analysis: analysisData } = analysis;
  const { dominantType, confidence, signals } = analysisData;

  const getDominantColor = () => {
    switch (dominantType) {
      case 'retail':
        return COLORS.retail;
      case 'institutional':
        return COLORS.institutional;
      default:
        return COLORS.neutral;
    }
  };

  const getDominantIcon = () => {
    switch (dominantType) {
      case 'retail':
        return <Users className="h-5 w-5" />;
      case 'institutional':
        return <Building2 className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const formatConfidence = (conf: number) => {
    return Math.round(conf * 100);
  };

  const getConfidenceColor = (conf: number) => {
    if (conf > 0.7) return 'text-green-400';
    if (conf > 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getDominantColor() }}
          />
          <h3 className="text-xl font-bold">{symbol}</h3>
        </div>
        <div className="flex items-center space-x-1 text-gray-400">
          <Zap className="h-4 w-4" />
          <span className="text-sm">Live</span>
        </div>
      </div>

      {/* Dominant Type */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <div style={{ color: getDominantColor() }}>
            {getDominantIcon()}
          </div>
          <span className="font-medium capitalize" style={{ color: getDominantColor() }}>
            {dominantType === 'mixed' ? 'Mixed Signals' : `${dominantType} Dominant`}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Confidence:</span>
          <span className={`font-medium ${getConfidenceColor(confidence)}`}>
            {formatConfidence(confidence)}%
          </span>
        </div>
      </div>

      {/* Signal Breakdown */}
      <div className="mb-4">
        <h4 className="text-sm text-gray-400 mb-2">Signal Analysis</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-sm">Retail Signals</span>
            </div>
            <span className="text-blue-400 font-medium">{signals.retailSignals}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-purple-400" />
              <span className="text-sm">Institutional Signals</span>
            </div>
            <span className="text-purple-400 font-medium">{signals.institutionalSignals}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Neutral Signals</span>
            </div>
            <span className="text-gray-400 font-medium">{signals.neutralSignals}</span>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div 
              className="bg-blue-500"
              style={{ 
                width: `${(signals.retailSignals / (signals.retailSignals + signals.institutionalSignals + signals.neutralSignals)) * 100}%` 
              }}
            />
            <div 
              className="bg-purple-500"
              style={{ 
                width: `${(signals.institutionalSignals / (signals.retailSignals + signals.institutionalSignals + signals.neutralSignals)) * 100}%` 
              }}
            />
            <div 
              className="bg-gray-500"
              style={{ 
                width: `${(signals.neutralSignals / (signals.retailSignals + signals.institutionalSignals + signals.neutralSignals)) * 100}%` 
              }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Retail</span>
          <span>Mixed</span>
          <span>Institutional</span>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-300 border-t border-gray-700 pt-3">
        {analysisData.summary}
      </div>

      {/* Timestamp */}
      <div className="text-xs text-gray-500 mt-3">
        Last updated: {new Date(analysis.timestamp).toLocaleTimeString()}
      </div>
    </motion.div>
  );
} 