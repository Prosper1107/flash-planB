"use client";

import { useState } from "react";
import { Zap, Copy, Check, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { copyToClipboard } from "@/lib/utils";
import toast from "react-hot-toast";

interface LightningAddressCardProps {
  address: string;
  compact?: boolean;
}

export function LightningAddressCard({ address, compact = false }: LightningAddressCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(address);
    if (ok) {
      setCopied(true);
      toast.success("Lightning Address copiée !");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
        <Zap className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium truncate">{address}</span>
        <button onClick={handleCopy} className="flex-shrink-0">
          {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4 opacity-70 hover:opacity-100" />}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs text-flash-gray-text font-medium">Votre Lightning Address</p>
          <p className="text-sm font-bold text-flash-dark">{address}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            copied
              ? "bg-green-50 text-flash-success"
              : "bg-flash-blue-50 text-flash-blue hover:bg-flash-blue-100"
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copié !" : "Copier"}
        </button>
        <button
          onClick={() => setShowQr(!showQr)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-flash-gray text-flash-dark hover:bg-flash-gray-border transition-all"
        >
          <QrCode className="w-4 h-4" />
          QR
        </button>
      </div>

      {showQr && (
        <div className="mt-4 flex flex-col items-center gap-3 animate-fade-in">
          <div className="bg-flash-gray p-4 rounded-2xl">
            <QRCodeSVG
              value={`lightning:${address}`}
              size={160}
              fgColor="#1B4FE8"
              bgColor="transparent"
            />
          </div>
          <p className="text-xs text-flash-gray-text text-center">
            Scannez avec n&apos;importe quel wallet Lightning
          </p>
        </div>
      )}
    </div>
  );
}
