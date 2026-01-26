import { NetworkType } from './networks';

export interface DataPlan {
  id: string;
  network: Exclude<NetworkType, null>;
  size: string;
  sizeValue: number; // in MB for sorting
  price: number;
  validity: string;
  type: 'SME' | 'Corporate' | 'Gifting';
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

export function getPlansByNetwork(network: Exclude<NetworkType, null>): DataPlan[] {
  return dataPlans.filter(plan => plan.network === network);
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
