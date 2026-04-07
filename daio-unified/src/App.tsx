import { Suspense, lazy, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ModuleIntro, MODULE_INTROS } from '@/components/ModuleIntro'

const Calculator = lazy(() => import('@/modules/calculator'))
const StrategicPlatform = lazy(() => import('@/modules/strategic-platform'))
const TemplateGenerator = lazy(() => import('@/modules/template-generator'))
const PortfolioDashboard = lazy(() => import('@/modules/portfolio-dashboard'))
const DigitalEstate = lazy(() => import('@/modules/digital-estate'))
const DocumentRewriter = lazy(() => import('@/modules/document-rewriter'))
const VaultProtocol = lazy(() => import('@/modules/vault-protocol'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading module...</p>
      </div>
    </div>
  )
}

function WithIntro({ id, children }: { id: string; children: ReactNode }) {
  const intro = MODULE_INTROS[id]
  return (
    <>
      {intro && <ModuleIntro moduleId={id} {...intro} />}
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/calculator" replace />} />
        <Route path="/calculator" element={<WithIntro id="calculator"><Calculator /></WithIntro>} />
        <Route path="/strategic-platform" element={<WithIntro id="strategic-platform"><StrategicPlatform /></WithIntro>} />
        <Route path="/template-generator" element={<WithIntro id="template-generator"><TemplateGenerator /></WithIntro>} />
        <Route path="/portfolio-dashboard" element={<WithIntro id="portfolio-dashboard"><PortfolioDashboard /></WithIntro>} />
        <Route path="/digital-estate" element={<WithIntro id="digital-estate"><DigitalEstate /></WithIntro>} />
        <Route path="/document-rewriter" element={<WithIntro id="document-rewriter"><DocumentRewriter /></WithIntro>} />
        <Route path="/vault-protocol" element={<WithIntro id="vault-protocol"><VaultProtocol /></WithIntro>} />
      </Route>
    </Routes>
  )
}
