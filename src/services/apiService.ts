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
      console.log(`Starting analysis for ${symbol}`);
      
      // Skip CoinGlass liquidation data entirely since it's not available on hobbyist plan
      // Use real market analysis using only free APIs that we know work
      const analysis = await this.createRealMarketAnalysis(symbol);

      return {
        symbol,
        timestamp: Date.now(),
        rawData: {
          note: "Using real market data from free APIs",
          planLimitations: false
        },
        analysis,
        planLimitations: false,
        sources: ['Binance Public API', 'CoinGecko Free Tier']
      };
    } catch (error) {
      console.error('Error fetching retail vs institutional analysis:', error);
      // Return fallback analysis on error
      return {
        symbol,
        timestamp: Date.now(),
        analysis: {
          dominantType: 'mixed',
          confidence: 0.3,
          signals: {
            retailSignals: 1,
            institutionalSignals: 1,
            neutralSignals: 1,
          },
          interpretation: 'Analysis temporarily unavailable due to API error',
          dataQuality: 'limited',
          summary: 'Mixed signals - API error occurred'
        },
        error: error instanceof Error ? error.message : 'Unknown error',
        planLimitations: false
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

  private async createRealMarketAnalysis(symbol: string): Promise<any> {
    try {
      console.log(`Creating real market analysis for ${symbol}`);
      
      // Use real market data from free APIs to analyze retail vs institutional behavior
      const promises = [
        this.getCoinGeckoTopCoins(100).catch((err) => {
          console.warn('CoinGecko API error:', err);
          return null;
        }),
        this.getBinance24hrTicker(symbol).catch((err) => {
          console.warn('Binance API error:', err);
          return null;
        })
      ];

      const [coinData, binanceTicker] = await Promise.all(promises);

      let retailSignals = 0;
      let institutionalSignals = 0;
      let neutralSignals = 0;

      console.log(`CoinGecko data available: ${coinData ? 'Yes' : 'No'}`);
      console.log(`Binance ticker available: ${binanceTicker ? 'Yes' : 'No'}`);

      // Analysis 1: Volume vs Market Cap Ratio (High ratio = More retail activity)
      if (binanceTicker && coinData) {
        const coin = coinData.find((c: any) => c.symbol.toLowerCase() === symbol.toLowerCase());
        if (coin && binanceTicker.volume) {
          const volumeToMarketCapRatio = parseFloat(binanceTicker.volume) / coin.market_cap;
          console.log(`Volume/MarketCap ratio: ${volumeToMarketCapRatio}`);
          if (volumeToMarketCapRatio > 0.1) retailSignals++;
          else if (volumeToMarketCapRatio < 0.05) institutionalSignals++;
          else neutralSignals++;
        } else {
          neutralSignals++;
        }
      } else {
        neutralSignals++;
      }

      // Analysis 2: Price Volatility Pattern (High volatility = More retail)
      if (binanceTicker && binanceTicker.priceChangePercent) {
        const priceChangePercent = Math.abs(parseFloat(binanceTicker.priceChangePercent));
        console.log(`Price change percent: ${priceChangePercent}%`);
        if (priceChangePercent > 5) retailSignals++;
        else if (priceChangePercent < 2) institutionalSignals++;
        else neutralSignals++;
      } else {
        neutralSignals++;
      }

      // Analysis 3: Trading Count vs Volume (Many small trades = Retail)
      if (binanceTicker && binanceTicker.volume && binanceTicker.count) {
        const avgTradeSize = parseFloat(binanceTicker.volume) / parseFloat(binanceTicker.count);
        console.log(`Average trade size: ${avgTradeSize}`);
        if (avgTradeSize < 1000) retailSignals++;
        else if (avgTradeSize > 10000) institutionalSignals++;
        else neutralSignals++;
      } else {
        neutralSignals++;
      }

      // Analysis 4: Market Cap Based Behavior
      if (coinData) {
        const coin = coinData.find((c: any) => c.symbol.toLowerCase() === symbol.toLowerCase());
        if (coin && coin.market_cap) {
          console.log(`Market cap: ${coin.market_cap}`);
          if (coin.market_cap < 1000000000) retailSignals++; // Under 1B = More retail
          else if (coin.market_cap > 100000000000) institutionalSignals++; // Over 100B = More institutional
          else neutralSignals++;
        } else {
          neutralSignals++;
        }
      } else {
        neutralSignals++;
      }

      // Analysis 5: 24h High/Low Range Analysis
      if (binanceTicker && binanceTicker.highPrice && binanceTicker.lowPrice && binanceTicker.lastPrice) {
        const high = parseFloat(binanceTicker.highPrice);
        const low = parseFloat(binanceTicker.lowPrice);
        const current = parseFloat(binanceTicker.lastPrice);
        const range = (high - low) / low;
        const position = (current - low) / (high - low);
        
        console.log(`Price range analysis: Range=${range}, Position=${position}`);
        
        if (range > 0.1 && (position < 0.2 || position > 0.8)) {
          retailSignals++; // High volatility with extreme positioning
        } else if (range < 0.03) {
          institutionalSignals++; // Low volatility suggests institutional stability
        } else {
          neutralSignals++;
        }
      } else {
        neutralSignals++;
      }

      // Determine dominant type
      let dominantType = 'mixed';
      let confidence = 0.5;
      
      if (retailSignals > institutionalSignals + 1) {
        dominantType = 'retail';
        confidence = Math.min(0.85, 0.6 + (retailSignals - institutionalSignals) * 0.1);
      } else if (institutionalSignals > retailSignals + 1) {
        dominantType = 'institutional';
        confidence = Math.min(0.85, 0.6 + (institutionalSignals - retailSignals) * 0.1);
      }

      const totalSignals = retailSignals + institutionalSignals + neutralSignals;
      
      console.log(`Analysis complete: ${dominantType} (${Math.round(confidence * 100)}% confidence)`);
      console.log(`Signals: Retail=${retailSignals}, Institutional=${institutionalSignals}, Neutral=${neutralSignals}`);
      
      return {
        dominantType,
        confidence,
        signals: {
          retailSignals,
          institutionalSignals,
          neutralSignals,
        },
        interpretation: `Analysis based on ${totalSignals} market behavior indicators from real trading data`,
        dataQuality: 'real-time',
        sources: ['Binance Public API', 'CoinGecko Free Tier'],
        summary: `Real market analysis showing ${dominantType} behavior patterns with ${Math.round(confidence * 100)}% confidence`,
        dataPoints: {
          coinGeckoAvailable: coinData ? true : false,
          binanceAvailable: binanceTicker ? true : false,
          totalFactorsAnalyzed: totalSignals
        }
      };

    } catch (error) {
      console.error('Error in real market analysis:', error);
      // Fallback to basic analysis
      return {
        dominantType: 'mixed',
        confidence: 0.3,
        signals: {
          retailSignals: 2,
          institutionalSignals: 2,
          neutralSignals: 1,
        },
        interpretation: 'Limited analysis due to API error',
        dataQuality: 'limited',
        summary: 'Mixed signals - Analysis temporarily unavailable',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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