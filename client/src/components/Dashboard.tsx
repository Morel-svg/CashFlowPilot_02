import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Header from "./Header";
import DashboardStats from "./DashboardStats";
import TransactionList, { Transaction } from "./TransactionList";
import AddTransactionForm from "./AddTransactionForm";
import DateRangeFilter from "./DateRangeFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Filter, Download, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // todo: remove mock functionality
  const mockStatsData = {
    totalIncome: 28750,
    monthlyIncome: 8200,
    weeklyIncome: 1850,
    transactionCount: 247,
    growthPercentage: 18,
    topSource: "Wave"
  };

  // todo: remove mock functionality
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      amount: 85,
      description: 'Personal Training Session - John',
      category: 'session',
      source: 'wave',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: '2', 
      amount: 120,
      description: 'Fitness Coaching - Sarah',
      category: 'session-coaching',
      source: 'orange-money',
      date: '2024-01-14',
      status: 'completed'
    },
    {
      id: '3',
      amount: 150,
      description: 'Monthly Membership - Mike',
      category: 'monthly-subscription',
      source: 'manual',
      date: '2024-01-13',
      status: 'pending'
    },
    {
      id: '4',
      amount: 45,
      description: 'Weekly Pass - Lisa',
      category: 'weekly-subscription',
      source: 'wave',
      date: '2024-01-12',
      status: 'completed'
    },
    {
      id: '5',
      amount: 95,
      description: 'CrossFit Session - Alex',
      category: 'session',
      source: 'orange-money',
      date: '2024-01-11',
      status: 'failed'
    },
    {
      id: '6',
      amount: 180,
      description: 'Nutrition Coaching - Emma',
      category: 'session-coaching',
      source: 'wave',
      date: '2024-01-10',
      status: 'completed'
    }
  ];

  const handleAddTransaction = (data: any) => {
    console.log('New transaction:', data);
    setShowAddTransaction(false);
    // In real app, this would update the transaction list
  };

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters);
    // In real app, this would filter the transactions
  };

  const handleDateRangeChange = (range: any) => {
    console.log('Date range changed:', range);
    // In real app, this would filter transactions by date
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('Refreshing data...');
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      console.log('Data refreshed');
    }, 2000);
  };

  const handleExport = () => {
    console.log('Exporting data...');
    // In real app, this would export transaction data
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
              disabled={isRefreshing}
              className="gap-2"
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          </div>
        </div>

        {/* API Integration Status */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-foreground">API Integration Status</p>
                <p className="text-sm text-muted-foreground">Connect your Wave and Orange Money accounts for automatic transaction sync</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Wave: Pending
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Orange Money: Pending
                </Badge>
                <Button size="sm" variant="outline" className="gap-1" data-testid="button-setup-api">
                  <Settings className="h-3 w-3" />
                  Setup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats */}
            <DashboardStats data={mockStatsData} />
            
            {/* Transactions */}
            <TransactionList 
              transactions={mockTransactions}
              onFilterChange={handleFilterChange}
            />
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
                    <Badge variant="secondary" className="text-xs">Sessions</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg. Transaction</span>
                    <span className="font-medium">$112</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">This Week</span>
                    <span className="font-medium text-green-600">+23%</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Payment Sources</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-secondary rounded-sm"></div>
                        <span>Wave</span>
                      </div>
                      <span className="font-medium">62%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded-sm"></div>
                        <span>Orange Money</span>
                      </div>
                      <span className="font-medium">28%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-muted rounded-sm"></div>
                        <span>Manual</span>
                      </div>
                      <span className="font-medium">10%</span>
                    </div>
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
    </div>
  );
}