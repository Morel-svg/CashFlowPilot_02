import DashboardStats from '../DashboardStats'

export default function DashboardStatsExample() {
  // todo: remove mock functionality
  const mockData = {
    totalIncome: 45250,
    monthlyIncome: 12800,
    weeklyIncome: 3200,
    transactionCount: 127,
    growthPercentage: 12,
    topSource: "Wave"
  };

  return <DashboardStats data={mockData} />
}