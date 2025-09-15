import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Calendar, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsData {
  totalIncome: number;
  transactionCount: number;
  avgTransaction: number;
  topCategory: string | null;
  topSource: string | null;
  categoryBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
}

interface DashboardStatsProps {
  data?: StatsData;
  isLoading?: boolean;
}

export default function DashboardStats({ data, isLoading = false }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Income",
      value: formatCurrency(data?.totalIncome || 0),
      icon: DollarSign,
      change: data?.topSource ? `Top: ${data.topSource === 'orange-money' ? 'Orange Money' : data.topSource === 'wave' ? 'Wave' : 'Manual'}` : "No data",
      description: "All time"
    },
    {
      title: "Avg Transaction",
      value: formatCurrency(data?.avgTransaction || 0),
      icon: TrendingUp,
      change: data?.topCategory ? `Top: ${data.topCategory.replace('-', ' ')}` : "No data",
      description: "Per transaction"
    },
    {
      title: "Total Transactions",
      value: (data?.transactionCount || 0).toString(),
      icon: Activity,
      change: "Total count",
      description: "All transactions"
    },
    {
      title: "Categories",
      value: data?.categoryBreakdown ? Object.keys(data.categoryBreakdown).length.toString() : "0",
      icon: Calendar,
      change: "Active categories",
      description: "In use"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover-elevate" data-testid={`card-stat-${index}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground" data-testid={`text-value-${index}`}>
              {stat.value}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className="text-xs"
                data-testid={`badge-change-${index}`}
              >
                {stat.change}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}