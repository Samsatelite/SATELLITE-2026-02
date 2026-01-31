import { useState, useCallback, useRef, useEffect } from 'react';
import { PhoneInput, PhoneInputRef } from '@/components/PhoneInput';
import { MultiNumberInput, PhoneEntry } from '@/components/MultiNumberInput';
import { ServiceToggle, ServiceType } from '@/components/ServiceToggle';
import { PlanSelector } from '@/components/PlanSelector';
import { PaymentSheet } from '@/components/PaymentSheet';
import { ProcessingState } from '@/components/ProcessingState';
import { SuccessReceipt } from '@/components/SuccessReceipt';
import { RewardsPage } from '@/components/RewardsPage';
import { LoginPrompt } from '@/components/LoginPrompt';
import { NetworkType, formatPhoneNumber, networks } from '@/lib/networks';
import { DataPlan, AirtimePlan, formatPrice } from '@/lib/plans';
import {
  Transaction, 
  PaymentDetails,
  generateReference, 
  generatePaymentDetails,
  saveLastNumber,
  saveTransaction,
  getRecentTransactions,
} from '@/lib/transactions';
import { Button } from '@/components/ui/button';
import { History, Users, User, ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type AppState = 'input' | 'plans' | 'payment' | 'processing' | 'success' | 'rewards';

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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [bulkLoginRequired, setBulkLoginRequired] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const phoneInputRef = useRef<PhoneInputRef>(null);

  // Load recent transactions
  useEffect(() => {
    setRecentTransactions(getRecentTransactions());
  }, []);

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
      setRecentTransactions(getRecentTransactions());
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

  const handleClaimRewards = useCallback(() => {
    setAppState('rewards');
  }, []);

  const handleLoginPrompt = useCallback((required: boolean = false) => {
    setBulkLoginRequired(required);
    setShowLoginPrompt(true);
  }, []);

  const handleLogin = useCallback(() => {
    // In production, redirect to auth
    setShowLoginPrompt(false);
    setBulkLoginRequired(false);
    // For now, just continue
  }, []);

  const handleContinueAsGuest = useCallback(() => {
    if (!bulkLoginRequired) {
      setShowLoginPrompt(false);
    }
  }, [bulkLoginRequired]);

  const toggleMultiMode = () => {
    setIsMultiMode(!isMultiMode);
    if (!isMultiMode) {
      // Switching to multi mode - reset entries
      setPhoneEntries([{ id: crypto.randomUUID(), phone: '', network: null, isValid: false }]);
    }
  };

  const validEntriesCount = phoneEntries.filter(e => e.isValid).length;
  const validPhoneNumbers = isMultiMode 
    ? phoneEntries.filter(e => e.isValid).map(e => e.phone.replace(/\D/g, ''))
    : [phoneNumber.replace(/\D/g, '')];

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
        <button 
          onClick={() => setShowHistory(true)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
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
                  onLoginPrompt={handleLoginPrompt}
                />
              ) : (
                <PhoneInput
                  ref={phoneInputRef}
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
                    ? "border-primary text-primary bg-transparent" 
                    : "bg-primary text-primary-foreground border-transparent"
                )}
              >
                {isMultiMode ? (
                  <>
                    <User className="w-3.5 h-3.5" />
                    Single Transaction
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5" />
                    Bulk Transaction
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
              <ArrowLeft className="w-4 h-4" />
              <span className="font-mono">
                {isMultiMode 
                  ? `${validEntriesCount} numbers` 
                  : formatPhoneNumber(phoneNumber)
                }
              </span>
            </button>

            {/* Plans grid */}
            <PlanSelector
              network={network}
              serviceType={serviceType}
              selectedPlan={selectedPlan}
              onSelectPlan={handleSelectPlan}
              onBackToInput={handleBackToInput}
              phoneNumbers={validPhoneNumbers}
              isMultiMode={isMultiMode}
              onClaimRewards={handleClaimRewards}
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
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={handleCancelPayment}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to plans
            </button>

            <PaymentSheet
              paymentDetails={paymentDetails}
              onConfirmPayment={handleConfirmPayment}
              onCancel={handleCancelPayment}
            />
          </div>
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

        {/* Rewards page */}
        {appState === 'rewards' && (
          <RewardsPage onBack={() => setAppState('plans')} />
        )}
      </main>

      {/* Footer - only show on input state */}
      {appState === 'input' && (
        <footer className="p-4 text-center text-xs text-muted-foreground">
          Fast. Simple. Data.
        </footer>
      )}

      {/* Login prompt dialog */}
      <LoginPrompt
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        onLogin={handleLogin}
        onContinueAsGuest={handleContinueAsGuest}
        required={bulkLoginRequired}
      />

      {/* Recent transactions sheet */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent side="bottom" className="h-[70vh]">
          <SheetHeader>
            <SheetTitle>Recent Transactions</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(70vh-80px)]">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transactions yet
              </p>
            ) : (
              recentTransactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: tx.network ? networks[tx.network].color : '#888' }}
                    >
                      {tx.network ? networks[tx.network].name.slice(0, 3).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="font-mono text-sm">{formatPhoneNumber(tx.phoneNumber.split(', ')[0])}</p>
                      <p className="text-xs text-muted-foreground">
                        {'size' in tx.plan ? tx.plan.size : formatPrice(tx.plan.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(tx.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;