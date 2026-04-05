// DAIO Vault Protocol — Secure Display Utilities
// Canvas-based anti-copy rendering with auto-destruct

import type { DisplayConfig } from "../types";

// ─── Canvas Rendering ────────────────────────────────────────────

export function renderSecretOnCanvas(
  canvas: HTMLCanvasElement,
  secret: string,
  config: DisplayConfig
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Background with subtle noise pattern
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, width, height);
  drawNoisePattern(ctx, width, height);

  // Watermark (diagonal, semi-transparent)
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.font = "14px monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.textAlign = "center";
  const watermark = `${config.watermarkText} | ${config.sessionId} | ${new Date().toISOString().slice(0, 19)}`;
  for (let y = -height; y < height; y += 40) {
    ctx.fillText(watermark, 0, y);
  }
  ctx.restore();

  // Border
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Header
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = "#22c55e";
  ctx.textAlign = "left";
  ctx.fillText("DAIO VAULT PROTOCOL — SECURE DISPLAY", 28, 42);

  ctx.font = "10px monospace";
  ctx.fillStyle = "#6b7280";
  ctx.fillText(`Session: ${config.sessionId}`, 28, 58);

  // Separator
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(28, 68);
  ctx.lineTo(width - 28, 68);
  ctx.stroke();

  // Secret content
  if (config.mode === "split-screen") {
    renderSplitScreen(ctx, secret, width, height);
  } else {
    renderFullSecret(ctx, secret, width, height);
  }

  // Footer
  ctx.font = "10px monospace";
  ctx.fillStyle = "#ef4444";
  ctx.textAlign = "center";
  ctx.fillText(
    "DO NOT PHOTOGRAPH OR RECORD — AUTO-DESTRUCT ACTIVE",
    width / 2,
    height - 24
  );
}

function renderFullSecret(
  ctx: CanvasRenderingContext2D,
  secret: string,
  width: number,
  height: number
): void {
  ctx.font = "16px monospace";
  ctx.fillStyle = "#f0fdf4";
  ctx.textAlign = "center";

  // Word-wrap the secret
  const maxCharsPerLine = Math.floor((width - 80) / 10);
  const lines: string[] = [];
  for (let i = 0; i < secret.length; i += maxCharsPerLine) {
    lines.push(secret.slice(i, i + maxCharsPerLine));
  }

  const startY = Math.max(90, (height - lines.length * 28) / 2);
  lines.forEach((line, idx) => {
    ctx.fillText(line, width / 2, startY + idx * 28);
  });
}

function renderSplitScreen(
  ctx: CanvasRenderingContext2D,
  secret: string,
  width: number,
  _height: number
): void {
  // Split secret into 3 parts, show one at a time based on current tick
  const partLen = Math.ceil(secret.length / 3);
  const parts = [
    secret.slice(0, partLen),
    secret.slice(partLen, partLen * 2),
    secret.slice(partLen * 2),
  ];

  const currentPart = Math.floor(Date.now() / 10000) % 3;

  ctx.font = "14px monospace";
  ctx.fillStyle = "#fbbf24";
  ctx.textAlign = "center";
  ctx.fillText(
    `Teil ${currentPart + 1} von 3 — Wechselt alle 10 Sekunden`,
    width / 2,
    90
  );

  ctx.font = "18px monospace";
  ctx.fillStyle = "#f0fdf4";
  ctx.fillText(parts[currentPart], width / 2, 130);

  // Show which parts are hidden
  ctx.font = "12px monospace";
  ctx.fillStyle = "#4b5563";
  for (let i = 0; i < 3; i++) {
    const label = i === currentPart ? `[Teil ${i + 1}: SICHTBAR]` : `[Teil ${i + 1}: ████████]`;
    ctx.fillText(label, width / 2, 170 + i * 20);
  }
}

function drawNoisePattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 8;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);
}

// ─── Countdown Overlay ───────────────────────────────────────────

export function renderCountdown(
  canvas: HTMLCanvasElement,
  secondsLeft: number,
  totalSeconds: number
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.clientWidth;
  const dpr = window.devicePixelRatio || 1;

  // Progress bar at bottom
  const barHeight = 4;
  const barY = canvas.clientHeight - 14;
  const progress = secondsLeft / totalSeconds;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Background bar
  ctx.fillStyle = "#374151";
  ctx.fillRect(28, barY, width - 56, barHeight);

  // Progress bar
  const color = progress > 0.3 ? "#22c55e" : progress > 0.1 ? "#f59e0b" : "#ef4444";
  ctx.fillStyle = color;
  ctx.fillRect(28, barY, (width - 56) * progress, barHeight);

  // Timer text
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = color;
  ctx.textAlign = "right";
  ctx.fillText(`${secondsLeft}s`, width - 28, barY - 4);

  ctx.restore();
}

// ─── Auto-Destruct ───────────────────────────────────────────────

export function destroyCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Black out
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  // Destroyed message
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = "#ef4444";
  ctx.textAlign = "center";
  ctx.fillText("SECRET DESTROYED", width / 2, height / 2 - 10);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("Auto-Destruct abgeschlossen", width / 2, height / 2 + 14);

  ctx.restore();
}

// ─── Clipboard & Print Blocking ──────────────────────────────────

export function blockClipboard(): () => void {
  const handler = (e: ClipboardEvent) => {
    e.preventDefault();
    if (e.clipboardData) {
      e.clipboardData.setData(
        "text/plain",
        "[DAIO Vault Protocol: Copy blocked]"
      );
    }
  };

  const keyHandler = (e: KeyboardEvent) => {
    // Block Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+P, PrintScreen
    if (
      (e.ctrlKey && ["c", "v", "a", "p"].includes(e.key.toLowerCase())) ||
      e.key === "PrintScreen"
    ) {
      e.preventDefault();
    }
  };

  document.addEventListener("copy", handler);
  document.addEventListener("cut", handler);
  document.addEventListener("keydown", keyHandler);

  return () => {
    document.removeEventListener("copy", handler);
    document.removeEventListener("cut", handler);
    document.removeEventListener("keydown", keyHandler);
  };
}

export function addPrintBlockStyles(): () => void {
  const style = document.createElement("style");
  style.id = "daio-vault-print-block";
  style.textContent = `
    @media print {
      body * { visibility: hidden !important; }
      body::after {
        visibility: visible !important;
        content: "DAIO Vault Protocol: Print blocked for security";
        display: block;
        text-align: center;
        padding: 2rem;
        font-size: 24px;
        color: red;
      }
    }
  `;
  document.head.appendChild(style);

  return () => {
    const el = document.getElementById("daio-vault-print-block");
    if (el) el.remove();
  };
}
