import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Groups from './components/Groups';
import Friends from './components/Friends';
import AddExpenseModal from './components/AddExpenseModal';
import AddPersonModal from './components/AddPersonModal';
import { User, Expense, Group, Balance } from './types';
import { calculateBalances } from './utils/calculations';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  
  // Mock data - in a real app, this would come from an API
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'You', email: 'you@example.com' },
    { id: '2', name: 'Alice Johnson', email: 'alice@example.com' },
    { id: '3', name: 'Bob Smith', email: 'bob@example.com' },
    { id: '4', name: 'Carol Davis', email: 'carol@example.com' },
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      description: 'Dinner at Italian Restaurant',
      amount: 1450.00,
      paidBy: '1',
      splitBetween: ['1', '2', '3'],
      date: '2025-01-15',
      category: 'food',
    },
    {
      id: '2',
      description: 'Uber to Airport',
      amount: 540.00,
      paidBy: '2',
      splitBetween: ['1', '2'],
      date: '2025-01-14',
      category: 'transport',
    },
    {
      id: '3',
      description: 'Movie Tickets',
      amount: 432.00,
      paidBy: '3',
      splitBetween: ['1', '2', '3', '4'],
      date: '2025-01-13',
      category: 'entertainment',
    },
    {
      id: '4',
      description: 'Grocery Shopping',
      amount: 1030.00,
      paidBy: '1',
      splitBetween: ['1', '4'],
      date: '2025-01-12',
      category: 'food',
    },
    {
      id: '5',
      description: 'Electric Bill',
      amount: 1800.00,
      paidBy: '4',
      splitBetween: ['1', '2', '3', '4'],
      date: '2025-01-10',
      category: 'utilities',
    },
  ]);

  const [groups] = useState<Group[]>([
    {
      id: '1',
      name: 'Roommates',
      description: 'Shared apartment expenses',
      members: ['1', '2', '3'],
      createdAt: '2025-01-01',
      color: 'bg-blue-500',
    },
    {
      id: '2',
      name: 'Weekend Trip',
      description: 'Ski trip to Colorado',
      members: ['1', '2', '4'],
      createdAt: '2025-01-05',
      color: 'bg-purple-500',
    },
    {
      id: '3',
      name: 'Office Lunch Group',
      description: 'Weekly team lunches',
      members: ['1', '3', '4'],
      createdAt: '2025-01-08',
      color: 'bg-green-500',
    },
  ]);

  const currentUserId = '1';
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);

  useEffect(() => {
    const calculatedBalances = calculateBalances(expenses, users);
    setBalances(calculatedBalances);
  }, [expenses, users]);

  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expense: Expense = {
      ...newExpense,
      id: Date.now().toString(),
    };
    setExpenses(prev => [expense, ...prev]);
  };

  const handleAddPerson = (newPerson: Omit<User, 'id'>) => {
    const person: User = {
      ...newPerson,
      id: Date.now().toString(),
    };
    setUsers(prev => [...prev, person]);
  };

  const handleShowMonthlyReport = () => {
    // This function is called when monthly report is generated
    console.log('Monthly report generated');
  };

  const handleSettleAllBalances = () => {
    // Reset all balances by creating new expenses that settle everything
    // In a real app, this would create settlement transactions
    console.log('All balances settled');
  };

  const handleExportData = () => {
    // This function is called when data is exported
    console.log('Data exported');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            expenses={expenses}
            users={users}
            balances={balances}
            currentUserId={currentUserId}
            onShowMonthlyReport={handleShowMonthlyReport}
            onSettleAllBalances={handleSettleAllBalances}
            onExportData={handleExportData}
          />
        );
      case 'groups':
        return <Groups groups={groups} expenses={expenses} users={users} />;
      case 'friends':
        return (
          <Friends 
            users={users} 
            balances={balances} 
            currentUserId={currentUserId}
            expenses={expenses}
            onAddPerson={() => setIsAddPersonModalOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddExpense={() => setIsAddExpenseModalOpen(true)}
        users={users}
        expenses={expenses}
        balances={balances}
        currentUserId={currentUserId}
      />
      
      {renderContent()}

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onAddExpense={handleAddExpense}
        users={users}
        currentUserId={currentUserId}
      />

      <AddPersonModal
        isOpen={isAddPersonModalOpen}
        onClose={() => setIsAddPersonModalOpen(false)}
        onAddPerson={handleAddPerson}
      />
    </div>
  );
}

export default App;