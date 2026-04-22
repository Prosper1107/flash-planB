import { useCallback } from "react";
import { lndApi } from "@/lib/api/client";
import { useWalletStore } from "@/lib/stores/walletStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";

/**
 * Hook pour gérer le wallet (balance, LND, etc.)
 */
export function useWallet() {
  const {
    balanceSats,
    balanceXof,
    lndBalanceSats,
    lightningAddress,
    setLndBalance,
    setLightningAddress,
    computeBalanceFromTxs,
  } = useWalletStore();

  const { setLndConnected, lndConnected } = useSettingsStore();

  const loadLndBalance = useCallback(async () => {
    try {
      const info = await lndApi.getInfo();
      if (info && !info.error) {
        setLndConnected(true);
        try {
          const chanBal = await lndApi.getChannelBalance();
          if (chanBal?.local_balance?.sat) {
            setLndBalance(Number(chanBal.local_balance.sat));
          }
        } catch {
          /* no channels */
        }
      } else {
        setLndConnected(false);
      }
    } catch {
      setLndConnected(false);
    }
  }, [setLndConnected, setLndBalance]);

  return {
    balanceSats,
    balanceXof,
    lndBalanceSats,
    lndConnected,
    lightningAddress,
    setLightningAddress,
    computeBalanceFromTxs,
    loadLndBalance,
  };
}
