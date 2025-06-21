'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Check, 
  X,
  ChevronDown,
  Settings
} from 'lucide-react';
import { COLORS } from '@/config/constants';

// Available exchanges
const ALL_EXCHANGES = [
  'Binance', 'OKX', 'dYdX', 'Bybit', 'Vertex', 'Bitget', 'CoinEx', 
  'Bitfinex', 'Kraken', 'HTX', 'BingX', 'Gate', 'Crypto.com', 
  'Coinbase', 'Hyperliquid', 'Bitunix', 'MEXC', 'WhiteBIT'
];

interface ExchangeSelectorProps {
  selectedExchanges: string[];
  onExchangeUpdate: (exchanges: string[]) => void;
}

export default function ExchangeSelector({ selectedExchanges, onExchangeUpdate }: ExchangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedExchanges);

  useEffect(() => {
    setTempSelected(selectedExchanges);
  }, [selectedExchanges]);

  const handleToggleExchange = (exchange: string) => {
    setTempSelected(prev => {
      if (prev.includes(exchange)) {
        return prev.filter(ex => ex !== exchange);
      } else {
        return [...prev, exchange];
      }
    });
  };

  const handleSelectAll = () => {
    setTempSelected(ALL_EXCHANGES);
  };

  const handleClearAll = () => {
    setTempSelected([]);
  };

  const handleApply = () => {
    onExchangeUpdate(tempSelected);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempSelected(selectedExchanges);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Exchange Selection Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 rounded-lg border transition-colors"
        style={{ 
          backgroundColor: COLORS.surface,
          borderColor: COLORS.deepIndigo,
          color: COLORS.sandstone
        }}
      >
        <div className="flex items-center space-x-3">
          <Building2 className="h-5 w-5" style={{ color: COLORS.electricSky }} />
          <div className="text-left">
            <div className="font-medium">Exchange Selection</div>
            <div className="text-sm" style={{ color: COLORS.neutral }}>
              {selectedExchanges.length} of {ALL_EXCHANGES.length} exchanges selected
            </div>
          </div>
        </div>
        <ChevronDown 
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: COLORS.neutral }}
        />
      </button>

      {/* Exchange Selection Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 rounded-lg border shadow-xl z-50"
          style={{ 
            backgroundColor: COLORS.surface,
            borderColor: COLORS.deepIndigo
          }}
        >
          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: COLORS.deepIndigo }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold" style={{ color: COLORS.sandstone }}>
                Select Exchanges
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{ 
                    backgroundColor: COLORS.electricSky + '20',
                    color: COLORS.electricSky
                  }}
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{ 
                    backgroundColor: COLORS.sunsetEmber + '20',
                    color: COLORS.sunsetEmber
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>
            <p className="text-sm" style={{ color: COLORS.neutral }}>
              Select which exchanges to include in funding rate arbitrage analysis
            </p>
          </div>

          {/* Exchange Grid */}
          <div className="p-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {ALL_EXCHANGES.map((exchange) => (
                <button
                  key={exchange}
                  onClick={() => handleToggleExchange(exchange)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    tempSelected.includes(exchange) ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: tempSelected.includes(exchange) 
                      ? COLORS.electricSky + '20' 
                      : COLORS.deepIndigo + '30',
                    borderColor: tempSelected.includes(exchange) 
                      ? COLORS.electricSky 
                      : COLORS.deepIndigo,
                    ...(tempSelected.includes(exchange) && {
                      '--tw-ring-color': COLORS.electricSky
                    } as React.CSSProperties)
                  }}
                >
                  <span 
                    className="text-sm font-medium"
                    style={{ 
                      color: tempSelected.includes(exchange) 
                        ? COLORS.electricSky 
                        : COLORS.neutral 
                    }}
                  >
                    {exchange}
                  </span>
                  {tempSelected.includes(exchange) && (
                    <Check className="h-4 w-4" style={{ color: COLORS.electricSky }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: COLORS.deepIndigo }}>
            <div className="text-sm" style={{ color: COLORS.neutral }}>
              {tempSelected.length} exchanges selected
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ 
                  backgroundColor: COLORS.deepIndigo,
                  color: COLORS.neutral
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={tempSelected.length === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: COLORS.electricSky,
                  color: COLORS.white
                }}
              >
                Apply Selection
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 