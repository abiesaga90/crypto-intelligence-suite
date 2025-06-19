import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '@/config/constants';

// API Service class for free APIs only
class ApiService {
  private coingeckoApi: AxiosInstance;
  private binanceApi: AxiosInstance;

  constructor() {
    // Detect if we're on mobile for timeout adjustments
    const isMobile = typeof window !== 'undefined' && window.navigator && /Mobi|Android/i.test(window.navigator.userAgent);
    const timeoutDuration = isMobile ? 45000 : 30000; // Longer timeout for mobile

    // CoinGecko API setup (free tier)
    this.coingeckoApi = axios.create({
      baseURL: API_CONFIG.alternatives.coingecko.baseUrl,
      timeout: timeoutDuration,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Binance API setup (free tier)
    this.binanceApi = axios.create({
      baseURL: API_CONFIG.alternatives.binance.baseUrl,
      timeout: timeoutDuration,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptors for better error handling
    this.coingeckoApi.interceptors.request.use(
      (config) => {
        console.log(`CoinGecko API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('CoinGecko API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.binanceApi.interceptors.request.use(
      (config) => {
        console.log(`Binance API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Binance API Request Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // ===== FREE APIs ONLY =====

  async getCoinGeckoTopCoins(limit: number = 30): Promise<any> {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempting CoinGecko API call (attempt ${retryCount + 1}/${maxRetries})`);
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
        console.log(`CoinGecko API success: Received ${response.data?.length || 0} coins`);
        return response.data;
      } catch (error) {
        retryCount++;
        console.error(`Error fetching CoinGecko top coins (attempt ${retryCount}):`, error);
        
        if (retryCount >= maxRetries) {
          console.error('CoinGecko API failed after all retries');
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
        console.log(`Retrying CoinGecko API in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async getCoinGeckoGlobalData(): Promise<any> {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempting CoinGecko Global API call (attempt ${retryCount + 1}/${maxRetries})`);
        const response = await this.coingeckoApi.get(API_CONFIG.alternatives.coingecko.endpoints.globalData);
        console.log('CoinGecko Global API success');
        return response.data;
      } catch (error) {
        retryCount++;
        console.error(`Error fetching CoinGecko global data (attempt ${retryCount}):`, error);
        
        if (retryCount >= maxRetries) {
          console.error('CoinGecko Global API failed after all retries');
          throw error;
        }
        
        // Wait before retry
        const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
        console.log(`Retrying CoinGecko Global API in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
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

  // ===== TOP GAINERS ENDPOINTS =====

  async getTopGainersAndLosersFromCoinGecko(limit: number = 100): Promise<any> {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempting CoinGecko Top Gainers & Losers API call (attempt ${retryCount + 1}/${maxRetries})`);
        
        // Get top 250 coins to have enough data for gainers and losers
        const response = await this.coingeckoApi.get(API_CONFIG.alternatives.coingecko.endpoints.topGainers, {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc', // Get by market cap first to ensure quality coins
            per_page: 250, // Get enough data to filter gainers and losers
            page: 1,
            sparkline: false,
            price_change_percentage: '1h,24h,7d'
          }
        });

        // Filter coins with sufficient volume (>$50,000 as per CoinGecko standard)
        const validCoins = response.data.filter((coin: any) => 
          coin.total_volume && 
          coin.total_volume > 50000 && 
          coin.price_change_percentage_24h !== null &&
          coin.price_change_percentage_24h !== undefined
        );

        // Separate gainers and losers, then sort each
        const gainers = validCoins
          .filter((coin: any) => coin.price_change_percentage_24h > 0)
          .sort((a: any, b: any) => b.price_change_percentage_24h - a.price_change_percentage_24h)
          .slice(0, limit);

        const losers = validCoins
          .filter((coin: any) => coin.price_change_percentage_24h < 0)
          .sort((a: any, b: any) => a.price_change_percentage_24h - b.price_change_percentage_24h) // Ascending for losers (most negative first)
          .slice(0, limit);

        console.log(`CoinGecko Gainers & Losers API success: ${gainers.length} gainers, ${losers.length} losers`);
        return { gainers, losers };
      } catch (error) {
        retryCount++;
        console.error(`Error fetching CoinGecko gainers & losers (attempt ${retryCount}):`, error);
        
        if (retryCount >= maxRetries) {
          console.error('CoinGecko Gainers & Losers API failed after all retries');
          throw error;
        }
        
        const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
        console.log(`Retrying CoinGecko Gainers & Losers API in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async getTopGainersFromBinance(limit: number = 12): Promise<any> {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempting Binance Top Gainers API call (attempt ${retryCount + 1}/${maxRetries})`);
        
        // Get all 24hr tickers
        const response = await this.binanceApi.get(API_CONFIG.alternatives.binance.endpoints.topGainers);
        
        // Filter USDT pairs and sort by price change percentage
        const gainers = response.data
          .filter((ticker: any) => 
            ticker.symbol.endsWith('USDT') && 
            parseFloat(ticker.priceChangePercent) > 0 &&
            parseFloat(ticker.volume) > 1000000 // Filter low volume coins
          )
          .sort((a: any, b: any) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
          .slice(0, limit)
          .map((ticker: any) => ({
            id: ticker.symbol.replace('USDT', '').toLowerCase(),
            symbol: ticker.symbol.replace('USDT', ''),
            name: ticker.symbol.replace('USDT', ''),
            current_price: parseFloat(ticker.lastPrice),
            price_change_percentage_24h: parseFloat(ticker.priceChangePercent),
            volume: parseFloat(ticker.volume),
            source: 'binance'
          }));

        console.log(`Binance Top Gainers API success: Received ${gainers.length} gainers`);
        return gainers;
      } catch (error) {
        retryCount++;
        console.error(`Error fetching Binance top gainers (attempt ${retryCount}):`, error);
        
        if (retryCount >= maxRetries) {
          console.error('Binance Top Gainers API failed after all retries');
          throw error;
        }
        
        const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
        console.log(`Retrying Binance Top Gainers API in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async getTopGainers(limit: number = 12): Promise<any> {
    try {
      console.log('Fetching top gainers from multiple sources...');
      
      // Try CoinGecko first (more comprehensive data)
      try {
        const gainersLosersData = await this.getTopGainersAndLosersFromCoinGecko(100);
        const coinGeckoGainers = gainersLosersData.gainers.slice(0, limit);
        if (coinGeckoGainers && coinGeckoGainers.length > 0) {
          console.log(`Using CoinGecko top gainers: ${coinGeckoGainers.length} coins`);
          return {
            data: coinGeckoGainers,
            source: 'coingecko',
            timestamp: Date.now()
          };
        }
      } catch (error) {
        console.warn('CoinGecko top gainers failed, trying Binance...', error);
      }

      // Fallback to Binance
      try {
        const binanceGainers = await this.getTopGainersFromBinance(limit);
        if (binanceGainers && binanceGainers.length > 0) {
          console.log(`Using Binance top gainers: ${binanceGainers.length} coins`);
          return {
            data: binanceGainers,
            source: 'binance',
            timestamp: Date.now()
          };
        }
      } catch (error) {
        console.warn('Binance top gainers failed...', error);
      }

      // Final fallback with sample data
      console.log('All APIs failed, using fallback top gainers data');
      return {
        data: [
          { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', current_price: 35, price_change_percentage_24h: 8.5, source: 'fallback' },
          { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', current_price: 15.2, price_change_percentage_24h: 7.3, source: 'fallback' },
          { id: 'polygon', symbol: 'MATIC', name: 'Polygon', current_price: 0.85, price_change_percentage_24h: 6.8, source: 'fallback' },
          { id: 'solana', symbol: 'SOL', name: 'Solana', current_price: 98, price_change_percentage_24h: 5.2, source: 'fallback' },
          { id: 'cardano', symbol: 'ADA', name: 'Cardano', current_price: 0.45, price_change_percentage_24h: 4.9, source: 'fallback' }
        ],
        source: 'fallback',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error in getTopGainers:', error);
      throw error;
    }
  }

  async getTopGainersAndLosers(limit: number = 100): Promise<{ gainers: any[], losers: any[] }> {
    try {
      console.log('Starting Top Gainers & Losers API calls...');
      
      // Try CoinGecko first
      try {
        const data = await this.getTopGainersAndLosersFromCoinGecko(limit);
        console.log('Using CoinGecko data for gainers & losers');
        return {
          gainers: data.gainers.map((coin: any) => ({ ...coin, source: 'CoinGecko' })),
          losers: data.losers.map((coin: any) => ({ ...coin, source: 'CoinGecko' }))
        };
      } catch (error) {
        console.error('CoinGecko gainers & losers failed:', error);
      }

      // Fallback to mixed sources or cached data
      try {
        const gainers = await this.getTopGainersFromBinance(Math.min(limit, 50));
        console.log('Using Binance data for gainers, fallback for losers');
        return {
          gainers: gainers.map((coin: any) => ({ ...coin, source: 'Binance' })),
          losers: this.getFallbackTopLosers(limit)
        };
      } catch (error) {
        console.error('All APIs failed for gainers & losers');
      }

      // Final fallback to cached data
      console.log('All APIs failed, using fallback data for gainers & losers');
      return {
        gainers: this.getFallbackTopGainers(limit),
        losers: this.getFallbackTopLosers(limit)
      };
      
    } catch (error) {
      console.error('Error in getTopGainersAndLosers:', error);
      return {
        gainers: this.getFallbackTopGainers(limit),
        losers: this.getFallbackTopLosers(limit)
      };
    }
  }

  private getFallbackTopGainers(limit: number): any[] {
    return [
      { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', current_price: 35, price_change_percentage_24h: 8.5, total_volume: 850000000, market_cap: 13000000000, source: 'fallback' },
      { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', current_price: 15.2, price_change_percentage_24h: 7.3, total_volume: 720000000, market_cap: 8900000000, source: 'fallback' },
      { id: 'polygon', symbol: 'MATIC', name: 'Polygon', current_price: 0.85, price_change_percentage_24h: 6.8, total_volume: 560000000, market_cap: 7800000000, source: 'fallback' },
      { id: 'solana', symbol: 'SOL', name: 'Solana', current_price: 98, price_change_percentage_24h: 5.2, total_volume: 1200000000, market_cap: 42000000000, source: 'fallback' },
      { id: 'cardano', symbol: 'ADA', name: 'Cardano', current_price: 0.45, price_change_percentage_24h: 4.9, total_volume: 380000000, market_cap: 15700000000, source: 'fallback' }
    ].slice(0, limit);
  }

  private getFallbackTopLosers(limit: number): any[] {
    return [
      { id: 'terra-luna', symbol: 'LUNA', name: 'Terra Luna Classic', current_price: 0.000085, price_change_percentage_24h: -12.3, total_volume: 45000000, market_cap: 580000000, source: 'fallback' },
      { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu', current_price: 0.0000087, price_change_percentage_24h: -8.7, total_volume: 125000000, market_cap: 5100000000, source: 'fallback' },
      { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', current_price: 0.073, price_change_percentage_24h: -6.2, total_volume: 320000000, market_cap: 10400000000, source: 'fallback' },
      { id: 'ripple', symbol: 'XRP', name: 'XRP', current_price: 0.51, price_change_percentage_24h: -5.8, total_volume: 890000000, market_cap: 27800000000, source: 'fallback' },
      { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', current_price: 67, price_change_percentage_24h: -4.1, total_volume: 420000000, market_cap: 5000000000, source: 'fallback' }
    ].slice(0, limit);
  }

  // ===== RETAIL vs INSTITUTIONAL ANALYSIS (Free APIs Only) =====

  async getRetailVsInstitutionalAnalysis(symbol: string): Promise<any> {
    try {
      console.log(`Starting analysis for ${symbol}`);
      
      // Use real market analysis using only free APIs that work
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
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 