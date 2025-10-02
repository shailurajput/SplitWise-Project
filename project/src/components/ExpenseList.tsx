import React from 'react';
import { Calendar, User, DollarSign } from 'lucide-react';
import { Expense, User as UserType } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ExpenseListProps {
  expenses: Expense[];
  users: UserType[];
}

export default function ExpenseList({ expenses, users }: ExpenseListProps) {
  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Unknown User';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      food: 'bg-orange-100 text-orange-800',
      transport: 'bg-blue-100 text-blue-800',
      entertainment: 'bg-purple-100 text-purple-800',
      utilities: 'bg-green-100 text-green-800',
      shopping: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (expenses.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gradient-to-br from-gray-50 to-white">
        <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No expenses yet. Add your first expense to get started!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {expenses.map((expense) => (
        <div key={expense.id} className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-medium text-gray-900">{expense.description}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getCategoryColor(expense.category)}`}>
                  {expense.category}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Paid by {getUserName(expense.paidBy)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(expense.date)}</span>
                </div>
                <span>Split {expense.splitBetween.length} ways</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{formatCurrency(expense.amount)}</div>
              <div className="text-sm text-gray-500">
                {formatCurrency(expense.amount / expense.splitBetween.length)} per person
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}