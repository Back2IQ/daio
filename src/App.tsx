import { useState, useEffect, useCallback, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Shield, Network, Wallet, Send, Coins, TrendingUp,
  Users, History, Plus, ChevronDown, Eye, EyeOff,
  Copy, Lock, LogOut, Download, AlertTriangle, CheckCircle,
  Scale, Key, Link2, ArrowDownUp, ShieldAlert, Settings, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import AppSidebar from '@/components/AppSidebar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useWalletStore } from '@/store/walletStore';
import Back2IQLogo from '@/components/Back2IQLogo';
import { formatAddress, isValidAddress, isValidMnemonicPhrase } from '@/lib/crypto';
import Networks from '@/components/Networks';
import Tokens from '@/components/Tokens';
import NFTs from '@/components/NFTs';
import DeFi from '@/components/DeFi';
import DashboardTab from '@/components/DashboardTab';
import SendTab from '@/components/SendTab';
import PortfolioTab from '@/components/PortfolioTab';
import DMSTab from '@/components/DMSTab';
import HeirsTab from '@/components/HeirsTab';
import EmergencyTab from '@/components/EmergencyTab';
import AuditTab from '@/components/AuditTab';
import InheritanceContainerTab from '@/components/InheritanceContainerTab';
import TransferGateTab from '@/components/TransferGateTab';
import ComplianceTab from '@/components/ComplianceTab';
import GuardianPortal from '@/components/GuardianPortal';
import HeirPortal from '@/components/HeirPortal';
import NotaryPortal from '@/components/NotaryPortal';
import RecoveryFlow from '@/components/RecoveryFlow';
import WalletConnectTab from '@/components/WalletConnectTab';
import SwapTab from '@/components/SwapTab';
import ApprovalsTab from '@/components/ApprovalsTab';
import NotificationsSettings from '@/components/NotificationsSettings';
import BuySellTab from '@/components/BuySellTab';
import './App.css';

const AUTO_LOCK_MS = 5 * 60 * 1000; // 5 minutes

// Wallet Setup Component
function WalletSetup({ onComplete }: { onComplete: () => void }) {
  const [mode, setMode] = useState<'create' | 'import' | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { initializeWallet, importWallet } = useWalletStore();

  const handleCreate = async () => {
    if (isLoading) return;
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }

    if (step === 1) {
      setIsLoading(true);
      try {
        const generatedMnemonic = await initializeWallet(password);
        setMnemonic(generatedMnemonic);
        setStep(2);
      } catch {
        toast.error('Failed to create wallet');
      } finally {
        setIsLoading(false);
      }
    } else {
      setPassword('');
      setConfirmPassword('');
      onComplete();
    }
  };

  const handleImport = async () => {
    if (isLoading) return;
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (!isValidMnemonicPhrase(mnemonic)) { toast.error('Invalid seed phrase (must contain valid BIP-39 words)'); return; }

    setIsLoading(true);
    try {
      await importWallet(mnemonic, password);
      setPassword('');
      setConfirmPassword('');
      setMnemonic('');
      onComplete();
    } catch {
      toast.error('Failed to import wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied!');
    } catch {
      toast.error('Copy failed');
    }
  };

  if (!mode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Back2IQLogo size="lg" showSlogan />
            </div>
            <CardTitle className="text-2xl">Welcome to DAIO Wallet</CardTitle>
            <CardDescription>The first wallet with integrated inheritance management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full h-14 text-lg" onClick={() => setMode('create')}>
              <Plus className="w-5 h-5 mr-2" />Create New Wallet
            </Button>
            <Button variant="outline" className="w-full h-14 text-lg" onClick={() => setMode('import')}>
              <Download className="w-5 h-5 mr-2" />Import Wallet
            </Button>
          </CardContent>
          <CardFooter className="text-center text-sm text-slate-500">
            Orchestration without Custody - Governance with Defined Liability
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create New Wallet</CardTitle>
            <CardDescription>{step === 1 ? 'Set a secure password' : 'Back up your seed phrase'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="create-password">Password</Label>
                  <Input id="create-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-confirm">Confirm Password</Label>
                  <Input id="create-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
                </div>
              </>
            ) : (
              <>
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">Write down these 24 words and store them securely.</AlertDescription>
                </Alert>
                <div className="p-4 bg-slate-100 rounded-lg font-mono text-sm cursor-pointer" onClick={() => setShowMnemonic(!showMnemonic)}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-500">Seed Phrase (24 words)</span>
                    {showMnemonic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </div>
                  <p className={showMnemonic ? '' : 'blur-sm select-none'}>{mnemonic}</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => copyToClipboard(mnemonic)}>
                  <Copy className="w-4 h-4 mr-2" />Copy
                </Button>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {step === 2 && <Button variant="outline" onClick={() => setMode(null)}>Back</Button>}
            <Button className={step === 1 ? 'w-full' : ''} onClick={handleCreate} disabled={isLoading}>
              {isLoading ? 'Please wait...' : step === 1 ? 'Next' : 'Create Wallet'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Import Wallet</CardTitle>
          <CardDescription>Enter your seed phrase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-mnemonic">Seed Phrase (12 or 24 words)</Label>
            <textarea id="import-mnemonic" className="w-full p-3 border rounded-lg font-mono text-sm min-h-[100px]" value={mnemonic} onChange={(e) => setMnemonic(e.target.value)} placeholder="word1 word2 word3 ..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="import-password">Password</Label>
            <Input id="import-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="import-confirm">Confirm Password</Label>
            <Input id="import-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setMode(null)}>Back</Button>
          <Button onClick={handleImport} disabled={isLoading}>{isLoading ? 'Please wait...' : 'Import Wallet'}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Unlock Screen with brute-force feedback
function UnlockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const unlockWallet = useWalletStore(s => s.unlockWallet);
  const failedAttempts = useWalletStore(s => s.failedAttempts);
  const lockoutUntil = useWalletStore(s => s.lockoutUntil);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  useEffect(() => {
    if (lockoutUntil <= Date.now()) { setLockoutRemaining(0); return; }
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleUnlock = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const success = await unlockWallet(password);
      if (success) {
        setPassword('');
        onUnlock();
      } else {
        toast.error('Incorrect password');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unlock failed');
    } finally {
      setIsLoading(false);
    }
  };

  const isLockedOut = lockoutRemaining > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Back2IQLogo size="lg" showSlogan />
          </div>
          <CardTitle className="text-2xl">Unlock Wallet</CardTitle>
          {failedAttempts > 0 && (
            <CardDescription className="text-red-500">
              {failedAttempts} failed attempts
              {isLockedOut && ` — Locked for ${lockoutRemaining}s`}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            onKeyDown={(e) => e.key === 'Enter' && !isLockedOut && handleUnlock()}
            disabled={isLockedOut}
            aria-label="Wallet password"
          />
          <Button className="w-full" onClick={handleUnlock} disabled={isLoading || isLockedOut}>
            {isLockedOut ? `Locked (${lockoutRemaining}s)` : isLoading ? 'Please wait...' : 'Unlock'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Main App
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isInitialized = useWalletStore(s => s.isInitialized);
  const isLocked = useWalletStore(s => s.isLocked);
  const accounts = useWalletStore(s => s.accounts);
  const activeAccountIndex = useWalletStore(s => s.activeAccountIndex);
  const networks = useWalletStore(s => s.networks);
  const activeAccount = useWalletStore(s => s.getActiveAccount());
  const activeNetwork = useWalletStore(s => s.getActiveNetwork());
  const setActiveAccount = useWalletStore(s => s.setActiveAccount);
  const addAccount = useWalletStore(s => s.addAccount);
  const lockWallet = useWalletStore(s => s.lockWallet);
  const sendTransaction = useWalletStore(s => s.sendTransaction);
  const setActiveNetwork = useWalletStore(s => s.setActiveNetwork);
  const addAuditEntry = useWalletStore(s => s.addAuditEntry);
  const userRole = useWalletStore(s => s.userRole);

  // Auto-lock timer: lock after 5 min of inactivity
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetAutoLock = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isLocked && isInitialized) {
      timerRef.current = setTimeout(() => {
        lockWallet();
        toast.info('Wallet auto-locked (inactivity)');
      }, AUTO_LOCK_MS);
    }
  }, [isLocked, isInitialized, lockWallet]);

  useEffect(() => {
    if (isLocked || !isInitialized) return;
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'] as const;
    const handler = () => resetAutoLock();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetAutoLock(); // start initial timer
    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLocked, isInitialized, resetAutoLock]);

  // Auto-lock on tab hide / browser freeze
  useEffect(() => {
    if (isLocked || !isInitialized) return;
    let hiddenSince: number | null = null;
    const VISIBILITY_LOCK_MS = 30 * 1000; // 30 seconds

    const onVisibilityChange = () => {
      if (document.hidden) {
        hiddenSince = Date.now();
      } else if (hiddenSince && Date.now() - hiddenSince >= VISIBILITY_LOCK_MS) {
        lockWallet();
        toast.info('Wallet auto-locked (tab hidden)');
      }
      hiddenSince = null;
    };

    const onFreeze = () => {
      lockWallet();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('freeze', onFreeze);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('freeze', onFreeze);
    };
  }, [isLocked, isInitialized, lockWallet]);

  useEffect(() => {
    if (isInitialized && !isLocked) {
      addAuditEntry({ action: 'Session Started', details: 'Wallet session initialized', type: 'info' });
    }
  }, [isInitialized, isLocked, addAuditEntry]);

  if (!isInitialized) return <WalletSetup onComplete={() => { /* store already updated */ }} />;
  if (isLocked) return <UnlockScreen onUnlock={() => { /* store already updated */ }} />;

  const handleSend = async () => {
    if (isSending) return;
    if (!isValidAddress(sendTo)) { toast.error('Invalid address'); return; }
    if (!sendAmount || parseFloat(sendAmount) <= 0) { toast.error('Invalid amount'); return; }
    const balance = parseFloat(activeAccount?.balance || '0');
    if (parseFloat(sendAmount) > balance) { toast.error('Insufficient balance'); return; }

    setIsSending(true);
    try {
      await sendTransaction(sendTo, sendAmount);
      toast.success('Transaction sent!');
      setSendDialogOpen(false);
      setSendTo('');
      setSendAmount('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied!');
    } catch {
      toast.error('Copy failed');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab onSendOpen={() => setSendDialogOpen(true)} onReceiveOpen={() => setShowReceive(true)} />;
      case 'send': return <SendTab />;
      case 'swap': return <SwapTab />;
      case 'buysell': return <BuySellTab />;
      case 'assets-tokens': return <Tokens />;
      case 'assets-nfts': return <NFTs />;
      case 'assets-defi': return <DeFi />;
      case 'portfolio': return <PortfolioTab />;
      case 'walletconnect': return <WalletConnectTab />;
      case 'approvals': return <ApprovalsTab />;
      case 'networks': return <Networks />;
      case 'dms': return <DMSTab />;
      case 'inheritance': return <InheritanceContainerTab />;
      case 'transfergate': return <TransferGateTab />;
      case 'emergency': return <EmergencyTab />;
      case 'guardian-portal': return <GuardianPortal />;
      case 'heir-portal': return <HeirPortal />;
      case 'notary-portal': return <NotaryPortal />;
      case 'beneficiaries': return <HeirsTab />;
      case 'compliance': return <ComplianceTab />;
      case 'recovery': return <RecoveryFlow />;
      case 'settings': return <NotificationsSettings />;
      case 'audit': return <AuditTab />;
      default: return <DashboardTab onSendOpen={() => setSendDialogOpen(true)} onReceiveOpen={() => setShowReceive(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} onLock={lockWallet} />
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 capitalize">
                  {userRole}
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />MiCA
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" aria-label="Switch network">
                    <Network className="w-4 h-4 mr-1" /><span className="hidden sm:inline">{activeNetwork.name}</span><ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {networks.map(network => (
                    <DropdownMenuItem key={network.id} onClick={() => setActiveNetwork(network.id)}>
                      {network.name}{network.isTestnet && <Badge variant="secondary" className="ml-2">Testnet</Badge>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" aria-label="Switch account">
                    <Wallet className="w-4 h-4 mr-1" /><span className="hidden sm:inline">{activeAccount ? formatAddress(activeAccount.address) : 'No account'}</span><ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {accounts.map((account, index) => (
                    <DropdownMenuItem key={account.address} onClick={() => setActiveAccount(index)} className={index === activeAccountIndex ? 'bg-blue-50' : ''}>
                      <div className="flex flex-col">
                        <span className="font-medium">{account.name}</span>
                        <span className="text-xs text-slate-500">{formatAddress(account.address)}</span>
                        <span className="text-xs text-slate-400">{account.balance} {activeNetwork.symbol}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={() => addAccount()}>
                    <Plus className="w-4 h-4 mr-2" />New Account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" onClick={lockWallet} aria-label="Lock wallet"><LogOut className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {renderContent()}
        </div>
      </main>

      {/* Send Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send {activeNetwork.symbol}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-send-to">Recipient</Label>
              <Input id="dialog-send-to" placeholder="0x..." value={sendTo} onChange={(e) => setSendTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-send-amount">Amount ({activeNetwork.symbol})</Label>
              <Input id="dialog-send-amount" type="number" step="0.001" min="0" placeholder="0.0" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} />
              <p className="text-sm text-slate-500">Available: {activeAccount?.balance || '0'} {activeNetwork.symbol}</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSend} disabled={!sendTo || !sendAmount || isSending}>{isSending ? 'Sending...' : 'Send'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Dialog */}
      <Dialog open={showReceive} onOpenChange={setShowReceive}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive {activeNetwork.symbol}</DialogTitle>
            <DialogDescription>Share this address to receive {activeNetwork.symbol}</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <div className="bg-slate-100 p-6 rounded-lg mb-4"><p className="font-mono text-lg break-all">{activeAccount?.address}</p></div>
            <Button onClick={() => copyToClipboard(activeAccount?.address || '')}><Copy className="w-4 h-4 mr-2" />Copy Address</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppWithProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

export default AppWithProviders;
