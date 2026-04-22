"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, MapPin, ArrowLeft, Save, CheckCircle, Edit2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/client";

import { useSettingsStore } from "@/lib/stores/settingsStore";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { profileUpdates, setProfileUpdates, kycData } = useSettingsStore();
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: profileUpdates.name || user?.name || "",
    email: user?.email || "",
    phone: profileUpdates.whatsapp || user?.whatsapp || "",
    address: profileUpdates.address || user?.address || "",
  });

  // Synchroniser les données
  useEffect(() => {
    setFormData({
      name: profileUpdates.name || user?.name || "",
      email: user?.email || "",
      phone: profileUpdates.whatsapp || user?.whatsapp || "",
      address: profileUpdates.address || user?.address || "",
    });
  }, [user, profileUpdates]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error("Le nom est obligatoire");
    
    setSaving(true);
    try {
      const res = await authApi.updateMe({
        name: formData.name,
        email: formData.email,
        whatsapp: formData.phone,
        address: formData.address || undefined,
      });

      if (res.success) {
        // Sauvegarde locale
        setProfileUpdates({
          name: formData.name,
          whatsapp: formData.phone,
          address: formData.address,
        });

        setIsEditing(false);
        toast.success("Profil mis à jour localement");
      } else {
        toast.error(res.message || "Erreur lors de la mise à jour");
      }
    } catch (error: any) {
      toast.error("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "N/A";

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
          <h1 className="page-title">Profil & Compte</h1>
          <p className="text-muted mt-1">Gérez vos informations personnelles</p>
        </div>
      </div>

      {/* Identité visuelle */}
      <div className="card flex flex-col items-center justify-center py-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-flash-blue/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        
        <div className="w-20 h-20 gradient-bg rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-flash-blue relative z-10">
          {formData.name?.charAt(0).toUpperCase() || "F"}
          {user?.is_active && (
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
            </div>
          )}
        </div>
        <h2 className="mt-4 text-xl font-bold text-flash-dark relative z-10">{formData.name || "Utilisateur"}</h2>
        <div className="flex flex-col items-center gap-1 mt-2 relative z-10">
          <span className="text-xs bg-flash-blue-50 text-flash-blue font-semibold px-3 py-1 rounded-full">
            {user?.tag || "flash"}@bitcoinflash.xyz
          </span>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[10px] text-flash-gray-text uppercase font-bold tracking-wider">
              {user?.kyc_tier?.name || "LEVEL 0"}
            </p>
            <span className="w-1 h-1 bg-flash-gray-border rounded-full" />
            <p className="text-[10px] text-flash-gray-text uppercase font-bold tracking-wider">
              Membre depuis {memberSince}
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="card space-y-5">
        <div className="flex items-center justify-between border-b border-flash-gray-border pb-3">
          <h3 className="font-semibold text-flash-dark">
            Informations de base
          </h3>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-flash-blue font-medium text-sm flex items-center gap-1 hover:underline"
            >
              <Edit2 className="w-4 h-4" /> Modifier
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="label flex items-center gap-2">
              <User className="w-4 h-4 text-flash-gray-text" /> Nom complet
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className={`input-field ${!isEditing ? "bg-flash-gray text-flash-gray-text opacity-70 cursor-not-allowed" : ""}`}
              placeholder="Ex: Prosper"
            />
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Mail className="w-4 h-4 text-flash-gray-text" /> Adresse Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className={`input-field ${!isEditing ? "bg-flash-gray text-flash-gray-text opacity-70 cursor-not-allowed" : ""}`}
              placeholder="prosper@planb.com"
            />
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Phone className="w-4 h-4 text-flash-gray-text" /> Numéro de Téléphone
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className={`input-field ${!isEditing ? "bg-flash-gray text-flash-gray-text opacity-70 cursor-not-allowed" : ""}`}
              placeholder="+229 97 000 000"
            />
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <MapPin className="w-4 h-4 text-flash-gray-text" /> Adresse Postale
            </label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              className={`input-field ${!isEditing ? "bg-flash-gray text-flash-gray-text opacity-70 cursor-not-allowed" : ""}`}
              placeholder="Cotonou, Bénin"
            />
          </div>
        </div>
      </div>

      {/* Save / Edit Buttons at the bottom */}
      {isEditing ? (
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 py-3 font-semibold text-flash-gray-text bg-flash-gray rounded-2xl hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.name}
            className="btn-primary flex-[2] flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" /> Sauvegarder les modifications
              </>
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-4 opacity-90"
        >
          <Edit2 className="w-5 h-5" /> Activer le mode édition
        </button>
      )}

      {/* Supprimer le compte */}
      <div className="mt-8 text-center pt-4">
        <button className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
          Demander la suppression du compte
        </button>
      </div>

    </div>
  );
}
