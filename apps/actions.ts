'use server';

import { categorizeExpense } from '@/ai/flows/categorize-expense';
import { z } from 'zod';

const ExpenseSchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters'),
  amount: z.number().positive('Amount must be positive'),
});

export async function getExpenseCategory(data: { description: string; amount: number }) {
  const parsed = ExpenseSchema.safeParse(data);
  if (!parsed.success) {
    // Returning a structured error is better for the client
    return { error: parsed.error.flatten().fieldErrors, category: null };
  }

  try {
    const result = await categorizeExpense(parsed.data);
    return { category: result.category, error: null };
  } catch (error) {
    console.error('AI categorization failed:', error);
    return { category: null, error: { _errors: ['AI service is currently unavailable. Please try again later.'] } };
  }
}
