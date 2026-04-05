import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Scale, FileText, Download, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { toast } from 'sonner';
import {
  generateComplianceReport,
  generateComplianceDocument,
  getJurisdictions,
  getSeverityColor,
  type Jurisdiction,
  type ComplianceReport,
  type ComplianceDocument,
  type ComplianceSeverity,
} from '@/lib/compliance';

const severityIcon = (s: ComplianceSeverity) => {
  switch (s) {
    case 'ok': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'critical': return <XCircle className="w-4 h-4 text-red-600" />;
    case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    case 'info': return <Info className="w-4 h-4 text-blue-600" />;
  }
};

const ComplianceTab: React.FC = () => {
  const beneficiaries = useWalletStore(s => s.beneficiaries);
  const keyFragments = useWalletStore(s => s.keyFragments);
  const dmsConfig = useWalletStore(s => s.dmsConfig);
  const inheritanceContainer = useWalletStore(s => s.inheritanceContainer) as { level: number; assetInventory: string } | null;
  const activeAccount = useWalletStore(s => s.getActiveAccount());
  const addAuditEntry = useWalletStore(s => s.addAuditEntry);

  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('DE');
  const [document, setDocument] = useState<ComplianceDocument | null>(null);

  const report: ComplianceReport = useMemo(() => {
    const guardians = beneficiaries.filter(b => b.role === 'guardian');
    const notary = beneficiaries.find(b => b.role === 'notary');
    const distributed = keyFragments.length > 0 && keyFragments.every(f => f.status === 'distributed');

    return generateComplianceReport(
      {
        hasBeneficiaries: beneficiaries.length > 0,
        beneficiaryCount: beneficiaries.length,
        hasGuardians: guardians.length > 0,
        guardianCount: guardians.length,
        hasNotary: !!notary,
        dmsEnabled: dmsConfig.enabled,
        hasInheritanceContainer: !!inheritanceContainer,
        inheritanceContainerLevel: inheritanceContainer?.level ?? 0,
        keyFragmentsDistributed: distributed,
        encryptionEnabled: true, // wallet is always encrypted
        daiScore: 0, // not needed for checks
        totalValueUSD: 0,
      },
      jurisdiction
    );
  }, [beneficiaries, keyFragments, dmsConfig, inheritanceContainer, jurisdiction]);

  const handleGenerateDocument = () => {
    if (!activeAccount) return;
    const doc = generateComplianceDocument(report, activeAccount.address);
    setDocument(doc);
    addAuditEntry({
      action: 'Compliance Report Generated',
      details: `Jurisdiction: ${jurisdiction}, Score: ${report.score}/100`,
      type: 'info',
    });
    toast.success('Compliance report generated');
  };

  const handleDownload = () => {
    if (!document) return;
    const blob = new Blob([document.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${jurisdiction}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const passedCount = report.checks.filter(c => c.passed).length;
  const failedCount = report.checks.length - passedCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Scale className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Compliance & Legal Framework</h2>
          <p className="text-slate-500">Automated regulatory checks and report generation</p>
        </div>
      </div>

      {/* Jurisdiction selector + score */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
          <CardDescription>Select your jurisdiction and review automated compliance checks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Jurisdiction</label>
              <Select value={jurisdiction} onValueChange={v => setJurisdiction(v as Jurisdiction)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getJurisdictions().map(j => (
                    <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-50">
              <span className="text-3xl font-bold">{report.score}</span>
              <span className="text-sm text-slate-500">/ 100</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              className={
                report.overallStatus === 'compliant'
                  ? 'bg-green-100 text-green-800'
                  : report.overallStatus === 'action_required'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }
            >
              {report.overallStatus === 'compliant'
                ? 'Compliant'
                : report.overallStatus === 'action_required'
                  ? 'Action Required'
                  : 'Non-Compliant'}
            </Badge>
            <span className="text-sm text-slate-500">
              {passedCount} passed, {failedCount} require attention
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Check results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Compliance Checks ({report.checks.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.checks.map(check => (
            <div
              key={check.id}
              className={`p-3 rounded-lg border ${getSeverityColor(check.severity)}`}
            >
              <div className="flex items-start gap-2">
                {severityIcon(check.severity)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{check.title}</span>
                    <Badge variant="outline" className="text-[10px]">{check.category.toUpperCase()}</Badge>
                  </div>
                  <p className="text-xs mt-1 opacity-80">{check.description}</p>
                  {check.actionRequired && (
                    <Alert className="mt-2 py-2">
                      <AlertDescription className="text-xs font-medium">
                        Action: {check.actionRequired}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Report generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Export a compliance report for your records or legal advisor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerateDocument}>
            <FileText className="w-4 h-4 mr-2" />Generate Compliance Report
          </Button>

          {document && (
            <div className="space-y-3">
              <pre className="p-4 bg-slate-50 rounded-lg text-xs font-mono whitespace-pre-wrap max-h-64 overflow-auto border">
                {document.content}
              </pre>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />Download Report
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceTab;
