import { useState, useEffect } from 'react';
import { 
  BookOpen, Calculator, Shield, TrendingUp, AlertTriangle, 
  CheckCircle, FileText, Clock, DollarSign, 
  ChevronDown, ChevronRight, Menu, X, 
  Lock, Briefcase, Scale, Zap, Award,
  Layers, Key,
  FileCheck, Bell, ExternalLink, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell
} from 'recharts';

// ============================================
// TYPES AND INTERFACES
// ============================================
interface ROICalculatorState {
  investment: number;
  clientsPerYear: number;
  feePerClient: number;
  operatingCosts: number;
}

interface RiskAssessmentState {
  digitalAssetValue: number;
  documentationLevel: number;
  successionPlanning: number;
  regulatoryCompliance: number;
}

interface ComplianceChecklistItem {
  id: string;
  category: string;
  item: string;
  completed: boolean;
  required: boolean;
}

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
  }[];
  keyLessons: string[];
}

// ============================================
// DATA CONSTANTS
// ============================================
const BLUEPRINT_PACKAGES = {
  standard: {
    name: 'DAIO Framework License',
    price: 25000,
    features: [
      'Complete Playbook & Methodology',
      'Editable Template Library',
      '90-Day Quick Start Program',
      'Compliance Checklists',
      '12-Month Regulatory Updates',
      'Multi-office usage rights',
      'Commercial white-label deployment'
    ],
    bestFor: ['Family offices', 'Wealth managers', 'Private banks', 'Multi-family offices', 'Advisory platforms'],
    license: 'Commercial white-label with resale/sublicensing permitted'
  },
  accompaniment: {
    name: 'Implementation Accompaniment',
    price: 0,
    features: [
      'Hands-on implementation support',
      'Strategic implementation workshop',
      'Kickoff + Regular review calls',
      'Process optimization consulting',
      'Team training & onboarding',
      'Extended advisory access'
    ],
    bestFor: ['Organizations seeking guided rollout', 'Teams new to digital asset succession'],
    license: 'Optional add-on — pricing on request'
  }
};

const CASE_STUDIES: CaseStudy[] = [
  {
    id: '1',
    title: 'The Family Office with Significant Crypto Assets',
    client: 'Bergmann Family Office (Munich)',
    challenge: '23M EUR in crypto assets with poor documentation and no succession planning after patriarch\'s health scare',
    solution: 'Full Sovereign-Guard implementation with 47 wallet addresses documented, Legacy-Proof Protocol executed',
    results: [
      { metric: 'Assets Documented', value: '€23.4M' },
      { metric: 'Project Duration', value: '4 months' },
      { metric: 'Investment', value: '€85,000' },
      { metric: 'Wallets Secured', value: '47' }
    ],
    keyLessons: [
      'Even wealthy families have gaps in digital succession planning',
      'Technical implementation + legal safeguards = complete protection',
      'Proactive lifetime planning prevents crisis-driven decisions'
    ]
  },
  {
    id: '2',
    title: 'The Deceased Early Adopter',
    client: 'Estate of Thomas W.',
    challenge: '2.8M EUR Bitcoin fortune with scattered documentation, family unaware of full extent',
    solution: 'Forensic analysis and posthumous Inheritance Container creation',
    results: [
      { metric: 'Assets Recovered', value: '€2.38M (85%)' },
      { metric: 'Transfer Time', value: '8 weeks' },
      { metric: 'Project Cost', value: '€45,000' },
      { metric: 'New Wallets Found', value: '3' }
    ],
    keyLessons: [
      'Posthumous intervention is possible but more expensive',
      'Forensic analysis can identify lost assets but not find everything',
      'Lifetime implementation is cheaper and more complete'
    ]
  },
  {
    id: '3',
    title: 'The Company with BTC Treasury Reserves',
    client: 'NordCap AG (Industrial Holding)',
    challenge: '4.2M EUR BTC reserves inaccessible due to CFO incapacity - single point of failure',
    solution: 'Succession-Sentinel for companies with multi-level approval processes',
    results: [
      { metric: 'BTC Reserves', value: '€4.2M' },
      { metric: 'Project Duration', value: '8 weeks' },
      { metric: 'Investment', value: '€38,000' },
      { metric: 'Wallets Recovered', value: '3 of 4' }
    ],
    keyLessons: [
      'Digital assets in companies require same care as traditional assets',
      'Single-person access is significant operational risk',
      'Organizational redundancy is essential'
    ]
  },
  {
    id: '4',
    title: 'The Cross-Border Inheritance Case',
    client: 'Dr. Klaus-Dieter Hofmann Estate',
    challenge: '1.6M EUR crypto portfolio across 3 jurisdictions (Germany, Switzerland, Cayman Islands)',
    solution: 'Modular Heritage-Integrity Framework with jurisdictional adaptation',
    results: [
      { metric: 'Assets Transferred', value: '€1.62M' },
      { metric: 'Project Duration', value: '6 months' },
      { metric: 'Investment', value: '€125,000' },
      { metric: 'Jurisdictions', value: '3' }
    ],
    keyLessons: [
      'Cross-border cases are complex but solvable with right framework',
      'Modular structure enables jurisdictional adaptation',
      'Investment in careful structuring avoids conflict'
    ]
  },
  {
    id: '5',
    title: 'The Boutique Advisory Firm',
    client: 'Meridian Vermoegen AG (Vienna)',
    challenge: 'Strategic gap - clients asking for digital succession support but no internal capability',
    solution: 'White-label implementation under own brand',
    results: [
      { metric: 'Implementation', value: '€75,000' },
      { metric: 'New Clients (6mo)', value: '3' },
      { metric: 'Fee per Client', value: '€15-25K' },
      { metric: 'Break-even', value: '12 months' }
    ],
    keyLessons: [
      'White-label model offers fast track into digital asset market',
      'Investment is manageable, amortization is fast',
      'Strategic advantages beyond direct income'
    ]
  }
];

