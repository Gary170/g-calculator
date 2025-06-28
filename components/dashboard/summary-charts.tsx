'use client';

import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Transaction } from '@/lib/types';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay, endOfWeek, endOfMonth, endOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval, parseISO } from 'date-fns';

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

const chartConfig = {
  sales: { label: 'Sales', color: 'hsl(var(--chart-1))' },
  expenses: { label: 'Expenses', color: 'hsl(var(--chart-2))' },
  profit: { label: 'Profit', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig;

const aggregateData = (transactions: Transaction[], period: TimePeriod) => {
    if (transactions.length === 0) return [];

    const sortedTransactions = [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const startDate = new Date(sortedTransactions[0].date);
    const endDate = new Date();

    let intervals;
    let formatString: string;
    let groupByFn: (date: Date) => string;

    switch (period) {
        case 'daily':
            intervals = eachDayOfInterval({ start: startOfDay(startDate), end: endOfDay(endDate) });
            formatString = 'MMM d';
            groupByFn = (date) => format(startOfDay(date), 'yyyy-MM-dd');
            break;
        case 'weekly':
            intervals = eachWeekOfInterval({ start: startOfWeek(startDate), end: endOfWeek(endDate) }, { weekStartsOn: 1 });
            formatString = 'MMM d';
            groupByFn = (date) => format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            break;
        case 'monthly':
            intervals = eachMonthOfInterval({ start: startOfMonth(startDate), end: endOfMonth(endDate) });
            formatString = 'MMM yyyy';
            groupByFn = (date) => format(startOfMonth(date), 'yyyy-MM');
            break;
        case 'yearly':
            intervals = eachYearOfInterval({ start: startOfYear(startDate), end: endOfYear(endDate) });
            formatString = 'yyyy';
            groupByFn = (date) => format(startOfYear(date), 'yyyy');
            break;
    }

    const dataMap = new Map<string, { date: string; sales: number; expenses: number }>();
    
    intervals.forEach(intervalDate => {
        const key = groupByFn(intervalDate);
        dataMap.set(key, { date: format(intervalDate, formatString), sales: 0, expenses: 0 });
    });

    transactions.forEach(t => {
        const key = groupByFn(new Date(t.date));
        if (dataMap.has(key)) {
            const entry = dataMap.get(key)!;
            if (t.type === 'sale') entry.sales += t.amount;
            else entry.expenses += t.amount;
        }
    });

    return Array.from(dataMap.values()).map(d => ({ ...d, profit: d.sales - d.expenses }));
};

export default function SummaryCharts({ transactions }: { transactions: Transaction[] }) {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');

    const chartData = useMemo(() => aggregateData(transactions, timePeriod), [transactions, timePeriod]);

    const totalSales = useMemo(() => transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0), [transactions]);
    const totalExpenses = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [transactions]);
    const totalProfit = totalSales - totalExpenses;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>An overview of your sales, expenses, and profits.</CardDescription>
                <div className="flex justify-between items-baseline pt-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                        <p className="text-2xl font-bold text-primary">${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Expenses</p>
                        <p className="text-2xl font-bold text-accent">${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                     <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Profit</p>
                        <p className="text-2xl font-bold" style={{color: 'hsl(var(--chart-3))'}}>${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="monthly" onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        <TabsTrigger value="yearly">Yearly</TabsTrigger>
                    </TabsList>
                    <TabsContent value={timePeriod}>
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full mt-4">
                            <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`}/>
                                <Tooltip
                                    cursor={false}
                                    content={<ChartTooltipContent
                                        formatter={(value, name) => (
                                        <div>
                                            <div className="font-medium capitalize">{name}</div>
                                            <div>{Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
                                        </div>
                                        )}
                                    />}
                                />
                                <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="profit" fill="var(--color-profit)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
