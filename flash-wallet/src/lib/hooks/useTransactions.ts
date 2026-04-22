import { useEffect, useCallback } from "react";
import { transactionsApi } from "@/lib/api/client";
import { useWalletStore } from "@/lib/stores/walletStore";

/**
 * Hook pour charger les transactions depuis l'API Flash
 * et les stocker dans le wallet store.
 */
export function useTransactions() {
  const {
    transactions,
    isLoadingTxs,
    setTransactions,
    setLoadingTxs,
    computeBalanceFromTxs,
  } = useWalletStore();

  const load = useCallback(async () => {
    setLoadingTxs(true);
    try {
      const res = await transactionsApi.list();
      if (res.success && res.transactions) {
        setTransactions(res.transactions);
        computeBalanceFromTxs();
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingTxs(false);
    }
  }, [setTransactions, setLoadingTxs, computeBalanceFromTxs]);

  useEffect(() => {
    load();
  }, [load]);

  return { transactions, isLoading: isLoadingTxs, reload: load };
}
