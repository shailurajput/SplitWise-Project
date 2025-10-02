import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Balance, User } from '../types';
import { formatCurrency } from '../utils/calculations';

interface BalanceCardProps {
  balance: Balance;
  users: User[];
}

export default function BalanceCard({ balance, users }: BalanceCardProps) {
  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Unknown User';
  };

  const owesEntries = Object.entries(balance.owes).filter(([_, amount]) => amount > 0);
  const owedByEntries = Object.entries(balance.owedBy).filter(([_, amount]) => amount > 0);

  return (
    <div className="space-y-4">
      {/* Net Balance */}
      <div className={`p-4 rounded-lg ${
        balance.netBalance >= 0 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">Net Balance</span>
          <span className={`text-lg font-bold ${
            balance.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(Math.abs(balance.netBalance))}
          </span>
        </div>
        <p className={`text-sm mt-1 ${
          balance.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {balance.netBalance >= 0 ? 'You are owed overall' : 'You owe overall'}
        </p>
      </div>

      {/* You Owe */}
      {owesEntries.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <ArrowDownLeft className="w-4 h-4 mr-2 text-red-500" />
            You owe
          </h4>
          <div className="space-y-2">
            {owesEntries.map(([userId, amount]) => (
              <div key={userId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-gray-900">{getUserName(userId)}</span>
                <span className="font-medium text-red-600">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* You Are Owed */}
      {owedByEntries.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-2 text-green-500" />
            You are owed
          </h4>
          <div className="space-y-2">
            {owedByEntries.map(([userId, amount]) => (
              <div key={userId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-900">{getUserName(userId)}</span>
                <span className="font-medium text-green-600">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {owesEntries.length === 0 && owedByEntries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>All settled up! 🎉</p>
        </div>
      )}
    </div>
  );
}