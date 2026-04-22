"use client";

import { RefreshCw } from "lucide-react";
import { WalletBalance } from "@/types";
import { LightningAddressCard } from "./LightningAddressCard";
import { formatXof } from "@/lib/utils";

interface BalanceCardProps {
  balance: WalletBalance;
  rate?: number;
  loading?: boolean;
  onRefresh?: () => void;
}

const formatSatsDisplay = (n: number) => {
  if (n >= 1_000_000) return { value: (n / 1_000_000).toFixed(2), unit: "M sats" };
  if (n >= 1_000) return { value: (n / 1_000).toFixed(1), unit: "k sats" };
  return { value: n.toLocaleString("fr-FR"), unit: "sats" };
};

export function BalanceCard({ balance, rate, loading, onRefresh }: BalanceCardProps) {
  const { value, unit } = formatSatsDisplay(balance.balance_sats);

  return (
    <div className="gradient-bg rounded-3xl p-6 text-white shadow-flash-lg">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-blue-200 text-sm font-medium mb-1">Solde du wallet</p>
          {loading ? (
            <div className="h-10 w-44 bg-white/20 rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{value}</span>
              <span className="text-xl font-medium text-blue-200">{unit}</span>
            </div>
          )}
          <p className="text-blue-200 text-sm mt-1">
            ≈ {formatXof(balance.balance_xof)}
            {rate && rate > 0 && (
              <span className="ml-2 text-xs opacity-70">• 1 sat = {rate} XOF</span>
            )}
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      <LightningAddressCard address={balance.lightning_address} compact />
    </div>
  );
}
