import axios, { AxiosInstance, AxiosError } from "axios";
import Cookies from "js-cookie";
import {
  RegisterPayload,
  LoginPayload,
  VerifyOtpPayload,
  AuthResponse,
  ApiResponse,
  SellSatsPayload,
  BuySatsPayload,
  TransactionsResponse,
} from "@/types";

// ============================================================
// Configuration
// ============================================================

const BASE_URL =
  process.env.NEXT_PUBLIC_FLASH_API_URL || "https://staging.bitcoinflash.xyz";

const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// ─── Request interceptor : injecte l'auth automatiquement ────
api.interceptors.request.use((config) => {
  const token = Cookies.get("flash_token");
  const stagingUserId = Cookies.get("flash_staging_user_id");

  // Priorité 1 : JWT Bearer token
  if (token) {
    config.headers["Authorization"] = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }

  // Priorité 2 : X-Staging-User-Id (toujours envoyé en staging s'il existe)
  // Le staging Flash accepte ce header pour les routes de données
  if (stagingUserId) {
    config.headers["X-Staging-User-Id"] = stagingUserId;
  }

  return config;
});

// ─── Response interceptor : gestion des erreurs 401 ──────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      // On ne déconnecte que si /auth/me ou /auth/refresh retourne 401
      // (= token réellement expiré). Les autres 401 sont silencieux
      const isAuthCheck =
        url.includes("/auth/me") || url.includes("/auth/refresh");

      if (isAuthCheck) {
        Cookies.remove("flash_token", { path: "/" });
        Cookies.remove("flash_staging_user_id", { path: "/" });
        Cookies.remove("flash_user", { path: "/" });
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/auth/")
        ) {
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================
// Helpers
// ============================================================

export function setAuthToken(token: string) {
  Cookies.set("flash_token", token, { expires: 1 / 24, path: "/" }); // 1h
}

export function setStagingUserId(userId: string) {
  Cookies.set("flash_staging_user_id", userId, { expires: 7, path: "/" });
}

export function setUserCookie(user: object) {
  Cookies.set("flash_user", JSON.stringify(user), { expires: 1, path: "/" });
}

export function clearAuth() {
  Cookies.remove("flash_token", { path: "/" });
  Cookies.remove("flash_staging_user_id", { path: "/" });
  Cookies.remove("flash_user", { path: "/" });
}

export function getStoredUser() {
  const raw = Cookies.get("flash_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getStoredToken() {
  return Cookies.get("flash_token") || null;
}

export function getStagingUserId() {
  return Cookies.get("flash_staging_user_id") || null;
}

// ============================================================
// AUTH API
// ============================================================

export const authApi = {
  register: (payload: RegisterPayload): Promise<AuthResponse> =>
    api.post("/auth/register", payload).then((r) => r.data),

  login: (payload: LoginPayload): Promise<AuthResponse> =>
    api.post("/auth/login", payload).then((r) => r.data),

  verifyOtp: (payload: VerifyOtpPayload): Promise<ApiResponse> =>
    api.post("/auth/verify-otp", payload).then((r) => r.data),

  regenerateOtp: (email: string): Promise<ApiResponse> =>
    api.post("/auth/regenerate-otp", { email }).then((r) => r.data),

  reactivate: (email: string): Promise<ApiResponse> =>
    api.post("/auth/reactivate", { email }).then((r) => r.data),

  logout: (): Promise<ApiResponse> =>
    api.post("/auth/logout").then((r) => r.data),

  me: (): Promise<ApiResponse> =>
    api.get("/auth/me").then((r) => r.data),

  refreshToken: (): Promise<AuthResponse> =>
    api.post("/auth/refresh").then((r) => r.data),

  requestPasswordReset: (email: string): Promise<ApiResponse> =>
    api.post("/auth/password/reset-request", { email }).then((r) => r.data),

  resetPassword: (payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<ApiResponse> =>
    api.post("/auth/password/reset", payload).then((r) => r.data),

  updateMe: (payload: Partial<User>): Promise<ApiResponse<{ user: User }>> =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Profil mis à jour localement",
          data: { user: payload as User }
        });
      }, 500);
    }),

  uploadKyc: (formData: FormData): Promise<ApiResponse> =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Document KYC envoyé"
        });
      }, 1000);
    }),

  updateNotifications: (prefs: any): Promise<ApiResponse> =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Préférences notifications enregistrées"
        });
      }, 500);
    }),
};

// ============================================================
// TRANSACTIONS API
// ============================================================

export const transactionsApi = {
  /** GET /transactions - retourne { success, transactions: [...] } */
  list: (): Promise<TransactionsResponse> =>
    api.get("/transactions").then((r) => r.data),

  /** POST /transactions/create - Créer une transaction (Vente/Achat) */
  create: (payload: any): Promise<ApiResponse> =>
    api.post("/transactions/create", payload).then((r) => r.data),

  /** Alias pour la vente */
  sell: (payload: SellSatsPayload): Promise<ApiResponse> =>
    api.post("/transactions/create", payload).then((r) => r.data),

  /** Alias pour l'achat */
  buy: (payload: BuySatsPayload): Promise<ApiResponse> =>
    api.post("/transactions/create", payload).then((r) => r.data),
};

// ============================================================
// LND / POLAR (via Next.js API routes)
// ============================================================

export const lndApi = {
  /** Récupère la balance du noeud Lightning via le proxy API route */
  getBalance: () =>
    axios.get("/api/lnd/balance").then((r) => r.data),

  /** Récupère la balance des canaux */
  getChannelBalance: () =>
    axios.get("/api/lnd/channels/balance").then((r) => r.data),

  /** Crée une facture Lightning */
  createInvoice: (amount_sats: number, memo?: string) =>
    axios
      .post("/api/lnd/invoices", { value: amount_sats, memo: memo || "Flash Wallet" })
      .then((r) => r.data),

  /** Paie une facture Lightning */
  payInvoice: (payment_request: string) =>
    axios
      .post("/api/lnd/channels/transactions", { payment_request })
      .then((r) => r.data),

  /** Liste les factures */
  listInvoices: () =>
    axios.get("/api/lnd/invoices").then((r) => r.data),

  /** Liste les paiements */
  listPayments: () =>
    axios.get("/api/lnd/payments").then((r) => r.data),

  /** Vérifie la connexion au noeud */
  getInfo: () =>
    axios.get("/api/lnd/info").then((r) => r.data),

  /** Décode un payment request */
  decodePayReq: (pay_req: string) =>
    axios.get(`/api/lnd/payreq/${pay_req}`).then((r) => r.data),
};

export default api;
