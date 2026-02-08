import { DataPlan, AirtimePlan } from './plans';
import { NetworkType } from './networks';

export type TransactionStatus = 'pending' | 'processing' | 'success' | 'failed' | 'refunded';

export interface Transaction {
  id: string;
  reference: string;
  phoneNumber: string;
  network: Exclude<NetworkType, null>;
  plan: DataPlan | AirtimePlan;
  amount: number;
  status: TransactionStatus;
  createdAt: Date;
  completedAt?: Date;
  paymentMethod?: string;
  isBulk?: boolean;
}

export interface PaymentDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  expiresAt: Date;
  reference: string;
}

// Generate unique transaction reference
export function generateReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DD${timestamp}${random}`;
}

// Mock payment details (would come from Paystack in production)
export function generatePaymentDetails(amount: number, reference: string): PaymentDetails {
  return {
    bankName: 'Wema Bank',
    accountNumber: '7821234567',
    accountName: 'Paystack-Datadome',
    amount,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    reference,
  };
}

// Local storage keys
const LAST_NUMBER_KEY = 'datadome_last_number';
const TRANSACTIONS_KEY = 'datadome_transactions';

export function saveLastNumber(phone: string): void {
  localStorage.setItem(LAST_NUMBER_KEY, phone);
}

export function getLastNumber(): string | null {
  return localStorage.getItem(LAST_NUMBER_KEY);
}

export function saveTransaction(transaction: Transaction): void {
  const existing = getRecentTransactions();
  const updated = [transaction, ...existing].slice(0, 10);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
}

export function getRecentTransactions(): Transaction[] {
  try {
    const stored = localStorage.getItem(TRANSACTIONS_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
    }));
  } catch {
    return [];
  }
}

export function formatTransactionId(id: string): string {
  return id.slice(0, 4) + '...' + id.slice(-4);
}
