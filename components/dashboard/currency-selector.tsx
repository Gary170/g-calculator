'use client';

import React from 'react';
import { currencies } from '@/lib/currencies';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

export default function CurrencySelector({ selectedCurrency, onCurrencyChange }: CurrencySelectorProps) {
  return (
    <Select onValueChange={onCurrencyChange} value={selectedCurrency}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map(currency => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.code} - {currency.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
