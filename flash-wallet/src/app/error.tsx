"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-flash-gray font-poppins flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-flash-danger" />
        </div>
        <h2 className="text-xl font-bold text-flash-dark mb-3">Une erreur est survenue</h2>
        <p className="text-flash-gray-text text-sm mb-8">
          {error.message || "Quelque chose s'est mal passé. Réessayez."}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Réessayer
          </button>
          <Link href="/" className="btn-secondary">
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
