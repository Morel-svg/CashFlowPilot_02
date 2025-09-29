import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Filter, MoreHorizontal, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import type { Transaction } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteTransaction } from "@/hooks/api";
import { useToast } from "@/hooks/use-toast";

type SortField = 'date' | 'amount' | 'description' | 'category' | 'source';
type SortDirection = 'asc' | 'desc';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onFilterChange?: (filters: { search: string; category: string; source: string }) => void;
  onEditTransaction?: (transaction: Transaction) => void;
}

export default function TransactionList({ transactions, isLoading = false, onFilterChange, onEditTransaction }: TransactionListProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);
  
  const deleteTransactionMutation = useDeleteTransaction();
  const { toast } = useToast();

  const handleFilterUpdate = () => {
    onFilterChange?.({
      search,
      category: categoryFilter,
      source: sourceFilter
    });
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransactionMutation.mutateAsync(id);
      toast({
        title: "Transaction Deleted",
        description: "The transaction has been successfully deleted.",
      });
      setDeleteTransactionId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSourceBadge = (source: Transaction['source']) => {
    const variants = {
      'wave': { variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      'orange-money': { variant: 'secondary' as const, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
      'manual': { variant: 'secondary' as const, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
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

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
      const matchesSource = sourceFilter === 'all' || transaction.source === sourceFilter;
      return matchesSearch && matchesCategory && matchesSource;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'source':
          aValue = a.source.toLowerCase();
          bValue = b.source.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

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
              <SelectItem value="session">Session</SelectItem>
              <SelectItem value="session-coaching">Session and coaching</SelectItem>
              <SelectItem value="monthly-subscription">Monthly subscription</SelectItem>
              <SelectItem value="weekly-subscription">Weekly subscription</SelectItem>
              <SelectItem value="others">Others</SelectItem>
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
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Sortable Headers */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('description')}
                    className="h-auto p-0 font-medium text-left justify-start hover:bg-transparent"
                  >
                    Description
                    {getSortIcon('description')}
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('category')}
                    className="h-auto p-0 text-xs hover:bg-transparent"
                  >
                    Category
                    {getSortIcon('category')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('date')}
                    className="h-auto p-0 text-xs hover:bg-transparent"
                  >
                    Date
                    {getSortIcon('date')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('source')}
                    className="h-auto p-0 text-xs hover:bg-transparent"
                  >
                    Source
                    {getSortIcon('source')}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('amount')}
                  className="h-auto p-0 font-semibold text-left justify-start hover:bg-transparent"
                >
                  Amount
                  {getSortIcon('amount')}
                </Button>
                <div className="w-9" /> {/* Spacer for actions column */}
              </div>
            </div>

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
                    <span className="capitalize">{transaction.category.replace('-', ' ')}</span>
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
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" data-testid={`button-menu-${transaction.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => onEditTransaction?.(transaction)}
                        data-testid={`button-edit-${transaction.id}`}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteTransactionId(transaction.id)}
                        className="text-destructive"
                        data-testid={`button-delete-${transaction.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            
            {!isLoading && filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-transactions">
                No transactions found matching your filters.
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTransactionId} onOpenChange={() => setDeleteTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTransactionId && handleDeleteTransaction(deleteTransactionId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}