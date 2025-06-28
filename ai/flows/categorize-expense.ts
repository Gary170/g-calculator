'use server';

/**
 * @fileOverview Provides AI-powered suggestions for categorizing expenses.
 *
 * - categorizeExpense - A function that suggests categories for an expense.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeExpenseInputSchema = z.object({
  description: z
    .string()
    .describe('The description of the expense, e.g., \'Lunch with client\'.'),
  amount: z.number().describe('The amount of the expense.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

const CategorizeExpenseOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'A suggested category for the expense, e.g., \'Meals and Entertainment\'.'
    ),
  confidence: z
    .number()
    .describe(
      'A confidence score between 0 and 1 indicating the accuracy of the category suggestion.'
    ),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeExpensePrompt',
  input: {schema: CategorizeExpenseInputSchema},
  output: {schema: CategorizeExpenseOutputSchema},
  prompt: `You are an expert financial assistant specializing in expense categorization.

  Given the description and amount of an expense, suggest the most appropriate category.
  Also, provide a confidence score (0-1) for your suggestion.

  Description: {{{description}}}
  Amount: {{{amount}}}
  `,
});

const categorizeExpenseFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
