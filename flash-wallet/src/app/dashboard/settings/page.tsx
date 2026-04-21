"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User, Bell, Shield, Smartphone, RefreshCw,
  Wifi, WifiOff, Zap, Save, CheckCircle
} from "lucide-react";
import { MobileMoneyProvider, MOBILE_MONEY_PROVIDERS } from "@/types";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useAuth } from "@/context/AuthContext";
import { lndApi } from "@/lib/api/client";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const {
    autoConvert, setAutoConvert,
    lndNode, setLndNode,
    lndConnected, setLndConnected,
  } = useSettingsStore();

  // Local state for LND config form
  const [lndHost, setLndHost] = useState(lndNode?.host || "127.0.0.1");
  const [lndPort, setLndPort] = useState(String(lndNode?.restPort || "8080"));
  const [lndMacaroon, setLndMacaroon] = useState(lndNode?.macaroon || "");
  const [testingLnd, setTestingLnd] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync from store on mount
  useEffect(() => {
    if (lndNode) {
      setLndHost(lndNode.host);
      setLndPort(String(lndNode.restPort));
      setLndMacaroon(lndNode.macaroon);
    }
  }, [lndNode]);

  // Synchroniser le numéro par défaut si vide
  useEffect(() => {
    if (user?.whatsapp && !autoConvert.mobile_money_number) {
      setAutoConvert({ mobile_money_number: user.whatsapp });
    }
  }, [user, autoConvert.mobile_money_number, setAutoConvert]);

  // Tester la connexion LND
  const testLndConnection = async () => {
    setTestingLnd(true);

    // Sauvegarder d'abord la config dans les cookies pour le proxy
    document.cookie = `flash_lnd_host=${lndHost};path=/`;
    document.cookie = `flash_lnd_port=${lndPort};path=/`;
    document.cookie = `flash_lnd_macaroon=${lndMacaroon};path=/`;

    try {
      const info = await lndApi.getInfo();
      if (info && !info.error) {
        setLndConnected(true);
        setLndNode({
          host: lndHost,
          restPort: Number(lndPort),
          macaroon: lndMacaroon,
        });
        toast.success(`Connecté ! Noeud: ${info.alias || info.identity_pubkey?.substring(0, 12) || "LND"}`);
      } else {
        setLndConnected(false);
        toast.error(info?.error || info?.hint || "Impossible de se connecter");
      }
    } catch {
      setLndConnected(false);
      toast.error("Connexion échouée. Vérifiez que Polar est lancé.");
    } finally {
      setTestingLnd(false);
    }
  };

  // Sauvegarder les paramètres
  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    toast.success("Paramètres sauvegardés !");
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Paramètres</h1>
        <p className="text-muted mt-1">Configurez votre wallet Flash</p>
      </div>

      {/* Profil */}
      {user && (
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-white text-xl font-bold">
              {user.name?.charAt(0).toUpperCase() || "F"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-flash-dark">{user.name}</p>
              <p className="text-sm text-flash-gray-text truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-flash-blue-50 text-flash-blue font-semibold px-2 py-0.5 rounded-full">
                  {user.tag}@bitcoinflash.xyz
                </span>
                {user.is_active && (
                  <span className="badge-success text-xs">Actif</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Noeud Lightning (Polar) ─── */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${lndConnected ? "bg-green-100 text-green-600" : "bg-flash-blue-50 text-flash-blue"
            }`}>
            {lndConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-flash-dark">Noeud Lightning (Polar)</h3>
            <p className="text-xs text-flash-gray-text">
              {lndConnected ? "Connecté et opérationnel" : "Non connecté - configurez votre noeud"}
            </p>
          </div>
          {lndConnected && (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          )}
        </div>

        <div>
          <label className="label">Adresse du noeud (Host)</label>
          <input
            value={lndHost}
            onChange={(e) => setLndHost(e.target.value)}
            placeholder="127.0.0.1"
            className="input-field"
          />
        </div>

        <div>
          <label className="label">Port REST</label>
          <input
            value={lndPort}
            onChange={(e) => setLndPort(e.target.value)}
            placeholder="8080"
            className="input-field"
          />
        </div>

        <div>
          <label className="label">Admin Macaroon (hex)</label>
          <textarea
            value={lndMacaroon}
            onChange={(e) => setLndMacaroon(e.target.value)}
            placeholder="Copiez le macaroon admin hex depuis Polar → Connect → HEX"
            rows={3}
            className="input-field resize-none font-mono text-xs"
          />
          <p className="text-xs text-flash-gray-text mt-1">
            Dans Polar : clic droit sur le noeud → Connect → HEX (Admin Macaroon)
          </p>
        </div>

        <button
          onClick={testLndConnection}
          disabled={testingLnd || !lndMacaroon}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {testingLnd ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Zap className="w-4 h-4" /> Tester la connexion
            </>
          )}
        </button>
      </div>

      {/* ─── Mobile Money ─── */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-flash-blue-50 text-flash-blue rounded-2xl flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-flash-dark">Mobile Money</h3>
            <p className="text-xs text-flash-gray-text">Compte de réception FCFA</p>
          </div>
        </div>

        <div>
          <label className="label">Opérateur</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.entries(MOBILE_MONEY_PROVIDERS) as [MobileMoneyProvider, typeof MOBILE_MONEY_PROVIDERS[MobileMoneyProvider]][]).map(
              ([key, info]) => (
                <button
                  key={key}
                  onClick={() => setAutoConvert({ mobile_money_provider: key })}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${autoConvert.mobile_money_provider === key
                      ? "border-flash-blue bg-flash-blue-50 text-flash-blue"
                      : "border-flash-gray-border bg-flash-gray text-flash-gray-text"
                    }`}
                >
                  <p className="font-semibold text-sm">{info.icon} {info.label}</p>
                  <p className="text-xs opacity-70">{info.country}</p>
                </button>
              )
            )}
          </div>
        </div>

        <div>
          <label className="label">Numéro de téléphone</label>
          <input
            value={autoConvert.mobile_money_number}
            onChange={(e) => setAutoConvert({ mobile_money_number: e.target.value })}
            className="input-field"
            placeholder="+229 97 000 000"
          />
        </div>
      </div>

      {/* ─── Auto-convert ─── */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-flash-blue-50 text-flash-blue rounded-2xl flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-flash-dark">Conversion automatique</h3>
            <p className="text-xs text-flash-gray-text">Sats → FCFA à la réception</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-flash-gray rounded-2xl p-4">
          <div>
            <p className="font-medium text-flash-dark text-sm">Activer la conversion auto</p>
            <p className="text-xs text-flash-gray-text">Convertit vos sats dès réception</p>
          </div>
          <button
            onClick={() => setAutoConvert({ enabled: !autoConvert.enabled })}
            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-flash-blue/10 transition-colors duration-200 ease-in-out focus:outline-none"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-md transition duration-200 ease-in-out ${autoConvert.enabled
                  ? "translate-x-5 bg-flash-blue"
                  : "translate-x-0 bg-white"
                }`}
            />
          </button>
        </div>

        {autoConvert.enabled && (
          <div className="animate-fade-in">
            <div className="flex justify-between mb-2">
              <label className="label mb-0">Pourcentage à convertir</label>
              <span className="text-flash-blue font-bold text-lg">{autoConvert.percentage}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={10}
              value={autoConvert.percentage}
              onChange={(e) => setAutoConvert({ percentage: Number(e.target.value) })}
              className="w-full accent-flash-blue"
            />
            <div className="flex justify-between text-xs text-flash-gray-text mt-1">
              <span>10%</span>
              <span>50%</span>
              <span>100%</span>
            </div>

            {autoConvert.mobile_money_number && (
              <div className="bg-flash-blue-50 border border-flash-blue-100 rounded-2xl p-3 mt-4 text-sm text-flash-blue">
                <strong>{autoConvert.percentage}%</strong> de vos satoshis reçus seront convertis en FCFA sur{" "}
                <strong>{MOBILE_MONEY_PROVIDERS[autoConvert.mobile_money_provider]?.label}</strong> ({autoConvert.mobile_money_number}).
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Autres sections ─── */}
      <div className="card divide-y divide-flash-gray-border p-0 overflow-hidden">
        {[
          { icon: <User className="w-5 h-5" />, label: "Profil & Compte", desc: "Modifier vos informations personnelles", href: "/dashboard/settings/profile" },
          { icon: <Shield className="w-5 h-5" />, label: "KYC & Vérification", desc: `Niveau: ${user?.kyc_tier?.name || "LEVEL 0"}`, href: "/dashboard/settings/kyc" },
          { icon: <Bell className="w-5 h-5" />, label: "Notifications", desc: "Gérer les alertes WhatsApp & email", href: "/dashboard/settings/notifications" },
        ].map(({ icon, label, desc, href }, i) => (
          <Link
            href={href}
            key={i}
            className="flex items-center gap-4 p-4 w-full hover:bg-flash-gray transition-colors text-left"
          >
            <div className="w-10 h-10 bg-flash-blue-50 text-flash-blue rounded-2xl flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-flash-dark text-sm">{label}</p>
              <p className="text-xs text-flash-gray-text">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {saving ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Save className="w-4 h-4" /> Sauvegarder les paramètres
          </>
        )}
      </button>
    </div>
  );
}
