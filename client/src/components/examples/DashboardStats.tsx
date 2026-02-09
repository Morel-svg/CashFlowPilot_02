import DashboardStats from '../DashboardStats'

export default function DashboardStatsExample() {
  // todo: remove mock functionality
  const mockData = {
    totalIncome: 28750,
    transactionCount: 247,
    avgTransaction: 116,
    topCategory: "session",
    growthPercentage: 18,
    topSource: "wave",
    categoryBreakdown: {
      session: 13450,
      "session-coaching": 6200,
      "monthly-subscription": 5400,
      "weekly-subscription": 2400,
      others: 1300,
    },
    sourceBreakdown: {
      wave: 15800,
      "orange-money": 9200,
      manual: 3750,
    },
    weekly: {
      totalIncome: 1850,
      transactionCount: 21,
    },
    monthly: {
      totalIncome: 8200,
      transactionCount: 78,
    },
  };

  return <DashboardStats data={mockData} />
}
