"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, MessageCircle, Mail, Zap, Smartphone, Save } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/client";

import { useSettingsStore } from "@/lib/stores/settingsStore";

export default function NotificationsPage() {
  const { notificationPrefs, setNotificationPrefs } = useSettingsStore();
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState(notificationPrefs);

  const toggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Appel API simulé
      const res = await authApi.updateNotifications(notifications);
      if (res.success) {
        // Sauvegarde locale
        setNotificationPrefs(notifications);
        toast.success("Préférences de notification enregistrées localement !");
      } else {
        toast.error(res.message || "Erreur lors de l'enregistrement");
      }
    } catch (error: any) {
      toast.error("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/settings"
          className="w-10 h-10 bg-flash-gray rounded-xl flex items-center justify-center text-flash-dark hover:bg-flash-gray-border transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-muted mt-1">Gérez comment Flash communique avec vous</p>
        </div>
      </div>

      {/* Canaux de communication */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-flash-dark border-b border-flash-gray-border pb-3">
          Canaux de communication
        </h3>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between p-3 hover:bg-flash-gray rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-flash-dark text-sm">Alertes Email</p>
                <p className="text-xs text-flash-gray-text">Reçus et bulletins de sécurité</p>
              </div>
            </div>
            <button
              onClick={() => toggle("email_alerts")}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-flash-blue/10 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-md transition duration-200 ease-in-out ${
                notifications.email_alerts ? "translate-x-5 bg-flash-blue" : "translate-x-0 bg-white"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-flash-gray rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 text-green-500 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-flash-dark text-sm">Alertes WhatsApp</p>
                <p className="text-xs text-flash-gray-text">Confirmation de conversion immédiate</p>
              </div>
            </div>
            <button
              onClick={() => toggle("whatsapp_alerts")}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-flash-blue/10 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-md transition duration-200 ease-in-out ${
                notifications.whatsapp_alerts ? "translate-x-5 bg-flash-blue" : "translate-x-0 bg-white"
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Types d'événements */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-flash-dark border-b border-flash-gray-border pb-3">
          Types d'événements
        </h3>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between p-3 hover:bg-flash-gray rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-flash-blue-50 text-flash-blue rounded-2xl flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-flash-dark text-sm">Réception Lightning</p>
                <p className="text-xs text-flash-gray-text">Quand quelqu'un paie votre facture</p>
              </div>
            </div>
            <button
              onClick={() => toggle("lightning_receipts")}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-flash-blue/10 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-md transition duration-200 ease-in-out ${
                notifications.lightning_receipts ? "translate-x-5 bg-flash-blue" : "translate-x-0 bg-white"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-flash-gray rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-flash-blue-50 text-flash-blue rounded-2xl flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-flash-dark text-sm">Conversion Mobile Money</p>
                <p className="text-xs text-flash-gray-text">Quand un dépôt FCFA est effectué</p>
              </div>
            </div>
            <button
              onClick={() => toggle("mobile_money_success")}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-flash-blue/10 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-md transition duration-200 ease-in-out ${
                notifications.mobile_money_success ? "translate-x-5 bg-flash-blue" : "translate-x-0 bg-white"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-flash-gray rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-flash-gray text-flash-gray-text rounded-2xl flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-flash-dark text-sm">Nouveautés & Offres</p>
                <p className="text-xs text-flash-gray-text">Actualités du réseau Flash</p>
              </div>
            </div>
            <button
              onClick={() => toggle("marketing")}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-flash-blue/10 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-md transition duration-200 ease-in-out ${
                notifications.marketing ? "translate-x-5 bg-flash-blue" : "translate-x-0 bg-white"
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
      >
        {saving ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Save className="w-5 h-5" /> Enregistrer les préférences
          </>
        )}
      </button>

    </div>
  );
}
