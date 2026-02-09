import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type {
  Transaction,
  InsertTransaction,
  StatsResponse,
  PeriodStatsResponse,
} from "@shared/schema";

// Transaction API hooks
export function useTransactions(filters?: {
  search?: string;
  category?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
}) {
  const searchParams = new URLSearchParams();
  if (filters?.search) searchParams.set("search", filters.search);
  if (filters?.category && filters.category !== "all") searchParams.set("category", filters.category);
  if (filters?.source && filters.source !== "all") searchParams.set("source", filters.source);
  if (filters?.startDate) searchParams.set("startDate", filters.startDate);
  if (filters?.endDate) searchParams.set("endDate", filters.endDate);

  const queryString = searchParams.toString();
  const url = `/api/transactions${queryString ? `?${queryString}` : ""}`;

  return useQuery<Transaction[]>({
    queryKey: ["/api/transactions", filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }
      return response.json();
    },
  });
}

export function useTransaction(id: string) {
  return useQuery<Transaction>({
    queryKey: ["/api/transactions", id],
    queryFn: async () => {
      const response = await fetch(`/api/transactions/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch transaction: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  return useMutation({
    mutationFn: async (data: InsertTransaction) => {
      const response = await apiRequest("POST", "/api/transactions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}

export function useUpdateTransaction() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTransaction> }) => {
      const response = await apiRequest("PUT", `/api/transactions/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}

export function useDeleteTransaction() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}

// Stats API hooks
export function useStats(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  const searchParams = new URLSearchParams();
  if (filters?.startDate) searchParams.set("startDate", filters.startDate);
  if (filters?.endDate) searchParams.set("endDate", filters.endDate);

  const queryString = searchParams.toString();
  const url = `/api/stats${queryString ? `?${queryString}` : ""}`;

  return useQuery<StatsResponse>({
    queryKey: ["/api/stats", filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      return response.json();
    },
  });
}

export function usePeriodStats(period: "weekly" | "monthly", startDate?: string, endDate?: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("period", period);
  if (startDate) searchParams.set("startDate", startDate);
  if (endDate) searchParams.set("endDate", endDate);

  return useQuery<PeriodStatsResponse>({
    queryKey: ["/api/stats/period", period, startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/stats/period?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch period stats: ${response.statusText}`);
      }
      return response.json();
    },
  });
}
