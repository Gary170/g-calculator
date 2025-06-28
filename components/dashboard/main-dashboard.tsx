'use client';

import React, { useState, useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import DataEntryForm from './data-entry-form';
import SummaryCharts from './summary-charts';
import ClientView from './client-view';
import { subDays, subMonths } from 'date-fns';

const initialTransactions: Transaction[] = [
  { id: '1', type: 'sale', date: subDays(new Date(), 2), description: 'Web Design Project', amount: 2500, clientName: 'Innovate LLC' },
  { id: '2', type: 'expense', date: subDays(new Date(), 5), description: 'Software Subscription', amount: 49, category: 'Software' },
  { id: '3', type: 'sale', date: subDays(new Date(), 10), description: 'Consulting Services', amount: 1200, clientName: 'TechCorp' },
  { id: '4', type: 'expense', date: subDays(new Date(), 12), description: 'Office Supplies', amount: 125, category: 'Office' },
  { id: '5', type: 'sale', date: subDays(new Date(), 15), description: 'Logo Design', amount: 800, clientName: 'Innovate LLC' },
  { id: '6', type: 'expense', date: subDays(new Date(), 20), description: 'Lunch with client', amount: 85, category: 'Meals' },
  { id: '7', type: 'sale', date: subMonths(new Date(), 1), description: 'Marketing Campaign', amount: 3500, clientName: 'Marketing Pro' },
  { id: '8', type: 'expense', date: subMonths(new Date(), 1), description: 'Cloud Hosting Bill', amount: 250, category: 'Utilities' },
];

export default function MainDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [
      ...prev,
      { ...transaction, id: crypto.randomUUID() },
    ].sort((a, b) => b.date.getTime() - a.date.getTime()));
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
