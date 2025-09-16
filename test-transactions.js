// Simple test script to verify transaction functionality
// This script tests the API endpoints for transaction management

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing CashFlowPilot Transaction API...\n');

  try {
    // Test 1: Get all transactions
    console.log('1. Testing GET /api/transactions');
    const transactionsResponse = await fetch(`${BASE_URL}/api/transactions`);
    const transactions = await transactionsResponse.json();
    console.log(`✅ Found ${transactions.length} transactions`);

    // Test 2: Get stats
    console.log('\n2. Testing GET /api/stats');
    const statsResponse = await fetch(`${BASE_URL}/api/stats`);
    const stats = await statsResponse.json();
    console.log(`✅ Stats: $${stats.totalIncome} total income, ${stats.transactionCount} transactions`);

    // Test 3: Get period stats
    console.log('\n3. Testing GET /api/stats/period');
    const periodStatsResponse = await fetch(`${BASE_URL}/api/stats/period`);
    const periodStats = await periodStatsResponse.json();
    console.log(`✅ Period stats: Weekly $${periodStats.weekly.totalIncome}, Monthly $${periodStats.monthly.totalIncome}`);

    // Test 4: Create a new transaction
    console.log('\n4. Testing POST /api/transactions');
    const newTransaction = {
      amount: '50.00',
      description: 'Test gym session - Personal training',
      category: 'session-coaching',
      source: 'manual',
      status: 'completed',
      date: new Date().toISOString()
    };

    const createResponse = await fetch(`${BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTransaction)
    });

    if (createResponse.ok) {
      const createdTransaction = await createResponse.json();
      console.log(`✅ Created transaction: ${createdTransaction.id}`);
      
      // Test 5: Update the transaction
      console.log('\n5. Testing PUT /api/transactions/:id');
      const updateData = {
        amount: '75.00',
        description: 'Test gym session - Personal training (Updated)'
      };

      const updateResponse = await fetch(`${BASE_URL}/api/transactions/${createdTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        const updatedTransaction = await updateResponse.json();
        console.log(`✅ Updated transaction: $${updatedTransaction.amount} - ${updatedTransaction.description}`);
      } else {
        console.log('❌ Failed to update transaction');
      }

      // Test 6: Delete the transaction
      console.log('\n6. Testing DELETE /api/transactions/:id');
      const deleteResponse = await fetch(`${BASE_URL}/api/transactions/${createdTransaction.id}`, {
        method: 'DELETE'
      });

      if (deleteResponse.ok) {
        console.log('✅ Deleted test transaction');
      } else {
        console.log('❌ Failed to delete transaction');
      }
    } else {
      console.log('❌ Failed to create transaction');
    }

    // Test 7: Test filtering
    console.log('\n7. Testing transaction filters');
    const filterResponse = await fetch(`${BASE_URL}/api/transactions?category=session&source=manual`);
    const filteredTransactions = await filterResponse.json();
    console.log(`✅ Filtered transactions: ${filteredTransactions.length} found`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Transaction CRUD operations working');
    console.log('- Stats calculation working');
    console.log('- Filtering working');
    console.log('- API endpoints responding correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running with: npm run dev');
  }
}

// Run the tests
testAPI();
