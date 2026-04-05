# DAIO Wallet - One Click Start

## Verwendung

Sie haben drei Möglichkeiten, die DAIO Wallet App zu starten:

### 1. Windows Batch Script (Empfohlen für Windows)
Doppelklicken Sie einfach auf `start.bat` oder führen Sie es in der Kommandozeile aus:
```cmd
start.bat
```

### 2. PowerShell Script
Führen Sie in PowerShell aus:
```powershell
.\start.ps1
```

### 3. Node.js Script (Cross-Platform)
Führen Sie mit Node.js aus:
```bash
node start.js
```

## Was passiert beim Start?

1. **Systemprüfung**: Überprüft ob Node.js installiert ist
2. **Abhängigkeiten**: Installiert automatisch alle benötigten npm-Pakete (nur beim ersten Start)
3. **Server-Start**: Startet den Entwicklungsserver auf `http://localhost:2111`

## Voraussetzungen

- **Node.js** (Version 16 oder höher) - [Download von nodejs.org](https://nodejs.org/)

## Funktionen

- ✅ Automatische Abhängigkeitsinstallation
- ✅ Port-Konfiguration auf 2111
- ✅ Farbige Konsolenausgabe
- ✅ Fehlerbehandlung
- ✅ Automatische Updates der Abhängigkeiten
- ✅ Cross-Platform Unterstützung

## Problemlösung

### Fehler: "Node.js is not installed"
- Installieren Sie Node.js von [https://nodejs.org/](https://nodejs.org/)

### Fehler: "Dependencies failed to install"
- Überprüfen Sie Ihre Internetverbindung
- Löschen Sie den `node_modules` Ordner und starten Sie das Script erneut

### Fehler: "Port 2111 is already in use"
- Schließen Sie andere Anwendungen, die Port 2111 verwenden
- Oder ändern Sie den Port in den Start-Scripten

## Ordnerstruktur

```
DAIO Wallet/
├── start.bat          # Windows Batch Script
├── start.ps1          # PowerShell Script
├── start.js           # Node.js Script
├── app/               # Hauptanwendungsordner
│   ├── package.json
│   ├── node_modules/
│   └── src/
└── README.md
```

## Tastenkürzel

- **CTRL+C**: Server stoppen
- **F5**: Seite neu laden (im Browser)

Die App ist nach dem Start unter [http://localhost:2111](http://localhost:2111) erreichbar.