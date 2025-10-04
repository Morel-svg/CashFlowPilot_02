import { type Transaction, type InsertTransaction } from "@shared/schema";
import { supabase } from "./db";

export interface IStorage {
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByFilters(filters: {
    search?: string;
    category?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]>;
  updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;

  getTransactionStats(startDate?: Date, endDate?: Date): Promise<{
    totalIncome: number;
    transactionCount: number;
    categoryBreakdown: Record<string, number>;
    sourceBreakdown: Record<string, number>;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getTransaction(id: string): Promise<Transaction | undefined> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(insertTransaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTransactionsByFilters(filters: {
    search?: string;
    category?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select('*');

    if (filters.search) {
      query = query.ilike('description', `%${filters.search}%`);
    }

    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters.source && filters.source !== 'all') {
      query = query.eq('source', filters.source);
    }

    if (filters.startDate) {
      query = query.gte('date', filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte('date', filters.endDate.toISOString());
    }

    query = query.order('date', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data || undefined;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    return !error;
  }

  async getTransactionStats(startDate?: Date, endDate?: Date): Promise<{
    totalIncome: number;
    transactionCount: number;
    categoryBreakdown: Record<string, number>;
    sourceBreakdown: Record<string, number>;
  }> {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('status', 'completed');

    if (startDate) {
      query = query.gte('date', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('date', endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const transactions = data || [];

    const totalIncome = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const transactionCount = transactions.length;

    const categoryBreakdown: Record<string, number> = {};
    const sourceBreakdown: Record<string, number> = {};

    transactions.forEach(t => {
      const amount = parseFloat(t.amount);
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + amount;
      sourceBreakdown[t.source] = (sourceBreakdown[t.source] || 0) + amount;
    });

    return {
      totalIncome,
      transactionCount,
      categoryBreakdown,
      sourceBreakdown
    };
  }
}

export const storage = new DatabaseStorage();
