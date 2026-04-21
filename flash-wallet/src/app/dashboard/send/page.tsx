"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Zap, QrCode, AlertCircle } from "lucide-react";
import { lndApi } from "@/lib/api/client";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { formatSats } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SendPage() {
  const router = useRouter();
  const { lndConnected } = useSettingsStore();

  const [invoice, setInvoice] = useState("");
  const [decodedInvoice, setDecodedInvoice] = useState<{
    num_satoshis: string;
    description: string;
    destination: string;
    expiry: string;
  } | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);

  // Décoder un payment request
  const decodeInvoice = async () => {
    if (!invoice.trim()) return toast.error("Collez une facture Lightning");
    if (!lndConnected) return toast.error("Noeud Lightning non connecté");

    setIsDecoding(true);
    try {
      const cleanInvoice = invoice.trim().toLowerCase().replace("lightning:", "");
      const decoded = await lndApi.decodePayReq(cleanInvoice);
      if (decoded && decoded.num_satoshis) {
        setDecodedInvoice(decoded);
      } else {
        toast.error("Facture invalide ou expirée");
      }
    } catch {
      toast.error("Impossible de décoder la facture");
    } finally {
      setIsDecoding(false);
    }
  };

  // Payer la facture
  const payInvoice = async () => {
    if (!decodedInvoice) return;
    setIsPaying(true);
    try {
      const cleanInvoice = invoice.trim().toLowerCase().replace("lightning:", "");
      const res = await lndApi.payInvoice(cleanInvoice);
      if (res?.payment_error) {
        toast.error(`Erreur: ${res.payment_error}`);
      } else {
        toast.success("Paiement envoyé avec succès !");
        router.push("/dashboard/wallet");
      }
    } catch {
      toast.error("Erreur lors du paiement");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/wallet"
          className="w-10 h-10 bg-flash-gray rounded-xl flex items-center justify-center hover:bg-flash-blue-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-flash-dark" />
        </Link>
        <div>
          <h1 className="page-title">Envoyer</h1>
          <p className="text-muted">Payer une facture Lightning</p>
        </div>
      </div>

      {!lndConnected ? (
        <div className="card text-center py-10">
          <AlertCircle className="w-12 h-12 text-flash-warning mx-auto mb-4" />
          <p className="text-flash-dark font-semibold mb-2">Noeud Lightning requis</p>
          <p className="text-sm text-flash-gray-text mb-6">
            Pour envoyer des paiements Lightning, connectez votre noeud Polar dans les paramètres.
          </p>
          <Link href="/dashboard/settings" className="btn-primary inline-flex items-center gap-2">
            Configurer Polar
          </Link>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="w-5 h-5 text-flash-blue" />
              <h3 className="font-semibold text-flash-dark">Facture Lightning</h3>
            </div>

            <textarea
              value={invoice}
              onChange={(e) => {
                setInvoice(e.target.value);
                setDecodedInvoice(null);
              }}
              placeholder="Collez une facture Lightning (lnbc...)"
              rows={4}
              className="input-field resize-none font-mono text-xs"
            />

            {!decodedInvoice ? (
              <button
                onClick={decodeInvoice}
                disabled={isDecoding || !invoice.trim()}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
              >
                {isDecoding ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Décoder la facture
                  </>
                )}
              </button>
            ) : (
              <div className="mt-4 space-y-4">
                {/* Résumé de la facture */}
                <div className="bg-flash-gray rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-flash-gray-text">Montant</span>
                    <span className="text-lg font-bold text-flash-blue">
                      {formatSats(Number(decodedInvoice.num_satoshis))} sats
                    </span>
                  </div>
                  {decodedInvoice.description && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-flash-gray-text">Description</span>
                      <span className="text-sm font-medium text-flash-dark">
                        {decodedInvoice.description}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-flash-gray-text">Destination</span>
                    <span className="text-xs font-mono text-flash-dark max-w-[200px] truncate">
                      {decodedInvoice.destination}
                    </span>
                  </div>
                </div>

                <button
                  onClick={payInvoice}
                  disabled={isPaying}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isPaying ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Confirmer le paiement
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
