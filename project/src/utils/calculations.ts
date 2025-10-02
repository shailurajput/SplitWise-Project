import { Expense, User, Balance } from '../types';

// Currency conversion utility
export const USD_TO_INR_RATE = 83.5; // Updated conversion rate

export function formatCurrency(amount: number): string {
  return `₹${(amount * USD_TO_INR_RATE).toFixed(2)}`;
}

export function convertToINR(amount: number): number {
  return amount * USD_TO_INR_RATE;
}

export function calculateBalances(expenses: Expense[], users: User[]): Balance[] {
  const balances: { [userId: string]: Balance } = {};

  // Initialize balances for all users
  users.forEach(user => {
    balances[user.id] = {
      userId: user.id,
      owes: {},
      owedBy: {},
      netBalance: 0,
    };
  });

  // Calculate balances from expenses
  expenses.forEach(expense => {
    const { paidBy, splitBetween, amount } = expense;
    const sharePerPerson = amount / splitBetween.length;

    splitBetween.forEach(userId => {
      if (userId !== paidBy) {
        // This person owes the payer
        if (!balances[userId].owes[paidBy]) {
          balances[userId].owes[paidBy] = 0;
        }
        if (!balances[paidBy].owedBy[userId]) {
          balances[paidBy].owedBy[userId] = 0;
        }

        balances[userId].owes[paidBy] += sharePerPerson;
        balances[paidBy].owedBy[userId] += sharePerPerson;
      }
    });
  });

  // Calculate net balances
  Object.values(balances).forEach(balance => {
    const totalOwed = Object.values(balance.owedBy).reduce((sum, amount) => sum + amount, 0);
    const totalOwes = Object.values(balance.owes).reduce((sum, amount) => sum + amount, 0);
    balance.netBalance = totalOwed - totalOwes;
  });

  return Object.values(balances);
}

export function simplifyDebts(balances: Balance[]): { from: string; to: string; amount: number }[] {
  const settlements: { from: string; to: string; amount: number }[] = [];
  const netBalances = balances.map(b => ({ userId: b.userId, amount: b.netBalance }));

  while (true) {
    // Find the person who owes the most and the person who is owed the most
    const maxDebtor = netBalances.reduce((max, current) => 
      current.amount < max.amount ? current : max
    );
    const maxCreditor = netBalances.reduce((max, current) => 
      current.amount > max.amount ? current : max
    );

    // If both are close to zero, we're done
    if (Math.abs(maxDebtor.amount) < 0.01 && Math.abs(maxCreditor.amount) < 0.01) {
      break;
    }

    // Calculate settlement amount
    const settlementAmount = Math.min(Math.abs(maxDebtor.amount), maxCreditor.amount);
    
    if (settlementAmount < 0.01) break;

    settlements.push({
      from: maxDebtor.userId,
      to: maxCreditor.userId,
      amount: settlementAmount,
    });

    // Update balances
    maxDebtor.amount += settlementAmount;
    maxCreditor.amount -= settlementAmount;
  }

  return settlements;
}