import TransactionList, { Transaction } from '../TransactionList'

export default function TransactionListExample() {
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
    }
  ];

  return (
    <TransactionList 
      transactions={mockTransactions}
      onFilterChange={(filters) => console.log('Filter changed:', filters)}
    />
  )
}