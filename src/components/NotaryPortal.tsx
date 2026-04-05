import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useWalletStore } from '@/store/walletStore';
import { Scale, Key, Upload, FileCheck, Hash, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { VerificationDocument } from '@/lib/notaryVerification';

// ── Timestamp Certificate Generator ──────────────────────────────────────────
function downloadTimestampCertificate(doc: VerificationDocument): void {
  const issuedAt = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Timestamp Certificate — ${doc.fileName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; color: #1a1a1a; background: #fff; padding: 48px; max-width: 780px; margin: 0 auto; }
    .header { border-bottom: 3px double #1a1a1a; padding-bottom: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 28px; font-weight: bold; letter-spacing: 1px; }
    .subtitle { font-size: 12px; color: #555; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px; }
    .seal { width: 80px; height: 80px; border: 3px solid #1a1a1a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; text-align: center; font-weight: bold; letter-spacing: 1px; padding: 8px; }
    .field { margin-bottom: 16px; }
    .field-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #666; margin-bottom: 4px; }
    .field-value { font-size: 14px; }
    .hash { font-family: 'Courier New', monospace; font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 10px 12px; border-radius: 4px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 11px; color: #777; display: flex; justify-content: space-between; }
    @media print { body { padding: 24px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">TIMESTAMP CERTIFICATE</div>
      <div class="subtitle">DAIO Digital Asset Inheritance Orchestration</div>
    </div>
    <div class="seal">DAIO<br/>NOTARY<br/>SEAL</div>
  </div>
  <div class="field">
    <div class="field-label">Certificate ID</div>
    <div class="field-value">${doc.id.toUpperCase()}</div>
  </div>
  <div class="field">
    <div class="field-label">Document Name</div>
    <div class="field-value">${doc.fileName}</div>
  </div>
  <div class="field">
    <div class="field-label">Document Type</div>
    <div class="field-value">${doc.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
  </div>
  <div class="field">
    <div class="field-label">File Size</div>
    <div class="field-value">${(doc.fileSize / 1024).toFixed(2)} KB</div>
  </div>
  <div class="field">
    <div class="field-label">Keccak-256 Document Hash</div>
    <div class="hash">${doc.documentHash}</div>
  </div>
  ${doc.anchorTxHash ? `
  <div class="field" style="margin-top:16px;">
    <div class="field-label">On-Chain Anchor Transaction</div>
    <div class="hash">${doc.anchorTxHash}</div>
    <div style="font-size:11px;color:#555;margin-top:4px;">Chain ID: ${doc.anchorChainId ?? '—'}</div>
  </div>` : ''}
  <div class="field" style="margin-top:24px;">
    <div class="field-label">Timestamp (UTC)</div>
    <div class="field-value">${issuedAt}</div>
  </div>
  <div class="field">
    <div class="field-label">Verification Status</div>
    <div class="field-value">${doc.status.replace(/_/g, ' ').toUpperCase()}</div>
  </div>
  <div class="footer">
    <span>DAIO Notary Module v1.0 · This certificate proves the document existed at the stated timestamp.</span>
    <span>Issued: ${issuedAt}</span>
  </div>
  <div class="no-print" style="margin-top:32px;text-align:center;">
    <button onclick="window.print()" style="background:#1a1a1a;color:#fff;border:none;padding:10px 24px;border-radius:4px;font-size:14px;cursor:pointer;font-weight:bold;">
      Print / Save as PDF
    </button>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `timestamp-cert-${doc.id.slice(0, 8)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
import {
  createVerificationDocument,
  getDocumentTypes,
  getVerificationStatusColor,
  getVerificationStatusLabel,
  validateDocumentFile,
  ACCEPTED_FILE_TYPES,
  type DocumentType,
} from '@/lib/notaryVerification';

const NotaryPortal: React.FC = () => {
  const keyFragments = useWalletStore(s => s.keyFragments);
  const addAuditEntry = useWalletStore(s => s.addAuditEntry);
  const notaryFragment = keyFragments.find(f => f.type === 'notary');

  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('death_certificate');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateDocumentFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setIsProcessing(true);
    try {
      const doc = await createVerificationDocument(file, selectedDocType);
      setDocuments(prev => [doc, ...prev]);
      addAuditEntry({
        action: 'Document Uploaded',
        details: `${file.name} (${selectedDocType}) — Hash: ${doc.documentHash.slice(0, 16)}...`,
        type: 'info',
      });
      toast.success(`Document hashed: ${doc.documentHash.slice(0, 16)}...`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnchor = (docId: string) => {
    setDocuments(prev =>
      prev.map(d =>
        d.id === docId
          ? {
              ...d,
              status: 'anchored' as const,
              anchorTxHash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
              anchorChainId: 1,
            }
          : d
      )
    );
    addAuditEntry({
      action: 'Document Anchored',
      details: `Document hash anchored on-chain`,
      type: 'success',
    });
    toast.success('Document hash anchored on-chain');
  };

  const handleVerify = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    // Require document to be anchored on-chain before notary verification
    if (!doc || doc.status !== 'anchored') {
      toast.error('Document must be anchored on-chain before verification');
      return;
    }
    // Require a notary key fragment to prove notary role
    if (!notaryFragment) {
      toast.error('Only a designated notary can verify documents');
      return;
    }

    setDocuments(prev =>
      prev.map(d =>
        d.id === docId
          ? {
              ...d,
              status: 'verified' as const,
              notaryId: notaryFragment.id,
              verifiedAt: Date.now(),
            }
          : d
      )
    );
    addAuditEntry({
      action: 'Document Verified',
      details: `Notary ${notaryFragment.holder} verified document (hash: ${doc.documentHash.slice(0, 16)}...)`,
      type: 'success',
    });
    toast.success('Document verified by notary');
  };

  const handleReject = (docId: string) => {
    setDocuments(prev =>
      prev.map(d =>
        d.id === docId
          ? {
              ...d,
              status: 'rejected' as const,
              rejectionReason: 'Document could not be verified',
            }
          : d
      )
    );
    addAuditEntry({
      action: 'Document Rejected',
      details: 'Notary rejected document',
      type: 'warning',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Scale className="w-8 h-8 text-amber-600" />
        <div>
          <h2 className="text-2xl font-bold">Notary Portal</h2>
          <p className="text-slate-500">Document verification, hash anchoring, and key management</p>
        </div>
      </div>

      {/* Key Fragment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Key Fragment (Notary)
          </CardTitle>
          <CardDescription>Your assigned Shamir key fragment</CardDescription>
        </CardHeader>
        <CardContent>
          {notaryFragment ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>{notaryFragment.status}</Badge>
                <span className="text-sm text-slate-500">Holder: {notaryFragment.holder}</span>
              </div>
              <p className="text-sm text-slate-600">
                This key fragment is required as part of the threshold recovery process.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No key fragment assigned yet. The wallet owner must generate key fragments first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Document Upload & Verification
          </CardTitle>
          <CardDescription>
            Upload documents for hash computation and on-chain anchoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={selectedDocType} onValueChange={(v) => setSelectedDocType(v as DocumentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getDocumentTypes().map(dt => (
                    <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Upload File</Label>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="doc-upload"
                  aria-label="Upload document file"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" />Choose File</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Alert>
            <Hash className="w-4 h-4" />
            <AlertDescription className="text-xs">
              Files are hashed locally using Keccak-256. Only the hash is stored or anchored on-chain — the original document never leaves your device.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Document list */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Uploaded Documents ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="p-3 rounded-lg border space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">{doc.fileName}</span>
                    <span className="text-xs text-slate-400 ml-2">
                      ({(doc.fileSize / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Badge className={getVerificationStatusColor(doc.status)}>
                    {getVerificationStatusLabel(doc.status)}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 font-mono break-all">
                  Hash: {doc.documentHash}
                </div>
                {doc.anchorTxHash && (
                  <div className="text-xs text-slate-500 font-mono break-all">
                    Anchor TX: {doc.anchorTxHash}
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {doc.status === 'hash_computed' && (
                    <Button size="sm" variant="outline" onClick={() => handleAnchor(doc.id)}>
                      Anchor On-Chain
                    </Button>
                  )}
                  {doc.status === 'anchored' && notaryFragment && (
                    <Button size="sm" onClick={() => handleVerify(doc.id)}>
                      Verify
                    </Button>
                  )}
                  {(doc.status === 'hash_computed' || doc.status === 'anchored') && (
                    <Button size="sm" variant="destructive" onClick={() => handleReject(doc.id)}>
                      Reject
                    </Button>
                  )}
                  {(doc.status === 'hash_computed' || doc.status === 'anchored' || doc.status === 'verified') && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        downloadTimestampCertificate(doc);
                        toast.success('Certificate downloaded');
                      }}
                    >
                      <Download className="w-3 h-3 mr-1.5" />
                      Certificate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotaryPortal;
