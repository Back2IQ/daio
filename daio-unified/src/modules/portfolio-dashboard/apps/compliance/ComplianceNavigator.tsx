// App 3: No-Custody Compliance & Liability Navigator
// Shows why No-Custody makes the difference legally and operationally

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Building2,
  User,
  Scale,
  Briefcase,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  Info,
} from "lucide-react";
import type { UserType } from "../../types";
import { USER_TYPE_LABELS } from "../../types";

interface RiskArea {
  id: string;
  name: string;
  description: string;
  withoutDaio: string[];
  withDaio: string[];
}

const USER_TYPES: { id: UserType; icon: React.ReactNode; description: string }[] = [
  {
    id: "family-office",
    icon: <Building2 className="w-5 h-5" />,
    description: "Managing family wealth and digital assets",
  },
  {
    id: "bank",
    icon: <Briefcase className="w-5 h-5" />,
    description: "Financial institution offering custody services",
  },
  {
    id: "lawyer",
    icon: <Scale className="w-5 h-5" />,
    description: "Legal professional advising clients",
  },
  {
    id: "advisor",
    icon: <Users className="w-5 h-5" />,
    description: "Financial or wealth advisor",
  },
  {
    id: "individual",
    icon: <User className="w-5 h-5" />,
    description: "Individual investor with digital assets",
  },
];

const RISK_AREAS: RiskArea[] = [
  {
    id: "operational",
    name: "Operational Risk",
    description: "Risks related to day-to-day operations and processes",
    withoutDaio: [
      "No documented procedures for asset recovery",
      "Key person dependency without backup",
      "Unclear responsibilities and handoffs",
      "No audit trail for decisions",
    ],
    withDaio: [
      "Documented governance procedures",
      "Defined backup roles and succession",
      "Clear role assignments and workflows",
      "Immutable audit trail with hashes",
    ],
  },
  {
    id: "reputational",
    name: "Reputational Risk",
    description: "Risks to brand and professional reputation",
    withoutDaio: [
      "Assets lost due to poor planning",
      "Family disputes become public",
      "Client dissatisfaction with service",
      "Negative media coverage",
    ],
    withDaio: [
      "Professional documentation standards",
      "Clear dispute resolution paths",
      "Client confidence in process",
      "Transparent and auditable actions",
    ],
  },
  {
    id: "compliance",
    name: "Compliance Risk",
    description: "Risks related to regulatory requirements",
    withoutDaio: [
      "Inadequate documentation for regulators",
      "Missing KYC/AML trail",
      "Unclear beneficial ownership",
      "Tax reporting challenges",
    ],
    withDaio: [
      "Audit-ready documentation",
      "Clear ownership and control chains",
      "Structured reporting framework",
      "Regulatory compliance support",
    ],
  },
];

const POSITIONING = {
  whatWeDontDo: [
    {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      title: "Never Hold Private Keys",
      description: "DAIO never stores, manages, or has access to private keys or seed phrases",
    },
    {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      title: "Never Custody Assets",
      description: "We don't hold, transfer, or control any digital assets",
    },
    {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      title: "Never Execute Transactions",
      description: "DAIO doesn't sign or broadcast blockchain transactions",
    },
    {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      title: "Never Store Passwords",
      description: "No credentials, passwords, or access tokens in our system",
    },
  ],
  whatWeDo: [
    {
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      title: "Governance Documentation",
      description: "Structured templates for asset inventory, roles, and policies",
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      title: "Process Orchestration",
      description: "Clear workflows for triggers, verification, and execution",
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      title: "Audit Trail",
      description: "Cryptographic proof of documentation integrity",
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      title: "Compliance Support",
      description: "Documentation framework for regulatory requirements",
    },
  ],
};

