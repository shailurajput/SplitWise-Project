import React from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { Expense } from '../types';
import { formatCurrency } from '../utils/calculations';

interface MonthlyExpenseChartProps {
  expenses: Expense[];
}

export default function MonthlyExpenseChart({ expenses }: MonthlyExpenseChartProps) {
  // Get current month expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  // Group expenses by category
  const categoryData = monthlyExpenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = { name: category, value: 0, count: 0 };
    }
    acc[category].value += expense.amount;
    acc[category].count += 1;
    return acc;
  }, {} as { [key: string]: { name: string; value: number; count: number } });

  const chartData = Object.values(categoryData);
  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);

  // Colors for different categories
  const COLORS = {
    food: '#FF6B6B',
    transport: '#4ECDC4',
    entertainment: '#45B7D1',
    utilities: '#96CEB4',
    shopping: '#FFEAA7',
    other: '#DDA0DD',
  };

  const getCategoryColor = (category: string) => {
    return COLORS[category as keyof typeof COLORS] || COLORS.other;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      food: 'Food & Dining',
      transport: 'Transportation',
      entertainment: 'Entertainment',
      utilities: 'Utilities',
      shopping: 'Shopping',
      other: 'Other',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Custom pie chart using CSS
  const createPieChart = () => {
    if (chartData.length === 0) return null;

    let cumulativePercentage = 0;
    
    return (
      <div className="relative w-64 h-64 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="20"
          />
          {chartData.map((item, index) => {
            const percentage = (item.value / totalAmount) * 100;
            const strokeDasharray = `${percentage * 2.51} ${251.2 - percentage * 2.51}`;
            const strokeDashoffset = -cumulativePercentage * 2.51;
            
            cumulativePercentage += percentage;
            
            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={getCategoryColor(item.name)}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 hover:stroke-opacity-80"
              />
            );
          })}
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
        </div>
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Monthly Expenses</h2>
            <p className="text-sm text-gray-500">{monthName}</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses this month</h3>
          <p className="text-gray-600">Add some expenses to see your spending breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Monthly Expenses</h2>
          <p className="text-sm text-gray-500">{monthName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom Pie Chart */}
        <div className="flex items-center justify-center">
          {createPieChart()}
        </div>

        {/* Legend and Stats */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total This Month</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              <p className="text-sm text-gray-500">{monthlyExpenses.length} expense{monthlyExpenses.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Category Breakdown</h3>
            {chartData
              .sort((a, b) => b.value - a.value)
              .map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getCategoryColor(item.name) }}
                    />
                    <span className="text-sm text-gray-700">{getCategoryLabel(item.name)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(item.value)}</p>
                    <p className="text-xs text-gray-500">
                      {((item.value / totalAmount) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}