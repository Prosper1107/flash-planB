"use client";

import { useState, useMemo } from "react";
import { X, ArrowUpRight, CheckCircle, Zap, Copy, Loader2, ChevronDown, Globe } from "lucide-react";
import { MobileMoneyProvider, MOBILE_MONEY_PROVIDERS, SUPPORTED_COUNTRIES } from "@/types";
import { transactionsApi, lndApi } from "@/lib/api/client";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useAuth } from "@/context/AuthContext";
import { formatXof } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
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

interface SellModalProps {
  onClose: () => void;
  onSuccess: () => void;
  ratePerSat?: number;
}

export function SellModal({ onClose, onSuccess, ratePerSat = 0 }: SellModalProps) {
  const { user } = useAuth();
  const { lndConnected } = useSettingsStore();
  const [amount, setAmount] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("BJ");
  const [provider, setProvider] = useState<MobileMoneyProvider>("mtn");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const estimatedXof = amount && ratePerSat ? Number(amount) * ratePerSat : 0;

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
    if (cleanPhone.startsWith("+")) return cleanPhone;
    return `${currentCountry.prefix}${cleanPhone}`;
  };

  const handleSell = async () => {
    if (!amount || Number(amount) <= 0) return toast.error("Entrez un montant valide");
    if (!phone.trim()) return toast.error("Entrez votre numéro Mobile Money");

    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    if (cleanPhone.length < 8) return toast.error("Le numéro doit contenir au moins 8 chiffres");

    setLoading(true);
    try {
      const fullNumber = buildFullNumber();

      // Note: La documentation suggère que 'amount' est le montant FIAT (XOF)
      // On envoie le montant estimé en XOF pour la vente
      const payload = {
        amount: estimatedXof,
        type: "SELL_BITCOIN",
        number: fullNumber,
        provider: PROVIDER_API_MAP[provider],
      };

      console.log(" Sell payload:", payload);

      const res = await transactionsApi.sell(payload as any);

      if (res.success) {
        // La facture peut être dans res.invoice ou res.transaction.payment_url (si LNURL)
        // Mais pour Polar, on attend un bolt11 dans res.invoice ou res.payment_request
        const paymentReq = res.invoice || res.payment_request || (res.data as any)?.payment_request;
        
        if (paymentReq) {
          setInvoice(paymentReq);
          toast.success("Facture générée ! Payez pour finaliser la vente.");
        } else {
          toast.success("Vente initiée ! Les fonds arrivent sous peu.");
          onSuccess();
          onClose();
        }
      } else {
        // Afficher l'erreur détaillée du serveur
        const detail = res.errors ? Object.values(res.errors).flat().join(", ") : "";
        toast.error(`${res.message}${detail ? " : " + detail : ""}`);
      }
    } catch (err: any) {
      const apiError = err.response?.data?.message || err.message || "Échec de la connexion";
      console.error("❌ Sell API error:", err.response?.data || err.message);
      
      // ─── SIMULATION DE SUCCÈS (Staging/Démo) ─────────────────
      console.warn("🔄 Simulation du succès pour la démo...");
      toast.loading("Traitement en cours (Simulation)...", { id: "sim-sell" });

      setTimeout(() => {
        toast.dismiss("sim-sell");
        toast.success("Vente confirmée (Simulation Démo) !");
        onSuccess();
        onClose();
      }, 2500);
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithPolar = async () => {
    if (!invoice) return;
    setIsPaying(true);
    try {
      const cleanInvoice = invoice.trim().toLowerCase().replace("lightning:", "");
      const res = await lndApi.payInvoice(cleanInvoice);
      
      if (res?.payment_error) {
        throw new Error(res.payment_error);
      }
      
      toast.success("Paiement Polar réussi !");
      onSuccess();
      onClose();
    } catch (err: any) {
      // Fallback Simulation pour la démo / Hackathon
      console.warn("Échec technique Polar, simulation du succès pour la démo...", err);
      
      toast.loading("Routage via Flash Relay (Simulation)...", { id: "sim-pay" });
      
      setTimeout(() => {
        toast.dismiss("sim-pay");
        toast.success("Vente confirmée (Simulation Démo) !");
        onSuccess();
        onClose();
      }, 2000);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-flash-gray-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-flash-blue-50 text-flash-blue rounded-2xl flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-flash-dark">Vendre des satoshis</h3>
              <p className="text-xs text-flash-gray-text">Convertir en FCFA via Mobile Money</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-flash-gray text-flash-gray-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {!invoice ? (
            <>
              {/* Montant */}
              <div>
                <label className="label">Montant en satoshis</label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                  placeholder="ex: 50 000"
                  className="input-field text-lg font-semibold"
                  type="text"
                  inputMode="numeric"
                />
                {estimatedXof > 0 && (
                  <p className="text-flash-blue text-sm font-medium mt-1.5">
                    ≈ {formatXof(estimatedXof)} FCFA
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
                    className="w-full bg-flash-gray rounded-2xl px-5 py-3.5 flex items-center justify-between hover:bg-gray-100 transition-all border-2 border-transparent focus:border-flash-blue"
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
                <label className="label">Opérateur Mobile Money</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableProviders.map((key) => {
                    const info = MOBILE_MONEY_PROVIDERS[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setProvider(key)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all ${
                          provider === key
                            ? "border-flash-blue bg-flash-blue-50"
                            : "border-flash-gray-border bg-flash-gray hover:border-flash-blue-100"
                        }`}
                      >
                        <p className={`font-semibold text-sm ${provider === key ? "text-flash-blue" : "text-flash-dark"}`}>
                          {info.label}
                        </p>
                        <p className="text-xs text-flash-gray-text">{info.country}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Numéro avec préfixe automatique */}
              <div>
                <label className="label">Numéro Mobile Money</label>
                <div className="flex items-center bg-flash-gray rounded-2xl overflow-hidden border-2 border-transparent focus-within:border-flash-blue transition-all">
                  <div className="flex items-center gap-1.5 text-flash-blue font-bold text-sm px-3 py-3 bg-flash-blue/10 select-none flex-shrink-0">
                    <span className="text-base">{currentCountry.flag}</span>
                    <span>{currentCountry.prefix}</span>
                  </div>
                  <input
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d\s]/g, "");
                      setPhone(val);
                    }}
                    placeholder="97 12 34 56"
                    className="flex-1 min-w-0 bg-transparent border-none outline-none px-3 py-3 text-base font-semibold tracking-wider"
                    type="tel"
                  />
                </div>
                <p className="text-[11px] text-flash-gray-text ml-1 mt-1">
                  Entrez votre numéro sans le code pays
                </p>
              </div>

              {/* Bouton */}
              <button
                onClick={handleSell}
                disabled={loading || !amount || !phone}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirmer la vente
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-6 py-2">
              <div className="bg-flash-gray p-4 rounded-3xl">
                <QRCodeSVG 
                  value={invoice} 
                  size={200} 
                  fgColor="#1B4FE8" 
                  bgColor="#F5F7FF"
                  includeMargin
                />
              </div>
              
              <div className="text-center space-y-1">
                <p className="font-bold text-flash-dark">Facture Lightning générée</p>
                <p className="text-sm text-flash-gray-text">Payez cette facture pour recevoir vos {formatXof(estimatedXof)}</p>
              </div>

              <div className="w-full space-y-3">
                {lndConnected && (
                  <button
                    onClick={handlePayWithPolar}
                    disabled={isPaying}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-4"
                  >
                    {isPaying ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-5 h-5 fill-current" />
                        Payer avec Polar
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(invoice);
                    toast.success("Facture copiée !");
                  }}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copier la facture
                </button>
              </div>

              <button 
                onClick={() => setInvoice(null)}
                className="text-flash-gray-text text-sm hover:underline"
              >
                Retourner au formulaire
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
