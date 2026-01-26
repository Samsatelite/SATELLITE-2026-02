import { useState, useCallback } from 'react';
import { PhoneInput } from '@/components/PhoneInput';
import { PlanSelector } from '@/components/PlanSelector';
import { PaymentSheet } from '@/components/PaymentSheet';
import { ProcessingState } from '@/components/ProcessingState';
import { SuccessReceipt } from '@/components/SuccessReceipt';
import { NetworkType } from '@/lib/networks';
import { DataPlan, formatPrice } from '@/lib/plans';
import { 
  Transaction, 
  PaymentDetails,
  generateReference, 
  generatePaymentDetails,
  saveLastNumber,
  saveTransaction,
} from '@/lib/transactions';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { cn } from '@/lib/utils';

type AppState = 'input' | 'plans' | 'payment' | 'processing' | 'success';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [network, setNetwork] = useState<NetworkType>(null);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
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

  const handleSelectPlan = useCallback((plan: DataPlan) => {
    setSelectedPlan(plan);
  }, []);

  const handlePayNow = useCallback(() => {
    if (!selectedPlan || !network) return;
    
    const reference = generateReference();
    const details = generatePaymentDetails(selectedPlan.price, reference);
    setPaymentDetails(details);
    setAppState('payment');
  }, [selectedPlan, network]);

  const handleConfirmPayment = useCallback(() => {
    if (!selectedPlan || !network || !paymentDetails) return;

    setAppState('processing');

    // Simulate payment verification and VTU delivery
    setTimeout(() => {
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        reference: paymentDetails.reference,
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        network,
        plan: selectedPlan,
        amount: selectedPlan.price,
        status: 'success',
        createdAt: new Date(),
        completedAt: new Date(),
        paymentMethod: 'bank_transfer',
      };

      setCurrentTransaction(transaction);
      saveTransaction(transaction);
      setAppState('success');
    }, 2000);
  }, [selectedPlan, network, paymentDetails, phoneNumber]);

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
  }, []);

  const handleBackToInput = useCallback(() => {
    setAppState('input');
    setSelectedPlan(null);
  }, []);

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
          <div className="pt-16">
            <PhoneInput
              value={phoneNumber}
              onChange={handlePhoneChange}
              onValidNumber={handleValidNumber}
            />
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
              selectedPlan={selectedPlan}
              onSelectPlan={handleSelectPlan}
            />

            {/* Pay button */}
            <div className={cn(
              "fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border transition-all duration-300",
              selectedPlan ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            )}>
              <div className="container max-w-md mx-auto">
                <Button
                  onClick={handlePayNow}
                  disabled={!selectedPlan}
                  variant="primary"
                  size="xl"
                  className="w-full"
                >
                  Pay {selectedPlan && formatPrice(selectedPlan.price)}
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
