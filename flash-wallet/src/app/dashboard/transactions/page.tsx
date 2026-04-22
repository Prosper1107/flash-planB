"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowDownLeft, ArrowUpRight, Filter, Search, Loader2, Zap } from "lucide-react";
import { transactionsApi, lndApi } from "@/lib/api/client";
import { Transaction, formatSats, formatXof } from "@/types";
import { useAuth } from "@/context/AuthContext";

const TYPE_LABELS: Record<string, string> = {
  buy: "Achat",
  sell: "Vente",
  receive: "Réception",
  send: "Envoi",
};
const STATUS_LABELS: Record<string, string> = {
  completed: "Complété",
  pending: "En attente",
  processing: "En cours",
  failed: "Échoué",
};
const STATUS_COLORS: Record<string, string> = {
  completed: "badge-success",
  pending: "badge-warning",
  processing: "badge-warning",
  failed: "badge-danger",
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    let allTxs: any[] = [];
    try {
      const res = await transactionsApi.list();
      if (res.success && res.transactions) {
        // Filtrer les transactions BUY/SELL (simulées en staging, pas pertinentes)
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
    } catch {}

    try {
      const invRes = await lndApi.listInvoices();
      if (invRes.invoices) {
        allTxs.push(...invRes.invoices.filter((i: any) => i.state === "SETTLED").map((i: any) => ({
          id: `lnd_inv_${i.payment_request?.substring(0, 10) || Date.now()}`,
          user_id: user?.id || "local",
          type: "receive",
          amount_sats: Number(i.value_msat) / 1000 || Number(i.value) || 0,
          amount_xof: (Number(i.value) || 0) * 0.38,
          status: "completed",
          created_at: new Date(Number(i.creation_date) * 1000).toISOString(),
          description: i.memo || "Facture Lightning (Polar local)",
        })));
      }
    } catch {}

    try {
      const payRes = await lndApi.listPayments();
      if (payRes.payments) {
        allTxs.push(...payRes.payments.filter((p: any) => p.status === "SUCCEEDED").map((p: any) => ({
          id: `lnd_pay_${p.payment_hash?.substring(0, 10) || Date.now()}`,
          user_id: user?.id || "local",
          type: "send",
          amount_sats: Number(p.value_msat) / 1000 || Number(p.value) || 0,
          amount_xof: (Number(p.value) || 0) * 0.38,
          status: "completed",
          created_at: new Date(Number(p.creation_date) * 1000).toISOString(),
          description: "Paiement sortant (Polar local)",
        })));
      }
    } catch {}

    allTxs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setTxs(allTxs);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const filtered = txs.filter((tx) => {
    const matchType = filterType === "all" || tx.type === filterType;
    const matchStatus = filterStatus === "all" || tx.status === filterStatus;
    const matchSearch = !search || tx.id.includes(search) || tx.mobile_money_number?.includes(search);
    return matchType && matchStatus && matchSearch;
  });

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Transactions</h1>
        <p className="text-muted mt-1">Historique de toutes vos opérations</p>
      </div>

      {/* Filtres */}
      <div className="card space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-flash-gray-text" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une transaction..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-flash-gray-text" />
          </div>
          {["all", "receive", "send"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === t
                  ? "bg-flash-blue text-white"
                  : "bg-flash-gray text-flash-gray-text hover:bg-flash-blue-50 hover:text-flash-blue"
              }`}
            >
              {t === "all" ? "Tout" : TYPE_LABELS[t]}
            </button>
          ))}
          <div className="w-px h-6 bg-flash-gray-border self-center" />
          {["all", "completed", "pending", "failed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === s
                  ? "bg-flash-dark text-white"
                  : "bg-flash-gray text-flash-gray-text hover:bg-flash-gray-border"
              }`}
            >
              {s === "all" ? "Tous statuts" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-flash-blue animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-10 h-10 text-flash-blue-100 mx-auto mb-3" />
            <p className="text-flash-gray-text font-medium">Aucune transaction trouvée</p>
            <p className="text-xs text-flash-gray-text mt-1">
              {txs.length === 0
                ? "Vos transactions apparaîtront ici après votre première opération"
                : "Essayez de modifier vos filtres"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-flash-gray-border">
            {filtered.map((tx) => (
              <div
                key={tx.id}
                className="py-4 flex items-center justify-between hover:bg-flash-gray -mx-6 px-6 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      tx.type === "receive" || tx.type === "buy"
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-500"
                    }`}
                  >
                    {tx.type === "receive" || tx.type === "buy" ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-flash-dark text-sm">
                      {TYPE_LABELS[tx.type] || tx.type}
                    </p>
                    <p className="text-xs text-flash-gray-text">{formatDate(tx.created_at)}</p>
                    {tx.mobile_money_number && (
                      <p className="text-xs text-flash-gray-text">{tx.mobile_money_number}</p>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p
                    className={`font-bold text-sm ${
                      tx.type === "receive" || tx.type === "buy"
                        ? "text-green-600"
                        : "text-flash-dark"
                    }`}
                  >
                    {tx.type === "receive" || tx.type === "buy" ? "+" : "-"}
                    {formatSats(tx.amount_sats)} sats
                  </p>
                  <p className="text-xs text-flash-gray-text">{formatXof(tx.amount_xof)}</p>
                  <span className={STATUS_COLORS[tx.status]}>
                    {STATUS_LABELS[tx.status] || tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