export function ComplianceNavigator() {
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [showPositioning, setShowPositioning] = useState(false);

  const calculateRiskScore = (userType: UserType) => {
    // Simplified risk calculation based on user type
    const baseScores: Record<UserType, { operational: number; reputational: number; compliance: number }> = {
      "family-office": { operational: 75, reputational: 80, compliance: 70 },
      bank: { operational: 60, reputational: 85, compliance: 90 },
      lawyer: { operational: 70, reputational: 75, compliance: 80 },
      advisor: { operational: 65, reputational: 70, compliance: 60 },
      individual: { operational: 85, reputational: 60, compliance: 75 },
    };
    return baseScores[userType];
  };

  return (
    <div className="p-6">
      {!selectedUserType ? (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Select Your Profile</h2>
            <p className="text-slate-500">
              Choose your role to see how DAIO addresses your specific compliance and liability concerns
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {USER_TYPES.map((ut) => (
              <button
                key={ut.id}
                onClick={() => setSelectedUserType(ut.id)}
                className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-lg transition-all text-left"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  {ut.icon}
                </div>
                <h3 className="font-semibold text-lg mb-1">{USER_TYPE_LABELS[ut.id]}</h3>
                <p className="text-sm text-slate-500">{ut.description}</p>
                <div className="flex items-center gap-1 text-blue-600 text-sm mt-4">
                  View Analysis
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setSelectedUserType(null)}>
                ← Back
              </Button>
              <div>
                <h2 className="text-xl font-bold">{USER_TYPE_LABELS[selectedUserType]}</h2>
                <p className="text-sm text-slate-500">Risk Assessment & DAIO Positioning</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowPositioning(!showPositioning)}>
              <Shield className="w-4 h-4 mr-2" />
              {showPositioning ? "Hide" : "Show"} DAIO Positioning
            </Button>
          </div>

          {/* Risk Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {RISK_AREAS.map((area) => {
                  const scores = calculateRiskScore(selectedUserType);
                  const score = scores[area.id as keyof typeof scores];
                  return (
                    <div key={area.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{area.name}</span>
                        <Badge
                          className={
                            score >= 80
                              ? "bg-red-500"
                              : score >= 60
                              ? "bg-amber-500"
                              : "bg-green-500"
                          }
                        >
                          {score}% Risk
                        </Badge>
                      </div>
                      <Progress value={score} className="h-2" />
                      <p className="text-sm text-slate-500">{area.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* DAIO Positioning */}
          {showPositioning && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <Shield className="w-5 h-5" />
                  DAIO Positioning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                      <EyeOff className="w-4 h-4" />
                      What We DON'T Do
                    </h4>
                    <div className="space-y-3">
                      {POSITIONING.whatWeDontDo.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg"
                        >
                          {item.icon}
                          <div>
                            <div className="font-medium text-sm">{item.title}</div>
                            <div className="text-xs text-slate-500">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      What We DO
                    </h4>
                    <div className="space-y-3">
                      {POSITIONING.whatWeDo.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg"
                        >
                          {item.icon}
                          <div>
                            <div className="font-medium text-sm">{item.title}</div>
                            <div className="text-xs text-slate-500">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Mitigation Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {RISK_AREAS.map((area) => (
                  <AccordionItem key={area.id} value={area.id}>
                    <AccordionTrigger>{area.name}</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-2 gap-4 pt-2">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <h4 className="font-medium text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Without DAIO
                          </h4>
                          <ul className="space-y-2">
                            {area.withoutDaio.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-medium text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            With DAIO
                          </h4>
                          <ul className="space-y-2">
                            {area.withDaio.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Proof Pack */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Audit-Ready Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="w-5 h-5" />
                <AlertDescription>
                  DAIO generates documentation that supports audit and compliance requirements
                  without exposing sensitive credentials.
                </AlertDescription>
              </Alert>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {[
                  { title: "Asset Inventory", desc: "Non-sensitive hints and custody info" },
                  { title: "Role Definitions", desc: "Clear responsibilities and contacts" },
                  { title: "Policy Framework", desc: "Quorum, time delays, and procedures" },
                  { title: "Audit Trail", desc: "Cryptographic integrity proofs" },
                ].map((doc, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">{doc.title}</span>
                    </div>
                    <p className="text-xs text-slate-500">{doc.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
