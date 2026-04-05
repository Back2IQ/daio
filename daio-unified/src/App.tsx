import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'

const Calculator = lazy(() => import('@/modules/calculator'))
const StrategicPlatform = lazy(() => import('@/modules/strategic-platform'))
const SalesBlueprint = lazy(() => import('@/modules/sales-blueprint'))
const TemplateGenerator = lazy(() => import('@/modules/template-generator'))
const PortfolioDashboard = lazy(() => import('@/modules/portfolio-dashboard'))
const PionierfallPitch = lazy(() => import('@/modules/pionierfall-pitch'))
const BtcTicker = lazy(() => import('@/modules/btc-ticker'))
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

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/calculator" replace />} />
        <Route path="/calculator" element={<Suspense fallback={<LoadingFallback />}><Calculator /></Suspense>} />
        <Route path="/strategic-platform" element={<Suspense fallback={<LoadingFallback />}><StrategicPlatform /></Suspense>} />
        <Route path="/sales-blueprint" element={<Suspense fallback={<LoadingFallback />}><SalesBlueprint /></Suspense>} />
        <Route path="/template-generator" element={<Suspense fallback={<LoadingFallback />}><TemplateGenerator /></Suspense>} />
        <Route path="/portfolio-dashboard" element={<Suspense fallback={<LoadingFallback />}><PortfolioDashboard /></Suspense>} />
        <Route path="/pionierfall-pitch" element={<Suspense fallback={<LoadingFallback />}><PionierfallPitch /></Suspense>} />
        <Route path="/btc-ticker" element={<Suspense fallback={<LoadingFallback />}><BtcTicker /></Suspense>} />
        <Route path="/document-rewriter" element={<Suspense fallback={<LoadingFallback />}><DocumentRewriter /></Suspense>} />
        <Route path="/vault-protocol" element={<Suspense fallback={<LoadingFallback />}><VaultProtocol /></Suspense>} />
      </Route>
    </Routes>
  )
}
