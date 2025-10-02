import React, { useState } from 'react';
import { DollarSign, TrendingUp, Users, Receipt, Sparkles, Target, Calendar, Award, Calculator, X } from 'lucide-react';
import { Expense, User, Balance } from '../types';
import { formatCurrency } from '../utils/calculations';
import ExpenseList from './ExpenseList';
import BalanceCard from './BalanceCard';
import SplitCalculator from './SplitCalculator';
import MonthlyExpenseChart from './MonthlyExpenseChart';

interface DashboardProps {
  expenses: Expense[];
  users: User[];
  balances: Balance[];
  currentUserId: string;
  onShowMonthlyReport: () => void;
  onSettleAllBalances: () => void;
  onExportData: () => void;
}

export default function Dashboard({ 
  expenses, 
  users, 
  balances, 
  currentUserId,
  onShowMonthlyReport,
  onSettleAllBalances,
  onExportData
}: DashboardProps) {
  const currentUserBalance = balances.find(b => b.userId === currentUserId);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const recentExpenses = expenses.slice(0, 5);
  const [isSplitCalculatorModalOpen, setIsSplitCalculatorModalOpen] = useState(false);

  const generateMonthlyReport = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    const report = {
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalExpenses: monthlyExpenses.length,
      totalAmount: monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      categories: monthlyExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as { [key: string]: number }),
      topExpense: monthlyExpenses.sort((a, b) => b.amount - a.amount)[0]
    };
    
    if (monthlyExpenses.length === 0) {
      alert(`📊 Monthly Report - ${report.month}\n\n` +
            `No expenses recorded for this month yet.\n` +
            `Start adding expenses to see your monthly breakdown!`);
      return;
    }

    const categoryBreakdown = Object.entries(report.categories)
      .sort(([,a], [,b]) => b - a)
      .map(([category, amount]) => `• ${category.charAt(0).toUpperCase() + category.slice(1)}: ${formatCurrency(amount)}`)
      .join('\n');
    
    const avgPerExpense = report.totalAmount / report.totalExpenses;
    const dailyAvg = report.totalAmount / new Date().getDate();
    
    alert(`📊 MONTHLY EXPENSE REPORT\n` +
          `${report.month}\n` +
          `${'='.repeat(30)}\n\n` +
          `💰 Total Spent: ${formatCurrency(report.totalAmount)}\n` +
          `📝 Total Expenses: ${report.totalExpenses}\n` +
          `📊 Average per Expense: ${formatCurrency(avgPerExpense)}\n` +
          `📅 Daily Average: ${formatCurrency(dailyAvg)}\n\n` +
          `📈 CATEGORY BREAKDOWN:\n${categoryBreakdown}\n\n` +
          `🏆 HIGHEST EXPENSE:\n${report.topExpense?.description || 'None'}\n${formatCurrency(report.topExpense?.amount || 0)}\n\n` +
          `💡 Keep tracking your expenses to better manage your budget!`);
    
    onShowMonthlyReport();
  };

  const settleAllBalances = () => {
    const currentUserBalance = balances.find(b => b.userId === currentUserId);
    const hasOwes = currentUserBalance && Object.keys(currentUserBalance.owes).length > 0;
    const hasOwedBy = currentUserBalance && Object.keys(currentUserBalance.owedBy).length > 0;
    const hasAnyBalances = hasOwes || hasOwedBy;
    
    if (!hasAnyBalances) {
      alert(`🎉 BALANCE STATUS\n` +
            `${'='.repeat(25)}\n\n` +
            `✅ All your balances are settled!\n\n` +
            `You don't owe anyone money and\n` +
            `no one owes you money.\n\n` +
            `Great job managing your expenses! 👏`);
      return;
    }
    
    // Show current balance summary
    let balanceSummary = `💸 CURRENT BALANCE SUMMARY\n${'='.repeat(30)}\n\n`;
    
    if (hasOwes) {
      balanceSummary += `❌ YOU OWE:\n`;
      Object.entries(currentUserBalance!.owes).forEach(([userId, amount]) => {
        const userName = users.find(u => u.id === userId)?.name || 'Unknown';
        balanceSummary += `• ${userName}: ${formatCurrency(amount)}\n`;
      });
      balanceSummary += `\n`;
    }
    
    if (hasOwedBy) {
      balanceSummary += `✅ YOU ARE OWED:\n`;
      Object.entries(currentUserBalance!.owedBy).forEach(([userId, amount]) => {
        const userName = users.find(u => u.id === userId)?.name || 'Unknown';
        balanceSummary += `• ${userName}: ${formatCurrency(amount)}\n`;
      });
      balanceSummary += `\n`;
    }
    
    const netBalance = currentUserBalance?.netBalance || 0;
    balanceSummary += `💰 NET BALANCE: ${formatCurrency(Math.abs(netBalance))}\n`;
    balanceSummary += netBalance >= 0 ? `(You are owed overall)\n\n` : `(You owe overall)\n\n`;
    balanceSummary += `This will mark all balances as settled.\nContinue?`;
    
    const confirmSettle = window.confirm(balanceSummary);
    
    if (confirmSettle) {
      onSettleAllBalances();
      alert(`✅ SETTLEMENT COMPLETE!\n` +
            `${'='.repeat(25)}\n\n` +
            `🎉 All balances have been settled!\n\n` +
            `• All debts cleared\n` +
            `• Fresh start for new expenses\n` +
            `• Settlement recorded\n\n` +
            `You can now continue splitting\n` +
            `expenses with a clean slate! 🚀`);
    }
  };

  const exportData = () => {
    const currentDate = new Date();
    const totalUsers = users.length;
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate category breakdown
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });
    
    // Calculate user spending
    const userSpending = expenses.reduce((acc, expense) => {
      const userName = users.find(u => u.id === expense.paidBy)?.name || 'Unknown';
      acc[userName] = (acc[userName] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });
    
    const data = {
      exportInfo: {
        exportDate: currentDate.toISOString(),
        exportedBy: 'SplitWise App',
        version: '1.0.0'
      },
      summary: {
        totalUsers,
        totalExpenses,
        totalAmount,
        averageExpense: totalExpenses > 0 ? totalAmount / totalExpenses : 0,
        dateRange: {
          earliest: expenses.length > 0 ? expenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0].date : null,
          latest: expenses.length > 0 ? expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date : null
        }
      },
      categoryBreakdown,
      userSpending,
      users: users.map(user => ({ name: user.name, email: user.email })),
      expenses: expenses.map(expense => ({
        description: expense.description,
        amount: expense.amount,
        amountInINR: expense.amount * 83,
        date: expense.date,
        category: expense.category,
        paidBy: users.find(u => u.id === expense.paidBy)?.name,
        splitBetween: expense.splitBetween.map(id => users.find(u => u.id === id)?.name),
        sharePerPerson: expense.amount / expense.splitBetween.length
      })),
      balances: balances.map(balance => ({
        user: users.find(u => u.id === balance.userId)?.name,
        netBalance: balance.netBalance,
        owes: Object.entries(balance.owes).map(([userId, amount]) => ({
          to: users.find(u => u.id === userId)?.name,
          amount
        })),
        owedBy: Object.entries(balance.owedBy).map(([userId, amount]) => ({
          from: users.find(u => u.id === userId)?.name,
          amount
        }))
      }))
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `splitwise-export-${currentDate.toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`📁 DATA EXPORT COMPLETE!\n` +
          `${'='.repeat(30)}\n\n` +
          `✅ Export Summary:\n` +
          `• ${totalUsers} users exported\n` +
          `• ${totalExpenses} expenses exported\n` +
          `• Total amount: ${formatCurrency(totalAmount)}\n` +
          `• File: splitwise-export-${currentDate.toISOString().split('T')[0]}.json\n\n` +
          `📂 File saved to your Downloads folder!\n\n` +
          `The export includes:\n` +
          `• Complete expense history\n` +
          `• User information\n` +
          `• Balance calculations\n` +
          `• Category breakdowns\n` +
          `• Summary statistics\n\n` +
          `💡 You can import this data later or\n` +
          `share it with your accountant!`);
    
    onExportData();
  };
  const stats = [
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: DollarSign,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Your Balance',
      value: formatCurrency(Math.abs(currentUserBalance?.netBalance || 0)),
      subtitle: currentUserBalance?.netBalance >= 0 ? 'You are owed' : 'You owe',
      icon: TrendingUp,
      color: currentUserBalance?.netBalance >= 0 ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600',
      bgColor: currentUserBalance?.netBalance >= 0 ? 'bg-green-50' : 'bg-red-50',
      textColor: currentUserBalance?.netBalance >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      title: 'Active Groups',
      value: '3',
      icon: Users,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'This Month',
      value: formatCurrency(expenses
        .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
        .reduce((sum, e) => sum + e.amount, 0)),
      icon: Receipt,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Sparkles className="w-8 h-8 mr-3 text-yellow-300" />
                Welcome back!
              </h1>
              <p className="text-green-100 text-lg">Here's your expense overview for today</p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Award className="w-10 h-10 text-yellow-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 transform`}>
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-sm text-gray-400">{stat.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Recent Expenses */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Receipt className="w-5 h-5 mr-2 text-gray-600" />
                Recent Expenses
              </h2>
              <p className="text-sm text-gray-500 mt-1">Your latest expense activities</p>
            </div>
            <ExpenseList expenses={recentExpenses} users={users} />
          </div>
        </div>

        {/* Balance Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                Your Balances
              </h2>
              <p className="text-sm text-gray-500 mt-1">Current balance overview</p>
            </div>
            <div className="p-6">
              {currentUserBalance && (
                <BalanceCard balance={currentUserBalance} users={users} />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button 
                onClick={generateMonthlyReport}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-3 text-left transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">View Monthly Report</span>
                </div>
              </button>
              <button 
                onClick={settleAllBalances}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-3 text-left transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">Settle All Balances</span>
                </div>
              </button>
              <button 
                onClick={exportData}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-3 text-left transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">Export Data</span>
                </div>
              </button>
              <button 
                onClick={() => setIsSplitCalculatorModalOpen(true)}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-3 text-left transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center">
                  <Calculator className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">Split Calculator</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator and Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Split Calculator */}
        <SplitCalculator users={users} />
        
        {/* Monthly Expense Chart */}
        <MonthlyExpenseChart expenses={expenses} />
      </div>

      {/* Split Calculator Modal */}
      {isSplitCalculatorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Split Calculator</h2>
              </div>
              <button
                onClick={() => setIsSplitCalculatorModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-white rounded-xl shadow-lg border-0 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Quick Split Calculator</h2>
                    <p className="text-sm text-gray-500">Calculate how to split expenses easily</p>
                  </div>
                </div>
                <SplitCalculator users={users} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}