import React, { useState } from 'react';
import { X, Calculator, Users, DollarSign } from 'lucide-react';

interface SplitCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: { id: string; name: string }[];
}

interface SplitPerson {
  id: string;
  name: string;
  amount: number;
}

export default function SplitCalculatorModal({ isOpen, onClose, users }: SplitCalculatorModalProps) {
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

  const resetCalculator = () => {
    setTotalAmount('');
    setSplitType('equal');
    setSelectedPeople([]);
    setCustomAmounts({});
  };

  const handleClose = () => {
    resetCalculator();
    onClose();
  };

  const splitResults = calculateSplit();
  const totalCustom = splitResults.reduce((sum, person) => sum + person.amount, 0);
  const remaining = parseFloat(totalAmount) - totalCustom;

  if (!isOpen) return null;

  return (
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
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">₹</span>
              <input
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
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
                className={`flex-1 px-4 py-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                  splitType === 'equal'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-md'
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
                className={`flex-1 px-4 py-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                  splitType === 'custom'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-md'
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
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {users.map(user => (
                <div key={user.id} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedPeople.includes(user.id)}
                    onChange={() => togglePerson(user.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="flex-1 text-gray-900">{user.name}</span>
                  
                  {splitType === 'custom' && selectedPeople.includes(user.id) && (
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">₹</span>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Split Results
              </h3>
              
              {splitType === 'custom' && Math.abs(remaining) > 0.01 && (
                <div className={`p-3 rounded-lg mb-4 ${
                  remaining > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    remaining > 0 ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    {remaining > 0 ? `₹${remaining.toFixed(2)} remaining` : `₹${Math.abs(remaining).toFixed(2)} over budget`}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {splitResults.map(person => (
                  <div key={person.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-900">{person.name}</span>
                    <span className="text-xl font-bold text-blue-600">
                      ₹{person.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{splitType === 'equal' ? (parseFloat(totalAmount) || 0).toFixed(2) : totalCustom.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={resetCalculator}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Reset
            </button>
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 font-medium shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}