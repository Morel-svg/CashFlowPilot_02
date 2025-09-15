import DashboardStats from '../DashboardStats'

export default function DashboardStatsExample() {
  // todo: remove mock functionality
  const mockData = {
    totalIncome: 28750,
    monthlyIncome: 8200,
    weeklyIncome: 1850,
    transactionCount: 247,
    growthPercentage: 18,
    topSource: "Wave"
  };

  return <DashboardStats data={mockData} />
}