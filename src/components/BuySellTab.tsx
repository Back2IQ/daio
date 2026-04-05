import React, { useState } from 'react';
import { CreditCard, ExternalLink, Loader2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useWalletStore } from '@/store/walletStore';

// ─── Types ───────────────────────────────────────────────────────

type RampMode = 'buy' | 'sell';

interface RampProvider {
  id: string;
  name: string;
  description: string;
  supportedCurrencies: string[];
  supportedCrypto: string[];
  kycRequired: boolean;
  fees: string;
  widgetUrl: string;
}

// ─── Providers ───────────────────────────────────────────────────

const PROVIDERS: RampProvider[] = [
  {
    id: 'transak',
    name: 'Transak',
    description: 'Buy & sell crypto with cards, bank transfer, Apple Pay',
    supportedCurrencies: ['EUR', 'USD', 'GBP', 'CHF'],
    supportedCrypto: ['ETH', 'MATIC', 'BNB', 'AVAX', 'USDC', 'USDT'],
    kycRequired: true,
    fees: '1.0% - 5.5%',
    widgetUrl: 'https://global.transak.com/',
  },
  {
    id: 'moonpay',
    name: 'MoonPay',
    description: 'Fast fiat on-ramp with 160+ countries supported',
    supportedCurrencies: ['EUR', 'USD', 'GBP'],
    supportedCrypto: ['ETH', 'MATIC', 'BNB', 'USDC', 'USDT', 'DAI'],
    kycRequired: true,
    fees: '1.0% - 4.5%',
    widgetUrl: 'https://www.moonpay.com/buy',
  },
];

const FIAT_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'];

const BuySellTab: React.FC = () => {
  const activeAccount = useWalletStore((s) => s.getActiveAccount());
  const activeNetwork = useWalletStore((s) => s.getActiveNetwork());
  const addAuditEntry = useWalletStore((s) => s.addAuditEntry);

  const [mode, setMode] = useState<RampMode>('buy');
  const [amount, setAmount] = useState('');
  const [fiatCurrency, setFiatCurrency] = useState('EUR');
  const [selectedProvider, setSelectedProvider] = useState<RampProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);

  const handleOpenWidget = (provider: RampProvider) => {
    if (!activeAccount) {
      toast.error('No active account');
      return;
    }

    setIsLoading(true);
    setSelectedProvider(provider);

    // Build widget URL with parameters
    const params = new URLSearchParams({
      walletAddress: activeAccount.address,
      cryptoCurrencyCode: activeNetwork.symbol,
      fiatCurrency,
      fiatAmount: amount || '100',
      network: activeNetwork.name.toLowerCase(),
    });

    const url = `${provider.widgetUrl}?${params.toString()}`;
    setWidgetUrl(url);

    addAuditEntry({
      action: `Fiat ${mode === 'buy' ? 'Purchase' : 'Sale'} Initiated`,
      details: `${provider.name}: ${amount || '100'} ${fiatCurrency} → ${activeNetwork.symbol}`,
      type: 'info',
    });

    setIsLoading(false);
  };

  const handleCloseWidget = () => {
    setWidgetUrl(null);
    setSelectedProvider(null);
  };

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {mode === 'buy' ? 'Buy Crypto' : 'Sell Crypto'}
          </CardTitle>
          <CardDescription>
            {mode === 'buy'
              ? 'Purchase crypto with fiat currency'
              : 'Sell crypto for fiat currency'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Buy/Sell Toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'buy' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('buy')}
            >
              Buy
            </Button>
            <Button
              variant={mode === 'sell' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('sell')}
            >
              Sell
            </Button>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Amount ({fiatCurrency})</Label>
              <Input
                type="number"
                min="0"
                step="10"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fiat Currency</Label>
              <Select value={fiatCurrency} onValueChange={setFiatCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIAT_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              {mode === 'buy' ? 'Receive' : 'Send'}: <span className="font-medium">{activeNetwork.symbol}</span> on {activeNetwork.name}
            </span>
          </div>

          {activeAccount && (
            <div className="text-xs text-slate-500">
              Receiving address: <span className="font-mono">{activeAccount.address}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Provider</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PROVIDERS.map((provider) => {
            const supportsCrypto = provider.supportedCrypto.includes(activeNetwork.symbol);
            const supportsFiat = provider.supportedCurrencies.includes(fiatCurrency);

            return (
              <div
                key={provider.id}
                className={`p-4 rounded-lg border ${
                  !supportsCrypto || !supportsFiat ? 'opacity-50' : 'hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{provider.name}</h3>
                      {provider.kycRequired && (
                        <Badge variant="secondary" className="text-[10px]">KYC Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{provider.description}</p>
                    <p className="text-xs text-slate-400 mt-1">Fees: {provider.fees}</p>
                  </div>
                  <Button
                    size="sm"
                    disabled={!supportsCrypto || !supportsFiat || isLoading}
                    onClick={() => handleOpenWidget(provider)}
                  >
                    {isLoading && selectedProvider?.id === provider.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Select<ExternalLink className="w-3 h-3 ml-1" /></>
                    )}
                  </Button>
                </div>
                {(!supportsCrypto || !supportsFiat) && (
                  <p className="text-xs text-red-500 mt-2">
                    {!supportsCrypto
                      ? `${activeNetwork.symbol} not supported`
                      : `${fiatCurrency} not supported`}
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Widget embed (iframe) */}
      {widgetUrl && selectedProvider && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{selectedProvider.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCloseWidget}>Close</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription className="text-xs">
                You are interacting with a third-party service ({selectedProvider.name}).
                DAIO Wallet does not process fiat payments directly. KYC verification may be required.
              </AlertDescription>
            </Alert>
            <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '500px' }}>
              <iframe
                src={widgetUrl}
                title={`${selectedProvider.name} Widget`}
                className="w-full h-full border-0"
                allow="camera; payment"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                referrerPolicy="no-referrer"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BuySellTab;
