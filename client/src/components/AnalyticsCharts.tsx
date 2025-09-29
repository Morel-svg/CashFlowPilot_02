import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig 
} from "@/components/ui/chart";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  LineChart, 
  Line,
  ResponsiveContainer 
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsData {
  categoryBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  monthlyTrend?: Array<{
    month: string;
    income: number;
    transactions: number;
  }>;
  weeklyTrend?: Array<{
    week: string;
    income: number;
    transactions: number;
  }>;
}

interface AnalyticsChartsProps {
  data?: AnalyticsData;
  isLoading?: boolean;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const categoryConfig: ChartConfig = {
  session: {
    label: "Session",
    color: "hsl(var(--chart-1))",
  },
  "session-coaching": {
    label: "Session + Coaching",
    color: "hsl(var(--chart-2))",
  },
  "monthly-subscription": {
    label: "Monthly Subscription",
    color: "hsl(var(--chart-3))",
  },
  "weekly-subscription": {
    label: "Weekly Subscription",
    color: "hsl(var(--chart-4))",
  },
  "others": {
    label: "Others",
    color: "hsl(var(--chart-5))",
  },
};

const sourceConfig: ChartConfig = {
  wave: {
    label: "Wave",
    color: "#3B82F6", // Blue
  },
  "orange-money": {
    label: "Orange Money",
    color: "#F97316", // Orange
  },
  manual: {
    label: "Manual",
    color: "#10B981", // Green
  },
};

export default function AnalyticsCharts({ data, isLoading = false }: AnalyticsChartsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCategoryName = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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

  // Transform category data for pie chart
  const categoryData = data?.categoryBreakdown ? Object.entries(data.categoryBreakdown).map(([category, amount]) => ({
    name: formatCategoryName(category),
    value: amount,
    category,
  })) : [];

  // Transform source data for pie chart
  const sourceData = data?.sourceBreakdown ? Object.entries(data.sourceBreakdown).map(([source, amount]) => ({
    name: formatSourceName(source),
    value: amount,
    source,
  })) : [];

  // Sample monthly trend data (in a real app, this would come from the API)
  const monthlyTrend = data?.monthlyTrend || [
    { month: "Jan", income: 2400, transactions: 15 },
    { month: "Feb", income: 1398, transactions: 12 },
    { month: "Mar", income: 9800, transactions: 25 },
    { month: "Apr", income: 3908, transactions: 18 },
    { month: "May", income: 4800, transactions: 22 },
    { month: "Jun", income: 3800, transactions: 20 },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="hover-elevate">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Category Breakdown */}
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="text-lg">Income by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={categoryConfig} className="h-64">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [formatCurrency(Number(value)), ""]}
                  />
                }
              />
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Source Breakdown */}
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="text-lg">Income by Source</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={sourceConfig} className="h-64">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [formatCurrency(Number(value)), ""]}
                  />
                }
              />
              <Pie
                data={sourceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
              >
                {sourceData.map((entry, index) => {
                  const sourceKey = entry.source as keyof typeof sourceConfig;
                  const color = sourceConfig[sourceKey]?.color || COLORS[index % COLORS.length];
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Monthly Income Trend */}
      <Card className="hover-elevate md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Income Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-64">
            <LineChart data={monthlyTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      name === "income" ? formatCurrency(Number(value)) : value,
                      name === "income" ? "Income" : "Transactions"
                    ]}
                  />
                }
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Category Comparison Bar Chart */}
      <Card className="hover-elevate md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={categoryConfig} className="h-64">
            <BarChart data={categoryData}>
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [formatCurrency(Number(value)), "Income"]}
                  />
                }
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Transaction Volume Trend */}
      <Card className="hover-elevate md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Transaction Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-64">
            <BarChart data={monthlyTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [value, "Transactions"]}
                  />
                }
              />
              <Bar 
                dataKey="transactions" 
                fill="hsl(var(--chart-2))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
