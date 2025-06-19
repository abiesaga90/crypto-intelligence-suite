'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, Info } from 'lucide-react';
import { COLORS } from '@/config/constants';

interface LiquidationTrackerProps {
  symbol: string;
}

export default function LiquidationTracker({ symbol }: LiquidationTrackerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="h-5 w-5 text-orange-500" />
        <h3 className="text-lg font-semibold">Liquidation Tracker</h3>
        <span className="text-sm text-gray-400">({symbol})</span>
      </div>
      <div className="text-center text-yellow-400 p-8">
        <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
        <p className="text-lg font-semibold mb-2">CoinGlass Professional+ Required</p>
        <p className="text-sm text-gray-400 mb-4">
          Liquidation tracking requires CoinGlass Professional+ plan for real-time data access.
        </p>
        <div className="mt-4 text-sm text-gray-400">
          <Info className="h-4 w-4 inline mr-1" />
          Currently using free APIs only (CoinGecko + Binance)
        </div>
        <div className="mt-6 bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-orange-400 mb-2">Alternative Analysis Available:</h4>
          <p className="text-xs text-gray-300">
            • Market overview with real-time prices<br/>
            • Retail vs Institutional behavior analysis<br/>
            • Volume and volatility patterns<br/>
            • Order book depth analysis
          </p>
        </div>
      </div>
    </motion.div>
  );
} 