import { useState, useCallback } from 'react';
import { PhoneInput } from '@/components/PhoneInput';
import { MultiNumberInput, PhoneEntry } from '@/components/MultiNumberInput';
import { ServiceToggle, ServiceType } from '@/components/ServiceToggle';
import { PlanSelector } from '@/components/PlanSelector';
import { PaymentSheet } from '@/components/PaymentSheet';
import { ProcessingState } from '@/components/ProcessingState';
import { SuccessReceipt } from '@/components/SuccessReceipt';
import { NetworkType } from '@/lib/networks';
import { DataPlan, AirtimePlan, formatPrice } from '@/lib/plans';
import {
  Transaction, 
  PaymentDetails,
  generateReference, 
  generatePaymentDetails,
  saveLastNumber,
  saveTransaction,
} from '@/lib/transactions';
import { Button } from '@/components/ui/button';
import { History, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type AppState = 'input' | 'plans' | 'payment' | 'processing' | 'success';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('input');
  const [serviceType, setServiceType] = useState<ServiceType>('data');
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [network, setNetwork] = useState<NetworkType>(null);
  const [phoneEntries, setPhoneEntries] = useState<PhoneEntry[]>([
    { id: crypto.randomUUID(), phone: '', network: null, isValid: false }
  ]);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | AirtimePlan | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);

  const handlePhoneChange = useCallback((value: string, detectedNetwork: NetworkType) => {
    setPhoneNumber(value);
    setNetwork(detectedNetwork);
  }, []);

  const handleValidNumber = useCallback((phone: string, detectedNetwork: Exclude<NetworkType, null>) => {
    setNetwork(detectedNetwork);
    setAppState('plans');
    saveLastNumber(phone);
  }, []);

  const handleMultiValidNumbers = useCallback((entries: PhoneEntry[]) => {
    // Use the first valid entry's network
    const firstValid = entries.find(e => e.isValid && e.network);
    if (firstValid && firstValid.network) {
      setNetwork(firstValid.network);
      setAppState('plans');
      saveLastNumber(entries[0].phone.replace(/\D/g, ''));
    }
  }, []);

  const handleSelectPlan = useCallback((plan: DataPlan | AirtimePlan) => {
    setSelectedPlan(plan);
  }, []);

  const handlePayNow = useCallback(() => {
    if (!selectedPlan || !network) return;
    
    // Calculate total for multi-number mode
    const count = isMultiMode ? phoneEntries.filter(e => e.isValid).length : 1;
    // Handle both data plans (price) and airtime plans (amount)
    const planPrice = 'price' in selectedPlan ? selectedPlan.price : selectedPlan.amount;
    const totalPrice = planPrice * count;
    
    const reference = generateReference();
    const details = generatePaymentDetails(totalPrice, reference);
    setPaymentDetails(details);
    setAppState('payment');
  }, [selectedPlan, network, isMultiMode, phoneEntries]);

  const handleConfirmPayment = useCallback(() => {
    if (!selectedPlan || !network || !paymentDetails) return;

    setAppState('processing');

    // Simulate payment verification and VTU delivery
    setTimeout(() => {
      const targetPhone = isMultiMode 
        ? phoneEntries.filter(e => e.isValid).map(e => e.phone.replace(/\D/g, '')).join(', ')
        : phoneNumber.replace(/\D/g, '');

      const transaction: Transaction = {
        id: crypto.randomUUID(),
        reference: paymentDetails.reference,
        phoneNumber: targetPhone,
        network,
        plan: selectedPlan,
        amount: paymentDetails.amount,
        status: 'success',
        createdAt: new Date(),
        completedAt: new Date(),
        paymentMethod: 'bank_transfer',
      };

      setCurrentTransaction(transaction);
      saveTransaction(transaction);
      setAppState('success');
    }, 2000);
  }, [selectedPlan, network, paymentDetails, phoneNumber, isMultiMode, phoneEntries]);

  const handleCancelPayment = useCallback(() => {
    setAppState('plans');
    setPaymentDetails(null);
  }, []);

  const handleNewPurchase = useCallback(() => {
    setAppState('input');
    setPhoneNumber('');
    setNetwork(null);
    setSelectedPlan(null);
    setPaymentDetails(null);
    setCurrentTransaction(null);
    setPhoneEntries([{ id: crypto.randomUUID(), phone: '', network: null, isValid: false }]);
    setIsMultiMode(false);
  }, []);

  const handleBackToInput = useCallback(() => {
    setAppState('input');
    setSelectedPlan(null);
  }, []);

  const toggleMultiMode = () => {
    setIsMultiMode(!isMultiMode);
    if (!isMultiMode) {
      // Switching to multi mode - reset entries
      setPhoneEntries([{ id: crypto.randomUUID(), phone: '', network: null, isValid: false }]);
    }
  };

  const validEntriesCount = phoneEntries.filter(e => e.isValid).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <button 
          onClick={handleNewPurchase}
          className="text-xl font-bold tracking-tighter"
        >
          datadome<span className="text-primary">.</span>
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <History className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 container max-w-md mx-auto px-4 py-8">
        {/* Phone input state */}
        {appState === 'input' && (
          <div className="space-y-6">
            {/* Service toggle */}
            <ServiceToggle value={serviceType} onChange={setServiceType} />

            {/* Phone input(s) */}
            <div className="pt-4">
              {isMultiMode ? (
                <MultiNumberInput
                  entries={phoneEntries}
                  onEntriesChange={setPhoneEntries}
                  onAllValid={handleMultiValidNumbers}
                />
              ) : (
                <PhoneInput
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  onValidNumber={handleValidNumber}
                />
              )}
            </div>

            {/* Multi/Single toggle - positioned below input */}
            <div className="flex justify-center pt-2">
              <button
                onClick={toggleMultiMode}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all border",
                  isMultiMode 
                    ? "bg-primary/10 text-primary border-primary/30" 
                    : "text-muted-foreground hover:text-foreground border-border hover:border-muted-foreground"
                )}
              >
                {isMultiMode ? (
                  <>
                    <Users className="w-3.5 h-3.5" />
                    Bulk Transaction
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5" />
                    Single Transaction
                  </>
                )}
              </button>
            </div>

            {/* Continue button for multi-mode */}
            {isMultiMode && validEntriesCount > 0 && (
              <div className="pt-4">
                <Button
                  onClick={() => handleMultiValidNumbers(phoneEntries.filter(e => e.isValid))}
                  variant="primary"
                  size="xl"
                  className="w-full"
                >
                  Continue with {validEntriesCount} number{validEntriesCount > 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Plans selection state */}
        {appState === 'plans' && network && (
          <div className="space-y-6">
            {/* Back button & phone display */}
            <button
              onClick={handleBackToInput}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>←</span>
              <span className="font-mono">{phoneNumber}</span>
            </button>

            {/* Plans grid */}
            <PlanSelector
              network={network}
              serviceType={serviceType}
              selectedPlan={selectedPlan}
              onSelectPlan={handleSelectPlan}
            />

            {/* Pay button */}
            <div className={cn(
              "fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border transition-all duration-300",
              selectedPlan ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            )}>
              <div className="container max-w-md mx-auto">
                {isMultiMode && validEntriesCount > 1 && selectedPlan && (
                  <p className="text-center text-sm text-muted-foreground mb-2">
                    {formatPrice('price' in selectedPlan ? selectedPlan.price : selectedPlan.amount)} × {validEntriesCount} numbers
                  </p>
                )}
                <Button
                  onClick={handlePayNow}
                  disabled={!selectedPlan}
                  variant="primary"
                  size="xl"
                  className="w-full"
                >
                  Pay {selectedPlan && formatPrice(
                    (() => {
                      const planPrice = 'price' in selectedPlan ? selectedPlan.price : selectedPlan.amount;
                      return isMultiMode ? planPrice * validEntriesCount : planPrice;
                    })()
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Payment state */}
        {appState === 'payment' && paymentDetails && (
          <PaymentSheet
            paymentDetails={paymentDetails}
            onConfirmPayment={handleConfirmPayment}
            onCancel={handleCancelPayment}
          />
        )}

        {/* Processing state */}
        {appState === 'processing' && (
          <ProcessingState />
        )}

        {/* Success state */}
        {appState === 'success' && currentTransaction && (
          <SuccessReceipt
            transaction={currentTransaction}
            onNewPurchase={handleNewPurchase}
          />
        )}
      </main>

      {/* Footer - only show on input state */}
      {appState === 'input' && (
        <footer className="p-4 text-center text-xs text-muted-foreground">
          Fast. Simple. Data.
        </footer>
      )}
    </div>
  );
};

export default Index;
