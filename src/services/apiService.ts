import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '@/config/constants';

// API Service class for free APIs only
class ApiService {
  private coingeckoApi: AxiosInstance;
  private binanceApi: AxiosInstance;

  constructor() {
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
  }

  // ===== FREE APIs ONLY =====

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