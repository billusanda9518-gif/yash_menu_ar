"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, Copy, Check, ImageIcon } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface QRGeneratorProps {
  url: string;
  label: string;
  sublabel?: string;
  fgColor?: string;
  bgColor?: string;
  size?: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function QRGenerator({
  url,
  label,
  sublabel,
  fgColor = "#1a1a1a",
  bgColor = "#ffffff",
  size = 256,
}: QRGeneratorProps) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  /* Generate QR code data URL whenever props change */
  useEffect(() => {
    let cancelled = false;

    async function generate() {
      try {
        const png = await QRCode.toDataURL(url, {
          width: size,
          margin: 2,
          color: { dark: fgColor, light: bgColor },
          errorCorrectionLevel: "M",
        });
        if (!cancelled) setDataUrl(png);
      } catch {
        if (!cancelled) showToast.error("Failed to generate QR code");
      }
    }

    generate();
    return () => {
      cancelled = true;
    };
  }, [url, fgColor, bgColor, size]);

  /* Download as PNG */
  const downloadPNG = useCallback(() => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${label.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast.success("PNG downloaded");
  }, [dataUrl, label]);

  /* Download as SVG */
  const downloadSVG = useCallback(async () => {
    try {
      const svg = await QRCode.toString(url, {
        type: "svg",
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: "M",
      });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${label.replace(/\s+/g, "-").toLowerCase()}-qr.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showToast.success("SVG downloaded");
    } catch {
      showToast.error("Failed to generate SVG");
    }
  }, [url, fgColor, bgColor, size, label]);

  /* Copy URL */
  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast.error("Failed to copy link");
    }
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      {/* Label */}
      <div className="text-center">
        <p className="text-sm font-semibold text-white">{label}</p>
        {sublabel && (
          <p className="mt-0.5 text-xs text-zinc-400">{sublabel}</p>
        )}
      </div>

      {/* QR Preview */}
      <div className="flex items-center justify-center rounded-lg bg-white p-3">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR code for ${label}`}
            width={size}
            height={size}
            className="block"
          />
        ) : (
          <div
            className="flex items-center justify-center bg-zinc-100"
            style={{ width: size, height: size }}
          >
            <ImageIcon className="h-8 w-8 text-zinc-400" />
          </div>
        )}
      </div>

      {/* URL preview */}
      <p className="max-w-full truncate text-xs text-zinc-500">{url}</p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={downloadPNG}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          PNG
        </Button>
        <Button variant="outline" size="sm" onClick={downloadSVG}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          SVG
        </Button>
        <Button variant="ghost" size="sm" onClick={copyUrl}>
          {copied ? (
            <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="mr-1.5 h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy Link"}
        </Button>
      </div>
    </div>
  );
}
