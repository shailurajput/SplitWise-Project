import React from 'react';
import { UserPlus, Mail, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { User, Balance, Expense } from '../types';
import { formatCurrency } from '../utils/calculations';

interface FriendsProps {
  users: User[];
  balances: Balance[];
  currentUserId: string;
  expenses: Expense[];
  onAddPerson: () => void;
}

export default function Friends({ users, balances, currentUserId, expenses, onAddPerson }: FriendsProps) {
  const friends = users.filter(user => user.id !== currentUserId);
  const currentUserBalance = balances.find(b => b.userId === currentUserId);

  const getBalanceWithFriend = (friendId: string) => {
    if (!currentUserBalance) return 0;
    
    const owes = currentUserBalance.owes[friendId] || 0;
    const owedBy = currentUserBalance.owedBy[friendId] || 0;
    
    return owedBy - owes; // Positive means friend owes you, negative means you owe friend
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Friends</h1>
          <p className="text-gray-600 mt-2">Manage your friends and see who owes what</p>
        </div>
        <button 
          onClick={onAddPerson}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Friend</span>
        </button>
      </div>

      {friends.length === 0 ? (
        <div className="text-center py-12">
          <UserPlus className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No friends added yet</h3>
          <p className="text-gray-600 mb-6">Add friends to start splitting expenses together</p>
          <button 
            onClick={onAddPerson}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Add Your First Friend
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {friends.map((friend) => {
            const balance = getBalanceWithFriend(friend.id);
            const absBalance = Math.abs(balance);
            
            return (
              <div key={friend.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {getInitials(friend.name)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{friend.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {friend.email}
                      </p>
                    </div>
                  </div>

                  {balance !== 0 ? (
                    <div className={`p-4 rounded-lg ${
                      balance > 0 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {balance > 0 ? (
                            <ArrowUpRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowDownLeft className="w-5 h-5 text-red-600" />
                          )}
                          <span className={`font-medium ${
                            balance > 0 ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {balance > 0 ? 'Owes you' : 'You owe'}
                          </span>
                        </div>
                        <span className={`text-lg font-bold ${
                          balance > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(absBalance)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <DollarSign className="w-5 h-5" />
                        <span className="font-medium">All settled up</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <div 
                        onClick={() => {
                          const friendExpenses = expenses.filter(expense => 
                            expense.paidBy === friend.id || expense.splitBetween.includes(friend.id)
                          );
                          
                          if (friendExpenses.length === 0) {
                            alert(`📊 EXPENSE HISTORY\n` +
                                  `${friend.name}\n` +
                                  `${'='.repeat(20)}\n\n` +
                                  `No shared expenses found.\n\n` +
                                  `Start splitting expenses with\n` +
                                  `${friend.name} to see history here!`);
                            return;
                          }
                          
                          const historyText = friendExpenses
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 5)
                            .map(expense => {
                              const paidByName = users.find(u => u.id === expense.paidBy)?.name;
                              const shareAmount = expense.amount / expense.splitBetween.length;
                              return `• ${expense.description}\n  ${formatCurrency(expense.amount)} (${formatCurrency(shareAmount)} each)\n  Paid by: ${paidByName}\n  Date: ${new Date(expense.date).toLocaleDateString()}`;
                            })
                            .join('\n\n');
                          
                          alert(`📊 EXPENSE HISTORY\n` +
                                `${friend.name}\n` +
                                `${'='.repeat(20)}\n\n` +
                                `Recent shared expenses:\n\n` +
                                `${historyText}\n\n` +
                                `${friendExpenses.length > 5 ? `... and ${friendExpenses.length - 5} more expenses` : ''}`);
                        }}
                      >
                        View History
                      </div>
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <div 
                        onClick={() => {
                          const currentBalance = getBalanceWithFriend(friend.id);
                          
                          if (Math.abs(currentBalance) < 0.01) {
                            alert(`✅ SETTLEMENT STATUS\n` +
                                  `${friend.name}\n` +
                                  `${'='.repeat(20)}\n\n` +
                                  `🎉 You're already settled up!\n\n` +
                                  `No money is owed in either direction.\n` +
                                  `Keep splitting expenses fairly! 👍`);
                            return;
                          }
                          
                          const isOwed = currentBalance > 0;
                          const amount = Math.abs(currentBalance);
                          
                          const confirmSettle = window.confirm(
                            `💸 SETTLE UP WITH ${friend.name.toUpperCase()}\n` +
                            `${'='.repeat(30)}\n\n` +
                            `Current balance: ${formatCurrency(amount)}\n` +
                            `${isOwed ? `${friend.name} owes you` : `You owe ${friend.name}`}\n\n` +
                            `Mark this balance as settled?`
                          );
                          
                          if (confirmSettle) {
                            alert(`✅ SETTLEMENT COMPLETE!\n` +
                                  `${friend.name}\n` +
                                  `${'='.repeat(20)}\n\n` +
                                  `🎉 Balance settled: ${formatCurrency(amount)}\n\n` +
                                  `${isOwed ? `${friend.name} has paid you` : `You have paid ${friend.name}`}\n\n` +
                                  `You're now settled up! 🤝`);
                          }
                        }}
                      >
                        Settle Up
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}