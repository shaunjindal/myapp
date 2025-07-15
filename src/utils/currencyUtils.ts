export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
}

const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'en-EU',
  },
};

// Default currency - this should ideally come from backend/user preferences
const DEFAULT_CURRENCY = 'INR';

/**
 * Get currency configuration from backend or use default
 * In a real app, this would come from user preferences or backend config
 */
export function getCurrentCurrency(): CurrencyConfig {
  // TODO: Get from backend user preferences or app config
  return CURRENCY_CONFIGS[DEFAULT_CURRENCY];
}

/**
 * Format amount with currency using Intl.NumberFormat
 */
export function formatCurrency(amount: number, currencyCode?: string): string {
  const currency = currencyCode || DEFAULT_CURRENCY;
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS[DEFAULT_CURRENCY];
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
  }).format(amount);
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currencyCode?: string): string {
  const currency = currencyCode || DEFAULT_CURRENCY;
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS[DEFAULT_CURRENCY];
  return config.symbol;
}

/**
 * Format price with just symbol (lighter formatting)
 */
export function formatPrice(amount: number, currencyCode?: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(2)}`;
} 