import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWalletStore } from '@/store/walletStore';
import { formatDate } from '@/lib/format';

function getStatusColor(status: string): string {
  switch (status) {
    case 'active': case 'success': case 'confirmed': return 'bg-green-500';
    case 'warning': case 'pending': return 'bg-yellow-500';
    case 'escalation': return 'bg-orange-500';
    case 'critical': case 'failed': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

const AuditTab: React.FC = () => {
  const auditTrail = useWalletStore(s => s.auditTrail);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center"><FileText className="w-5 h-5 mr-2" />Audit Trail</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto" role="log" aria-label="Audit Trail">
            {auditTrail.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No audit entries found.</p>
            ) : (
              auditTrail.map((entry) => (
                <div key={entry.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getStatusColor(entry.type)}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{entry.action}</p>
                      <time className="text-xs text-slate-500" dateTime={new Date(entry.timestamp).toISOString()}>{formatDate(entry.timestamp)}</time>
                    </div>
                    <p className="text-sm text-slate-600">{entry.details}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTab;
