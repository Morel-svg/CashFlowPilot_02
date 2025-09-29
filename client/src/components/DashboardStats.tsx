import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Calendar, Activity, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsData {
  totalIncome: number;
  transactionCount: number;
  avgTransaction: number;
  topCategory: string | null;
  topSource: string | null;
  categoryBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  growthPercentage?: number;
  weekly?: {
    totalIncome: number;
    transactionCount: number;
  };
  monthly?: {
    totalIncome: number;
    transactionCount: number;
  };
}

interface DashboardStatsProps {
  data?: StatsData;
  isLoading?: boolean;
}

export default function DashboardStats({ data, isLoading = false }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
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

  const getGrowthIcon = (growth?: number) => {
    if (!growth) return null;
    return growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getGrowthColor = (growth?: number) => {
    if (!growth) return "text-muted-foreground";
    return growth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'wave':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'orange-money':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'manual':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSourceDotColor = (source: string) => {
    switch (source) {
      case 'wave':
        return 'bg-blue-500';
      case 'orange-money':
        return 'bg-orange-500';
      case 'manual':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatSourceName = (source: string) => {
    switch (source) {
      case 'orange-money':
        return 'Orange Money';
      case 'wave':
        return 'Wave';
      case 'manual':
        return 'Manual';
      default:
        return source;
    }
  };

  const stats = [
    {
      title: "Total Income",
      value: formatCurrency(data?.totalIncome || 0),
      icon: DollarSign,
      change: data?.topSource ? (
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${getSourceDotColor(data.topSource)}`}></div>
          <span>Top: {formatSourceName(data.topSource)}</span>
        </div>
      ) : "No data",
      source: data?.topSource,
      description: "All time",
      growth: data?.growthPercentage
    },
    {
      title: "Avg Transaction",
      value: formatCurrency(data?.avgTransaction || 0),
      icon: TrendingUp,
      change: data?.topCategory ? `Top: ${data.topCategory.replace('-', ' ')}` : "No data",
      description: "Per transaction"
    },
    {
      title: "This Week",
      value: formatCurrency(data?.weekly?.totalIncome || 0),
      icon: Activity,
      change: `${data?.weekly?.transactionCount || 0} transactions`,
      description: "Last 7 days"
    },
    {
      title: "This Month",
      value: formatCurrency(data?.monthly?.totalIncome || 0),
      icon: Calendar,
      change: `${data?.monthly?.transactionCount || 0} transactions`,
      description: "Current month"
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
                className={`text-xs ${stat.source ? getSourceColor(stat.source) : ''}`}
                data-testid={`badge-change-${index}`}
              >
                {stat.change}
              </Badge>
              {stat.growth !== undefined && (
                <div className={`flex items-center gap-1 text-xs ${getGrowthColor(stat.growth)}`}>
                  {getGrowthIcon(stat.growth)}
                  <span>{Math.abs(stat.growth)}%</span>
                </div>
              )}
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