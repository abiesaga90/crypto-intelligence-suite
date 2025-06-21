'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';
import { COLORS } from '@/config/constants';

interface InvestmentCalculatorProps {
  totalInvestment: number;
  setTotalInvestment: (amount: number) => void;
}

export default function InvestmentCalculator({ totalInvestment, setTotalInvestment }: InvestmentCalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [holdingPeriod, setHoldingPeriod] = useState(7); // days
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');

  // Sample calculation based on mock arbitrage opportunity
  const sampleArbitrageRate = 0.0175; // 1.75% funding rate difference
  const fundingPeriodsPerDay = 3; // 8-hour funding periods
  const dailyReturn = sampleArbitrageRate * fundingPeriodsPerDay;
  const projectedReturn = totalInvestment * dailyReturn * holdingPeriod;

  const riskMultipliers = {
    low: 0.5,
    medium: 1.0,
    high: 1.5
  };

  const adjustedReturn = projectedReturn * riskMultipliers[riskTolerance];

  return (
    <div className="rounded-lg" style={{ backgroundColor: COLORS.surface }}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between border-b"
        style={{ borderColor: COLORS.deepIndigo }}
      >
        <div className="flex items-center space-x-3">
          <Calculator className="h-5 w-5" style={{ color: COLORS.electricSky }} />
          <div className="text-left">
            <h3 className="font-semibold" style={{ color: COLORS.sandstone }}>
              Investment Calculator
            </h3>
            <p className="text-sm" style={{ color: COLORS.neutral }}>
              Calculate potential arbitrage returns
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold" style={{ color: COLORS.electricSky }}>
            ${adjustedReturn.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs" style={{ color: COLORS.neutral }}>
            {holdingPeriod}-day projection
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 space-y-4"
        >
          {/* Investment Amount */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.sandstone }}>
              Total Investment Pool
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: COLORS.neutral }} />
              <input
                type="number"
                value={totalInvestment}
                onChange={(e) => setTotalInvestment(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-opacity-50"
                                 style={{ 
                   backgroundColor: COLORS.deepIndigo + '30',
                   borderColor: COLORS.deepIndigo,
                   color: COLORS.sandstone
                 }}
                placeholder="100000"
              />
            </div>
          </div>

          {/* Holding Period */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.sandstone }}>
              Holding Period (Days)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: COLORS.neutral }} />
              <input
                type="number"
                value={holdingPeriod}
                onChange={(e) => setHoldingPeriod(Number(e.target.value))}
                min="1"
                max="30"
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: COLORS.deepIndigo + '30',
                  borderColor: COLORS.deepIndigo,
                  color: COLORS.sandstone
                }}
              />
            </div>
          </div>

          {/* Risk Tolerance */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.sandstone }}>
              Risk Tolerance
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((risk) => (
                <button
                  key={risk}
                  onClick={() => setRiskTolerance(risk)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    riskTolerance === risk ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: riskTolerance === risk 
                      ? COLORS.electricSky + '20' 
                      : COLORS.deepIndigo + '30',
                    color: riskTolerance === risk 
                      ? COLORS.electricSky 
                      : COLORS.neutral,
                    borderColor: COLORS.deepIndigo,
                    ...(riskTolerance === risk && {
                      '--tw-ring-color': COLORS.electricSky
                    } as React.CSSProperties)
                  }}
                >
                  {risk.charAt(0).toUpperCase() + risk.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Calculation Details */}
          <div className="space-y-3">
            <h4 className="font-medium" style={{ color: COLORS.sandstone }}>
              Calculation Details
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div style={{ color: COLORS.neutral }}>Sample Rate Diff:</div>
                <div className="font-medium" style={{ color: COLORS.electricSky }}>
                  {(sampleArbitrageRate * 100).toFixed(3)}%
                </div>
              </div>
              <div>
                <div style={{ color: COLORS.neutral }}>Daily Periods:</div>
                <div className="font-medium" style={{ color: COLORS.sandstone }}>
                  {fundingPeriodsPerDay}
                </div>
              </div>
              <div>
                <div style={{ color: COLORS.neutral }}>Daily Return:</div>
                <div className="font-medium text-green-400">
                  {(dailyReturn * 100).toFixed(4)}%
                </div>
              </div>
              <div>
                <div style={{ color: COLORS.neutral }}>Risk Multiplier:</div>
                <div className="font-medium" style={{ color: COLORS.sunsetEmber }}>
                  {riskMultipliers[riskTolerance]}x
                </div>
              </div>
            </div>
          </div>

          {/* Risk Warning */}
          <div 
            className="p-3 rounded-lg border"
            style={{ 
              backgroundColor: COLORS.sunsetEmber + '10',
              borderColor: COLORS.sunsetEmber + '50'
            }}
          >
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: COLORS.sunsetEmber }} />
              <div className="text-xs" style={{ color: COLORS.neutral }}>
                <div className="font-medium mb-1" style={{ color: COLORS.sunsetEmber }}>
                  Risk Disclaimer
                </div>
                These calculations are projections based on current market conditions. 
                Funding rates can change rapidly, and arbitrage opportunities may not persist. 
                Always consider market volatility and execution risks.
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-3 border-t" style={{ borderColor: COLORS.deepIndigo }}>
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: COLORS.electricSky }}>
                {((adjustedReturn / totalInvestment) * 100).toFixed(2)}%
              </div>
              <div className="text-xs" style={{ color: COLORS.neutral }}>
                Total Return
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: COLORS.sandstone }}>
                {(((adjustedReturn / totalInvestment) / holdingPeriod) * 100).toFixed(3)}%
              </div>
              <div className="text-xs" style={{ color: COLORS.neutral }}>
                Daily Avg
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {(((adjustedReturn / totalInvestment) * (365 / holdingPeriod)) * 100).toFixed(1)}%
              </div>
              <div className="text-xs" style={{ color: COLORS.neutral }}>
                Annualized
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 