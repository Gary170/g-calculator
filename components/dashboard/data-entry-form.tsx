'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from '@/lib/types';
import { getExpenseCategory } from '@/app/actions';
import { useDebounce } from '@/hooks/use-debounce';
import { Loader2, Wand2 } from 'lucide-react';

const formSchema = z.object({
    type: z.enum(['sale', 'expense']),
    date: z.date({ required_error: 'A date is required.' }),
    description: z.string().min(2, 'Description must be at least 2 characters.'),
    amount: z.coerce.number().positive('Amount must be a positive number.'),
    clientName: z.string().optional(),
    category: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.type === 'sale' && (!data.clientName || data.clientName.length < 2)) {
        ctx.addIssue({
            code: 'custom',
            path: ['clientName'],
            message: 'Client name is required for sales.',
        });
    }
    if (data.type === 'expense' && (!data.category || data.category.length < 2)) {
        ctx.addIssue({
            code: 'custom',
            path: ['category'],
            message: 'Category is required for expenses.',
        });
    }
});

type FormValues = z.infer<typeof formSchema>;

interface DataEntryFormProps {
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export default function DataEntryForm({ onAddTransaction }: DataEntryFormProps) {
    const [type, setType] = useState<'sale' | 'expense'>('sale');
    const { toast } = useToast();
    const [isSuggesting, startSuggestionTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: 'sale',
            description: '',
            amount: 0,
        },
    });

    const descriptionValue = form.watch('description');
    const amountValue = form.watch('amount');
    const debouncedDescription = useDebounce(descriptionValue, 500);
    const debouncedAmount = useDebounce(amountValue, 500);

    useEffect(() => {
        const selectedType = form.watch('type');
        setType(selectedType);
    }, [form.watch('type')]);
    
    useEffect(() => {
        if (form.getValues("date") === undefined) {
            form.setValue("date", new Date());
        }
    }, [form]);

    useEffect(() => {
        if (type === 'expense' && debouncedDescription && debouncedAmount > 0) {
            startSuggestionTransition(async () => {
                const result = await getExpenseCategory({ description: debouncedDescription, amount: debouncedAmount });
                if (result.category) {
                    form.setValue('category', result.category);
                    toast({
                        title: "Category Suggested",
                        description: `We've suggested a category for your expense.`,
                    });
                }
            });
        }
    }, [debouncedDescription, debouncedAmount, type, form, toast]);

    const onSubmit = (values: FormValues) => {
        onAddTransaction(values);
        toast({
            title: 'Transaction Added',
            description: `${values.type.charAt(0).toUpperCase() + values.type.slice(1)} of $${values.amount} has been logged.`,
        });
        form.reset({
            type: values.type,
            description: '',
            amount: 0,
            date: new Date(),
            clientName: '',
            category: ''
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Transaction</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Controller
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="sale" id="sale" />
                                    <Label htmlFor="sale">Sale</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="expense" id="expense" />
                                    <Label htmlFor="expense">Expense</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Controller
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <DatePicker date={field.value} setDate={field.onChange} />
                            )}
                        />
                        {form.formState.errors.date && <p className="text-sm font-medium text-destructive">{form.formState.errors.date.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" {...form.register('description')} placeholder="e.g., Website Development" />
                        {form.formState.errors.description && <p className="text-sm font-medium text-destructive">{form.formState.errors.description.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" step="0.01" {...form.register('amount')} placeholder="0.00" />
                        {form.formState.errors.amount && <p className="text-sm font-medium text-destructive">{form.formState.errors.amount.message}</p>}
                    </div>

                    {type === 'sale' && (
                        <div className="space-y-2">
                            <Label htmlFor="clientName">Client Name</Label>
                            <Input id="clientName" {...form.register('clientName')} placeholder="e.g., Innovate LLC" />
                            {form.formState.errors.clientName && <p className="text-sm font-medium text-destructive">{form.formState.errors.clientName.message}</p>}
                        </div>
                    )}

                    {type === 'expense' && (
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <div className="relative">
                                <Input id="category" {...form.register('category')} placeholder="e.g., Software" />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    {isSuggesting ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <Wand2 className="h-5 w-5 text-muted-foreground" />}
                                </div>
                            </div>
                            {form.formState.errors.category && <p className="text-sm font-medium text-destructive">{form.formState.errors.category.message}</p>}
                        </div>
                    )}
                    
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Add Transaction
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
