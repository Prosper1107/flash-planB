"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, UploadCloud, CheckCircle, ShieldAlert, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/client";

import { useSettingsStore } from "@/lib/stores/settingsStore";

export default function KYCPage() {
  const { user } = useAuth();
  const { kycData, setKycData } = useSettingsStore();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  // Fusionner statut API + Local
  const status = kycData.status !== "unverified" 
    ? kycData.status 
    : (user?.kyc_status === "APPROVED" ? "verified" : (user?.kyc_status === "PENDING" ? "pending" : "unverified"));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Appel API simulé
      const res = await authApi.uploadKyc(formData);
      
      if (res.success) {
        // Sauvegarde locale
        setKycData({
          status: "pending",
          fileName: file.name,
          submittedAt: new Date().toISOString(),
        });
        toast.success("Document envoyé ! En attente de validation (Simulé).");
      } else {
        toast.error(res.message || "Erreur lors de l'envoi");
      }
    } catch (error: any) {
      toast.error("Une erreur est survenue lors de l'upload");
    } finally {
      setUploading(false);
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
          <h1 className="page-title">KYC & Vérification</h1>
          <p className="text-muted mt-1">Augmentez vos plafonds de transaction</p>
        </div>
      </div>

      {/* KYC Status Card */}
      <div className="card text-center py-8 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-flash-blue/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {status === "verified" ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-4 shadow-sm ring-8 ring-green-50">
              <Shield className="w-10 h-10" />
            </div>
          ) : status === "pending" ? (
             <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-4 shadow-sm ring-8 ring-yellow-50">
               <ShieldAlert className="w-10 h-10" />
             </div>
          ) : (
            <div className="w-20 h-20 bg-flash-blue-50 rounded-full flex items-center justify-center text-flash-blue mb-4 shadow-sm ring-8 ring-flash-blue/10">
              <Shield className="w-10 h-10" />
            </div>
          )}

          <h2 className="text-2xl font-bold text-flash-dark">
            {status === "verified" ? "Vérifié (Niveau 1)" : status === "pending" ? "Vérification en cours" : "Non Vérifié (Niveau 0)"}
          </h2>
          
          <p className="text-sm text-flash-gray-text mt-2 max-w-sm mx-auto">
            {status === "verified" 
              ? "Votre identité est vérifiée. Vous bénéficiez de plafonds illimités sur vos transactions Lightning."
              : status === "pending"
              ? "Vos documents sont en cours de révision par notre équipe de conformité (habituellement 24h)."
              : "Vérifiez votre identité pour débloquer les achats et ventes de volume supérieur à 100,000 FCFA."}
          </p>
        </div>
      </div>

      {/* Upload Zone (Only if unverified) */}
      {status === "unverified" && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-flash-dark">Envoyer une pièce d'identité</h3>
          <p className="text-xs text-flash-gray-text">
            Formats acceptés: JPG, PNG, PDF (Max 5MB). Carte Nationale, Passeport ou Permis de conduire.
          </p>

          <label 
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              file ? "border-flash-blue bg-flash-blue-50" : "border-flash-gray-border hover:border-flash-blue"
            }`}
          >
            <input 
              type="file" 
              className="hidden" 
              accept="image/*,.pdf" 
              onChange={handleFileChange} 
            />
            
            {file ? (
              <>
                <CheckCircle className="w-8 h-8 text-flash-success mb-2" />
                <p className="font-medium text-flash-dark">{file.name}</p>
                <p className="text-xs text-flash-gray-text mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB - Cliquez pour modifier
                </p>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-flash-blue mb-2" />
                <p className="font-medium text-flash-dark">Cliquez ou glissez un fichier</p>
                <p className="text-xs text-flash-gray-text mt-1">Photo claire, sans reflets</p>
              </>
            )}
          </label>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {uploading ? (
               <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : "Soumettre pour vérification"}
          </button>
        </div>
      )}

      {/* Tiers Information */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-flash-dark border-b border-flash-gray-border pb-3">
          Vos Avantages et Plafonds
        </h3>
        
        <div className="space-y-3">
          {/* Tier 0 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl border border-flash-gray-border bg-white">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-1 ${
              status === "unverified" ? "bg-flash-blue text-white" : "bg-flash-gray text-flash-gray-text"
            }`}>
              0
            </div>
            <div className="flex-1">
              <p className="font-semibold text-flash-dark text-sm">Niveau 0 (Email uniquement)</p>
              <ul className="text-xs text-flash-gray-text mt-1 space-y-1 list-disc list-inside">
                <li>Réception Lightning Limitée</li>
                <li>Pas de vente auto-convert vers Mobile Money</li>
              </ul>
            </div>
          </div>

          {/* Tier 1 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl border border-flash-gray-border bg-white">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-1 ${
              status === "verified" ? "bg-green-500 text-white" : "bg-flash-gray text-flash-gray-text"
            }`}>
              1
            </div>
            <div className="flex-1">
              <p className="font-semibold text-flash-dark text-sm">Niveau 1 (Preuve d'identité)</p>
              <ul className="text-xs text-flash-gray-text mt-1 space-y-1 list-disc list-inside">
                <li>Vente auto-convert activée</li>
                <li>Achat de satoshis via Mobile Money</li>
                <li>Retraits vers Mobile Money (Plafond 1,000,000 FCFA/mois)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
