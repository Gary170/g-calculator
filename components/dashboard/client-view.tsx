'use client';

import React, { useState, useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

export default function ClientView({ transactions }: { transactions: Transaction[] }) {
    const [selectedClient, setSelectedClient] = useState<string | null>(null);

    const clients = useMemo(() => {
        const clientSet = new Set<string>();
        transactions.forEach(t => {
            if (t.clientName) clientSet.add(t.clientName);
        });
        return Array.from(clientSet).sort();
    }, [transactions]);

    const clientData = useMemo(() => {
        if (!selectedClient) return { totalSales: 0, transactions: [] };
        const clientTransactions = transactions.filter(t => t.clientName === selectedClient);
        const totalSales = clientTransactions.reduce((sum, t) => sum + t.amount, 0);
        return { totalSales, transactions: clientTransactions };
    }, [transactions, selectedClient]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Client Breakdown</CardTitle>
                <CardDescription>View sales data for specific clients.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select onValueChange={setSelectedClient} value={selectedClient || ''}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                        {clients.map(client => (
                            <SelectItem key={client} value={client}>{client}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedClient && (
                    <div className="space-y-4">
                        <Card className="bg-secondary">
                            <CardHeader>
                                <CardTitle className="text-lg">{selectedClient}</CardTitle>
                                <CardDescription>Total Sales</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-primary">
                                    ${clientData.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </CardContent>
                        </Card>
                        
                        <h4 className="font-semibold">Transaction History</h4>
                        <ScrollArea className="h-[200px] w-full rounded-md border">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clientData.transactions.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell>{format(new Date(t.date), 'MMM d, yyyy')}</TableCell>
                                            <TableCell>{t.description}</TableCell>
                                            <TableCell className="text-right">${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
