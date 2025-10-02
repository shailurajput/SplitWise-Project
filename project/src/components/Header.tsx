import React from 'react';
import { Calculator, Users, Plus, Bell, Settings, X, DollarSign, UserPlus, Calendar } from 'lucide-react';
import { User, Expense, Balance } from '../types';
import { formatCurrency } from '../utils/calculations';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddExpense: () => void;
  users: User[];
  expenses: Expense[];
  balances: Balance[];
  currentUserId: string;
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onAddExpense, 
  users, 
  expenses, 
  balances, 
  currentUserId 
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = React.useState(false);

  // Generate notifications based on app data
  const generateNotifications = () => {
    const notifications = [];
    const currentUserBalance = balances.find(b => b.userId === currentUserId);
    
    // Recent expenses (last 3 days)
    const recentExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return expenseDate >= threeDaysAgo;
    }).slice(0, 3);

    recentExpenses.forEach(expense => {
      const paidByName = users.find(u => u.id === expense.paidBy)?.name || 'Someone';
      notifications.push({
        id: `expense-${expense.id}`,
        type: 'expense',
        title: 'New Expense Added',
        message: `${paidByName} added "${expense.description}" for ${formatCurrency(expense.amount)}`,
        time: new Date(expense.date).toLocaleDateString(),
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      });
    });

    // Balance notifications
    if (currentUserBalance) {
      // People who owe you
      Object.entries(currentUserBalance.owedBy).forEach(([userId, amount]) => {
        if (amount > 0) {
          const userName = users.find(u => u.id === userId)?.name || 'Someone';
          notifications.push({
            id: `owed-${userId}`,
            type: 'balance',
            title: 'Money Owed to You',
            message: `${userName} owes you ${formatCurrency(amount)}`,
            time: 'Pending',
            icon: DollarSign,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          });
        }
      });

      // People you owe
      Object.entries(currentUserBalance.owes).forEach(([userId, amount]) => {
        if (amount > 0) {
          const userName = users.find(u => u.id === userId)?.name || 'Someone';
          notifications.push({
            id: `owes-${userId}`,
            type: 'debt',
            title: 'Payment Reminder',
            message: `You owe ${userName} ${formatCurrency(amount)}`,
            time: 'Action needed',
            icon: DollarSign,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
          });
        }
      });
    }

    // Monthly summary notification
    const currentMonth = new Date().getMonth();
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth;
    });
    
    if (monthlyExpenses.length > 0) {
      const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      notifications.push({
        id: 'monthly-summary',
        type: 'summary',
        title: 'Monthly Summary',
        message: `You've spent ${formatCurrency(monthlyTotal)} this month across ${monthlyExpenses.length} expenses`,
        time: new Date().toLocaleDateString('en-US', { month: 'long' }),
        icon: Calendar,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      });
    }

    // Welcome notification for new users
    if (expenses.length === 0) {
      notifications.push({
        id: 'welcome',
        type: 'welcome',
        title: 'Welcome to SplitWise! 🎉',
        message: 'Start by adding your first expense to split with friends',
        time: 'Getting started',
        icon: UserPlus,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      });
    }

    return notifications.slice(0, 5); // Limit to 5 notifications
  };

  const notifications = generateNotifications();
  const unreadCount = notifications.length;

  const handleNotificationClick = (notification: any) => {
    let alertMessage = `🔔 NOTIFICATION DETAILS\n`;
    alertMessage += `${'='.repeat(30)}\n\n`;
    alertMessage += `📋 ${notification.title}\n`;
    alertMessage += `💬 ${notification.message}\n`;
    alertMessage += `⏰ ${notification.time}\n\n`;
    
    switch (notification.type) {
      case 'expense':
        alertMessage += `💡 TIP: Check your recent expenses in the dashboard to see how this affects your balance.`;
        break;
      case 'balance':
        alertMessage += `💡 TIP: You can send a payment reminder or settle up in the Friends section.`;
        break;
      case 'debt':
        alertMessage += `💡 TIP: Click "Settle Up" in the Friends section to mark this as paid.`;
        break;
      case 'summary':
        alertMessage += `💡 TIP: View your detailed monthly report in Quick Actions for more insights.`;
        break;
      case 'welcome':
        alertMessage += `💡 TIP: Click the "Add Expense" button to get started with your first expense!`;
        break;
    }
    
    alert(alertMessage);
    setShowNotifications(false);
  };
  return (
    <header className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 shadow-lg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-opacity-30 transition-all duration-300">
              <Calculator className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-sm">SplitWise</h1>
          </div>

          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                activeTab === 'dashboard'
                  ? 'bg-white bg-opacity-20 text-white backdrop-blur-sm shadow-lg'
                  : 'text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                activeTab === 'groups'
                  ? 'bg-white bg-opacity-20 text-white backdrop-blur-sm shadow-lg'
                  : 'text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              Groups
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                activeTab === 'friends'
                  ? 'bg-white bg-opacity-20 text-white backdrop-blur-sm shadow-lg'
                  : 'text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              Friends
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200 hover:scale-110 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{unreadCount} new notifications</p>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No notifications yet</p>
                        <p className="text-sm text-gray-400 mt-1">We'll notify you about expenses and balances</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${notification.bgColor} flex-shrink-0`}>
                              <notification.icon className={`w-4 h-4 ${notification.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                      <button
                        onClick={() => {
                          alert(`🔔 ALL NOTIFICATIONS\n` +
                                `${'='.repeat(25)}\n\n` +
                                `📊 Total Notifications: ${notifications.length}\n\n` +
                                `📝 Summary:\n` +
                                `• Recent expenses: ${notifications.filter(n => n.type === 'expense').length}\n` +
                                `• Balance updates: ${notifications.filter(n => n.type === 'balance').length}\n` +
                                `• Payment reminders: ${notifications.filter(n => n.type === 'debt').length}\n` +
                                `• Monthly summaries: ${notifications.filter(n => n.type === 'summary').length}\n\n` +
                                `💡 Click on individual notifications for more details!`);
                          setShowNotifications(false);
                        }}
                        className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        View All Notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="p-2 text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200 hover:scale-110">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onAddExpense}
              className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}