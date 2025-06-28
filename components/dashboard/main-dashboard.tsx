'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Transaction } from '@/lib/types';
import DataEntryForm from './data-entry-form';
import SummaryCharts from './summary-charts';
import ClientView from './client-view';
import CurrencySelector from './currency-selector';
import { getLocalCurrency } from '@/lib/currencies';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function MainDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[] | null>(null);

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
  
  const handleExport = () => {
    if (transactions.length === 0) {
      toast({
        title: "No data to export",
        description: "Add some transactions before exporting.",
      });
      return;
    }
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `g-expenses-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Export successful",
      description: "Your transaction history has been downloaded.",
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Invalid file content");
        
        const parsedData = JSON.parse(text);
        
        if (!Array.isArray(parsedData) || !parsedData.every(item => 'id' in item && 'type' in item && 'date' in item && 'description' in item && 'amount' in item)) {
            throw new Error("Invalid file format. Make sure it's a valid transaction export file.");
        }

        const newTransactions: Transaction[] = parsedData.map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));

        setPendingTransactions(newTransactions);
        
      } catch (error) {
        console.error("Import failed:", error);
        toast({
            title: "Import Failed",
            description: (error as Error).message || "The selected file could not be read.",
            variant: "destructive",
        });
      } finally {
        if(event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
  };
  
  const confirmImport = () => {
    if (pendingTransactions) {
      setTransactions(pendingTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setPendingTransactions(null);
      toast({
        title: "Import Successful",
        description: "Your transaction history has been restored.",
      });
    }
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
       <div className="flex justify-end items-center gap-2 mb-4">
          <Button variant="outline" size="icon" onClick={handleExport} title="Export Data">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleImportClick} title="Import Data">
            <Upload className="h-4 w-4" />
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

          <CurrencySelector selectedCurrency={currency} onCurrencyChange={setCurrency} />

          <AlertDialog open={!!pendingTransactions} onOpenChange={(open) => !open && setPendingTransactions(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Replace Transaction History?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will replace all your current transactions with the data from the imported file. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setPendingTransactions(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmImport}>Yes, Import</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
