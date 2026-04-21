"use client";

import { useState } from "react";
import { X, ArrowDownLeft, Zap, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { lndApi } from "@/lib/api/client";
import { copyToClipboard } from "@/lib/utils";
import toast from "react-hot-toast";

interface ReceiveModalProps {
  lightningAddress: string;
  onClose: () => void;
}

export function ReceiveModal({ lightningAddress, onClose }: ReceiveModalProps) {
  const [tab, setTab] = useState<"address" | "invoice">("address");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDesc, setInvoiceDesc] = useState("");
  const [invoice, setInvoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    setCopied(true);
    toast.success("Copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const generateInvoice = async () => {
    if (!invoiceAmount || Number(invoiceAmount) <= 0) {
      return toast.error("Entrez un montant en satoshis");
    }
    setLoading(true);
    try {
      const res = await lndApi.createInvoice(
        Number(invoiceAmount),
        invoiceDesc || "Paiement Flash"
      );
      if (res?.payment_request) {
        setInvoice(res.payment_request);
      } else {
        toast.error("Impossible de générer la facture. Vérifiez votre noeud Polar.");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-flash-lg animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-flash-gray-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 text-flash-success rounded-2xl flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-flash-dark">Recevoir des satoshis</h3>
              <p className="text-xs text-flash-gray-text">Via Lightning Network</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-flash-gray text-flash-gray-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 pb-0">
          {(["address", "invoice"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-flash-blue text-white"
                  : "bg-flash-gray text-flash-gray-text hover:text-flash-dark"
              }`}
            >
              {t === "address" ? "⚡ Lightning Address" : "🧾 Facture"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Onglet Lightning Address */}
          {tab === "address" && (
            <>
              <div className="flex justify-center">
                <div className="bg-flash-gray p-5 rounded-2xl">
                  <QRCodeSVG
                    value={`lightning:${lightningAddress}`}
                    size={170}
                    fgColor="#1B4FE8"
                    bgColor="transparent"
                  />
                </div>
              </div>

              <div className="bg-flash-blue-50 border border-flash-blue-100 rounded-2xl p-4 flex items-center gap-3">
                <Zap className="w-5 h-5 text-flash-blue flex-shrink-0" />
                <span className="text-flash-blue font-semibold text-sm break-all flex-1">
                  {lightningAddress}
                </span>
              </div>

              <button
                onClick={() => handleCopy(lightningAddress)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  copied
                    ? "bg-green-50 text-flash-success"
                    : "btn-secondary"
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copié !" : "Copier l'adresse"}
              </button>

              <p className="text-center text-xs text-flash-gray-text">
                Compatible avec tous les wallets Lightning (Phoenix, Breez, Muun...)
              </p>
            </>
          )}

          {/* Onglet Facture */}
          {tab === "invoice" && (
            <>
              {!invoice ? (
                <>
                  <div>
                    <label className="label">Montant (satoshis)</label>
                    <input
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value.replace(/\D/g, ""))}
                      placeholder="ex: 10 000"
                      className="input-field"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className="label">Description (optionnel)</label>
                    <input
                      value={invoiceDesc}
                      onChange={(e) => setInvoiceDesc(e.target.value)}
                      placeholder="Paiement pour..."
                      className="input-field"
                    />
                  </div>
                  <button
                    onClick={generateInvoice}
                    disabled={loading || !invoiceAmount}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : "Générer la facture"}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="bg-flash-gray p-4 rounded-2xl">
                      <QRCodeSVG value={invoice} size={170} fgColor="#1B4FE8" bgColor="transparent" />
                    </div>
                  </div>

                  <div className="bg-flash-gray rounded-2xl p-3">
                    <p className="text-xs text-flash-gray-text font-mono break-all line-clamp-2">
                      {invoice.slice(0, 60)}...
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(invoice)}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
                    >
                      <Copy className="w-4 h-4" /> Copier
                    </button>
                    <button
                      onClick={() => { setInvoice(""); setInvoiceAmount(""); }}
                      className="btn-outline flex-1 text-sm"
                    >
                      Nouvelle facture
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
