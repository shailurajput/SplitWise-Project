import React from 'react';
import { Users, Plus, Calendar, DollarSign } from 'lucide-react';
import { Group, Expense, User } from '../types';
import { formatCurrency } from '../utils/calculations';

interface GroupsProps {
  groups: Group[];
  expenses: Expense[];
  users: User[];
}

export default function Groups({ groups, expenses, users }: GroupsProps) {
  const getGroupExpenses = (groupId: string) => {
    return expenses.filter(expense => expense.groupId === groupId);
  };

  const getGroupTotal = (groupId: string) => {
    return getGroupExpenses(groupId).reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getMemberNames = (memberIds: string[]) => {
    return memberIds.map(id => users.find(u => u.id === id)?.name || 'Unknown').join(', ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600 mt-2">Manage your expense groups and shared costs</p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Create Group</span>
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-600 mb-6">Create your first group to start splitting expenses with friends</p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const groupExpenses = getGroupExpenses(group.id);
            const totalAmount = getGroupTotal(group.id);
            
            return (
              <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${group.color}`}
                    >
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.members.length} members</p>
                    </div>
                  </div>

                  {group.description && (
                    <p className="text-gray-600 mb-4">{group.description}</p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total Expenses</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Recent Activity</span>
                      <span className="text-sm text-gray-600">
                        {groupExpenses.length} expense{groupExpenses.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Members:</p>
                      <p className="text-sm text-gray-700 truncate">{getMemberNames(group.members)}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      Created {new Date(group.createdAt).toLocaleDateString()}
                    </div>
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