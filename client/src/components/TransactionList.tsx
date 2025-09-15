import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MoreHorizontal } from "lucide-react";
import { useState } from "react";

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  source: 'wave' | 'orange-money' | 'manual';
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionListProps {
  transactions: Transaction[];
  onFilterChange?: (filters: { search: string; category: string; source: string }) => void;
}

export default function TransactionList({ transactions, onFilterChange }: TransactionListProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const handleFilterUpdate = () => {
    onFilterChange?.({
      search,
      category: categoryFilter,
      source: sourceFilter
    });
  };

  const getSourceBadge = (source: Transaction['source']) => {
    const variants = {
      'wave': { variant: 'secondary' as const, color: 'bg-secondary text-secondary-foreground' },
      'orange-money': { variant: 'default' as const, color: 'bg-primary text-primary-foreground' },
      'manual': { variant: 'outline' as const, color: '' }
    };
    return variants[source];
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const variants = {
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return variants[status];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    const matchesSource = sourceFilter === 'all' || transaction.source === sourceFilter;
    return matchesSearch && matchesCategory && matchesSource;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterUpdate();
              }}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={(value) => {
            setCategoryFilter(value);
            handleFilterUpdate();
          }}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="consulting">Consulting</SelectItem>
              <SelectItem value="products">Products</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sourceFilter} onValueChange={(value) => {
            setSourceFilter(value);
            handleFilterUpdate();
          }}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-source">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="wave">Wave</SelectItem>
              <SelectItem value="orange-money">Orange Money</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover-elevate"
              data-testid={`row-transaction-${transaction.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-foreground truncate">
                    {transaction.description}
                  </h4>
                  <Badge 
                    className={`${getSourceBadge(transaction.source).color} text-xs`}
                    data-testid={`badge-source-${transaction.id}`}
                  >
                    {transaction.source === 'orange-money' ? 'Orange Money' : 
                     transaction.source === 'wave' ? 'Wave' : 'Manual'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{transaction.category}</span>
                  <span>{formatDate(transaction.date)}</span>
                  <Badge 
                    className={`${getStatusBadge(transaction.status)} text-xs`}
                    data-testid={`badge-status-${transaction.id}`}
                  >
                    {transaction.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-semibold text-lg text-green-600 dark:text-green-400" data-testid={`text-amount-${transaction.id}`}>
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
                
                <Button size="icon" variant="ghost" data-testid={`button-menu-${transaction.id}`}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-transactions">
              No transactions found matching your filters.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}