"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Zap, ArrowRight, ArrowLeft, Smartphone,
  RefreshCw, CheckCircle, Wallet
} from "lucide-react";
import { MobileMoneyProvider, MOBILE_MONEY_PROVIDERS, SUPPORTED_COUNTRIES } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import toast from "react-hot-toast";

type Step = "welcome" | "mobile-money" | "auto-convert" | "lightning-address" | "done";

const STEPS: Step[] = ["welcome", "mobile-money", "auto-convert", "lightning-address", "done"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { autoConvert: storedAutoConvert, setAutoConvert: setStoredAutoConvert } = useSettingsStore();

  const [step, setStep] = useState<Step>("welcome");

  // Local state for the form
  const [provider, setProvider] = useState<MobileMoneyProvider | "">(storedAutoConvert.mobile_money_provider);
  const [phone, setPhone] = useState(storedAutoConvert.mobile_money_number || "");
  const [autoConvert, setAutoConvert] = useState(storedAutoConvert.enabled);

  // Auto-fill phone from user profile
  useEffect(() => {
    if (user?.whatsapp && !phone) {
      setPhone(user.whatsapp);
    }
  }, [user, phone]);

  const [convertPercent, setConvertPercent] = useState(storedAutoConvert.percentage);
  const [country, setCountry] = useState("BJ");

  // User lightning address
  const lightningAddress = user?.tag ? `${user.tag}@bitcoinflash.xyz` : "votrecompte@bitcoinflash.xyz";

  const stepIndex = STEPS.indexOf(step);
  const progress = (stepIndex / (STEPS.length - 1)) * 100;

  const next = () => {
    const nextStep = STEPS[stepIndex + 1];
    if (nextStep) setStep(nextStep);
  };

  const back = () => {
    const prevStep = STEPS[stepIndex - 1];
    if (prevStep) setStep(prevStep);
  };

  const finish = () => {
    // Save to settings store
    setStoredAutoConvert({
      enabled: autoConvert,
      percentage: convertPercent,
      mobile_money_provider: provider as MobileMoneyProvider,
      mobile_money_number: phone,
    });

    toast.success("Wallet configuré ! Bienvenue sur Flash 🎉");
    router.push("/dashboard/wallet");
  };

  return (
    <div className="min-h-screen bg-flash-gray font-poppins flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative rounded-lg overflow-hidden shadow-sm">
              <Image
                src="/images/logo.jpg"
                alt="Flash Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-bold text-flash-blue uppercase tracking-tight">Flash</span>
          </div>
          <span className="text-sm text-flash-gray-text font-medium">
            Étape {stepIndex + 1} / {STEPS.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-flash-blue-100 rounded-full overflow-hidden">
          <div
            className="h-full gradient-bg rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-4">
        <div className="w-full max-w-lg animate-slide-up">

          {/* STEP 1 : Welcome */}
          {step === "welcome" && (
            <div className="card text-center">
              <div className="w-20 h-20 gradient-bg rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-flash-dark mb-3">
                Bienvenue sur Flash Wallet
              </h1>
              <p className="text-flash-gray-text mb-6">
                En 3 étapes, configurez votre wallet pour recevoir du Bitcoin et l&apos;encaisser automatiquement en FCFA sur votre Mobile Money.
              </p>
              <div className="space-y-3 mb-8 text-left">
                {[
                  { icon: <Smartphone className="w-5 h-5" />, text: "Connectez votre compte Mobile Money" },
                  { icon: <RefreshCw className="w-5 h-5" />, text: "Choisissez votre taux de conversion auto" },
                  { icon: <Zap className="w-5 h-5" />, text: "Obtenez votre Lightning Address" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-flash-gray rounded-2xl p-3">
                    <div className="w-9 h-9 bg-flash-blue-50 text-flash-blue rounded-xl flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-flash-dark">{item.text}</span>
                  </div>
                ))}
              </div>
              <button onClick={next} className="btn-primary w-full flex items-center justify-center gap-2">
                Commencer la configuration <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2 : Mobile Money */}
          {step === "mobile-money" && (
            <div className="card">
              <div className="w-14 h-14 bg-flash-blue-50 rounded-2xl flex items-center justify-center mb-5">
                <Smartphone className="w-7 h-7 text-flash-blue" />
              </div>
              <h2 className="text-xl font-bold text-flash-dark mb-1">Mobile Money</h2>
              <p className="text-flash-gray-text text-sm mb-6">
                Choisissez votre opérateur et entrez votre numéro pour recevoir vos FCFA.
              </p>

              {/* Pays */}
              <div className="mb-4">
                <label className="label">Pays</label>
                <div className="grid grid-cols-3 gap-2">
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCountry(c.code); setProvider(""); }}
                      className={`py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all ${country === c.code
                          ? "border-flash-blue bg-flash-blue-50 text-flash-blue"
                          : "border-flash-gray-border bg-flash-gray text-flash-gray-text"
                        }`}
                    >
                      {c.flag} {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opérateur */}
              <div className="mb-4">
                <label className="label">Opérateur Mobile Money</label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(MOBILE_MONEY_PROVIDERS) as [MobileMoneyProvider, typeof MOBILE_MONEY_PROVIDERS[MobileMoneyProvider]][]).map(
                    ([key, info]) => (
                      <button
                        key={key}
                        onClick={() => setProvider(key)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all ${provider === key
                            ? "border-flash-blue bg-flash-blue-50"
                            : "border-flash-gray-border bg-flash-gray hover:border-flash-blue-100"
                          }`}
                      >
                        <p className={`font-semibold text-sm ${provider === key ? "text-flash-blue" : "text-flash-dark"}`}>
                          {info.label}
                        </p>
                        <p className="text-xs text-flash-gray-text">{info.country}</p>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Numéro */}
              <div className="mb-6">
                <label className="label">Numéro Mobile Money</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+229 97 123 456"
                  className="input-field"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={back} className="btn-secondary flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <button
                  onClick={() => {
                    if (!provider || !phone) {
                      toast.error("Sélectionnez un opérateur et entrez votre numéro");
                      return;
                    }
                    next();
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 : Auto-convert */}
          {step === "auto-convert" && (
            <div className="card">
              <div className="w-14 h-14 bg-flash-blue-50 rounded-2xl flex items-center justify-center mb-5">
                <RefreshCw className="w-7 h-7 text-flash-blue" />
              </div>
              <h2 className="text-xl font-bold text-flash-dark mb-1">Conversion automatique</h2>
              <p className="text-flash-gray-text text-sm mb-6">
                Chaque fois que vous recevez des satoshis, Flash peut les convertir automatiquement en FCFA.
              </p>

              {/* Toggle */}
              <div className="flex items-center justify-between bg-flash-gray rounded-2xl p-4 mb-5">
                <div>
                  <p className="font-semibold text-flash-dark text-sm">Conversion automatique</p>
                  <p className="text-xs text-flash-gray-text">Convertir mes sats en FCFA à la réception</p>
                </div>
                <button
                  onClick={() => setAutoConvert(!autoConvert)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${autoConvert ? "bg-flash-blue" : "bg-gray-300"
                    }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${autoConvert ? "translate-x-6" : "translate-x-0.5"
                    }`} />
                </button>
              </div>

              {/* Slider */}
              {autoConvert && (
                <div className="mb-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Pourcentage à convertir</label>
                    <span className="text-flash-blue font-bold text-lg">{convertPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={10}
                    value={convertPercent}
                    onChange={(e) => setConvertPercent(Number(e.target.value))}
                    className="w-full accent-flash-blue"
                  />
                  <div className="flex justify-between text-xs text-flash-gray-text mt-1">
                    <span>10%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>

                  <div className="bg-flash-blue-50 border border-flash-blue-100 rounded-2xl p-3 mt-4 text-sm text-flash-blue">
                    <strong>{convertPercent}%</strong> de vos satoshis reçus seront convertis en FCFA sur{" "}
                    <strong>{provider ? MOBILE_MONEY_PROVIDERS[provider as MobileMoneyProvider].label : "votre Mobile Money"}</strong>.
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={back} className="btn-secondary flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <button onClick={next} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 : Lightning Address */}
          {step === "lightning-address" && (
            <div className="card text-center">
              <div className="w-14 h-14 relative rounded-2xl overflow-hidden shadow-sm mx-auto mb-5">
                <Image
                  src="/images/logo.jpg"
                  alt="Flash Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-flash-dark mb-1">Votre Lightning Address</h2>
              <p className="text-flash-gray-text text-sm mb-6">
                C&apos;est votre adresse pour recevoir du Bitcoin. Partagez-la comme une adresse email.
              </p>

              <div className="bg-flash-gray border-2 border-flash-blue rounded-2xl p-4 mb-2 font-mono text-flash-blue font-semibold text-lg break-all">
                {lightningAddress}
              </div>
              <p className="text-xs text-flash-gray-text mb-6">
                Cette adresse restera toujours accessible depuis votre portefeuille.
              </p>

              <div className="bg-flash-blue-50 rounded-2xl p-4 text-left mb-6 space-y-2">
                {[
                  "Fonctionne comme une adresse email Bitcoin",
                  "Compatible avec tous les wallets Lightning",
                  "Conversion automatique active dès le premier paiement reçu",
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-flash-success flex-shrink-0 mt-0.5" />
                    <span className="text-flash-dark">{t}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={back} className="btn-secondary flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <button onClick={next} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Terminer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 : Done */}
          {step === "done" && (
            <div className="card text-center">
              <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-flash-success" />
              </div>
              <h2 className="text-2xl font-bold text-flash-dark mb-3">Tout est prêt !</h2>
              <p className="text-flash-gray-text mb-8">
                Votre wallet Flash est configuré. Partagez votre Lightning Address et commencez à recevoir du Bitcoin converti automatiquement en FCFA.
              </p>

              <div className="bg-flash-gray rounded-2xl p-4 mb-8 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-flash-gray-text">Opérateur</span>
                  <span className="font-semibold text-flash-dark">
                    {provider ? MOBILE_MONEY_PROVIDERS[provider as MobileMoneyProvider].label : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-flash-gray-text">Numéro</span>
                  <span className="font-semibold text-flash-dark">{phone || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-flash-gray-text">Conversion auto</span>
                  <span className={`font-semibold ${autoConvert ? "text-flash-success" : "text-flash-gray-text"}`}>
                    {autoConvert ? `${convertPercent}% activée` : "Désactivée"}
                  </span>
                </div>
              </div>

              <button onClick={finish} className="btn-primary w-full flex items-center justify-center gap-2 text-base">
                Accéder à mon wallet <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
