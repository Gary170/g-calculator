export type Transaction = {
  id: string;
  type: 'sale' | 'expense';
  date: Date;
  description: string;
  amount: number;
  clientName?: string;
  category?: string;
};
