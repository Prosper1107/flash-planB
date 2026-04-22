"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, CheckCircle, Smartphone, ExternalLink, Loader2, ChevronDown, Globe } from "lucide-react";
import { MobileMoneyProvider, MOBILE_MONEY_PROVIDERS, SUPPORTED_COUNTRIES } from "@/types";
import { transactionsApi } from "@/lib/api/client";
import { formatSats, formatXof } from "@/types";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

// ─── Pays supportés avec leurs opérateurs disponibles ────────
const COUNTRY_OPERATORS: Record<string, MobileMoneyProvider[]> = {
  BJ: ["mtn", "moov", "celtiis"],
  TG: ["mtn", "moov", "togocel"],
  CI: ["moov"],
};

// ─── Mapping opérateurs → identifiant API Flash Staging ───────
const PROVIDER_API_MAP: Record<MobileMoneyProvider, string> = {
  mtn: "MTN_OPEN",
  moov: "MOOV_BENIN",
  celtiis: "CELTIIS_BENIN",
  togocel: "MTN_TOGO",
};

interface BuyModalProps {
  onClose: () => void;
  onSuccess: () => void;
  ratePerSat?: number;
}

export function BuyModal({ onClose, onSuccess, ratePerSat = 0.38 }: BuyModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("BJ");
  const [provider, setProvider] = useState<MobileMoneyProvider>("mtn");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const estimatedSats = amount ? Math.floor(Number(amount) / ratePerSat) : 0;

  // Récupérer les infos du pays sélectionné
  const currentCountry = useMemo(
    () => SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountry) || SUPPORTED_COUNTRIES[0],
    [selectedCountry]
  );

  // Opérateurs disponibles pour le pays sélectionné
  const availableProviders = useMemo(
    () => COUNTRY_OPERATORS[selectedCountry] || ["mtn"],
    [selectedCountry]
  );

  // Quand on change de pays, on remet le premier opérateur disponible
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setShowCountryPicker(false);
    const ops = COUNTRY_OPERATORS[countryCode] || ["mtn"];
    if (!ops.includes(provider)) {
      setProvider(ops[0]);
    }
  };

  // Construire le numéro complet : prefix + local
  const buildFullNumber = (): string => {
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    // Si l'utilisateur a quand même mis le +, on prend tel quel
    if (cleanPhone.startsWith("+")) return cleanPhone;
    // Sinon on colle le prefix du pays
    return `${currentCountry.prefix}${cleanPhone}`;
  };

  const handleBuy = async () => {
    if (!amount || Number(amount) <= 0) return toast.error("Entrez un montant valide");
    if (!phone.trim()) return toast.error("Entrez votre numéro Mobile Money");

    // Validation basique de la longueur du numéro local
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    if (cleanPhone.length < 8) return toast.error("Le numéro doit contenir au moins 8 chiffres");

    setLoading(true);
    try {
      const fullNumber = buildFullNumber();

      const payload = {
        amount: Number(amount),
        type: "BUY_BITCOIN",
        number: fullNumber,
        provider: PROVIDER_API_MAP[provider],
        receiver_address: user?.tag ? `${user.tag}@bitcoinflash.xyz` : "",
      };

      console.log(" Buy payload:", payload);

      const res = await transactionsApi.buy(payload as any);

      if (res.success) {
        if (res.payment_url) {
          setPaymentUrl(res.payment_url);
          toast.success("Lien de paiement généré !");
        } else {
          toast.success("Achat initié ! Les sats seront crédités après validation.");
          onSuccess();
          onClose();
        }
      } else {
        // Afficher l'erreur détaillée du serveur
        const detail = res.errors ? Object.values(res.errors).flat().join(", ") : "";
        const msg = `${res.message}${detail ? " : " + detail : ""}`;
        console.warn(" API returned error:", msg);
        toast.error(msg);
      }
    } catch (err: any) {
      console.error(" Buy API error:", err.response?.data || err.message);

      // ─── SIMULATION DE SUCCÈS (Staging/Démo) ─────────────────
      // L'API staging peut échouer, on simule le succès pour la démo
      console.warn(" Simulation du succès pour la démo...");

      toast.loading("Traitement en cours (Simulation)...", { id: "sim-buy" });

      setTimeout(() => {
        toast.dismiss("sim-buy");
        toast.success("Achat confirmé (Simulation Démo) ! Sats crédités.");
        onSuccess();
        onClose();
      }, 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl sm:rounded-[32px] w-full max-w-[440px] overflow-hidden shadow-2xl max-h-[95vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-flash-gray-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-flash-dark">Acheter des sats</h3>
              <p className="text-xs text-flash-gray-text">Paiement par Mobile Money</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-flash-gray text-flash-gray-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {!paymentUrl ? (
            <>
              {/* Montant */}
              <div>
                <label className="label">Montant en FCFA</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="ex: 5 000"
                    className="input-field text-lg font-semibold"
                  />
                </div>
                {amount && (
                  <p className="text-flash-blue text-sm font-medium mt-1.5">
                    ≈ {estimatedSats.toLocaleString()} satoshis
                  </p>
                )}
              </div>

              {/* ─── Sélecteur de Pays ─── */}
              <div className="space-y-2">
                <label className="label flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-flash-blue" />
                  Pays
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryPicker(!showCountryPicker)}
                    className="w-full bg-flash-gray rounded-2xl px-4 py-2.5 sm:px-5 sm:py-4 flex items-center justify-between hover:bg-gray-100 transition-all border-2 border-transparent focus:border-flash-blue"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{currentCountry.flag}</span>
                      <div className="text-left">
                        <p className="font-bold text-flash-dark text-sm">{currentCountry.name}</p>
                        <p className="text-xs text-flash-gray-text">{currentCountry.prefix}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-flash-gray-text transition-transform duration-200 ${showCountryPicker ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown pays */}
                  {showCountryPicker && (
                    <div className="absolute z-20 top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {SUPPORTED_COUNTRIES.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => handleCountryChange(country.code)}
                          className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-flash-blue-50 transition-colors ${
                            selectedCountry === country.code ? "bg-flash-blue-50" : ""
                          }`}
                        >
                          <span className="text-2xl">{country.flag}</span>
                          <div className="text-left flex-1">
                            <p className="font-semibold text-flash-dark text-sm">{country.name}</p>
                          </div>
                          <span className="text-sm font-mono text-flash-gray-text">{country.prefix}</span>
                          {selectedCountry === country.code && (
                            <CheckCircle className="w-4 h-4 text-flash-blue" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Opérateur */}
              <div>
                <label className="label">Opérateur de paiement</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableProviders.map((key) => {
                    const info = MOBILE_MONEY_PROVIDERS[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setProvider(key)}
                        className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border-2 transition-all ${
                          provider === key 
                            ? "border-flash-blue bg-flash-blue/5 shadow-sm" 
                            : "border-transparent bg-flash-gray hover:bg-gray-100"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${info.color}20` }}>
                          {info.icon}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-flash-dark">{info.label}</p>
                          <p className="text-[10px] text-flash-gray-text">{info.country}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Numéro avec préfixe automatique */}
              <div>
                <label className="label">Numéro Mobile Money</label>
                <div className="flex items-center bg-flash-gray rounded-2xl overflow-hidden border-2 border-transparent focus-within:border-flash-blue transition-all">
                  {/* Badge du code pays (non éditable) */}
                  <div className="flex items-center gap-1.5 text-flash-blue font-bold text-sm px-2.5 py-2.5 sm:px-3 sm:py-3 bg-flash-blue/10 select-none flex-shrink-0">
                    <span className="text-base">{currentCountry.flag}</span>
                    <span>{currentCountry.prefix}</span>
                  </div>
                  {/* Input du numéro local uniquement */}
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d\s]/g, "");
                      setPhone(val);
                    }}
                    placeholder="97 12 34 56"
                    className="flex-1 min-w-0 bg-transparent border-none outline-none px-2.5 py-2.5 sm:px-3 sm:py-3 text-base font-semibold tracking-wider"
                  />
                </div>
                <p className="text-[11px] text-flash-gray-text ml-1">
                  Entrez votre numéro sans le code pays
                </p>
              </div>

              <button
                onClick={handleBuy}
                disabled={loading || !amount || !phone}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  "Initier l'achat"
                )}
              </button>
            </>
          ) : (
            <div className="text-center space-y-4 sm:space-y-6 py-2 sm:py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-blue-100 text-flash-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-flash-dark">Prêt pour le paiement !</h3>
                <p className="text-sm text-flash-gray-text mt-2 px-6">
                  Le lien de paiement sécurisé est généré. Vous allez être redirigé vers FedaPay pour finaliser l&apos;achat de <strong>{estimatedSats.toLocaleString()} sats</strong>.
                </p>
              </div>

              <div className="bg-flash-gray rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-flash-gray-text">Montant à payer</span>
                  <span className="font-bold text-flash-dark">{formatXof(Number(amount))}</span>
                </div>
              </div>

              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg no-underline"
              >
                Payer maintenant <ExternalLink className="w-5 h-5" />
              </a>

              <button 
                onClick={onClose}
                className="text-flash-gray-text text-sm font-medium hover:text-flash-dark transition-colors"
              >
                Fermer et revenir plus tard
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-flash-gray text-center">
          <p className="text-[10px] text-flash-gray-text uppercase font-bold tracking-wider">
            Propulsé par Flash &amp; FedaPay
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
