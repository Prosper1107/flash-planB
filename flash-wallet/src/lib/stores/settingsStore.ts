import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AutoConvertConfig, MobileMoneyProvider, LndNodeConfig } from "@/types";

interface SettingsState {
  // ─── Auto-conversion config ─────────────────
  autoConvert: AutoConvertConfig;
  setAutoConvert: (config: Partial<AutoConvertConfig>) => void;

  // ─── Polar / LND node config ────────────────
  lndNode: LndNodeConfig | null;
  setLndNode: (config: LndNodeConfig | null) => void;
  lndConnected: boolean;
  setLndConnected: (connected: boolean) => void;

  // ─── Préférences ────────────────────────────
  currency: "XOF" | "sats";
  setCurrency: (c: "XOF" | "sats") => void;

  // ─── Profil Local (Mock) ─────────────────────
  profileUpdates: {
    name?: string;
    whatsapp?: string;
    address?: string;
  };
  setProfileUpdates: (updates: Partial<SettingsState["profileUpdates"]>) => void;

  // ─── KYC Local (Mock) ────────────────────────
  kycData: {
    status: "unverified" | "pending" | "verified";
    fileName?: string;
    submittedAt?: string;
  };
  setKycData: (data: Partial<SettingsState["kycData"]>) => void;

  // ─── Notifications Locales (Mock) ────────────
  notificationPrefs: {
    email_alerts: boolean;
    whatsapp_alerts: boolean;
    lightning_receipts: boolean;
    mobile_money_success: boolean;
    marketing: boolean;
  };
  setNotificationPrefs: (prefs: Partial<SettingsState["notificationPrefs"]>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Auto-convert defaults
      autoConvert: {
        enabled: true,
        percentage: 100,
        mobile_money_provider: "mtn" as MobileMoneyProvider,
        mobile_money_number: "",
      },
      setAutoConvert: (config) =>
        set((s) => ({
          autoConvert: { ...s.autoConvert, ...config },
        })),

      // LND / Polar defaults
      lndNode: null,
      setLndNode: (config) => set({ lndNode: config }),
      lndConnected: false,
      setLndConnected: (connected) => set({ lndConnected: connected }),

      // Currency preference
      currency: "sats",
      setCurrency: (c) => set({ currency: c }),

      // Profil Local defaults
      profileUpdates: {},
      setProfileUpdates: (updates) =>
        set((s) => ({
          profileUpdates: { ...s.profileUpdates, ...updates },
        })),

      // KYC Local defaults
      kycData: {
        status: "unverified",
      },
      setKycData: (data) =>
        set((s) => ({
          kycData: { ...s.kycData, ...data },
        })),

      // Notifications defaults
      notificationPrefs: {
        email_alerts: true,
        whatsapp_alerts: false,
        lightning_receipts: true,
        mobile_money_success: true,
        marketing: false,
      },
      setNotificationPrefs: (prefs) =>
        set((s) => ({
          notificationPrefs: { ...s.notificationPrefs, ...prefs },
        })),
    }),
    {
      name: "flash-settings",
    }
  )
);
