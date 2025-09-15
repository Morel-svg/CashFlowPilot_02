import { transactions, type Transaction, type InsertTransaction } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, ilike, sql } from "drizzle-orm";

// Interface for transaction storage operations
export interface IStorage {
  // Transaction CRUD operations
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
  
  // Dashboard stats
  getTransactionStats(startDate?: Date, endDate?: Date): Promise<{
    totalIncome: number;
    transactionCount: number;
    categoryBreakdown: Record<string, number>;
    sourceBreakdown: Record<string, number>;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.date));
  }

  async getTransactionsByFilters(filters: {
    search?: string;
    category?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]> {
    const conditions = [];

    if (filters.search) {
      conditions.push(ilike(transactions.description, `%${filters.search}%`));
    }

    if (filters.category && filters.category !== 'all') {
      conditions.push(eq(transactions.category, filters.category as any));
    }

    if (filters.source && filters.source !== 'all') {
      conditions.push(eq(transactions.source, filters.source as any));
    }

    if (filters.startDate) {
      conditions.push(gte(transactions.date, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(transactions.date, filters.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select()
      .from(transactions)
      .where(whereClause)
      .orderBy(desc(transactions.date));
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getTransactionStats(startDate?: Date, endDate?: Date): Promise<{
    totalIncome: number;
    transactionCount: number;
    categoryBreakdown: Record<string, number>;
    sourceBreakdown: Record<string, number>;
  }> {
    const conditions = [eq(transactions.status, 'completed')];
    
    if (startDate) {
      conditions.push(gte(transactions.date, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(transactions.date, endDate));
    }

    const whereClause = and(...conditions);

    // Get total income and count
    const [totals] = await db
      .select({
        totalIncome: sql<number>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
        transactionCount: sql<number>`COUNT(*)`
      })
      .from(transactions)
      .where(whereClause);

    // Get category breakdown
    const categoryStats = await db
      .select({
        category: transactions.category,
        total: sql<number>`SUM(CAST(${transactions.amount} AS DECIMAL))`
      })
      .from(transactions)
      .where(whereClause)
      .groupBy(transactions.category);

    // Get source breakdown
    const sourceStats = await db
      .select({
        source: transactions.source,
        total: sql<number>`SUM(CAST(${transactions.amount} AS DECIMAL))`
      })
      .from(transactions)
      .where(whereClause)
      .groupBy(transactions.source);

    const categoryBreakdown = categoryStats.reduce((acc, stat) => {
      acc[stat.category] = Number(stat.total);
      return acc;
    }, {} as Record<string, number>);

    const sourceBreakdown = sourceStats.reduce((acc, stat) => {
      acc[stat.source] = Number(stat.total);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIncome: Number(totals.totalIncome),
      transactionCount: Number(totals.transactionCount),
      categoryBreakdown,
      sourceBreakdown
    };
  }
}

export const storage = new DatabaseStorage();
