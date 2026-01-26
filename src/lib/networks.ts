// Nigerian network prefixes mapping
export type NetworkType = 'mtn' | 'airtel' | 'glo' | '9mobile' | null;

export interface Network {
  id: NetworkType;
  name: string;
  color: string;
}

export const networks: Record<Exclude<NetworkType, null>, Network> = {
  mtn: { id: 'mtn', name: 'MTN', color: '#FFCC00' },
  airtel: { id: 'airtel', name: 'Airtel', color: '#FF0000' },
  glo: { id: 'glo', name: 'Glo', color: '#00A651' },
  '9mobile': { id: '9mobile', name: '9mobile', color: '#006B3F' },
};

// Network prefix mappings
const networkPrefixes: Record<string, NetworkType> = {
  // MTN prefixes
  '0703': 'mtn', '0706': 'mtn', '0803': 'mtn', '0806': 'mtn',
  '0810': 'mtn', '0813': 'mtn', '0814': 'mtn', '0816': 'mtn',
  '0903': 'mtn', '0906': 'mtn', '0913': 'mtn', '0916': 'mtn',
  
  // Airtel prefixes
  '0701': 'airtel', '0708': 'airtel', '0802': 'airtel', '0808': 'airtel',
  '0812': 'airtel', '0901': 'airtel', '0902': 'airtel', '0904': 'airtel',
  '0907': 'airtel', '0911': 'airtel', '0912': 'airtel',
  
  // Glo prefixes
  '0705': 'glo', '0805': 'glo', '0807': 'glo', '0811': 'glo',
  '0815': 'glo', '0905': 'glo', '0915': 'glo',
  
  // 9mobile prefixes
  '0809': '9mobile', '0817': '9mobile', '0818': '9mobile',
  '0908': '9mobile', '0909': '9mobile',
};

export function detectNetwork(phone: string): NetworkType {
  // Clean the phone number
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle numbers starting with +234 or 234
  let normalized = cleaned;
  if (cleaned.startsWith('234')) {
    normalized = '0' + cleaned.slice(3);
  }
  
  // Get the first 4 digits (prefix)
  const prefix = normalized.slice(0, 4);
  
  return networkPrefixes[prefix] || null;
}

export function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Limit to 11 digits
  const limited = digits.slice(0, 11);
  
  // Format as 0XXX XXX XXXX
  if (limited.length <= 4) {
    return limited;
  } else if (limited.length <= 7) {
    return `${limited.slice(0, 4)} ${limited.slice(4)}`;
  } else {
    return `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7)}`;
  }
}

export function isValidNigerianNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 11 && cleaned.startsWith('0');
}
