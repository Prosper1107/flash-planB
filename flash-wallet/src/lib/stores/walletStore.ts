import { create } from "zustand";
import { Transaction } from "@/types";

interface WalletState {
  // ─── Balance ────────────────────────────────
  balanceSats: number;
  balanceXof: number;
  lndBalanceSats: number;

  // ─── Transactions ──────────────────────────
  transactions: Transaction[];
  isLoadingTxs: boolean;

  // ─── Lightning Address ─────────────────────
  lightningAddress: string;

  // ─── Actions ───────────────────────────────
  setBalance: (sats: number, xof: number) => void;
  setLndBalance: (sats: number) => void;
  setTransactions: (txs: Transaction[]) => void;
  setLoadingTxs: (loading: boolean) => void;
  setLightningAddress: (addr: string) => void;
  addTransaction: (tx: Transaction) => void;

  /** Recalcule la balance à partir des transactions */
  computeBalanceFromTxs: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balanceSats: 0,
  balanceXof: 0,
  lndBalanceSats: 0,
  transactions: [],
  isLoadingTxs: true,
  lightningAddress: "",

  setBalance: (sats, xof) => set({ balanceSats: sats, balanceXof: xof }),
  setLndBalance: (sats) => set({ lndBalanceSats: sats }),
  setTransactions: (txs) => set({ transactions: txs }),
  setLoadingTxs: (loading) => set({ isLoadingTxs: loading }),
  setLightningAddress: (addr) => set({ lightningAddress: addr }),

  addTransaction: (tx) =>
    set((s) => ({ transactions: [tx, ...s.transactions] })),

  computeBalanceFromTxs: () => {
    const { transactions } = get();
    let sats = 0;

    for (const tx of transactions) {
      if (tx.status !== "completed") continue;
      
      // On ignore les transactions LND (Polar) car leur solde est géré séparément par lndBalanceSats
      if (tx.id.startsWith("lnd_")) continue;

      if (tx.type === "receive" || tx.type === "buy") {
        sats += tx.amount_sats;
      } else if (tx.type === "sell" || tx.type === "send") {
        sats -= tx.amount_sats;
      }
    }

    // Approximation XOF (le taux réel viendra de l'API quand disponible)
    const XOF_PER_SAT = 0.38;
    set({ balanceSats: Math.max(0, sats), balanceXof: Math.max(0, sats * XOF_PER_SAT) });
  },
}));
