# CashFlowPilot - Gym Income Management System

A private, single-business dashboard for managing income transactions, built as a local Electron desktop app (React + Express).

## 🚀 Features

### ✅ Transaction Management
- **Add Transactions**: Create new income transactions with detailed information
- **Edit Transactions**: Update existing transaction details
- **Delete Transactions**: Remove transactions with confirmation dialog
- **Transaction Categories**: Session, Session + Coaching, Monthly/Weekly Subscriptions
- **Payment Sources**: Wave, Orange Money, Manual Entry

### ✅ Advanced Search & Filtering
- **Real-time Search**: Search transactions by description
- **Category Filtering**: Filter by transaction category
- **Source Filtering**: Filter by payment source
- **Date Range Filtering**: Filter transactions by date range
- **Sortable Columns**: Sort by date, amount, description, category, or source

### ✅ Dashboard Analytics
- **Total Income**: Complete income tracking
- **Average Transaction**: Calculate average transaction value
- **Weekly/Monthly Stats**: Period-based income analysis
- **Growth Tracking**: Month-over-month growth percentage
- **Category Breakdown**: Income distribution by category
- **Source Breakdown**: Income distribution by payment source

### ✅ User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: Comprehensive error messages and validation
- **Toast Notifications**: User feedback for all actions
- **Real-time Updates**: Automatic data refresh after changes

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Query** for data fetching
- **Wouter** for routing
- **Framer Motion** for animations

### Backend
- **Express.js** with TypeScript
- **Local file storage** (JSON file on disk)
- **Zod** for validation

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Drizzle Kit** for database migrations

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CashFlowPilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the desktop app (development)**
   ```bash
   npm run electron:dev
   ```

4. **Build desktop installers (macOS + Windows)**
   ```bash
   npm run electron:pack
   ```

5. **Optional: run as a web app**
   ```bash
   npm run dev
   ```

   Navigate to `http://localhost:3000`

## 🧪 Testing

Run the test script to verify all functionality (requires the server to be running):

```bash
node test-transactions.js
```

This will test:
- Transaction CRUD operations
- Stats calculation
- Filtering functionality
- API endpoint responses

## 💾 Data Storage

The desktop app stores transactions locally as a JSON file:

- macOS: `~/Library/Application Support/CashFlowPilot/data/transactions.json`
- Windows: `%APPDATA%\\CashFlowPilot\\data\\transactions.json`

To move the app to another computer, install it there and copy this file into the same location.

## 📊 Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category transaction_category NOT NULL,
  source transaction_source NOT NULL,
  status transaction_status DEFAULT 'completed',
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Enums
- **Categories**: session, session-coaching, monthly-subscription, weekly-subscription
- **Sources**: wave, orange-money, manual
- **Status**: completed, pending, failed

## 🔧 API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions with optional filters
- `GET /api/transactions/:id` - Get specific transaction
- `GET /api/transactions/export` - Export transactions to CSV (NEW!)
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Statistics
- `GET /api/stats` - Get dashboard statistics
- `GET /api/stats/period` - Get period-based statistics

## 🎯 Key Features Implemented

### 1. Transaction Records Setup ✅
- Complete database schema with proper relationships
- Transaction categories and payment sources
- Status tracking for transaction lifecycle

### 2. Transaction Management ✅
- Full CRUD operations for transactions
- Form validation and error handling
- Confirmation dialogs for destructive actions

### 3. Search and Sort ✅
- Real-time search functionality
- Multi-column sorting with visual indicators
- Advanced filtering options
- Date range filtering

### 4. Dashboard Statistics ✅
- Real-time calculation of income metrics
- Period-based analysis (weekly, monthly)
- Growth percentage tracking
- Category and source breakdowns

### 5. Screen Integration ✅
- All screens connected to real API endpoints
- Proper loading states and error handling
- Responsive design across all components

### 6. Testing ✅
- Comprehensive test script for API endpoints
- End-to-end transaction flow testing
- Validation of all CRUD operations

## 🚀 Getting Started

1. **Add Your First Transaction**
   - Click the "Add Transaction" button
   - Fill in the transaction details
   - Select category and payment source
   - Save the transaction

2. **Explore the Dashboard**
   - View your income statistics
   - Check weekly and monthly breakdowns
   - Monitor growth trends

3. **Manage Transactions**
   - Use search and filters to find specific transactions
   - Click the menu button to edit or delete
   - Sort by any column for better organization

4. **Track Performance**
   - Monitor your top income categories
   - Track payment source performance
   - Analyze growth patterns

### ✅ Advanced Analytics (NEW!)
- **Interactive Charts**: Pie charts for category and source breakdowns
- **Trend Analysis**: Monthly income and transaction volume trends
- **Comparative Views**: Side-by-side category performance
- **Visual Insights**: Rich data visualization using Recharts

### ✅ Data Export (NEW!)
- **CSV Export**: Export filtered transaction data to CSV format
- **Applied Filters**: Export respects current search and filter settings
- **Automatic Download**: One-click download with timestamped filenames
- **Flexible Data**: Export exactly what you see on screen

## 🔮 Future Enhancements

- **API Integrations**: Connect with Wave and Orange Money APIs
- **User Authentication**: Multi-user support
- **Mobile App**: React Native mobile application
- **Automated Sync**: Real-time transaction synchronization
- **Excel Export**: Enhanced export options with XLSX format
- **Advanced Analytics**: Time-series analysis and forecasting

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository.

---

**CashFlowPilot** - Streamline your gym income management with powerful analytics and intuitive transaction tracking.
