import { NetworkType } from './networks';

export interface DataPlan {
  id: string;
  network: Exclude<NetworkType, null>;
  size: string;
  sizeValue: number; // in MB for sorting
  price: number;
  validity: string;
  type: 'SME' | 'Corporate' | 'Gifting' | 'Airtime';
  popular?: boolean;
}

export interface AirtimePlan {
  id: string;
  network: Exclude<NetworkType, null>;
  amount: number;
  popular?: boolean;
}

// SME Data Plans (cached data - would come from Redis in production)
export const dataPlans: DataPlan[] = [
  // MTN SME Plans
  { id: 'mtn-500mb', network: 'mtn', size: '500MB', sizeValue: 500, price: 140, validity: '30 days', type: 'SME' },
  { id: 'mtn-1gb', network: 'mtn', size: '1GB', sizeValue: 1024, price: 260, validity: '30 days', type: 'SME', popular: true },
  { id: 'mtn-2gb', network: 'mtn', size: '2GB', sizeValue: 2048, price: 520, validity: '30 days', type: 'SME' },
  { id: 'mtn-3gb', network: 'mtn', size: '3GB', sizeValue: 3072, price: 780, validity: '30 days', type: 'SME' },
  { id: 'mtn-5gb', network: 'mtn', size: '5GB', sizeValue: 5120, price: 1300, validity: '30 days', type: 'SME' },
  { id: 'mtn-10gb', network: 'mtn', size: '10GB', sizeValue: 10240, price: 2600, validity: '30 days', type: 'SME' },
  
  // Airtel SME Plans
  { id: 'airtel-500mb', network: 'airtel', size: '500MB', sizeValue: 500, price: 140, validity: '30 days', type: 'SME' },
  { id: 'airtel-1gb', network: 'airtel', size: '1GB', sizeValue: 1024, price: 260, validity: '30 days', type: 'SME', popular: true },
  { id: 'airtel-2gb', network: 'airtel', size: '2GB', sizeValue: 2048, price: 520, validity: '30 days', type: 'SME' },
  { id: 'airtel-5gb', network: 'airtel', size: '5GB', sizeValue: 5120, price: 1300, validity: '30 days', type: 'SME' },
  { id: 'airtel-10gb', network: 'airtel', size: '10GB', sizeValue: 10240, price: 2600, validity: '30 days', type: 'SME' },
  
  // Glo SME Plans
  { id: 'glo-500mb', network: 'glo', size: '500MB', sizeValue: 500, price: 135, validity: '30 days', type: 'SME' },
  { id: 'glo-1gb', network: 'glo', size: '1GB', sizeValue: 1024, price: 250, validity: '30 days', type: 'SME', popular: true },
  { id: 'glo-2gb', network: 'glo', size: '2GB', sizeValue: 2048, price: 500, validity: '30 days', type: 'SME' },
  { id: 'glo-5gb', network: 'glo', size: '5GB', sizeValue: 5120, price: 1250, validity: '30 days', type: 'SME' },
  { id: 'glo-10gb', network: 'glo', size: '10GB', sizeValue: 10240, price: 2500, validity: '30 days', type: 'SME' },
  
  // 9mobile SME Plans
  { id: '9mobile-500mb', network: '9mobile', size: '500MB', sizeValue: 500, price: 130, validity: '30 days', type: 'SME' },
  { id: '9mobile-1gb', network: '9mobile', size: '1GB', sizeValue: 1024, price: 250, validity: '30 days', type: 'SME', popular: true },
  { id: '9mobile-2gb', network: '9mobile', size: '2GB', sizeValue: 2048, price: 500, validity: '30 days', type: 'SME' },
  { id: '9mobile-5gb', network: '9mobile', size: '5GB', sizeValue: 5120, price: 1200, validity: '30 days', type: 'SME' },
];

// Airtime Recharge Options
export const airtimePlans: AirtimePlan[] = [
  // MTN Airtime
  { id: 'mtn-airtime-50', network: 'mtn', amount: 50 },
  { id: 'mtn-airtime-100', network: 'mtn', amount: 100, popular: true },
  { id: 'mtn-airtime-200', network: 'mtn', amount: 200 },
  { id: 'mtn-airtime-500', network: 'mtn', amount: 500 },
  { id: 'mtn-airtime-1000', network: 'mtn', amount: 1000 },
  { id: 'mtn-airtime-2000', network: 'mtn', amount: 2000 },
  
  // Airtel Airtime
  { id: 'airtel-airtime-50', network: 'airtel', amount: 50 },
  { id: 'airtel-airtime-100', network: 'airtel', amount: 100, popular: true },
  { id: 'airtel-airtime-200', network: 'airtel', amount: 200 },
  { id: 'airtel-airtime-500', network: 'airtel', amount: 500 },
  { id: 'airtel-airtime-1000', network: 'airtel', amount: 1000 },
  { id: 'airtel-airtime-2000', network: 'airtel', amount: 2000 },
  
  // Glo Airtime
  { id: 'glo-airtime-50', network: 'glo', amount: 50 },
  { id: 'glo-airtime-100', network: 'glo', amount: 100, popular: true },
  { id: 'glo-airtime-200', network: 'glo', amount: 200 },
  { id: 'glo-airtime-500', network: 'glo', amount: 500 },
  { id: 'glo-airtime-1000', network: 'glo', amount: 1000 },
  { id: 'glo-airtime-2000', network: 'glo', amount: 2000 },
  
  // 9mobile Airtime
  { id: '9mobile-airtime-50', network: '9mobile', amount: 50 },
  { id: '9mobile-airtime-100', network: '9mobile', amount: 100, popular: true },
  { id: '9mobile-airtime-200', network: '9mobile', amount: 200 },
  { id: '9mobile-airtime-500', network: '9mobile', amount: 500 },
  { id: '9mobile-airtime-1000', network: '9mobile', amount: 1000 },
  { id: '9mobile-airtime-2000', network: '9mobile', amount: 2000 },
];

export function getPlansByNetwork(network: Exclude<NetworkType, null>): DataPlan[] {
  return dataPlans.filter(plan => plan.network === network);
}

export function getAirtimeByNetwork(network: Exclude<NetworkType, null>): AirtimePlan[] {
  return airtimePlans.filter(plan => plan.network === network);
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
