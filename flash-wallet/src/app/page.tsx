"use client";

import Link from "next/link";
import Image from "next/image";
import { Zap, ArrowRight, Shield, Smartphone, RefreshCw, Globe, Facebook, Linkedin } from "lucide-react";

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Wallet Lightning",
    desc: "Envoyez, recevez et gérez vos satoshis instantanément avec un wallet Lightning natif.",
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: "Conversion Flexible",
    desc: "Convertissez vos fonds en FCFA vers votre Mobile Money en un clic, à votre rythme.",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Multi-Opérateurs",
    desc: "Connectez vos comptes MTN MoMo, Moov Money, Celtiis ou Togocel en toute simplicité.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Sécurité Maximale",
    desc: "Vos fonds sont protégés par des standards de sécurité bancaire et une authentification forte.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Moyen de conversion n°1",
    desc: "La solution de référence pour le Bénin, le Togo et la Côte d'Ivoire.",
  },
];

const operators = ["MTN MoMo", "Moov Money", "Celtiis", "Togocel"];

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-poppins">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 relative rounded-xl overflow-hidden shadow-sm">
              <Image 
                src="/images/logo.jpg" 
                alt="Flash Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <span className="text-xl font-bold text-flash-blue uppercase tracking-tight">Flash</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-flash-gray-text hover:text-flash-blue font-medium text-sm transition-colors">
              Connexion
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm py-2 px-5">
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-flash-blue-50 text-flash-blue text-sm font-semibold px-4 py-2 rounded-full mb-8">
            <Zap className="w-4 h-4" />
            Bitcoin Lightning × Mobile Money
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-flash-dark leading-tight mb-6">
            Votre <span className="text-flash-blue">Wallet Bitcoin</span> intelligent & <span className="text-flash-blue">Convertisseur FCFA</span>
          </h1>
          <p className="text-xl text-flash-gray-text max-w-2xl mx-auto mb-10">
            Gérez vos satoshis en toute sécurité et transformez-les en Mobile Money en un éclair. La solution de conversion de référence pour l&apos;Afrique de l&apos;Ouest.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding" className="btn-primary flex items-center gap-2 text-base">
              Ouvrir mon wallet <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/login" className="btn-secondary text-base">
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Operators */}
      <section className="py-8 border-y border-flash-gray-border bg-flash-gray">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-flash-gray-text mb-4">Opérateurs supportés</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {operators.map((op) => (
              <span key={op} className="text-flash-dark font-semibold text-sm bg-white px-5 py-2 rounded-full shadow-card">
                {op}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-flash-dark text-center mb-3">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-flash-gray-text text-center mb-12">
            Une solution complète pour bridger Bitcoin et Mobile Money
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card hover:shadow-flash transition-all duration-300 group">
                <div className="w-12 h-12 bg-flash-blue-50 text-flash-blue rounded-2xl flex items-center justify-center mb-4 group-hover:bg-flash-blue group-hover:text-white transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-flash-dark mb-2">{f.title}</h3>
                <p className="text-sm text-flash-gray-text">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto gradient-bg rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Prêt à passer au niveau supérieur ?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Prenez le contrôle de vos crypto-actifs avec un wallet qui parle FCFA. Simple, rapide et sécurisé.
          </p>
          <Link href="/onboarding" className="bg-white text-flash-blue font-bold py-3 px-8 rounded-2xl hover:bg-flash-blue-50 transition-colors inline-flex items-center gap-2">
            Ouvrir mon wallet gratuit <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white border-t border-flash-gray-border">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 relative rounded-2xl overflow-hidden shadow-sm">
              <Image 
                src="/images/logo.jpg" 
                alt="Flash Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <span className="text-2xl font-bold text-flash-blue tracking-tight">Flash Wallet</span>
          </div>
          
          <p className="text-flash-gray-text text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Le wallet Bitcoin Lightning et moyen de conversion préféré des utilisateurs en Afrique de l&apos;Ouest.
          </p>

          <div className="flex items-center justify-center gap-8 mb-10">
            <a href="https://www.facebook.com/bitcoinflashxyz?locale=fr_FR" target="_blank" rel="noopener noreferrer" className="text-flash-gray-text hover:text-flash-blue transition-all duration-300 transform hover:scale-110">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/company/bitcoinflashxyz/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="text-flash-gray-text hover:text-flash-blue transition-all duration-300 transform hover:scale-110">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>

          <div className="pt-8 border-t border-flash-gray-border">
            <p className="text-[11px] text-flash-gray-text uppercase font-bold tracking-widest">
              © 2026 Flash Wallet • Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
