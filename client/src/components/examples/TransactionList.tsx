import TransactionList, { Transaction } from '../TransactionList'

export default function TransactionListExample() {
  // todo: remove mock functionality
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      amount: 2500,
      description: 'Web Development Services',
      category: 'services',
      source: 'wave',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: '2', 
      amount: 1800,
      description: 'Product Sales - Website',
      category: 'sales',
      source: 'orange-money',
      date: '2024-01-14',
      status: 'completed'
    },
    {
      id: '3',
      amount: 950,
      description: 'Consulting Session',
      category: 'consulting',
      source: 'manual',
      date: '2024-01-13',
      status: 'pending'
    },
    {
      id: '4',
      amount: 3200,
      description: 'Mobile App Development',
      category: 'services',
      source: 'wave',
      date: '2024-01-12',
      status: 'completed'
    },
    {
      id: '5',
      amount: 650,
      description: 'Digital Marketing Package',
      category: 'products',
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