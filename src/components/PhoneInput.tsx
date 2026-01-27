import { useEffect, useRef, useState } from 'react';
import { detectNetwork, formatPhoneNumber, isValidNigerianNumber, networks, NetworkType } from '@/lib/networks';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string, network: NetworkType) => void;
  onValidNumber: (phone: string, network: Exclude<NetworkType, null>) => void;
}

export function PhoneInput({ value, onChange, onValidNumber }: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [network, setNetwork] = useState<NetworkType>(null);
  const [recentNumbers, setRecentNumbers] = useState<string[]>([]);

  // Auto-focus on mount and load recent numbers
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    // Load recent numbers from localStorage
    const stored = localStorage.getItem('datadome_recent_numbers');
    if (stored) {
      try {
        const numbers = JSON.parse(stored) as string[];
        setRecentNumbers(numbers.slice(0, 2)); // Max 2 recent numbers
      } catch {
        // ignore parse errors
      }
    }
    
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatPhoneNumber(raw);
    const detectedNetwork = detectNetwork(raw);
    
    setNetwork(detectedNetwork);
    onChange(formatted, detectedNetwork);

    // Check if valid and trigger callback
    const cleaned = raw.replace(/\D/g, '');
    if (isValidNigerianNumber(cleaned) && detectedNetwork) {
      // Save to recent numbers
      saveRecentNumber(cleaned);
      onValidNumber(cleaned, detectedNetwork);
    }
  };

  const saveRecentNumber = (phone: string) => {
    const stored = localStorage.getItem('datadome_recent_numbers');
    let numbers: string[] = [];
    if (stored) {
      try {
        numbers = JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    // Add to front, remove duplicates, keep max 2
    numbers = [phone, ...numbers.filter(n => n !== phone)].slice(0, 2);
    localStorage.setItem('datadome_recent_numbers', JSON.stringify(numbers));
  };

  const selectRecentNumber = (phone: string) => {
    const formatted = formatPhoneNumber(phone);
    const detectedNetwork = detectNetwork(phone);
    setNetwork(detectedNetwork);
    onChange(formatted, detectedNetwork);
    if (isValidNigerianNumber(phone) && detectedNetwork) {
      onValidNumber(phone, detectedNetwork);
    }
  };

  const isValid = isValidNigerianNumber(value.replace(/\D/g, ''));

  return (
    <div className="relative">
      {/* Network indicator */}
      {network && (
        <div className="w-full flex justify-center -mb-2 pb-2 animate-scale-in">
          <span 
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ 
              backgroundColor: networks[network].color + '20',
              color: networks[network].color,
            }}
          >
            {networks[network].name}
          </span>
        </div>
      )}

      {/* Phone input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          placeholder="0801 234 5678"
          className={cn(
            "number-input w-full py-4",
            isValid && "text-foreground",
            !isValid && value && "text-muted-foreground"
          )}
          autoComplete="tel"
        />
        
        {/* Underline indicator */}
        <div className="h-0.5 bg-muted rounded-full mt-2 overflow-hidden">
          <div 
            className={cn(
              "h-full bg-primary transition-all duration-300 ease-out",
              isValid ? "w-full" : "w-0"
            )}
          />
        </div>
      </div>

      {/* Helper text */}
      <p className="text-center text-sm text-muted-foreground mt-4">
        {!value && "Enter phone number"}
        {value && !network && "Detecting network..."}
        {value && network && !isValid && `${11 - value.replace(/\D/g, '').length} more digits`}
        {isValid && "✓ Valid number"}
      </p>

      {/* Recent numbers */}
      {!value && recentNumbers.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="text-center text-xs text-muted-foreground">Recent numbers</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {recentNumbers.map((phone) => {
              const phoneNetwork = detectNetwork(phone);
              return (
                <button
                  key={phone}
                  onClick={() => selectRecentNumber(phone)}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-mono transition-colors flex items-center gap-2"
                >
                  {formatPhoneNumber(phone)}
                  {phoneNetwork && (
                    <span 
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ 
                        backgroundColor: networks[phoneNetwork].color + '20',
                        color: networks[phoneNetwork].color,
                      }}
                    >
                      {networks[phoneNetwork].name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
