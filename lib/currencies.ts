export const currencies = [
  { code: 'USD', name: 'United States Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'GBP', name: 'British Pound Sterling' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'SGD', name: 'Singapore Dollar' },
];

export const getLocalCurrency = (): string => {
  if (typeof window === 'undefined') {
    return 'USD';
  }
  try {
    // Intl.NumberFormat is a client-side API
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD', // A default is required
    });
    const detectedCurrency = formatter.resolvedOptions().currency;
    
    // Ensure the detected currency is in our list
    if (currencies.some(c => c.code === detectedCurrency)) {
      return detectedCurrency;
    }
    return 'USD'; // Fallback if not supported
  } catch (e) {
    console.error('Failed to detect local currency:', e);
    return 'USD';
  }
};
