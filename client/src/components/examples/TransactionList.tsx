import TransactionList from "../TransactionList";
import type { Transaction } from "@shared/schema";

export default function TransactionListExample() {
  // todo: remove mock functionality
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      amount: "85",
      description: 'Personal Training Session - John',
      category: 'session',
      source: 'wave',
      date: new Date('2024-01-15'),
      status: 'completed',
      createdAt: new Date('2024-01-15'),
      createdBy: null
    },
    {
      id: '2', 
      amount: "120",
      description: 'Fitness Coaching - Sarah',
      category: 'session-coaching',
      source: 'orange-money',
      date: new Date('2024-01-14'),
      status: 'completed',
      createdAt: new Date('2024-01-14'),
      createdBy: null
    },
    {
      id: '3',
      amount: "150",
      description: 'Monthly Membership - Mike',
      category: 'monthly-subscription',
      source: 'manual',
      date: new Date('2024-01-13'),
      status: 'pending',
      createdAt: new Date('2024-01-13'),
      createdBy: null
    },
    {
      id: '4',
      amount: "45",
      description: 'Weekly Pass - Lisa',
      category: 'weekly-subscription',
      source: 'wave',
      date: new Date('2024-01-12'),
      status: 'completed',
      createdAt: new Date('2024-01-12'),
      createdBy: null
    },
    {
      id: '5',
      amount: "95",
      description: 'CrossFit Session - Alex',
      category: 'session',
      source: 'orange-money',
      date: new Date('2024-01-11'),
      status: 'failed',
      createdAt: new Date('2024-01-11'),
      createdBy: null
    }
  ];

  return (
    <TransactionList 
      transactions={mockTransactions}
      onFilterChange={(filters) => console.log('Filter changed:', filters)}
    />
  )
}
