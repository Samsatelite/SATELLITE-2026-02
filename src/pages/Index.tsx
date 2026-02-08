import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { PhoneInput, PhoneInputRef } from '@/components/PhoneInput';
import { ServiceToggle, ServiceType } from '@/components/ServiceToggle';
import { PlanSelector } from '@/components/PlanSelector';
import { PaymentSheet } from '@/components/PaymentSheet';
import { ProcessingState } from '@/components/ProcessingState';
import { SuccessReceipt } from '@/components/SuccessReceipt';
import { RewardsPage } from '@/components/RewardsPage';
import { AuthScreen } from '@/components/AuthScreen';
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
import { History, ArrowLeft, LogOut } from 'lucide-react';
import { MultiNumberInput, PhoneEntry } from '@/components/MultiNumberInput';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';

type AppState = 'auth' | 'input' | 'plans' | 'payment' | 'processing' | 'success' | 'rewards';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceType, setServiceType] = useState<ServiceType>('data');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [network, setNetwork] = useState<NetworkType>(null);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | AirtimePlan | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [multiEntries, setMultiEntries] = useState<PhoneEntry[]>([
    { id: crypto.randomUUID(), phone: '', network: null, isValid: false }
  ]);

  const phoneInputRef = useRef<PhoneInputRef>(null);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setAppState('input');
      } else {
        setAppState('auth');
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setAppState('input');
      } else {
        setAppState('auth');
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleMultiEntriesChange = useCallback((entries: PhoneEntry[]) => {
    setMultiEntries(entries);
    const firstValid = entries.find(e => e.isValid);
    if (firstValid) {
      setNetwork(firstValid.network);
    }
  }, []);

  const handleMultiProceed = useCallback(() => {
    const validEntries = multiEntries.filter(e => e.isValid);
    if (validEntries.length > 0 && validEntries[0].network) {
      setNetwork(validEntries[0].network);
      setAppState('plans');
    }
  }, [multiEntries]);

  const handleSelectPlan = useCallback((plan: DataPlan | AirtimePlan) => {
    setSelectedPlan(plan);
  }, []);

  const handlePayNow = useCallback(() => {
    if (!selectedPlan || !network) return;
    
    const planPrice = 'price' in selectedPlan ? selectedPlan.price : selectedPlan.amount;
    
    // Multiply by number count in bulk mode
    const numberCount = isMultiMode 
      ? multiEntries.filter(e => e.isValid).length 
      : 1;
    const totalAmount = planPrice * numberCount;
    
    const reference = generateReference();
    const details = generatePaymentDetails(totalAmount, reference);
    setPaymentDetails(details);
    setAppState('payment');
  }, [selectedPlan, network, isMultiMode, multiEntries]);

  const handleConfirmPayment = useCallback(() => {
    if (!selectedPlan || !network || !paymentDetails) return;

    setAppState('processing');

    setTimeout(() => {
      const phoneNumbers = isMultiMode 
        ? multiEntries.filter(e => e.isValid).map(e => e.phone.replace(/\D/g, ''))
        : [phoneNumber.replace(/\D/g, '')];

      const transaction: Transaction = {
        id: crypto.randomUUID(),
        reference: paymentDetails.reference,
        phoneNumber: phoneNumbers.join(', '),
        network,
        plan: selectedPlan,
        amount: paymentDetails.amount,
        status: 'success',
        createdAt: new Date(),
        completedAt: new Date(),
        paymentMethod: 'bank_transfer',
        isBulk: isMultiMode && phoneNumbers.length > 1,
      };

      setCurrentTransaction(transaction);
      saveTransaction(transaction);
      setRecentTransactions(getRecentTransactions());
      setAppState('success');
    }, 2000);
  }, [selectedPlan, network, paymentDetails, phoneNumber, isMultiMode, multiEntries]);

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
    setIsMultiMode(false);
    setMultiEntries([{ id: crypto.randomUUID(), phone: '', network: null, isValid: false }]);
  }, []);

  const handleBackToInput = useCallback(() => {
    setAppState('input');
    setSelectedPlan(null);
  }, []);

  const handleClaimRewards = useCallback(() => {
    setAppState('rewards');
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAppState('auth');
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  }, []);

  const validPhoneNumbers = isMultiMode 
    ? multiEntries.filter(e => e.isValid).map(e => e.phone.replace(/\D/g, ''))
    : [phoneNumber.replace(/\D/g, '')];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-xl font-bold tracking-tighter">
          datadome<span className="text-primary">.</span>
        </div>
      </div>
    );
  }

  if (appState === 'auth') {
    return <AuthScreen />;
  }

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
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <History className="w-5 h-5 text-muted-foreground" />
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
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
                <>
                  <MultiNumberInput
                    entries={multiEntries}
                    onEntriesChange={handleMultiEntriesChange}
                    onAllValid={() => {}}
                  />
                  {multiEntries.some(e => e.isValid) && (
                    <Button
                      onClick={handleMultiProceed}
                      variant="primary"
                      size="xl"
                      className="w-full mt-4"
                    >
                      Continue with {multiEntries.filter(e => e.isValid).length} number{multiEntries.filter(e => e.isValid).length !== 1 ? 's' : ''}
                    </Button>
                  )}
                  {/* Switch to single */}
                  <button
                    onClick={() => setIsMultiMode(false)}
                    className="w-full mt-3 py-2 px-4 text-xs font-medium rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500/10 transition-colors"
                  >
                    Single Transaction
                  </button>
                </>
              ) : (
                <>
                  <PhoneInput
                    ref={phoneInputRef}
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    onValidNumber={handleValidNumber}
                  />
                  {/* Bulk transaction micro button below progress */}
                  <button
                    onClick={() => setIsMultiMode(true)}
                    className="w-full mt-3 py-2 px-4 text-xs font-medium rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500/10 transition-colors"
                  >
                    Bulk Transaction
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Plans selection state */}
        {appState === 'plans' && network && (
          <div className="space-y-6">
            {/* Back button & phone display */}
            <button
              onClick={handleBackToInput}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors -mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-mono">
                {isMultiMode 
                  ? `${validPhoneNumbers.length} numbers`
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
                <Button
                  onClick={handlePayNow}
                  disabled={!selectedPlan}
                  variant="primary"
                  size="xl"
                  className="w-full"
                >
                  Pay {selectedPlan && formatPrice(
                    (() => {
                      const unitPrice = 'price' in selectedPlan ? selectedPlan.price : selectedPlan.amount;
                      const count = isMultiMode ? validPhoneNumbers.length : 1;
                      return unitPrice * count;
                    })()
                  )}
                  {isMultiMode && validPhoneNumbers.length > 1 && (
                    <span className="text-xs opacity-70 ml-1">
                      ({validPhoneNumbers.length} numbers)
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Payment state */}
        {appState === 'payment' && paymentDetails && (
          <div className="space-y-6">
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
                      <p className="font-mono text-sm">
                        {tx.isBulk 
                          ? `Bulk (${tx.phoneNumber.split(', ').length} numbers)`
                          : formatPhoneNumber(tx.phoneNumber.split(', ')[0])
                        }
                      </p>
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
