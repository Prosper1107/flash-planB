// ============================================================
// Formatage des montants
// ============================================================

export const formatSats = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M sats`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k sats`;
  return `${n.toLocaleString("fr-FR")} sats`;
};

export const formatXof = (n: number): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDateShort = (iso: string): string =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });

// ============================================================
// Validation
// ============================================================

export const isValidPhone = (phone: string): boolean =>
  /^\+?[0-9]{8,15}$/.test(phone.replace(/\s/g, ""));

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ============================================================
// Lightning Address helpers
// ============================================================

export const isValidLightningAddress = (addr: string): boolean =>
  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(addr);

export const getLightningAddressDomain = (addr: string): string =>
  addr.split("@")[1] || "";

export const getLightningAddressUser = (addr: string): string =>
  addr.split("@")[0] || "";

// ============================================================
// Clipboard
// ============================================================

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback pour les navigateurs sans support
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  }
};

// ============================================================
// Conversion
// ============================================================

export const satsToXof = (sats: number, rate: number): number =>
  Math.round(sats * rate);

export const xofToSats = (xof: number, rate: number): number =>
  rate > 0 ? Math.floor(xof / rate) : 0;

// ============================================================
// Couleur par statut
// ============================================================

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    completed: "text-flash-success bg-green-50",
    pending: "text-flash-warning bg-yellow-50",
    processing: "text-flash-warning bg-yellow-50",
    failed: "text-flash-danger bg-red-50",
  };
  return map[status] || "text-flash-gray-text bg-flash-gray";
};

export const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    completed: "Complété",
    pending: "En attente",
    processing: "En cours",
    failed: "Échoué",
  };
  return map[status] || status;
};

export const getTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    buy: "Achat",
    sell: "Vente",
    receive: "Réception",
    send: "Envoi",
  };
  return map[type] || type;
};

// ============================================================
// Truncate
// ============================================================

export const truncate = (str: string, max = 20): string =>
  str.length > max ? `${str.slice(0, max)}...` : str;

export const truncateMiddle = (str: string, keep = 8): string => {
  if (str.length <= keep * 2) return str;
  return `${str.slice(0, keep)}...${str.slice(-keep)}`;
};
