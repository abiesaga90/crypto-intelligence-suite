// API Configuration for CoinGlass HOBBYIST Plan
export const API_CONFIG = {
  coinglass: {
    baseUrl: 'https://open-api-v4.coinglass.com',
    apiKey: '69b7bf7628254ebabab13a1ff717c6ea',
    endpoints: {
      // MARKET DATA ENDPOINTS (Available to Hobbyist)
      supportedCoins: '/api/futures/supported-coins',
      supportedExchanges: '/api/futures/supported-exchange-pairs',
      coinsMarkets: '/api/futures/coins-markets',
      pairsMarkets: '/api/futures/pairs-markets',
      coinsPriceChange: '/api/futures/coins-price-change',
      priceHistory: '/api/futures/price-history',
      
      // LIQUIDATION ENDPOINTS (Available to Hobbyist with ≥4h intervals)
      liquidationPairHistory: '/api/futures/liquidation/history',
      liquidationCoinHistory: '/api/futures/liquidation/coin-history',
      liquidationCoinList: '/api/futures/liquidation/coin-list',
      liquidationExchangeList: '/api/futures/liquidation/exchange-list',
      
      // FUNDING RATE ENDPOINTS (Available to Hobbyist)
      fundingRateHistory: '/api/futures/funding-rate/history',
      fundingRateOIWeight: '/api/futures/funding-rate/oi-weight-history',
      fundingRateVolWeight: '/api/futures/funding-rate/vol-weight-history',
      fundingRateExchangeList: '/api/futures/funding-rate/exchange-list',
      
      // LONG-SHORT RATIO ENDPOINTS (Available to Hobbyist)
      longShortGlobalAccount: '/api/futures/long-short-ratio/global-account',
      longShortTopAccount: '/api/futures/long-short-ratio/top-account-history',
      longShortTopPosition: '/api/futures/long-short-ratio/top-position-history',
      
      // TAKER BUY/SELL ENDPOINTS (Available to Hobbyist)
      takerBuySellPairHistory: '/api/futures/taker-buy-sell/pair-history',
      takerBuySellCoinHistory: '/api/futures/taker-buy-sell/coin-history',
      
      // OPEN INTEREST ENDPOINTS (Available to Hobbyist)
      openInterestHistory: '/api/futures/open-interest/history',
      openInterestAggregatedHistory: '/api/futures/open-interest/aggregated-history',
      openInterestExchangeList: '/api/futures/open-interest/exchange-list',
    },
    
    // Rate limiting for HOBBYIST plan
    rateLimit: {
      requestsPerMinute: 30,
      intervalMinimum: '4h', // Minimum interval for liquidation data
    }
  },
  
  // Alternative APIs for market data
  alternatives: {
    coingecko: {
      baseUrl: 'https://api.coingecko.com/api/v3',
      endpoints: {
        coinsList: '/coins/list',
        coinsMarkets: '/coins/markets',
        coinData: '/coins',
        globalData: '/global'
      }
    },
    binance: {
      baseUrl: 'https://api.binance.com/api/v3',
      endpoints: {
        ticker24hr: '/ticker/24hr',
        exchangeInfo: '/exchangeInfo'
      }
    }
  }
};

// Application Constants
export const APP_CONFIG = {
  updateInterval: 60000, // 60 seconds (respecting rate limits)
  maxCoins: 30,
  refreshInterval: {
    fastUpdate: 60000,   // 1 minute (conservative for hobbyist plan)
    normalUpdate: 120000, // 2 minutes 
    slowUpdate: 300000,   // 5 minutes
  },
  pagination: {
    coinsPerPage: 10,
  },
  charts: {
    defaultTimeframe: '24h',
    candlestickInterval: '4h', // Respecting hobbyist plan limitations
  }
};

// Color schemes for the Teroxx Terminal dashboard
export const COLORS = {
  // Teroxx Brand Colors
  nightblue: '#010626',      // Nightblue - primary dark
  electricSky: '#0b688c',    // Electric Sky - primary accent  
  sandstone: '#bfb3a8',      // Sandstone - neutral/text
  sunsetEmber: '#d06643',    // Sunset Ember - warning/accent
  deepIndigo: '#060043',     // Deep Indigo - secondary dark
  white: '#ffffff',          // White
  black: '#000000',          // Black

  // Functional color mapping using Teroxx palette
  primary: '#0b688c',        // Electric Sky
  secondary: '#d06643',      // Sunset Ember  
  success: '#0b688c',        // Electric Sky for success
  warning: '#d06643',        // Sunset Ember for warnings
  error: '#d06643',          // Sunset Ember for errors
  retail: '#d06643',         // Sunset Ember for retail
  institutional: '#0b688c',  // Electric Sky for institutional
  neutral: '#bfb3a8',        // Sandstone for neutral text
  background: '#010626',     // Nightblue for main background
  surface: '#060043',        // Deep Indigo for surfaces
  text: '#bfb3a8',          // Sandstone for main text

  // Chart-specific colors using Teroxx palette
  chart: {
    grid: '#bfb3a8',         // Sandstone for grid lines
    text: '#bfb3a8',         // Sandstone for chart text
    axis: '#bfb3a8',         // Sandstone for axis
    background: '#060043',   // Deep Indigo for chart backgrounds
    retail: '#d06643',       // Sunset Ember for retail data
    institutional: '#0b688c', // Electric Sky for institutional data
    positive: '#0b688c',     // Electric Sky for positive values
    negative: '#d06643',     // Sunset Ember for negative values
    neutral: '#bfb3a8'       // Sandstone for neutral values
  }
};