const COMPLIANCE_CHECKLIST: ComplianceChecklistItem[] = [
  { id: 'c1', category: 'BGH Compliance', item: 'Information obligations to heirs documented', completed: false, required: true },
  { id: 'c2', category: 'BGH Compliance', item: 'Disclosure process established', completed: false, required: true },
  { id: 'c3', category: 'MiCA', item: 'Transparency requirements mapped', completed: false, required: true },
  { id: 'c4', category: 'MiCA', item: 'Documentation standards implemented', completed: false, required: true },
  { id: 'c5', category: 'BaFin', item: 'Traceability mechanisms in place', completed: false, required: true },
  { id: 'c6', category: 'BaFin', item: 'Information obligation tracking active', completed: false, required: true },
  { id: 'c7', category: 'GDPR', item: 'Data protection consent obtained', completed: false, required: true },
  { id: 'c8', category: 'GDPR', item: 'Retention periods defined', completed: false, required: true },
  { id: 'c9', category: 'GDPR', item: 'Data subject rights process established', completed: false, required: true },
  { id: 'c10', category: 'Internal Controls', item: 'Four-eyes principle implemented', completed: false, required: true },
  { id: 'c11', category: 'Internal Controls', item: 'Segregation of duties defined', completed: false, required: true },
  { id: 'c12', category: 'Audit', item: 'Audit trail system configured', completed: false, required: true },
  { id: 'c13', category: 'Audit', item: 'Evidence package templates ready', completed: false, required: false },
  { id: 'c14', category: 'Risk Management', item: 'Risk matrix completed', completed: false, required: false },
  { id: 'c15', category: 'Risk Management', item: 'Mitigation measures documented', completed: false, required: false }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);
};

// ============================================
// INTERACTIVE COMPONENTS
// ============================================

