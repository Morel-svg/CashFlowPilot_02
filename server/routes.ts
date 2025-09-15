import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

// Query validation schemas
const transactionFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.enum(['session', 'session-coaching', 'monthly-subscription', 'weekly-subscription', 'all']).optional(),
  source: z.enum(['wave', 'orange-money', 'manual', 'all']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

const statsFiltersSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Transaction Routes

  // GET /api/transactions - Get all transactions with optional filters
  app.get("/api/transactions", async (req, res) => {
    try {
      const validationResult = transactionFiltersSchema.safeParse(req.query);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid filter parameters",
          details: validationResult.error.errors
        });
      }

      const { search, category, source, startDate, endDate } = validationResult.data;
      
      // Convert 'all' to undefined for storage layer
      const filters = {
        search,
        category: category === 'all' ? undefined : category,
        source: source === 'all' ? undefined : source,
        startDate: startDate && !isNaN(startDate.getTime()) ? startDate : undefined,
        endDate: endDate && !isNaN(endDate.getTime()) ? endDate : undefined,
      };

      const transactions = await storage.getTransactionsByFilters(filters);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // GET /api/transactions/:id - Get specific transaction
  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });

  // POST /api/transactions - Create new transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const validationResult = insertTransactionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid transaction data",
          details: validationResult.error.errors
        });
      }

      const transaction = await storage.createTransaction(validationResult.data);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  // PUT /api/transactions/:id - Update transaction
  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Allow partial updates by making all fields optional
      const updateSchema = insertTransactionSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid transaction data",
          details: validationResult.error.errors
        });
      }

      const transaction = await storage.updateTransaction(id, validationResult.data);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  // DELETE /api/transactions/:id - Delete transaction
  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTransaction(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  // GET /api/stats - Get dashboard statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const validationResult = statsFiltersSchema.safeParse(req.query);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid filter parameters",
          details: validationResult.error.errors
        });
      }

      const { startDate, endDate } = validationResult.data;
      
      // Only pass valid dates to storage
      const validStartDate = startDate && !isNaN(startDate.getTime()) ? startDate : undefined;
      const validEndDate = endDate && !isNaN(endDate.getTime()) ? endDate : undefined;

      const stats = await storage.getTransactionStats(validStartDate, validEndDate);
      
      // Calculate additional metrics
      const avgTransaction = stats.transactionCount > 0 
        ? stats.totalIncome / stats.transactionCount 
        : 0;

      // Get top category and source, or null if no data
      const categoryEntries = Object.entries(stats.categoryBreakdown);
      const sourceEntries = Object.entries(stats.sourceBreakdown);
      
      const topCategory = categoryEntries.length > 0 
        ? categoryEntries.sort(([,a], [,b]) => b - a)[0][0] 
        : null;
      
      const topSource = sourceEntries.length > 0
        ? sourceEntries.sort(([,a], [,b]) => b - a)[0][0]
        : null;

      res.json({
        ...stats,
        avgTransaction: Math.round(avgTransaction * 100) / 100,
        topCategory,
        topSource
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // GET /api/stats/period - Get stats for specific periods (weekly, monthly)
  app.get("/api/stats/period", async (req, res) => {
    try {
      const now = new Date();
      
      // This week (last 7 days)
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekStats = await storage.getTransactionStats(weekStart, now);
      
      // This month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthStats = await storage.getTransactionStats(monthStart, now);
      
      // Previous month for growth calculation
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const prevMonthStats = await storage.getTransactionStats(prevMonthStart, prevMonthEnd);
      
      // Calculate growth percentage
      const growthPercentage = prevMonthStats.totalIncome > 0
        ? Math.round(((monthStats.totalIncome - prevMonthStats.totalIncome) / prevMonthStats.totalIncome) * 100)
        : 0;

      res.json({
        weekly: {
          totalIncome: weekStats.totalIncome,
          transactionCount: weekStats.transactionCount
        },
        monthly: {
          totalIncome: monthStats.totalIncome,
          transactionCount: monthStats.transactionCount
        },
        growthPercentage,
        categoryBreakdown: monthStats.categoryBreakdown,
        sourceBreakdown: monthStats.sourceBreakdown
      });
    } catch (error) {
      console.error("Error fetching period stats:", error);
      res.status(500).json({ error: "Failed to fetch period statistics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
