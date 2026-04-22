import Link from "next/link";
import Image from "next/image";
import { Zap, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-flash-gray font-poppins flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 relative rounded-3xl overflow-hidden shadow-sm mx-auto mb-6">
          <Image 
            src="/images/logo.jpg" 
            alt="Flash Logo" 
            fill 
            className="object-cover"
          />
        </div>
        <h1 className="text-6xl font-bold text-flash-blue mb-2">404</h1>
        <h2 className="text-xl font-bold text-flash-dark mb-3">Page introuvable</h2>
        <p className="text-flash-gray-text mb-8">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
