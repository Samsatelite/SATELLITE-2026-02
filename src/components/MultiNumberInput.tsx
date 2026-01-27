import { useState } from 'react';
import { detectNetwork, formatPhoneNumber, isValidNigerianNumber, networks, NetworkType } from '@/lib/networks';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

export interface PhoneEntry {
  id: string;
  phone: string;
  network: NetworkType;
  isValid: boolean;
}

interface MultiNumberInputProps {
  entries: PhoneEntry[];
  onEntriesChange: (entries: PhoneEntry[]) => void;
  onAllValid: (entries: PhoneEntry[]) => void;
}

export function MultiNumberInput({ entries, onEntriesChange, onAllValid }: MultiNumberInputProps) {
  const addEntry = () => {
    const newEntry: PhoneEntry = {
      id: crypto.randomUUID(),
      phone: '',
      network: null,
      isValid: false,
    };
    onEntriesChange([...entries, newEntry]);
  };

  const removeEntry = (id: string) => {
    if (entries.length <= 1) return;
    const updated = entries.filter(e => e.id !== id);
    onEntriesChange(updated);
  };

  const updateEntry = (id: string, phone: string) => {
    const formatted = formatPhoneNumber(phone);
    const network = detectNetwork(phone);
    const cleaned = phone.replace(/\D/g, '');
    const isValid = isValidNigerianNumber(cleaned) && network !== null;

    const updated = entries.map(e => 
      e.id === id ? { ...e, phone: formatted, network, isValid } : e
    );
    onEntriesChange(updated);

    // Check if all entries are valid
    const allValid = updated.every(e => e.isValid);
    if (allValid && updated.length > 0) {
      onAllValid(updated);
    }
  };

  return (
    <div className="space-y-3 animate-slide-up">
      {entries.map((entry, index) => (
        <div key={entry.id} className="relative">
          {/* Network indicator */}
          {entry.network && (
            <div className="absolute -top-2 left-3 z-10">
              <span 
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: networks[entry.network].color + '20',
                  color: networks[entry.network].color,
                }}
              >
                {networks[entry.network].name}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="tel"
                inputMode="numeric"
                value={entry.phone}
                onChange={(e) => updateEntry(entry.id, e.target.value)}
                placeholder={index === 0 ? "0801 234 5678" : "Add another number"}
                className={cn(
                  "w-full py-3 px-4 bg-muted rounded-lg text-base font-mono tracking-wide",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  "placeholder:text-muted-foreground/50",
                  entry.isValid && "ring-1 ring-primary/50"
                )}
                autoComplete="tel"
              />
              
              {/* Valid indicator */}
              {entry.isValid && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-sm">
                  ✓
                </div>
              )}
            </div>

            {/* Remove button */}
            {entries.length > 1 && (
              <button
                onClick={() => removeEntry(entry.id)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add more button */}
      <button
        onClick={addEntry}
        className="w-full py-3 px-4 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add another number
      </button>

      {/* Summary */}
      {entries.length > 1 && (
        <p className="text-center text-sm text-muted-foreground">
          {entries.filter(e => e.isValid).length} of {entries.length} numbers valid
        </p>
      )}
    </div>
  );
}
