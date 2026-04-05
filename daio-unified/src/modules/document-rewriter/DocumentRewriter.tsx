import { useState } from "react";
import { AppHeader } from "./components/layout/AppHeader";
import { UploadScreen } from "./components/upload/UploadScreen";
import { ThreePanelLayout } from "./components/layout/ThreePanelLayout";
import { SettingsDialog } from "./components/settings/SettingsDialog";
import { ExportDialog } from "./components/export/ExportDialog";
import { HarmonizationView } from "./components/export/HarmonizationView";
import { usePipelineStore } from "./store/pipeline-store";

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const phase = usePipelineStore((s) => s.phase);

  return (
    <>
      <div className="flex h-screen flex-col">
        <AppHeader
          onSettingsClick={() => setSettingsOpen(true)}
          onExportClick={() => setExportOpen(true)}
        />

        <main className="flex flex-1 overflow-hidden">
          {phase === "upload" && <UploadScreen />}
          {phase === "rewriting" && <ThreePanelLayout />}
          {phase === "harmonizing" && <HarmonizationView onExport={() => setExportOpen(true)} />}
          {phase === "completed" && <HarmonizationView onExport={() => setExportOpen(true)} />}
        </main>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </>
  );
}