// ROI Calculator Component
const ROICalculator = () => {
  const [state, setState] = useState<ROICalculatorState>({
    investment: 9900,
    clientsPerYear: 10,
    feePerClient: 15000,
    operatingCosts: 30000
  });

  const revenue = state.clientsPerYear * state.feePerClient;
  const netProfit = revenue - state.operatingCosts - state.investment;
  const roi = ((netProfit / state.investment) * 100);
  const breakEvenClients = Math.ceil((state.investment + state.operatingCosts) / state.feePerClient);

  const chartData = [
    { name: 'Year 1', revenue: revenue * 0.5, costs: state.investment + state.operatingCosts * 0.5 },
    { name: 'Year 2', revenue: revenue * 1.2, costs: state.operatingCosts },
    { name: 'Year 3', revenue: revenue * 1.5, costs: state.operatingCosts * 1.1 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="flex justify-between">
              <span>Initial Investment (€)</span>
              <span className="text-blue-600 font-semibold">{formatCurrency(state.investment)}</span>
            </Label>
            <Slider 
              value={[state.investment]} 
              onValueChange={([v]) => setState(s => ({ ...s, investment: v }))}
              min={5000} max={50000} step={1000}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="flex justify-between">
              <span>Clients per Year</span>
              <span className="text-blue-600 font-semibold">{state.clientsPerYear}</span>
            </Label>
            <Slider 
              value={[state.clientsPerYear]} 
              onValueChange={([v]) => setState(s => ({ ...s, clientsPerYear: v }))}
              min={1} max={50} step={1}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="flex justify-between">
              <span>Fee per Client (€)</span>
              <span className="text-blue-600 font-semibold">{formatCurrency(state.feePerClient)}</span>
            </Label>
            <Slider 
              value={[state.feePerClient]} 
              onValueChange={([v]) => setState(s => ({ ...s, feePerClient: v }))}
              min={5000} max={50000} step={1000}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="flex justify-between">
              <span>Annual Operating Costs (€)</span>
              <span className="text-blue-600 font-semibold">{formatCurrency(state.operatingCosts)}</span>
            </Label>
            <Slider 
              value={[state.operatingCosts]} 
              onValueChange={([v]) => setState(s => ({ ...s, operatingCosts: v }))}
              min={10000} max={100000} step={5000}
              className="mt-2"
            />
          </div>
        </div>
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Annual Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(revenue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Net Profit (Y1)</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netProfit)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">ROI</p>
                  <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {roi.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Break-even at</p>
                  <p className="text-2xl font-bold text-blue-600">{breakEvenClients} clients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar dataKey="costs" fill="#ef4444" name="Costs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800">
          <strong>Formula:</strong> Net Profit = (Clients × Fee) - Operating Costs - Investment | 
          ROI = (Net Profit / Investment) × 100 | 
          Break-even = ceil((Investment + Operating Costs) / Fee per Client)
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Risk Assessment Visualizer
const RiskAssessmentVisualizer = () => {
  const [state, setState] = useState<RiskAssessmentState>({
    digitalAssetValue: 1000000,
    documentationLevel: 30,
    successionPlanning: 20,
    regulatoryCompliance: 40
  });

  // Risk calculation formulas
  const documentationRisk = Math.max(0, 100 - state.documentationLevel);
  const successionRisk = Math.max(0, 100 - state.successionPlanning);
  const complianceRisk = Math.max(0, 100 - state.regulatoryCompliance);
  
  const totalRiskScore = (
    documentationRisk * 0.35 + 
    successionRisk * 0.35 + 
    complianceRisk * 0.30
  );

  // 20% = estimated probability of partial loss in an unstructured succession event
  // (based on industry average from DAIO Playbook case studies, Section 7)
  const potentialLossValue = (totalRiskScore / 100) * state.digitalAssetValue * 0.2;
  const litigationRisk = totalRiskScore > 60 ? 'High' : totalRiskScore > 40 ? 'Medium' : 'Low';
  const regulatoryExposure = complianceRisk > 50 ? 'Critical' : complianceRisk > 30 ? 'Elevated' : 'Managed';

  const pieData = [
    { name: 'Documentation Risk', value: documentationRisk, color: '#ef4444' },
    { name: 'Succession Risk', value: successionRisk, color: '#f97316' },
    { name: 'Compliance Risk', value: complianceRisk, color: '#eab308' },
    { name: 'Protected', value: Math.max(0, 100 - totalRiskScore), color: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="flex justify-between">
              <span>Digital Asset Value (€)</span>
              <span className="text-blue-600 font-semibold">{formatCurrency(state.digitalAssetValue)}</span>
            </Label>
            <Slider 
              value={[state.digitalAssetValue]} 
              onValueChange={([v]) => setState(s => ({ ...s, digitalAssetValue: v }))}
              min={100000} max={50000000} step={100000}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="flex justify-between">
              <span>Documentation Level (%)</span>
              <span className="text-blue-600 font-semibold">{state.documentationLevel}%</span>
            </Label>
            <Slider 
              value={[state.documentationLevel]} 
              onValueChange={([v]) => setState(s => ({ ...s, documentationLevel: v }))}
              min={0} max={100} step={5}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="flex justify-between">
              <span>Succession Planning (%)</span>
              <span className="text-blue-600 font-semibold">{state.successionPlanning}%</span>
            </Label>
            <Slider 
              value={[state.successionPlanning]} 
              onValueChange={([v]) => setState(s => ({ ...s, successionPlanning: v }))}
              min={0} max={100} step={5}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="flex justify-between">
              <span>Regulatory Compliance (%)</span>
              <span className="text-blue-600 font-semibold">{state.regulatoryCompliance}%</span>
            </Label>
            <Slider 
              value={[state.regulatoryCompliance]} 
              onValueChange={([v]) => setState(s => ({ ...s, regulatoryCompliance: v }))}
              min={0} max={100} step={5}
              className="mt-2"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <Card className={`border-2 ${totalRiskScore > 60 ? 'border-red-500 bg-red-50' : totalRiskScore > 40 ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Overall Risk Score</p>
                <p className={`text-4xl font-bold ${totalRiskScore > 60 ? 'text-red-600' : totalRiskScore > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {totalRiskScore.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600">Potential Loss Exposure</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(potentialLossValue)}</p>
            <p className="text-xs text-gray-500">Based on 20% loss probability (industry avg. for unstructured succession)</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600">Litigation Risk</p>
            <p className="text-xl font-bold text-orange-600">{litigationRisk}</p>
            <p className="text-xs text-gray-500">Based on documentation gaps</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600">Regulatory Exposure</p>
            <p className="text-xl font-bold text-yellow-600">{regulatoryExposure}</p>
            <p className="text-xs text-gray-500">Based on compliance level</p>
          </CardContent>
        </Card>
      </div>
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800">
          <strong>Risk Formula:</strong> Total Risk = (Doc Risk × 0.35) + (Succession Risk × 0.35) + (Compliance Risk × 0.30) | 
          <strong> Loss Exposure:</strong> (Total Risk / 100) × Asset Value × 0.2
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Compliance Checklist Component
const ComplianceChecklist = () => {
  const [items, setItems] = useState(COMPLIANCE_CHECKLIST);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))];
  const filteredItems = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Compliance Progress</p>
          <p className="text-2xl font-bold text-blue-600">{completedCount} / {items.length} completed</p>
        </div>
        <div className="w-32">
          <Progress value={progress} className="h-3" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={activeCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </Button>
        ))}
      </div>
      <ScrollArea className="h-96 border rounded-lg p-4">
        <div className="space-y-2">
          {filteredItems.map(item => (
            <div 
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                item.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => toggleItem(item.id)}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}>
                {item.completed && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${item.completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                  {item.item}
                </p>
                <p className="text-xs text-gray-500">{item.category} {item.required && <Badge variant="destructive" className="ml-1 text-xs">Required</Badge>}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {progress === 100 && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Congratulations! All compliance requirements are met. Your organization is audit-ready.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Package Comparison Component
const PackageComparison = () => {
  const [selectedPackage, setSelectedPackage] = useState<'standard' | 'accompaniment'>('standard');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(BLUEPRINT_PACKAGES).map(([key, pkg]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all ${selectedPackage === key ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:shadow-lg'}`}
            onClick={() => setSelectedPackage(key as 'standard' | 'accompaniment')}
          >
            <CardHeader className={`${selectedPackage === key ? 'bg-blue-50' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="text-3xl font-bold text-blue-600">
                      {pkg.price > 0 ? formatCurrency(pkg.price) : 'On Request'}
                    </span>
                    {key === 'standard' && <span className="text-sm text-gray-500 ml-2">one-time</span>}
                    {key === 'accompaniment' && <span className="text-sm text-gray-500 ml-2">optional add-on</span>}
                  </CardDescription>
                </div>
                {selectedPackage === key && <CheckCircle className="w-6 h-6 text-blue-600" />}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Best for:</p>
                <div className="flex flex-wrap gap-1">
                  {pkg.bestFor.map((bf, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{bf}</Badge>
                  ))}
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600"><strong>License:</strong> {pkg.license}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">One-Time Investment</p>
              <p className="text-xl font-bold text-blue-600">€25,000</p>
              <p className="text-xs text-gray-500">Full framework license</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expected First-Year Revenue</p>
              <p className="text-xl font-bold text-green-600">€30K - €80K</p>
              <p className="text-xs text-gray-500">Based on 3-5 clients</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Break-even Point</p>
              <p className="text-xl font-bold text-blue-600">3-5 Clients</p>
              <p className="text-xs text-gray-500">Typical implementation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Case Study Card Component
const CaseStudyCard = ({ study }: { study: CaseStudy }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="mb-2">Case Study {study.id}</Badge>
            <CardTitle className="text-lg">{study.title}</CardTitle>
            <CardDescription className="mt-1">{study.client}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {study.results.map((result, idx) => (
            <div key={idx} className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">{result.metric}</p>
              <p className="font-bold text-blue-600">{result.value}</p>
            </div>
          ))}
        </div>
        {expanded && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" /> Challenge
              </h4>
              <p className="text-sm text-gray-600 mt-1">{study.challenge}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" /> Solution
              </h4>
              <p className="text-sm text-gray-600 mt-1">{study.solution}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-green-500" /> Key Lessons
              </h4>
              <ul className="mt-1 space-y-1">
                {study.keyLessons.map((lesson, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                    {lesson}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'problem', label: 'The Problem', icon: AlertTriangle },
    { id: 'solution', label: 'Solution', icon: Shield },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'compliance', label: 'Compliance', icon: FileCheck },
    { id: 'implementation', label: 'Implementation', icon: TrendingUp },
    { id: 'tools', label: 'Tools & Templates', icon: FileText },
    { id: 'casestudies', label: 'Case Studies', icon: Briefcase },
    { id: 'calculators', label: 'Calculators', icon: Calculator },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="sticky top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/logo.png" alt="Back2IQ" className="h-10 w-auto flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight truncate">DAIO Blueprint</h1>
                <p className="text-xs sm:text-sm text-gray-500 leading-tight truncate">Digital Asset Inheritance Playbook</p>
              </div>
            </div>
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(item => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => scrollToSection(item.id)}
                  className="text-xs"
                >
                  <item.icon className="w-3 h-3 mr-1" />
                  {item.label}
                </Button>
              ))}
            </nav>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-1">
              {navItems.map(item => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => scrollToSection(item.id)}
                  className="w-full justify-start"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <section id="overview" className="mb-16">
            <div className="text-center py-12">
              <Badge className="mb-4 text-sm px-4 py-1">Version 1.0 | 2026</Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Digital Asset Inheritance
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Orchestration Playbook
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                The Institutional Implementation Blueprint for Digital Asset Succession
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" onClick={() => scrollToSection('calculators')} className="gap-2">
                  <Calculator className="w-5 h-5" />
                  Try ROI Calculator
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollToSection('problem')} className="gap-2">
                  <BookOpen className="w-5 h-5" />
                  Read the Blueprint
                </Button>
              </div>
            </div>
            
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-red-600">$400B+</p>
                  <p className="text-sm text-gray-600">Bitcoin Permanently Lost</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">$6T</p>
                  <p className="text-sm text-gray-600">Digital Assets by 2045</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-green-600">20%</p>
                  <p className="text-sm text-gray-600">of Bitcoin Lost Forever</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">€9,900</p>
                  <p className="text-sm text-gray-600">Starting Investment</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* The Problem Section */}
          <section id="problem" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h2 className="text-3xl font-bold text-gray-900">2: The Market Problem and Regulatory Foundation</h2>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>2.1 Digital Asset Amnesia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Problem Box: The Invisible Loss
                  </h4>
                  <p className="text-red-700 mt-2 text-sm">
                    A family loses 2 million euros in cryptocurrencies because the deceased father never disclosed his seed phrase. 
                    The wealth exists—but no one can access it. No legal dispute, no lawsuit, no intervention can reconstruct the key. 
                    The money is literally lost.
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  The fundamental problem of digital asset succession lies in a paradoxical characteristic of modern digital assets: 
                  they exist, but they do not "remember" their origin, their entitled parties, or their transfer rights. A physical 
                  gold treasure in a bank vault is embedded in a network of legal recognitions through proof of ownership, wills, 
                  and inheritance systems. A private key for cryptocurrencies, however, is merely a cryptographic key—without any 
                  connection to a legal identity, without automatic transfer mechanisms, and without any memory of who should own it.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  This "digital asset amnesia" has dramatic consequences. If the owner of digital assets dies without having passed 
                  on their access credentials, the assets continue to exist on the blockchain or in cloud systems, but they are 
                  effectively lost. There is no heir to claim them, no customer service to grant access, and no court that can 
                  transfer the assets—the key is missing, and with it, everything is lost.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-800">3-4 Million</p>
                    <p className="text-sm text-gray-600">Bitcoins Permanently Lost</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-800">€100K+</p>
                    <p className="text-sm text-gray-600">Per Bitcoin (Current Price)</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-800">€100B+</p>
                    <p className="text-sm text-gray-600">Total Estimated Loss</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>2.2 Regulatory Reality in Europe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                    <Scale className="w-4 h-4" /> The BGH Ruling III ZR 183/17 and Its Implications
                  </h4>
                  <p className="text-blue-700 mt-2 text-sm">
                    The legal landscape of digital asset succession in Germany was fundamentally shaped by the Federal Court of 
                    Justice (BGH) ruling III ZR 183/17. This ruling, issued in December 2017, clarified that even for digital 
                    assets that do not constitute classic property rights, inheritance-related disclosure obligations exist.
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  The BGH decided that heirs have a right to information about the deceased's digital assets—even if the service 
                  provider does not custody physical assets. The scope of this ruling is often underestimated. Many financial 
                  institutions and service providers believed that a "no-custody" model—merely providing infrastructure without 
                  direct custody of assets—would minimize liability risks. The BGH ruling made it clear that this assumption is 
                  incorrect.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Regulatory Fact: Documentation Obligations
                  </h4>
                  <p className="text-yellow-700 mt-2 text-sm">
                    Under MiCA and expanded BaFin supervisory practice, institutions are obligated to apply the same documentation 
                    standards to digital assets as to traditional assets. This includes identifying beneficial owners, traceability 
                    of transfers, and providing information to entitled third parties—including heirs.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>2.3 Liability Risks for Financial Institutions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Legal developments in recent years have sent a clear message: financial institutions cannot free themselves from 
                  their information obligations through "no-custody" models or technical distancing. Those providing digital 
                  infrastructures, managing access capabilities, or even operating technical interfaces for digital assets assume 
                  obligations that become relevant in the event of inheritance.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Litigation Costs</h4>
                    <p className="text-2xl font-bold text-red-600">€50,000 - €200,000</p>
                    <p className="text-sm text-red-600">Per unstructured inheritance case</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Personal Liability</h4>
                    <p className="text-sm text-orange-700">Managing directors, board members, and compliance officers can be held 
                    personally liable for breaches of duty in the area of digital asset succession.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2.4 The Demographic Pressure Wave</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Demographic development creates temporal pressure that cannot be ignored. The baby boomer generation, born between 
                  1946 and 1964, reaches typical inheritance age between 2025 and 2035. This generation has not only built traditional 
                  wealth but in many cases also accumulated digital assets on a significant scale.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Problem Box: The Window Is Closing
                  </h4>
                  <p className="text-purple-700 mt-2 text-sm">
                    A family office with 50 clients expects 30 to 40 inheritance cases in the next 10 years. Without structured 
                    digital succession planning, this means 30 to 40 potential problem cases with uncertain outcomes. With structured 
                    planning, these cases can be handled professionally and with low risk.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Solution Section */}
          <section id="solution" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-blue-500" />
              <h2 className="text-3xl font-bold text-gray-900">3: The Solution Concept — Sovereign Guard Architecture</h2>
            </div>
            
            <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">The Core Principle</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-800 text-lg leading-relaxed">
                  The core of this playbook is a fundamentally different approach to digital asset succession. While existing 
                  solutions attempt to transfer traditional custody and management mechanisms to digital assets, the methodology 
                  presented here follows a fundamentally different approach. <strong>The Sovereign Guard Architecture is built not 
                  on custody but on orchestration.</strong> It does not manage assets but governance structures. It does not assume 
                  liability for assets but for their orderly transfer.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-green-500" /> 3.1 Custody-Free Design
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    The Sovereign Guard Architecture is based on a paradigmatic principle: <strong>orchestration without custody, 
                    governance without liability.</strong> Traditional systems are based on custody—they custody private keys, 
                    manage access credentials, and assume responsibility for the assets themselves. This carries significant 
                    regulatory and liability implications.
                  </p>
                  <div className="mt-4 bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Regulatory Advantage:</strong> No CASP license required under MiCA because the architecture does not 
                      provide custody services. It offers governance, not custody.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-500" /> 3.2 Inheritance Container
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    The Inheritance Container is the central innovation—an encrypted, self-contained data space that inherently 
                    contains all inheritance-relevant information. It is not external document storage, not a database of access 
                    credentials—it is an integral part of the asset itself, travels with the asset, and exists independently of 
                    any infrastructure.
                  </p>
                  <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Key Promise:</strong> Succession planning does not depend on the existence of a service provider, 
                      a platform, or infrastructure. It is connected to the wealth itself.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-purple-500" /> 3.3 Legacy Proof Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    The Legacy Proof Protocol fundamentally transforms the succession process. Instead of heirs having to prove 
                    their entitlement, the protocol establishes and documents the entitlement during the asset owner's lifetime. 
                    <strong> The burden of proof is reversed.</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-purple-50 p-2 rounded text-center">
                      <p className="text-lg font-bold text-purple-600">50-75%</p>
                      <p className="text-xs text-purple-700">Time Savings</p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded text-center">
                      <p className="text-lg font-bold text-purple-600">60-80%</p>
                      <p className="text-xs text-purple-700">Cost Reduction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-500" /> 3.4 Succession Sentinel System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    The Succession Sentinel System is the automation component. Its primary function is the continuous monitoring 
                    of the asset owner's status to ensure that succession events are detected early and handled correctly. When 
                    the Sentinel System detects a defined event, an automated process is activated.
                  </p>
                  <div className="mt-4 bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Fail-Safety:</strong> Monitoring occurs via multiple, independent data sources with geographic 
                      distribution and multi-stage notification logic.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-red-500" /> 3.5 Transfer Gate Protocol
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  The Transfer Gate Protocol is the control component. Its purpose is to establish standardized approval processes 
                  for every asset transfer and ensure that transfers occur only after complete validation and authorized release. 
                  Every transfer goes through several validation stages: identification of the applicant, verification of entitlement, 
                  checking of conditions, and confirmation of authorization.
                </p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-800">Level 1</p>
                    <p className="text-sm text-gray-600">Automatic Validation</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-800">Level 2</p>
                    <p className="text-sm text-gray-600">Single Approval</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-800">Level 3</p>
                    <p className="text-sm text-gray-600">Dual Approval</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-800">Level 4</p>
                    <p className="text-sm text-gray-600">Committee Approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Architecture Comparison */}
          <section id="architecture" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Layers className="w-8 h-8 text-indigo-500" />
              <h2 className="text-3xl font-bold text-gray-900">Architecture Comparison</h2>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Aspect</th>
                        <th className="text-left py-3 px-4 font-semibold text-red-700">Custody-Based Solution</th>
                        <th className="text-left py-3 px-4 font-semibold text-green-700">Sovereign Guard Architecture</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Key Custody</td>
                        <td className="py-3 px-4 text-red-600">Yes, centralized</td>
                        <td className="py-3 px-4 text-green-600">No, with the owner</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="py-3 px-4 font-medium">Liability Risk</td>
                        <td className="py-3 px-4 text-red-600">High (loss risk)</td>
                        <td className="py-3 px-4 text-green-600">Low (no custody)</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Regulation</td>
                        <td className="py-3 px-4 text-red-600">CASP license required</td>
                        <td className="py-3 px-4 text-green-600">No CASP license</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="py-3 px-4 font-medium">Capital Requirements</td>
                        <td className="py-3 px-4 text-red-600">Significant (MiCA)</td>
                        <td className="py-3 px-4 text-green-600">None</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Attack Vector</td>
                        <td className="py-3 px-4 text-red-600">Central custodian</td>
                        <td className="py-3 px-4 text-green-600">Decentralized</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="py-3 px-4 font-medium">Control</td>
                        <td className="py-3 px-4 text-red-600">With custodian</td>
                        <td className="py-3 px-4 text-green-600">With owner</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Compliance Section */}
          <section id="compliance" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <FileCheck className="w-8 h-8 text-green-500" />
              <h2 className="text-3xl font-bold text-gray-900">4: The Heritage-Integrity Framework</h2>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>4.1 The Three Pillars of Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Document Integrity</h4>
                    <p className="text-sm text-blue-700">
                      Ensures that all created, processed, or archived documents are authentic, complete, and unaltered. 
                      Achieved through cryptographic mechanisms that detect any manipulation.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Process Integrity</h4>
                    <p className="text-sm text-green-700">
                      Ensures that all defined processes are correctly executed, decisions are traceable, and unauthorized 
                      interference in workflows is impossible.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Data Integrity</h4>
                    <p className="text-sm text-purple-700">
                      Ensures that all data is accurately captured, processed, and stored, redundancies are consistent, 
                      and data loss is excluded.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interactive Compliance Checklist</CardTitle>
                <CardDescription>Track your organization's compliance readiness</CardDescription>
              </CardHeader>
              <CardContent>
                <ComplianceChecklist />
              </CardContent>
            </Card>
          </section>

          {/* Implementation Section */}
          <section id="implementation" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <h2 className="text-3xl font-bold text-gray-900">5: Implementation Guide and Scaling Strategy</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-gray-700">0</span>
                    </div>
                    <h4 className="font-semibold text-gray-800">Preparation</h4>
                    <p className="text-sm text-gray-600 mt-2">3-7 days</p>
                    <p className="text-xs text-gray-500">Internal analysis, stakeholder identification, resource planning</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-blue-700">1</span>
                    </div>
                    <h4 className="font-semibold text-blue-800">Implementation</h4>
                    <p className="text-sm text-blue-600 mt-2">8-12 weeks</p>
                    <p className="text-xs text-blue-600">Deploy with real cases, validate process, identify adjustments</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-purple-700">2</span>
                    </div>
                    <h4 className="font-semibold text-purple-800">Scaling</h4>
                    <p className="text-sm text-purple-600 mt-2">16-24 weeks</p>
                    <p className="text-xs text-purple-600">Expand to larger client base, team expansion, process optimization</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-green-700">3</span>
                    </div>
                    <h4 className="font-semibold text-green-800">Full Integration</h4>
                    <p className="text-sm text-green-600 mt-2">Ongoing</p>
                    <p className="text-xs text-green-600">Standard process, continuous improvement, formal anchoring</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>5.2 Resource Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold">Cost Type</th>
                        <th className="text-left py-3 px-4 font-semibold">One-Time (EUR)</th>
                        <th className="text-left py-3 px-4 font-semibold">Ongoing (EUR/Year)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4">Playbook Acquisition</td>
                        <td className="py-3 px-4 font-semibold">€9,900 - €25,000</td>
                        <td className="py-3 px-4">—</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="py-3 px-4">Implementation</td>
                        <td className="py-3 px-4">€20,000 - €50,000</td>
                        <td className="py-3 px-4">—</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4">Training/Qualification</td>
                        <td className="py-3 px-4">€5,000 - €15,000</td>
                        <td className="py-3 px-4">€2,000 - €5,000</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="py-3 px-4">Technical Infrastructure</td>
                        <td className="py-3 px-4">€2,000 - €5,000</td>
                        <td className="py-3 px-4">€3,000 - €8,000</td>
                      </tr>
                      <tr className="bg-gray-100 font-semibold">
                        <td className="py-3 px-4">Total</td>
                        <td className="py-3 px-4">€37,000 - €95,000</td>
                        <td className="py-3 px-4">€5,000 - €13,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5.3 ROI Calculation — Business Case</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Time Savings</p>
                    <p className="text-2xl font-bold text-green-600">50-65%</p>
                    <p className="text-xs text-gray-500">Per case processing time</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Cost Savings</p>
                    <p className="text-2xl font-bold text-blue-600">€1,500-5,000</p>
                    <p className="text-xs text-gray-500">Per case (hourly rate €150-250)</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Break-even</p>
                    <p className="text-2xl font-bold text-purple-600">1-2 Years</p>
                    <p className="text-xs text-gray-500">With regular succession cases</p>
                  </div>
                </div>
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Info className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Risk Reduction:</strong> Liability cases can cost €50,000-200,000 per case. 
                    The framework reduces this risk by 70-90%.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </section>

          {/* Tools Section */}
          <section id="tools" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-orange-500" />
              <h2 className="text-3xl font-bold text-gray-900">6: Tools and Templates</h2>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold">Phase</th>
                        <th className="text-left py-3 px-4 font-semibold">Template</th>
                        <th className="text-left py-3 px-4 font-semibold">Usage</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Client Acquisition</td>
                        <td className="py-3 px-4">Initial Consultation Questionnaire</td>
                        <td className="py-3 px-4 text-gray-600">Recording client's initial situation</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="py-3 px-4 font-medium">Client Acquisition</td>
                        <td className="py-3 px-4">Client Onboarding Checklist</td>
                        <td className="py-3 px-4 text-gray-600">Structuring onboarding process</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Asset Discovery</td>
                        <td className="py-3 px-4">Digital Asset Inventory</td>
                        <td className="py-3 px-4 text-gray-600">Systematic recording of all digital assets</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="py-3 px-4 font-medium">Asset Discovery</td>
                        <td className="py-3 px-4">Wallet Categorization</td>
                        <td className="py-3 px-4 text-gray-600">Risk assessment of storage forms</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Container Creation</td>
                        <td className="py-3 px-4">Container Master Structure</td>
                        <td className="py-3 px-4 text-gray-600">Definition of technical container architecture</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="py-3 px-4 font-medium">Container Creation</td>
                        <td className="py-3 px-4">Digital Will</td>
                        <td className="py-3 px-4 text-gray-600">Storage of testamentary provisions</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Legacy Proof</td>
                        <td className="py-3 px-4">Proof Creation Checklist</td>
                        <td className="py-3 px-4 text-gray-600">Execution of technical validation process</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="py-3 px-4 font-medium">Transfer Gate</td>
                        <td className="py-3 px-4">Approval Matrix</td>
                        <td className="py-3 px-4 text-gray-600">Definition of control instances (Multi-Sig)</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Sentinel</td>
                        <td className="py-3 px-4">Sentinel Configuration</td>
                        <td className="py-3 px-4 text-gray-600">Setup of monitoring parameters (Oracle)</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="py-3 px-4 font-medium">Compliance</td>
                        <td className="py-3 px-4">Audit Trail</td>
                        <td className="py-3 px-4 text-gray-600">Ensuring complete traceability</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  <strong>20+ ready-to-use templates</strong> included in the Professional Toolkit. 
                  All templates may be modified, reused, and branded internally under the white-label license.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Case Studies Section */}
          <section id="casestudies" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-8 h-8 text-teal-500" />
              <h2 className="text-3xl font-bold text-gray-900">7: Case Studies and Practical Examples</h2>
            </div>
            
            <div className="space-y-4">
              {CASE_STUDIES.map(study => (
                <CaseStudyCard key={study.id} study={study} />
              ))}
            </div>
          </section>

          {/* Calculators Section */}
          <section id="calculators" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-8 h-8 text-pink-500" />
              <h2 className="text-3xl font-bold text-gray-900">Interactive Calculators</h2>
            </div>
            
            <Tabs defaultValue="roi" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="roi">ROI Calculator</TabsTrigger>
                <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
                <TabsTrigger value="container">Container Builder</TabsTrigger>
              </TabsList>
              <TabsContent value="roi">
                <Card>
                  <CardHeader>
                    <CardTitle>ROI Calculator — Business Case Analysis</CardTitle>
                    <CardDescription>Calculate your return on investment with real-time formulas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ROICalculator />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="risk">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment Visualizer</CardTitle>
                    <CardDescription>Assess your digital asset risk exposure with mathematical models</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RiskAssessmentVisualizer />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="container">
                <Card>
                  <CardHeader>
                    <CardTitle>Inheritance Container Builder</CardTitle>
                    <CardDescription>Configure your inheritance container structure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label>Asset Owner Name</Label>
                            <Input placeholder="Enter full name" />
                          </div>
                          <div>
                            <Label>Estimated Total Value (€)</Label>
                            <Input type="number" placeholder="1000000" />
                          </div>
                          <div>
                            <Label>Number of Heirs</Label>
                            <Input type="number" placeholder="2" />
                          </div>
                          <div>
                            <Label>Primary Trigger Event</Label>
                            <select className="w-full p-2 border rounded-md">
                              <option>Death of Asset Owner</option>
                              <option>Incapacity</option>
                              <option>Specific Age</option>
                              <option>Custom Condition</option>
                            </select>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-4">Container Preview</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Container ID:</span>
                              <span className="font-mono">2026-XXXX</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <Badge>DRAFT</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Encryption:</span>
                              <span className="text-green-600">AES-256</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Hash Algorithm:</span>
                              <span className="font-mono">SHA-256</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between">
                              <span className="text-gray-600">Validation Required:</span>
                              <span className="text-orange-600">Legacy Proof Protocol</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Monitoring:</span>
                              <span className="text-blue-600">Succession Sentinel</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Alert className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          This is a preview tool. Full container creation requires the Professional Toolkit with 
                          complete documentation and validation workflows.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-8 h-8 text-green-500" />
              <h2 className="text-3xl font-bold text-gray-900">DAIO Blueprint Package Overview</h2>
            </div>
            
            <PackageComparison />

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>All Packages Include</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Sovereign Guard Architecture Governance Framework</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Regulatory Update Integration (major changes included)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Operational Template Rights (modify, reuse, brand internally)</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Institutional Usage Rights (internal teams and client portfolios)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">No proprietary platform installation required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">No custody infrastructure required — No vendor lock-in</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Ready to Implement?</h3>
                  <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                    Organizations typically begin internal rollout preparation within 48 hours of acquisition 
                    using the provided Quick Start Guide and templates.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button size="lg" variant="secondary" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Request Demo
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 gap-2">
                      <FileText className="w-4 h-4" />
                      Download Brochure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Footer */}
          <footer className="border-t pt-8 mt-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <img src="/logo.png" alt="Back2IQ" className="h-12 w-auto mb-4" />
                <p className="text-sm text-gray-600">
                  Back2IQ — Ahead By Design<br />
                  Institutional solutions for digital asset succession.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><button onClick={() => scrollToSection('overview')} className="hover:text-blue-600">Overview</button></li>
                  <li><button onClick={() => scrollToSection('solution')} className="hover:text-blue-600">Solution</button></li>
                  <li><button onClick={() => scrollToSection('calculators')} className="hover:text-blue-600">Calculators</button></li>
                  <li><button onClick={() => scrollToSection('pricing')} className="hover:text-blue-600">Pricing</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><span className="hover:text-blue-600 cursor-pointer">Documentation</span></li>
                  <li><span className="hover:text-blue-600 cursor-pointer">Case Studies</span></li>
                  <li><span className="hover:text-blue-600 cursor-pointer">Compliance Guide</span></li>
                  <li><span className="hover:text-blue-600 cursor-pointer">API Reference</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Contact</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>info@back2iq.com</li>
                  <li>+49 (0) XXX XXX XXX</li>
                  <li>Munich, Germany</li>
                </ul>
              </div>
            </div>
            <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
              <p>Digital Asset Inheritance Playbook — Version 1.0 | © 2026 Back2IQ — All Rights Reserved</p>
              <p className="mt-2">Licensed under the DAIO Blueprint Licensing Agreement</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
