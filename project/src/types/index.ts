export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  date: string;
  category: string;
  groupId?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: string[];
  createdAt: string;
  color: string;
}

export interface Balance {
  userId: string;
  owes: { [userId: string]: number };
  owedBy: { [userId: string]: number };
  netBalance: number;
}