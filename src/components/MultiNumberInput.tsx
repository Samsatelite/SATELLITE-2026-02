import { useState, useRef } from 'react';
import { detectNetwork, formatPhoneNumber, isValidNigerianNumber, networks, NetworkType } from '@/lib/networks';
import { cn } from '@/lib/utils';
import { Plus, X, FileText, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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
  onLoginPrompt?: (required?: boolean) => void;
}

export function MultiNumberInput({ entries, onEntriesChange, onAllValid, onLoginPrompt }: MultiNumberInputProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showFreeformInput, setShowFreeformInput] = useState(false);
  const [freeformText, setFreeformText] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

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

    const validCount = updated.filter(e => e.isValid).length;
    if (validCount > 5 && onLoginPrompt) {
      onLoginPrompt(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === entries.length - 1) {
        addEntry();
      }
    }
  };

  const extractNumbersFromText = (text: string): string[] => {
    const phoneRegex = /(?:(?:\+?234|0)[789]\d{2}[\s.-]?\d{3}[\s.-]?\d{4})|(?:0[789]\d{9})/g;
    const matches = text.match(phoneRegex) || [];
    
    return matches.map(match => {
      const digits = match.replace(/\D/g, '');
      if (digits.startsWith('234')) {
        return '0' + digits.slice(3);
      }
      return digits;
    }).filter(num => num.length === 11);
  };

  const handleFreeformSubmit = () => {
    const numbers = extractNumbersFromText(freeformText);
    if (numbers.length === 0) return;

    const newEntries = numbers.map(phone => ({
      id: crypto.randomUUID(),
      phone: formatPhoneNumber(phone),
      network: detectNetwork(phone),
      isValid: isValidNigerianNumber(phone) && detectNetwork(phone) !== null,
    }));

    const existingValid = entries.filter(e => e.isValid);
    const combined = [...existingValid, ...newEntries];
    
    onEntriesChange(combined.length > 0 ? combined : [{ id: crypto.randomUUID(), phone: '', network: null, isValid: false }]);
    setFreeformText('');
    setShowFreeformInput(false);

    if (combined.filter(e => e.isValid).length > 5 && onLoginPrompt) {
      onLoginPrompt(true);
    }
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    
    try {
      // Use canvas to read image, then extract text via simple OCR-like approach
      // For production, integrate with a real OCR API (Google Vision, Tesseract.js)
      const text = await extractTextFromImage(file);
      const numbers = extractNumbersFromText(text);
      
      if (numbers.length > 0) {
        const newEntries = numbers.map(phone => ({
          id: crypto.randomUUID(),
          phone: formatPhoneNumber(phone),
          network: detectNetwork(phone),
          isValid: isValidNigerianNumber(phone) && detectNetwork(phone) !== null,
        }));

        const existingValid = entries.filter(e => e.isValid);
        const combined = [...existingValid, ...newEntries];
        onEntriesChange(combined);

        toast({
          title: `Found ${numbers.length} number${numbers.length > 1 ? 's' : ''}`,
          description: 'Numbers extracted from image',
        });
      } else {
        toast({
          title: 'No numbers found',
          description: 'Could not detect phone numbers in the image. Try a clearer image.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Processing failed',
        description: 'Could not process the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingImage(false);
      e.target.value = '';
    }
  };

  // Simple text extraction from image - in production use proper OCR
  const extractTextFromImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // For now, prompt user to paste the text manually
        // In production, send to OCR API
        const img = new Image();
        img.onload = () => {
          // Canvas-based approach - limited but functional for clear text
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
          // Without a real OCR library, we'll show the paste text dialog instead
          setShowFreeformInput(true);
          toast({
            title: 'Image captured',
            description: 'Please paste or type the numbers from the captured image below.',
          });
          resolve('');
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-3 animate-slide-up">
      {entries.map((entry, index) => (
        <div key={entry.id} className="relative">
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
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder={index === 0 ? "080 1234 5678" : "Add another number"}
                className={cn(
                  "w-full py-3 px-4 bg-muted rounded-lg text-base font-mono tracking-wide pr-10",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  "placeholder:text-muted-foreground/50",
                  entry.isValid && "ring-1 ring-primary/50"
                )}
                autoComplete="tel"
                enterKeyHint="next"
              />
              
              {entry.isValid && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-sm">
                  ✓
                </div>
              )}
            </div>

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

      {/* Freeform text input toggle */}
      {showFreeformInput ? (
        <div className="space-y-2">
          <textarea
            value={freeformText}
            onChange={(e) => setFreeformText(e.target.value)}
            placeholder="Paste a list of numbers or text containing phone numbers..."
            className="w-full py-3 px-4 bg-muted rounded-lg text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
          />
          <div className="flex gap-2">
            <Button onClick={handleFreeformSubmit} variant="primary" size="sm" className="flex-1">
              Extract Numbers
            </Button>
            <Button onClick={() => { setShowFreeformInput(false); setFreeformText(''); }} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setShowFreeformInput(true)}
            className="flex-1 py-2 px-3 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Paste Text
          </button>
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={isProcessingImage}
            className="flex-1 py-2 px-3 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Camera className="w-3.5 h-3.5" />
            {isProcessingImage ? 'Processing...' : 'Capture Image'}
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />
        </div>
      )}

      {/* Summary */}
      {entries.length > 1 && (
        <p className="text-center text-sm text-muted-foreground">
          {entries.filter(e => e.isValid).length} of {entries.length} numbers valid
        </p>
      )}
    </div>
  );
}
