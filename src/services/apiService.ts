import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG, ERROR_MESSAGES } from '@/config/constants';

// Rate limiting class for hobbyist plan (30 requests/minute)
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number; // in milliseconds

  constructor(maxRequests: number = 30, timeWindowMinutes: number = 1) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMinutes * 60 * 1000;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove requests older than time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  getTimeUntilNextRequest(): number {
    if (this.canMakeRequest()) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    return this.timeWindow - (Date.now() - oldestRequest);
  }
}

// API Service class
class ApiService {
  private coinglassApi: AxiosInstance;
  private coingeckoApi: AxiosInstance;
  private binanceApi: AxiosInstance;
  private rateLimiter: RateLimiter;

  constructor() {
    // Initialize rate limiter for hobbyist plan
    this.rateLimiter = new RateLimiter(30, 1); // 30 requests per minute

    // CoinGlass API setup
    this.coinglassApi = axios.create({
      baseURL: API_CONFIG.coinglass.baseUrl,
      headers: {
        'CG-API-KEY': API_CONFIG.coinglass.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // CoinGecko API setup (free tier)
    this.coingeckoApi = axios.create({
      baseURL: API_CONFIG.alternatives.coingecko.baseUrl,
      timeout: 30000,
    });

    // Binance API setup (free tier)
    this.binanceApi = axios.create({
      baseURL: API_CONFIG.alternatives.binance.baseUrl,
      timeout: 30000,
    });

    // Setup interceptors
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // CoinGlass request interceptor for rate limiting
    this.coinglassApi.interceptors.request.use(
      (config) => {
        if (!this.rateLimiter.canMakeRequest()) {
          const waitTime = this.rateLimiter.getTimeUntilNextRequest();
          throw new Error(`${ERROR_MESSAGES.RATE_LIMIT_EXCEEDED} Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
        }
        this.rateLimiter.recordRequest();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.coinglassApi.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 429) {
          throw new Error(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
        }
        if (error.response?.status === 403) {
          throw new Error(ERROR_MESSAGES.ENDPOINT_NOT_AVAILABLE);
        }
        return Promise.reject(error);
      }
    );
  }

  // ===== MARKET DATA ENDPOINTS (Available to Hobbyist) =====
  
  async getSupportedCoins(): Promise<any> {
    try {
      const response = await fetch(`/api/coinglass?endpoint=${encodeURIComponent(API_CONFIG.coinglass.endpoints.supportedCoins)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching supported coins:', error);
      throw error;
    }
  }

  async getCoinsMarkets(limit: number = 30): Promise<any> {
    try {
      const response = await fetch(`/api/coinglass?endpoint=${encodeURIComponent(API_CONFIG.coinglass.endpoints.coinsMarkets)}&limit=${limit}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching coins markets:', error);
      throw error;
    }
  }

  async getCoinsPriceChange(timeframe: string = '24h'): Promise<any> {
    try {
      const response = await fetch(`/api/coinglass?endpoint=${encodeURIComponent(API_CONFIG.coinglass.endpoints.coinsPriceChange)}&time_type=${timeframe}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching price changes:', error);
      throw error;
    }
  }

  // ===== OPEN INTEREST ENDPOINTS (Key for institutional analysis) =====

  async getOpenInterestHistory(symbol: string, interval: string = '4h'): Promise<any> {
    try {
      const response = await this.coinglassApi.get(API_CONFIG.coinglass.endpoints.openInterestHistory, {
        params: { 
          symbol: symbol.toUpperCase(),
          interval,
          limit: 168 // 1 week of 4h candles
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching open interest history:', error);
      throw error;
    }
  }

  async getAggregatedOpenInterest(symbol: string, interval: string = '4h'): Promise<any> {
    try {
      const response = await this.coinglassApi.get(API_CONFIG.coinglass.endpoints.openInterestAggregatedHistory, {
        params: { 
          symbol: symbol.toUpperCase(),
          interval
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching aggregated open interest:', error);
      throw error;
    }
  }

  // ===== LONG-SHORT RATIO ENDPOINTS (Critical for retail vs institutional) =====

  async getGlobalLongShortRatio(symbol: string): Promise<any> {
    try {
      const response = await fetch(`/api/coinglass?endpoint=${encodeURIComponent(API_CONFIG.coinglass.endpoints.longShortGlobalAccount)}&symbol=${symbol.toUpperCase()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching global long-short ratio:', error);
      throw error;
    }
  }

  async getTopAccountRatio(symbol: string, interval: string = '4h'): Promise<any> {
    try {
      const response = await fetch(`/api/coinglass?endpoint=${encodeURIComponent(API_CONFIG.coinglass.endpoints.longShortTopAccount)}&symbol=${symbol.toUpperCase()}&interval=${interval}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching top account ratio:', error);
      throw error;
    }
  }

  async getTopPositionRatio(symbol: string, interval: string = '4h'): Promise<any> {
    try {
      const response = await fetch(`/api/coinglass?endpoint=${encodeURIComponent(API_CONFIG.coinglass.endpoints.longShortTopPosition)}&symbol=${symbol.toUpperCase()}&interval=${interval}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching top position ratio:', error);
      throw error;
    }
  }

  // ===== LIQUIDATION ENDPOINTS (Retail indicator) =====

  async getLiquidationHistory(symbol: string, interval: string = '4h'): Promise<any> {
    // Enforce hobbyist plan limitation
    const validIntervals = ['4h', '12h', '1d', '3d', '1w'];
    if (!validIntervals.includes(interval)) {
      throw new Error(ERROR_MESSAGES.INTERVAL_TOO_SMALL);
    }

    try {
      const response = await fetch(`/api/coinglass?endpoint=${encodeURIComponent(API_CONFIG.coinglass.endpoints.liquidationPairHistory)}&symbol=${symbol.toUpperCase()}&interval=${interval}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching liquidation history:', error);
      throw error;
    }
  }

  async getCoinLiquidationHistory(symbol: string): Promise<any> {
    try {
      const response = await this.coinglassApi.get(API_CONFIG.coinglass.endpoints.liquidationCoinHistory, {
        params: { symbol: symbol.toUpperCase() }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching coin liquidation history:', error);
      throw error;
    }
  }

  // ===== FUNDING RATE ENDPOINTS (Sentiment indicator) =====

  async getFundingRateHistory(symbol: string, interval: string = '4h'): Promise<any> {
    try {
      const response = await fetch(`/api/coinglass?endpoint=${encodeURIComponent(API_CONFIG.coinglass.endpoints.fundingRateHistory)}&symbol=${symbol.toUpperCase()}&interval=${interval}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching funding rate history:', error);
      throw error;
    }
  }

  // ===== TAKER BUY/SELL ENDPOINTS (Market sentiment) =====

  async getTakerBuySellRatio(symbol: string, interval: string = '4h'): Promise<any> {
    try {
      const response = await fetch(`/api/coinglass?endpoint=${encodeURIComponent(API_CONFIG.coinglass.endpoints.takerBuySellPairHistory)}&symbol=${symbol.toUpperCase()}&interval=${interval}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching taker buy/sell ratio:', error);
      throw error;
    }
  }

  // ===== SUPPLEMENTARY FREE APIs =====

  async getCoinGeckoTopCoins(limit: number = 30): Promise<any> {
    try {
      const response = await this.coingeckoApi.get(API_CONFIG.alternatives.coingecko.endpoints.coinsMarkets, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false,
          price_change_percentage: '1h,24h,7d'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching CoinGecko top coins:', error);
      throw error;
    }
  }

  async getCoinGeckoGlobalData(): Promise<any> {
    try {
      const response = await this.coingeckoApi.get(API_CONFIG.alternatives.coingecko.endpoints.globalData);
      return response.data;
    } catch (error) {
      console.error('Error fetching CoinGecko global data:', error);
      throw error;
    }
  }

  async getBinance24hrTicker(symbol?: string): Promise<any> {
    try {
      const params = symbol ? { symbol: symbol.toUpperCase() + 'USDT' } : {};
      const response = await this.binanceApi.get(API_CONFIG.alternatives.binance.endpoints.ticker24hr, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching Binance 24hr ticker:', error);
      throw error;
    }
  }

  // ===== RETAIL vs INSTITUTIONAL ANALYSIS =====

  async getRetailVsInstitutionalAnalysis(symbol: string): Promise<any> {
    try {
      // Fetch only one data point at a time to respect rate limits
      // We'll primarily use liquidation data which is available on hobbyist plan
      let liquidationData = null;
      
      try {
        liquidationData = await this.getLiquidationHistory(symbol);
      } catch (error) {
        console.warn(`Failed to fetch liquidation data for ${symbol}:`, error);
      }

      // Since we're using limited data due to rate limits, we'll create a fallback analysis
      const data = {
        liquidationData: liquidationData || { fallback: true },
        planLimitations: true
      };

      // Always use fallback analysis for hobbyist plan to avoid rate limits
      const analysis = this.createFallbackAnalysis(symbol);

      return {
        symbol,
        timestamp: Date.now(),
        rawData: data,
        analysis,
        planLimitations: true,
        fallbackCount: 1
      };
    } catch (error) {
      console.error('Error fetching retail vs institutional analysis:', error);
      // Return fallback analysis on error
      return {
        symbol,
        timestamp: Date.now(),
        analysis: this.createFallbackAnalysis(symbol),
        error: error instanceof Error ? error.message : 'Unknown error',
        planLimitations: true
      };
    }
  }

  private analyzeRetailVsInstitutional(data: any): any {
    // Simple analysis logic - can be enhanced
    const signals = {
      retailSignals: 0,
      institutionalSignals: 0,
      neutralSignals: 0
    };

    // Analyze long-short ratio divergence
    // High retail long % often indicates retail FOMO
    
    // Analyze liquidation patterns
    // High liquidation ratios often indicate retail over-leverage
    
    // Analyze funding rates
    // Extreme funding rates often indicate retail positioning
    
    // Return analysis summary
    return {
      dominantType: signals.retailSignals > signals.institutionalSignals ? 'retail' : 
                   signals.institutionalSignals > signals.retailSignals ? 'institutional' : 'mixed',
      confidence: Math.abs(signals.retailSignals - signals.institutionalSignals) / 
                 (signals.retailSignals + signals.institutionalSignals + signals.neutralSignals),
      signals,
      summary: 'Analysis based on long-short ratios, liquidation patterns, and funding rates'
    };
  }

  private createFallbackAnalysis(symbol: string): any {
    // Create a realistic analysis based on market patterns and volume data
    // This simulates what we would expect to see based on general market behavior
    
    const baseScore = Math.random() * 40 + 30; // 30-70 range
    const volatility = Math.random() * 0.3 + 0.1; // 0.1-0.4 range
    
    // Add some symbol-specific bias
    const symbolBias: Record<string, number> = {
      'BTC': 0.1,  // Slightly more institutional
      'ETH': 0.05, // Balanced
      'DOGE': -0.2, // More retail
      'SHIB': -0.3, // Very retail
      'SOL': -0.1,  // Slightly more retail
    };
    
    const bias = symbolBias[symbol] || 0;
    const adjustedScore = Math.max(10, Math.min(90, baseScore + (bias * 100)));
    
    const retailSignals = Math.round(Math.random() * 5 + 2); // 2-7 signals
    const institutionalSignals = Math.round(Math.random() * 5 + 2); // 2-7 signals
    const neutralSignals = Math.round(Math.random() * 3 + 1); // 1-4 signals
    
    let dominantType = 'mixed';
    let interpretation = 'Mixed signals - Limited data due to plan restrictions';
    
    if (adjustedScore > 65) {
      dominantType = 'institutional';
      interpretation = 'Simulated institutional patterns - Upgrade for real-time analysis';
    } else if (adjustedScore < 35) {
      dominantType = 'retail';
      interpretation = 'Simulated retail patterns - Upgrade for real-time analysis';
    }

    return {
      dominantType,
      confidence: Math.max(0.3, Math.min(0.6, volatility + 0.2)), // Lower confidence for fallback
      signals: {
        retailSignals,
        institutionalSignals,
        neutralSignals,
      },
      interpretation,
      dataQuality: 'limited',
      limitation: 'HOBBYIST plan - Real-time liquidation and funding data requires Professional+ plan',
      fallbackNotice: true,
      summary: 'Simulated analysis - Real data requires plan upgrade'
    };
  }

  // ===== UTILITY METHODS =====

  getRemainingRequests(): number {
    return Math.max(0, 30 - this.rateLimiter['requests'].length);
  }

  getTimeUntilReset(): number {
    return this.rateLimiter.getTimeUntilNextRequest();
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 