// TOP 30 CRYPTOCURRENCIES for analysis
export const TOP_CRYPTOS = [
  'BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'LINK', 'DOT', 'UNI',
  'LTC', 'BCH', 'NEAR', 'APT', 'ARB', 'OP', 'MATIC', 'ICP', 'VET', 'FIL',
  'TRX', 'ATOM', 'LDO', 'MKR', 'AAVE', 'CRV', 'SNX', 'COMP', 'SUSHI', 'YFI'
];

// Exchange names mapping (focusing on those with good CoinGlass coverage)
export const EXCHANGE_NAMES = {
  binance: 'Binance',
  okx: 'OKX', 
  bybit: 'Bybit',
  coinbase: 'Coinbase',
  kraken: 'Kraken',
  bitget: 'Bitget',
  bitmex: 'BitMEX',
  deribit: 'Deribit',
};

// Timeframe options (respecting hobbyist plan limitations)
export const TIMEFRAMES = [
  { label: '4H', value: '4h', minutes: 240, available: true },
  { label: '1D', value: '1d', minutes: 1440, available: true },
  { label: '7D', value: '7d', minutes: 10080, available: true },
  { label: '30D', value: '30d', minutes: 43200, available: true },
];

// Metrics for retail vs institutional analysis
export const ANALYSIS_METRICS = {
  // Strong indicators of retail activity
  RETAIL_INDICATORS: [
    'high_liquidation_ratio',      // Retail gets liquidated more
    'funding_rate_divergence',     // Retail often on wrong side
    'small_position_concentration', // Many small positions
    'momentum_chasing',            // FOMO buying/selling
  ],
  
  // Strong indicators of institutional activity  
  INSTITUTIONAL_INDICATORS: [
    'large_open_interest',         // Big positions
    'low_funding_rate_impact',     // Less emotional trading
    'strategic_accumulation',      // Gradual position building
    'cross_exchange_arbitrage',    // Sophisticated strategies
  ],
  
  // Mixed/unclear signals
  MIXED_INDICATORS: [
    'balanced_long_short',         // Could be either
    'normal_volume_patterns',      // Regular trading activity
  ]
};

// Data categories for filtering and organization
export const DATA_CATEGORIES = {
  MARKET_DATA: 'market_data',
  OPEN_INTEREST: 'open_interest', 
  LIQUIDATIONS: 'liquidations',
  FUNDING_RATES: 'funding_rates',
  LONG_SHORT_RATIO: 'long_short_ratio',
  SENTIMENT: 'sentiment',
  VOLUME_ANALYSIS: 'volume_analysis',
};

// Error messages for better UX
export const ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please wait before making more requests.',
  INTERVAL_TOO_SMALL: 'Hobbyist plan supports ≥4h intervals only',
  API_ERROR: 'Unable to fetch data. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_SYMBOL: 'Invalid cryptocurrency symbol.',
  NO_DATA_AVAILABLE: 'No data available for the selected timeframe.',
  ENDPOINT_NOT_AVAILABLE: 'This feature requires CoinGlass Professional+ plan'
};

// Valid intervals for HOBBYIST plan
export const VALID_INTERVALS = ['4h', '12h', '1d', '3d', '1w', '1M'];

// Chart configuration
export const CHART_CONFIG = {
  animation: {
    duration: 1000,
    easing: 'ease-in-out'
  },
  responsive: true,
  maintainAspectRatio: false,
  defaultHeight: 400
};

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  realtime: 30000,    // 30 seconds for real-time components
  dashboard: 120000,  // 2 minutes for main dashboard
  charts: 300000,     // 5 minutes for charts
  markets: 60000      // 1 minute for market data
};

// Analysis scoring weights
export const ANALYSIS_WEIGHTS = {
  liquidationRatio: 0.4,    // 40% weight on liquidation patterns
  fundingRate: 0.3,         // 30% weight on funding rates
  longShortRatio: 0.2,      // 20% weight on long/short ratios
  takerBuySell: 0.1         // 10% weight on taker buy/sell
};

// Confidence thresholds for analysis
export const CONFIDENCE_THRESHOLDS = {
  high: 0.8,    // 80%+ confidence
  medium: 0.6,  // 60-80% confidence
  low: 0.4      // 40-60% confidence
};

export default {
  API_CONFIG,
  APP_CONFIG,
  COLORS,
  TOP_CRYPTOS,
  EXCHANGE_NAMES,
  TIMEFRAMES,
  ANALYSIS_METRICS,
  DATA_CATEGORIES,
  ERROR_MESSAGES,
  VALID_INTERVALS,
  CHART_CONFIG,
  REFRESH_INTERVALS,
  ANALYSIS_WEIGHTS,
  CONFIDENCE_THRESHOLDS,
}; 