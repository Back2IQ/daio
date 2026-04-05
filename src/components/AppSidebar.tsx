import { useState } from 'react';
import {
  Shield, Network, Wallet, Send, Coins, TrendingUp,
  Users, History, Key, Link2, ArrowDownUp, ShieldAlert, Settings,
  CreditCard, Clock, Package, Zap, UserCheck, Gavel, LogOut, Menu,
  ChevronDown
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Back2IQLogo from '@/components/Back2IQLogo';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLock: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Wallet',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Wallet },
      { id: 'send', label: 'Send', icon: Send },
      { id: 'swap', label: 'Swap', icon: ArrowDownUp },
      { id: 'buysell', label: 'Buy / Sell', icon: CreditCard },
      {
        id: 'assets',
        label: 'Assets',
        icon: Coins,
        children: [
          { id: 'assets-tokens', label: 'Tokens', icon: Coins },
          { id: 'assets-nfts', label: 'NFTs', icon: Package },
          { id: 'assets-defi', label: 'DeFi', icon: TrendingUp },
        ],
      },
      { id: 'portfolio', label: 'Portfolio', icon: TrendingUp },
    ],
  },
  {
    label: 'Connections',
    items: [
      { id: 'walletconnect', label: 'WalletConnect', icon: Link2 },
      { id: 'approvals', label: 'Approvals', icon: ShieldAlert },
    ],
  },
  {
    label: 'Network',
    items: [
      { id: 'networks', label: 'Networks', icon: Network },
    ],
  },
  {
    label: 'DAIO Shield',
    items: [
      { id: 'dms', label: "Dead Man's Switch", icon: Clock },
      { id: 'inheritance', label: 'Inheritance Container', icon: Package },
      { id: 'transfergate', label: 'Transfer Gate', icon: Zap },
      { id: 'emergency', label: 'Emergency', icon: ShieldAlert },
      { id: 'guardian-portal', label: 'Guardian Portal', icon: UserCheck },
      { id: 'heir-portal', label: 'Heir Portal', icon: Users },
      { id: 'notary-portal', label: 'Notary Portal', icon: Gavel },
    ],
  },
  {
    label: 'Management',
    items: [
      { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
      { id: 'compliance', label: 'Compliance', icon: Shield },
      { id: 'recovery', label: 'Recovery', icon: Key },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'audit', label: 'Audit Log', icon: History },
    ],
  },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ activeTab, onTabChange, onLock }) => {
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(activeTab.startsWith('assets') ? ['assets'] : [])
  );

  const handleClick = (id: string) => {
    onTabChange(id);
    setOpen(false);
  };

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu className="w-5 h-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Back2IQLogo size="sm" showSlogan />
              <div className="ml-auto">
                <SheetTitle className="text-base leading-tight">DAIO Wallet</SheetTitle>
                <p className="text-[11px] text-muted-foreground leading-tight">Digital Asset Inheritance</p>
              </div>
            </div>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto py-2">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-1">
                <p className="px-4 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
                {group.items.map((item) =>
                  item.children ? (
                    <div key={item.id}>
                      <button
                        onClick={() => toggleGroup(item.id)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent rounded-none transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown className={cn(
                          'w-4 h-4 text-muted-foreground transition-transform',
                          expandedGroups.has(item.id) && 'rotate-180'
                        )} />
                      </button>
                      {expandedGroups.has(item.id) && (
                        <div className="ml-4 border-l border-slate-200">
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => handleClick(child.id)}
                              className={cn(
                                'w-full flex items-center gap-3 pl-6 pr-4 py-2 text-sm transition-colors',
                                activeTab === child.id
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'hover:bg-accent text-foreground'
                              )}
                            >
                              <child.icon className="w-4 h-4" />
                              <span>{child.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      key={item.id}
                      onClick={() => handleClick(item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'hover:bg-accent text-foreground'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  )
                )}
              </div>
            ))}
          </nav>

          <div className="border-t p-3">
            <button
              onClick={() => { onLock(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Lock Wallet</span>
            </button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">DAIO Wallet v1.0</p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AppSidebar;
