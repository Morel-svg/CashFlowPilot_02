import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Calendar, Activity } from "lucide-react";

interface StatsData {
  totalIncome: number;
  monthlyIncome: number;
  weeklyIncome: number;
  transactionCount: number;
  growthPercentage: number;
  topSource: string;
}

interface DashboardStatsProps {
  data: StatsData;
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: "Total Income",
      value: formatCurrency(data.totalIncome),
      icon: DollarSign,
      change: `+${data.growthPercentage}%`,
      description: "vs last month"
    },
    {
      title: "This Month",
      value: formatCurrency(data.monthlyIncome),
      icon: Calendar,
      change: "Current month",
      description: "Monthly total"
    },
    {
      title: "This Week", 
      value: formatCurrency(data.weeklyIncome),
      icon: TrendingUp,
      change: "Weekly total",
      description: "7 days"
    },
    {
      title: "Transactions",
      value: data.transactionCount.toString(),
      icon: Activity,
      change: data.topSource,
      description: "Top source"
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