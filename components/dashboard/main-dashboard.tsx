'use client';

import React, { useState, useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import DataEntryForm from './data-entry-form';
import SummaryCharts from './summary-charts';
import ClientView from './client-view';

const initialTransactions: Transaction[] = [];

export default function MainDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [
      ...prev,
      { ...transaction, id: crypto.randomUUID() },
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const salesTransactions = useMemo(() => transactions.filter(t => t.type === 'sale'), [transactions]);

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-8">
          <DataEntryForm onAddTransaction={addTransaction} />
          <ClientView transactions={salesTransactions} />
        </div>
        <div className="lg:col-span-8">
          <SummaryCharts transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
