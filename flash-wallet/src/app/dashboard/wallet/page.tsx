"use client";

import { useEffect, useCallback, useState } from "react";
import {
  Zap, Copy, QrCode, ArrowDownLeft, ArrowUpRight,
  RefreshCw, Send, Smartphone, CheckCircle, Wifi, WifiOff, ShoppingCart
} from "lucide-react";
import { transactionsApi, lndApi } from "@/lib/api/client";
import { useWalletStore } from "@/lib/stores/walletStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useAuth } from "@/context/AuthContext";
import { formatSats, formatXof, MobileMoneyProvider, MOBILE_MONEY_PROVIDERS } from "@/types";
import { SellModal } from "@/components/wallet/SellModal";
import { BuyModal } from "../../../components/wallet/BuyModal";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function WalletPage() {
  const { user } = useAuth();
  const {
    balanceSats, balanceXof, lndBalanceSats,
    transactions, isLoadingTxs,
    lightningAddress,
    setBalance, setLndBalance, setTransactions,
    setLoadingTxs, setLightningAddress, computeBalanceFromTxs,
  } = useWalletStore();
  const { autoConvert, lndConnected, setLndConnected } = useSettingsStore();

  const [showReceive, setShowReceive] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [invoiceStr, setInvoiceStr] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  // Construire la Lightning Address à partir du tag utilisateur
  useEffect(() => {
    if (user?.tag) {
      setLightningAddress(`${user.tag}@bitcoinflash.xyz`);
    }
  }, [user?.tag, setLightningAddress]);

  // Charger les données
  const loadData = useCallback(async () => {
    setLoadingTxs(true);
    let allTxs: any[] = [];

    // 1. Charger les transactions depuis Flash API Staging
    try {
      const res = await transactionsApi.list();
      if (res.success && res.transactions) {
        // Filtrer les transactions BUY/SELL (simulées en staging, pas pertinentes)
        // On ne garde que les transactions Lightning réelles
        const mappedTxs = res.transactions
          .filter((tx: any) => {
            const t = (tx.type || "").toUpperCase();
            return t !== "BUY_BITCOIN" && t !== "SELL_BITCOIN";
          })
          .map((tx: any) => ({
            ...tx,
            type: tx.type.toLowerCase(),
            amount_sats: Number(tx.amount_sats) || 0,
            amount_xof: Number(tx.amount_xof) || 0,
            status: (tx.status || "completed").toLowerCase(),
          }));
        allTxs = [...mappedTxs];
      }
    } catch {
      // Ignorer l'erreur silencieusement
    }

    // 2. Tenter de se connecter au noeud LND (Polar) et récupérer les données Lightning
    let isConnected = false;
    try {
      const info = await lndApi.getInfo();
      if (info && !info.error) {
        isConnected = true;
        setLndConnected(true);
        
        // Récupérer la balance Lightning
        try {
          const chanBal = await lndApi.getChannelBalance();
          if (chanBal?.local_balance?.sat) {
            setLndBalance(Number(chanBal.local_balance.sat));
          }
        } catch { /* pas de channels */ }

        // Récupérer les factures Lightning locales (Recevoir)
        try {
          const invRes = await lndApi.listInvoices();
          if (invRes.invoices) {
            const localInvoices = invRes.invoices
              .filter((i: any) => i.state === "SETTLED")
              .map((i: any) => ({
                id: `lnd_inv_${i.payment_request?.substring(0, 10)}`,
                user_id: user?.id || "local",
                type: "receive",
                amount_sats: Number(i.value_msat) / 1000 || Number(i.value) || 0,
                amount_xof: (Number(i.value) || 0) * 0.38,
                status: "completed",
                created_at: new Date(Number(i.creation_date) * 1000).toISOString(),
                description: i.memo || "Facture Lightning (Polar local)",
              }));
            allTxs = [...allTxs, ...localInvoices];
          }
        } catch { /* ignored */ }

        // Récupérer les paiements Lightning locaux (Envoyer)
        try {
          const payRes = await lndApi.listPayments();
          if (payRes.payments) {
            const localPayments = payRes.payments
              .filter((p: any) => p.status === "SUCCEEDED")
              .map((p: any) => ({
                id: `lnd_pay_${p.payment_hash?.substring(0, 10)}`,
                user_id: user?.id || "local",
                type: "send",
                amount_sats: Number(p.value_msat) / 1000 || Number(p.value) || 0,
                amount_xof: (Number(p.value) || 0) * 0.38,
                status: "completed",
                created_at: new Date(Number(p.creation_date) * 1000).toISOString(),
                description: "Paiement sortant (Polar local)",
              }));
            allTxs = [...allTxs, ...localPayments];
          }
        } catch { /* ignored */ }
      } else {
        setLndConnected(false);
      }
    } catch {
      setLndConnected(false);
    }

    // 3. Trier tout par date décroissante et mettre à jour le store
    allTxs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setTransactions(allTxs);

    // 4. Calculer la balance FIAT à partir des transactions (si nécessaire)
    computeBalanceFromTxs();

    setLoadingTxs(false);
  }, [setLoadingTxs, setTransactions, computeBalanceFromTxs, setLndConnected, setLndBalance, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Copier la Lightning Address
  const copyAddress = () => {
    const addr = lightningAddress || `${user?.tag || "user"}@bitcoinflash.xyz`;
    navigator.clipboard.writeText(addr);
    toast.success("Adresse copiée !");
  };

  // Générer une facture Lightning via LND
  const generateInvoice = async () => {
    if (!invoiceAmount || Number(invoiceAmount) <= 0) {
      return toast.error("Entrez un montant en satoshis");
    }
    if (!lndConnected) {
      return toast.error("Noeud Lightning non connecté. Configurez Polar dans les Paramètres.");
    }
    setGeneratingInvoice(true);
    try {
      const res = await lndApi.createInvoice(Number(invoiceAmount), "Flash Wallet");
      if (res?.payment_request) {
        setInvoiceStr(res.payment_request);
        toast.success("Facture créée !");
      } else {
        toast.error("Erreur lors de la création de la facture");
      }
    } catch {
      toast.error("Impossible de créer la facture");
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // Supprimé handleSell redondant (géré dans SellModal)

  const totalBalance = balanceSats + lndBalanceSats;
  const totalXof = balanceXof + (lndBalanceSats * 0.38); // Simple conversion
  const displayAddress = lightningAddress || `${user?.tag || "user"}@bitcoinflash.xyz`;
  const recentTxs = transactions.slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ─── Balance Card ─── */}
      <div className="gradient-bg rounded-3xl p-6 text-white shadow-flash-lg relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 w-40 h-40 border border-white/30 rounded-full" />
          <div className="absolute -left-4 -bottom-4 w-24 h-24 border border-white/20 rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-blue-200 text-sm font-medium">Solde total</p>
              {isLoadingTxs ? (
                <div className="h-10 w-40 bg-white/20 rounded-xl animate-pulse mt-1" />
              ) : (
                <p className="text-4xl font-bold mt-1">
                  {formatSats(totalBalance)}
                  <span className="text-xl font-medium text-blue-200 ml-2">sats</span>
                </p>
              )}
              <p className="text-blue-200 text-sm mt-1">
                ≈ {formatXof(totalXof)}
              </p>
            </div>
            <button
              onClick={loadData}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Lightning Address */}
          <div className="bg-white/10 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{displayAddress}</span>
            </div>
            <button
              onClick={copyAddress}
              className="ml-2 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 flex-shrink-0"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* Polar connection status */}
          <div className="flex items-center gap-2 mt-3">
            {lndConnected ? (
              <div className="flex items-center gap-1.5 text-xs text-green-300">
                <Wifi className="w-3 h-3" />
                <span>Noeud Lightning connecté</span>
                {lndBalanceSats > 0 && (
                  <span className="ml-1 bg-white/10 px-2 py-0.5 rounded-full">
                    {formatSats(lndBalanceSats)} sats LN
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-blue-300/60">
                <WifiOff className="w-3 h-3" />
                <span>Noeud Polar non connecté</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Actions rapides ─── */}
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => { setShowReceive(true); setShowSell(false); setShowBuy(false); }}
          className="card hover:shadow-flash transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer group py-4 px-1"
        >
          <div className="w-10 h-10 bg-flash-blue-50 text-flash-blue rounded-xl flex items-center justify-center group-hover:bg-flash-blue group-hover:text-white transition-all">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <span className="font-semibold text-flash-dark text-[11px] sm:text-xs">Recevoir</span>
        </button>

        <Link
          href="/dashboard/send"
          className="card hover:shadow-flash transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer group py-4 px-1"
        >
          <div className="w-10 h-10 bg-flash-blue-50 text-flash-blue rounded-xl flex items-center justify-center group-hover:bg-flash-blue group-hover:text-white transition-all">
            <Send className="w-5 h-5" />
          </div>
          <span className="font-semibold text-flash-dark text-[11px] sm:text-xs">Envoyer</span>
        </Link>

        <button
          onClick={() => { setShowBuy(true); setShowReceive(false); setShowSell(false); }}
          className="card hover:shadow-flash transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer group py-4 px-1"
        >
          <div className="w-10 h-10 bg-flash-blue-50 text-flash-blue rounded-xl flex items-center justify-center group-hover:bg-flash-blue group-hover:text-white transition-all" title="Acheter avec FCFA">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="font-semibold text-flash-dark text-[11px] sm:text-xs">Acheter</span>
        </button>

        <button
          onClick={() => { setShowSell(true); setShowReceive(false); setShowBuy(false); }}
          className="card hover:shadow-flash transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer group py-4 px-1"
        >
          <div className="w-10 h-10 bg-flash-blue-50 text-flash-blue rounded-xl flex items-center justify-center group-hover:bg-flash-blue group-hover:text-white transition-all">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="font-semibold text-flash-dark text-[11px] sm:text-xs">Vendre</span>
        </button>
      </div>

      {/* ─── Auto-conversion badge ─── */}
      {autoConvert.enabled && autoConvert.mobile_money_number && (
        <div className="bg-flash-blue-50 border border-flash-blue-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-flash-blue text-white rounded-xl flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-flash-dark">
              Conversion auto activée - {autoConvert.percentage}%
            </p>
            <p className="text-xs text-flash-gray-text truncate">
              {MOBILE_MONEY_PROVIDERS[autoConvert.mobile_money_provider]?.label} • {autoConvert.mobile_money_number}
            </p>
          </div>
          <Link href="/dashboard/settings" className="text-flash-blue text-xs font-semibold hover:underline flex-shrink-0">
            Modifier
          </Link>
        </div>
      )}

      {/* ─── Panel Recevoir ─── */}
      {showReceive && (
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <QrCode className="w-5 h-5 text-flash-blue" /> Recevoir
            </h3>
            <button onClick={() => setShowReceive(false)} className="text-flash-gray-text hover:text-flash-dark text-xl leading-none">×</button>
          </div>

          {/* QR Lightning Address */}
          <div className="flex flex-col items-center mb-5 gap-3">
            <div className="bg-flash-gray p-4 rounded-2xl">
              <QRCodeSVG value={`lightning:${displayAddress}`} size={180} fgColor="#1B4FE8" bgColor="#F5F7FF" />
            </div>
            <p className="text-sm font-semibold text-flash-blue break-all text-center">{displayAddress}</p>
            <p className="text-xs text-flash-gray-text text-center">
              Scannez ce QR code avec n&apos;importe quel wallet Lightning
            </p>
            <button onClick={copyAddress} className="btn-secondary text-sm flex items-center gap-2">
              <Copy className="w-4 h-4" /> Copier l&apos;adresse
            </button>
          </div>

          {/* Créer une invoice via Polar */}
          {lndConnected && (
            <div className="border-t border-flash-gray-border pt-4">
              <p className="text-sm font-semibold text-flash-dark mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-flash-blue" /> Créer une facture Lightning
              </p>
              <div className="flex gap-2">
                <input
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  placeholder="Montant en sats"
                  type="number"
                  className="input-field flex-1"
                />
                <button
                  onClick={generateInvoice}
                  disabled={generatingInvoice}
                  className="btn-primary px-4 flex items-center gap-1 whitespace-nowrap"
                >
                  {generatingInvoice ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : "Générer"}
                </button>
              </div>
              {invoiceStr && (
                <div className="mt-3 bg-flash-gray rounded-2xl p-3">
                  <div className="flex justify-center mb-2">
                    <QRCodeSVG value={invoiceStr} size={160} fgColor="#1B4FE8" bgColor="#F5F7FF" />
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(invoiceStr); toast.success("Facture copiée !"); }}
                    className="btn-secondary w-full text-sm flex items-center justify-center gap-2 mt-2"
                  >
                    <Copy className="w-4 h-4" /> Copier la facture
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Modal Vendre ─── */}
      {showSell && (
        <SellModal
          onClose={() => setShowSell(false)}
          onSuccess={() => {
            loadData();
          }}
          ratePerSat={0.38}
        />
      )}

      {/* ─── Modal Acheter ─── */}
      {showBuy && (
        <BuyModal
          onClose={() => setShowBuy(false)}
          onSuccess={() => {
            loadData();
          }}
          ratePerSat={0.38}
        />
      )}

      {/* ─── Transactions récentes ─── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Transactions récentes</h3>
          <Link href="/dashboard/transactions" className="text-sm text-flash-blue font-medium hover:underline">
            Voir tout
          </Link>
        </div>

        {isLoadingTxs ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-flash-gray rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recentTxs.length === 0 ? (
          <div className="text-center py-10">
            <Zap className="w-10 h-10 text-flash-blue-100 mx-auto mb-3" />
            <p className="text-flash-gray-text text-sm">Aucune transaction pour l&apos;instant</p>
            <p className="text-xs text-flash-gray-text mt-1">
              Partagez votre Lightning Address pour recevoir des sats
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTxs.map((tx) => {
              const isPositive = tx.type === "receive" || tx.type === "buy";
              const labelMap: Record<string, string> = {
                buy: "Achat de sats",
                sell: "Vente de sats",
                receive: "Reçu (Lightning)",
                send: "Envoyé (Lightning)",
              };

              return (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-flash-gray rounded-2xl hover:bg-flash-blue-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isPositive ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-500"
                    }`}>
                      {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-flash-dark">
                          {labelMap[tx.type] || tx.type}
                        </p>
                        {tx.status === "pending" && (
                          <span className="px-1.5 py-0.5 rounded-md bg-orange-50 text-[10px] text-orange-600 font-bold uppercase">
                            En cours
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-flash-gray-text">
                        {new Date(tx.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-flash-dark">
                      {isPositive ? "+" : "-"}
                      {formatSats(tx.amount_sats)} sats
                    </p>
                    <p className="text-xs text-flash-gray-text">
                      {formatXof(tx.amount_xof)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
