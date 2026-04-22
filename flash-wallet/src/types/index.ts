// ============================================================
// FLASH WALLET - Types centralisés
// ============================================================

// ─── Auth ────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  whatsapp: string;
  country: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  user_id: string;
  code: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  tag: string;
  country: string;
  address: string | null;
  kyc_tier_id: number;
  kyc_status: "PENDING" | "APPROVED" | "REJECTED";
  is_active: boolean;
  roles: string[];
  kyc_tier: KycTier | null;
  kyc_expiry_date: string | null;
  lightning_address?: string;
  created_at: string;
}

export interface KycTier {
  id: number;
  name: string;
  monthly_limit: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user?: User;
    token?: string;
    access_token?: string;
  };
}

// ─── Wallet ──────────────────────────────────────────────────

export interface WalletBalance {
  balance_sats: number;
  balance_xof: number;
  lightning_address: string;
}

export interface AutoConvertConfig {
  enabled: boolean;
  percentage: number;
  mobile_money_provider: MobileMoneyProvider;
  mobile_money_number: string;
}

export type MobileMoneyProvider = "mtn" | "moov" | "celtiis" | "togocel";

export const MOBILE_MONEY_PROVIDERS: Record<
  MobileMoneyProvider,
  { label: string; country: string; color: string; icon: string }
> = {
  mtn: { label: "MTN MoMo", country: "BJ/TG", color: "#FFCC00", icon: "📱" },
  moov: { label: "Moov Money", country: "BJ/TG/CI", color: "#0066CC", icon: "📲" },
  celtiis: { label: "Celtiis", country: "BJ", color: "#E30613", icon: "📞" },
  togocel: { label: "Togocel", country: "TG", color: "#009933", icon: "📶" },
};

// ─── Transactions ────────────────────────────────────────────

export type TransactionType = "buy" | "sell" | "receive" | "send";
export type TransactionStatus = "pending" | "completed" | "failed" | "processing";

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount_sats: number;
  amount_xof: number;
  fee_sats?: number;
  fee_xof?: number;
  lightning_address?: string;
  mobile_money_number?: string;
  mobile_money_provider?: MobileMoneyProvider;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SellSatsPayload {
  amount: number; // Montant (XOF ou sats selon configuration backend, la doc suggère XOF pour BUY mais on testera)
  type: "SELL_BITCOIN" | "BUY_BITCOIN";
  number: string;
  provider?: string; // MTN_OPEN, MOOV_BENIN, etc.
  receiver_address?: string;
}

export interface BuySatsPayload {
  amount_xof: number;
  mobile_money_provider: MobileMoneyProvider;
  mobile_money_number: string;
}

// ─── API Generic ─────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  transaction?: any; // Pour les réponses de création de transaction
  invoice?: string | null; // Facture Lightning bolt11
  payment_request?: string | null; // Alias pour invoice
  payment_url?: string | null; // Pour les paiements FIAT (Buy)
  errors?: Record<string, string[]>;
}

// Flash API returns transactions in this format
export interface TransactionsResponse {
  success: boolean;
  transactions: Transaction[];
}

// ─── Lightning ───────────────────────────────────────────────

export interface LightningInvoice {
  payment_request: string;
  payment_hash: string;
  amount_sats: number;
  expires_at: string;
  description?: string;
}

// ─── LND / Polar ─────────────────────────────────────────────

export interface LndNodeConfig {
  host: string;       // ex: "127.0.0.1"
  restPort: number;   // ex: 8080
  macaroon: string;   // hex-encoded admin macaroon
  tlsCert?: string;   // optional TLS cert
}

export interface LndBalance {
  total_balance: string;
  confirmed_balance: string;
  unconfirmed_balance: string;
}

export interface LndChannelBalance {
  local_balance: { sat: string };
  remote_balance: { sat: string };
}

export interface LndInvoice {
  r_hash: string;
  payment_request: string;
  add_index: string;
  value: string;
  settled: boolean;
  creation_date: string;
  settle_date: string;
  memo: string;
  expiry: string;
  state: "OPEN" | "SETTLED" | "CANCELED" | "ACCEPTED";
}

export interface LndPayment {
  payment_hash: string;
  value_sat: string;
  status: "UNKNOWN" | "IN_FLIGHT" | "SUCCEEDED" | "FAILED";
  fee_sat: string;
  creation_time_ns: string;
}

// ─── Onboarding ──────────────────────────────────────────────

export type OnboardingStep =
  | "welcome"
  | "mobile-money"
  | "auto-convert"
  | "lightning-address"
  | "first-receive"
  | "complete";

// ─── Countries ───────────────────────────────────────────────

export const SUPPORTED_COUNTRIES = [
  { code: "BJ", name: "Bénin", flag: "🇧🇯", prefix: "+229" },
  { code: "TG", name: "Togo", flag: "🇹🇬", prefix: "+228" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", prefix: "+225" },
] as const;

export type CountryCode = "BJ" | "TG" | "CI";

// ─── Utils ───────────────────────────────────────────────────

export const formatSats = (n: number): string =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(2)}M`
    : n.toLocaleString("fr-FR");

export const formatXof = (n: number): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);

export const XOF_PER_SAT = 0.38; // Taux approximatif, à ajuster
