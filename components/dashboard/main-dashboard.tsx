'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Transaction } from '@/lib/types';
import DataEntryForm from './data-entry-form';
import SummaryCharts from './summary-charts';
import ClientView from './client-view';
import CurrencySelector from './currency-selector';
import { getLocalCurrency } from '@/lib/currencies';
import { Skeleton } from '@/components/ui/skeleton';

export default function MainDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions).map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));
        setTransactions(parsed);
      }
      
      const storedCurrency = localStorage.getItem('currency');
      setCurrency(storedCurrency || getLocalCurrency());

    } catch (error) {
        console.error("Failed to access localStorage during initial load", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('transactions', JSON.stringify(transactions));
      } catch (error) {
        console.error("Failed to save transactions to localStorage", error);
      }
    }
  }, [transactions, isMounted]);

  useEffect(() => {
    if (isMounted) {
       try {
        localStorage.setItem('currency', currency);
       } catch (error) {
        console.error("Failed to save currency to localStorage", error);
      }
    }
  }, [currency, isMounted]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [
      ...prev,
      { ...transaction, id: crypto.randomUUID() },
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const salesTransactions = useMemo(() => transactions.filter(t => t.type === 'sale'), [transactions]);
  const clientNames = useMemo(() => {
      const clientSet = new Set<string>();
      transactions.forEach(t => {
          if (t.clientName) clientSet.add(t.clientName);
      });
      return Array.from(clientSet).sort();
  }, [transactions]);

  if (!isMounted) {
    return (
       <div className="container mx-auto">
        <div className="flex justify-end mb-4">
          <Skeleton className="h-10 w-[220px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 flex flex-col gap-8">
            <Skeleton className="h-[620px] w-full rounded-lg" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
          <div className="lg:col-span-8">
            <Skeleton className="h-[520px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
       <div className="flex justify-end mb-4">
          <CurrencySelector selectedCurrency={currency} onCurrencyChange={setCurrency} />
       </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-8">
          <DataEntryForm onAddTransaction={addTransaction} clientNames={clientNames} />
          <ClientView transactions={salesTransactions} currency={currency} />
        </div>
        <div className="lg:col-span-8">
          <SummaryCharts transactions={transactions} currency={currency} />
        </div>
      </div>
    </div>
  );
}
