import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Header from "./Header";
import DashboardStats from "./DashboardStats";
import AnalyticsCharts from "./AnalyticsCharts";
import TransactionList from "./TransactionList";
import AddTransactionForm from "./AddTransactionForm";
import EditTransactionForm from "./EditTransactionForm";
import DateRangeFilter from "./DateRangeFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Filter, Download, RefreshCw, BarChart3, List } from "lucide-react";
import { useTransactions, useStats, useCreateTransaction, useUpdateTransaction, usePeriodStats } from "@/hooks/api";
import type { InsertTransaction, Transaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showEditTransaction, setShowEditTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    search?: string;
    category?: string;
    source?: string;
    startDate?: string;
    endDate?: string;
  }>({});
  
  const { toast } = useToast();

  // Fetch real data from API
  const { data: transactions = [], isLoading: transactionsLoading, refetch: refetchTransactions } = useTransactions(filters);
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useStats(filters);
  const { data: periodStatsData, isLoading: periodStatsLoading, refetch: refetchPeriodStats } = usePeriodStats("monthly");
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();

  const handleAddTransaction = async (data: InsertTransaction) => {
    try {
      await createTransactionMutation.mutateAsync(data);
      setShowAddTransaction(false);
      toast({
        title: "Transaction Added",
        description: "Your transaction has been successfully recorded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditTransaction(true);
  };

  const handleUpdateTransaction = async (id: string, data: Partial<InsertTransaction>) => {
    try {
      await updateTransactionMutation.mutateAsync({ id, data });
      setShowEditTransaction(false);
      setEditingTransaction(null);
      toast({
        title: "Transaction Updated",
        description: "Your transaction has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (newFilters: {
    search?: string;
    category?: string;
    source?: string;
  }) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const handleDateRangeChange = (range: {
    startDate?: string;
    endDate?: string;
  }) => {
    setFilters(prev => ({
      ...prev,
      ...range
    }));
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchTransactions(), refetchStats(), refetchPeriodStats()]);
      toast({
        title: "Data Refreshed",
        description: "All data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Combine stats data with period stats
  const combinedStatsData = statsData && periodStatsData ? {
    ...statsData,
    ...periodStatsData,
    weekly: periodStatsData.weekly,
    monthly: periodStatsData.monthly,
    growthPercentage: periodStatsData.growthPercentage
  } : statsData;

  const handleExport = async () => {
    try {
      // Build query parameters from current filters
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category && filters.category !== 'all') queryParams.append('category', filters.category);
      if (filters.source && filters.source !== 'all') queryParams.append('source', filters.source);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      // Create download link
      const url = `/api/transactions/export?${queryParams.toString()}`;
      
      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Started",
        description: "Your transaction data is being downloaded as CSV.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export transaction data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAddTransaction={() => setShowAddTransaction(true)}
        onToggleMenu={() => console.log('Menu toggled')}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gym Income Dashboard</h1>
            <p className="text-muted-foreground">Track your gym revenue from sessions and memberships</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
              data-testid="button-toggle-filters"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
              data-testid="button-export"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={transactionsLoading || statsLoading || periodStatsLoading}
              className="gap-2"
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 ${transactionsLoading || statsLoading || periodStatsLoading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          </div>
        </div>



        {/* Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats */}
            <DashboardStats 
              data={combinedStatsData} 
              isLoading={statsLoading || periodStatsLoading}
            />
            
            {/* Main Content Tabs */}
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions" className="gap-2">
                  <List className="h-4 w-4" />
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="transactions" className="space-y-6">
                <TransactionList 
                  transactions={transactions}
                  isLoading={transactionsLoading}
                  onFilterChange={handleFilterChange}
                  onEditTransaction={handleEditTransaction}
                />
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-6">
                <AnalyticsCharts 
                  data={{
                    categoryBreakdown: combinedStatsData?.categoryBreakdown || {},
                    sourceBreakdown: combinedStatsData?.sourceBreakdown || {},
                  }}
                  isLoading={statsLoading || periodStatsLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Date Range Filter */}
            {showFilters && (
              <DateRangeFilter onRangeChange={handleDateRangeChange} />
            )}
            
            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Top Category</span>
                    {statsData?.topCategory ? (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {statsData.topCategory?.replace('-', ' ') || 'Unknown'}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">No data</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg. Transaction</span>
                    <span className="font-medium">
                      {(statsData?.avgTransaction || 0).toLocaleString('fr-FR')} CFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Transactions</span>
                    <span className="font-medium">{statsData?.transactionCount || 0}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Payment Sources</p>
                  <div className="space-y-2">
                    {statsData?.sourceBreakdown ? (
                      Object.entries(statsData.sourceBreakdown).map(([source, amount]) => {
                        const percentage = statsData?.totalIncome > 0 
                          ? ((amount / (statsData.totalIncome || 1)) * 100).toFixed(0)
                          : '0';
                        const displayName = source === 'orange-money' ? 'Orange Money' : 
                                          source === 'wave' ? 'Wave' : 'Manual';
                        const colorClass = source === 'wave' ? 'bg-blue-500' :
                                          source === 'orange-money' ? 'bg-orange-500' : 'bg-green-500';
                        
                        return (
                          <div key={source} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 ${colorClass} rounded-sm`}></div>
                              <span>{displayName}</span>
                            </div>
                            <span className="font-medium">{percentage}%</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-muted-foreground">No data available</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Income Transaction</DialogTitle>
          </DialogHeader>
          <AddTransactionForm 
            onSubmit={handleAddTransaction}
            onCancel={() => setShowAddTransaction(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={showEditTransaction} onOpenChange={setShowEditTransaction}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <EditTransactionForm 
              transaction={editingTransaction}
              onSubmit={handleUpdateTransaction}
              onCancel={() => {
                setShowEditTransaction(false);
                setEditingTransaction(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}