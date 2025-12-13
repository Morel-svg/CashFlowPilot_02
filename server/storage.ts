import { type Transaction, type InsertTransaction } from "@shared/schema";
import { supabase } from "./db";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export class MemStorage implements IStorage {
  protected transactions: Map<string, Transaction>;
  protected currentId: number;

  constructor() {
    this.transactions = new Map();
    this.currentId = 1;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = String(this.currentId++);
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      status: insertTransaction.status || 'completed',
      date: insertTransaction.date || new Date(),
      createdAt: new Date(),
      createdBy: null,
      amount: insertTransaction.amount.toString(), // Ensure amount is string as per schema
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getTransactionsByFilters(filters: {
    search?: string;
    category?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]> {
    let results = Array.from(this.transactions.values());

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(t => 
        t.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category && filters.category !== 'all') {
      results = results.filter(t => t.category === filters.category);
    }

    if (filters.source && filters.source !== 'all') {
      results = results.filter(t => t.source === filters.source);
    }

    if (filters.startDate) {
      results = results.filter(t => new Date(t.date) >= filters.startDate!);
    }

    if (filters.endDate) {
      results = results.filter(t => new Date(t.date) <= filters.endDate!);
    }

    return results.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existing = this.transactions.get(id);
    if (!existing) return undefined;

    const updated: Transaction = {
      ...existing,
      ...updates,
      amount: updates.amount ? updates.amount.toString() : existing.amount,
    };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  async getTransactionStats(startDate?: Date, endDate?: Date): Promise<{
    totalIncome: number;
    transactionCount: number;
    categoryBreakdown: Record<string, number>;
    sourceBreakdown: Record<string, number>;
  }> {
    let transactions = Array.from(this.transactions.values());

    if (startDate) {
      transactions = transactions.filter(t => new Date(t.date) >= startDate);
    }

    if (endDate) {
      transactions = transactions.filter(t => new Date(t.date) <= endDate);
    }

    transactions = transactions.filter(t => t.status === 'completed');

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

export class JsonFileStorage extends MemStorage {
  private filePath: string;

  constructor(filePath: string) {
    super();
    this.filePath = filePath;
    this._load();
  }

  private _load() {
    if (fs.existsSync(this.filePath)) {
      try {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        const transactions = JSON.parse(data);
        transactions.forEach((t: any) => {
            // Fix date strings back to Date objects
            if (t.date) t.date = new Date(t.date);
            if (t.createdAt) t.createdAt = new Date(t.createdAt);
            this.transactions.set(t.id, t);
            
            // Update currentId to be higher than any existing id
            const idNum = parseInt(t.id);
            if (!isNaN(idNum) && idNum >= this.currentId) {
                this.currentId = idNum + 1;
            }
        });
      } catch (e) {
        console.error("Failed to load transactions from file:", e);
      }
    }
  }

  private _save() {
    try {
        const data = Array.from(this.transactions.values());
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Failed to save transactions to file:", e);
    }
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await super.createTransaction(insertTransaction);
    this._save();
    return result;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const result = await super.updateTransaction(id, updates);
    this._save();
    return result;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await super.deleteTransaction(id);
    this._save();
    return result;
  }
}

export const storage = new JsonFileStorage(path.join(process.cwd(), 'server/data/transactions.json'));
