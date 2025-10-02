import React, { useState } from 'react';
import { Users, DollarSign, Calculator } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface SplitCalculatorProps {
  users: { id: string; name: string }[];
}

interface SplitPerson {
  id: string;
  name: string;
  amount: number;
}

export default function SplitCalculator({ users }: SplitCalculatorProps) {
  const [totalAmount, setTotalAmount] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<{ [key: string]: string }>({});

  const togglePerson = (userId: string) => {
    setSelectedPeople(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const updateCustomAmount = (userId: string, amount: string) => {
    setCustomAmounts(prev => ({ ...prev, [userId]: amount }));
  };

  const calculateSplit = () => {
    const total = parseFloat(totalAmount) || 0;
    if (total === 0 || selectedPeople.length === 0) return [];

    if (splitType === 'equal') {
      const amountPerPerson = total / selectedPeople.length;
      return selectedPeople.map(id => ({
        id,
        name: users.find(u => u.id === id)?.name || 'Unknown',
        amount: amountPerPerson,
      }));
    } else {
      return selectedPeople.map(id => ({
        id,
        name: users.find(u => u.id === id)?.name || 'Unknown',
        amount: parseFloat(customAmounts[id]) || 0,
      }));
    }
  };

  const splitResults = calculateSplit();
  const totalCustom = splitResults.reduce((sum, person) => sum + person.amount, 0);
  const remaining = parseFloat(totalAmount) - totalCustom;

  return (
    <div className="space-y-6">
        {/* Total Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Split Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Split Type
          </label>
          <div className="flex space-x-3">
            <button
              onClick={() => setSplitType('equal')}
              className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                splitType === 'equal'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Equal Split</span>
              </div>
            </button>
            <button
              onClick={() => setSplitType('custom')}
              className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                splitType === 'custom'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Custom Split</span>
              </div>
            </button>
          </div>
        </div>

        {/* People Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select People
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {users.map(user => (
              <div key={user.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedPeople.includes(user.id)}
                  onChange={() => togglePerson(user.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="flex-1 text-gray-900">{user.name}</span>
                
                {splitType === 'custom' && selectedPeople.includes(user.id) && (
                  <div className="relative w-24">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={customAmounts[user.id] || ''}
                      onChange={(e) => updateCustomAmount(user.id, e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {splitResults.length > 0 && parseFloat(totalAmount) > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Split Results</h3>
            
            {splitType === 'custom' && Math.abs(remaining) > 0.01 && (
              <div className={`p-3 rounded-lg mb-4 ${
                remaining > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm font-medium ${
                  remaining > 0 ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {remaining > 0 ? `$${remaining.toFixed(2)} remaining` : `$${Math.abs(remaining).toFixed(2)} over budget`}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {splitResults.map(person => (
                <div key={person.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{person.name}</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(person.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-900">Total</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(splitType === 'equal' ? (parseFloat(totalAmount) || 0) : totalCustom)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}