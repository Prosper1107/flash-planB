"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Eye, EyeOff, ArrowLeft, ArrowRight, ChevronDown, Check } from "lucide-react";
import { authApi } from "@/lib/api/client";
import { SUPPORTED_COUNTRIES } from "@/types";
import toast from "react-hot-toast";

const schema = z
  .object({
    name: z.string().min(2, "Nom trop court"),
    email: z.string().email("Email invalide"),
    whatsapp: z.string().min(8, "Numéro WhatsApp invalide"),
    country: z.enum(["BJ", "TG", "CI"]),
    password: z.string().min(8, "Minimum 8 caractères"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirmation"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ 
    resolver: zodResolver(schema),
    defaultValues: { country: undefined } 
  });

  const countryValue = watch("country");
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCountry = SUPPORTED_COUNTRIES.find(c => c.code === countryValue);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      if (res.success && res.data?.user) {
        toast.success("Compte créé ! Vérifiez votre email.");
        // On passe le mot de passe encodé pour l'auto-login après vérification OTP
        const encodedPwd = btoa(data.password);
        router.push(
          `/auth/verify-otp?user_id=${res.data.user.id}&email=${encodeURIComponent(data.email)}&p=${encodeURIComponent(encodedPwd)}`
        );
      } else {
        toast.error(res.message || "Erreur lors de l'inscription");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || "Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-flash-gray font-poppins flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 text-flash-gray-text hover:text-flash-blue transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <div className="w-14 h-14 relative rounded-2xl overflow-hidden shadow-sm mx-auto mb-4">
            <Image 
              src="/images/logo.jpg" 
              alt="Flash Logo" 
              fill 
              className="object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-flash-dark">Créer un compte</h1>
          <p className="text-flash-gray-text text-sm mt-1">Rejoignez <span className="text-flash-blue font-semibold">Flash</span> en quelques secondes</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nom */}
            <div>
              <label className="label">Nom complet</label>
              <input {...register("name")} placeholder="Jean Dupont" className="input-field" />
              {errors.name && <p className="text-flash-danger text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email</label>
              <input {...register("email")} type="email" placeholder="jean@exemple.com" className="input-field" />
              {errors.email && <p className="text-flash-danger text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* WhatsApp */}
            <div>
              <label className="label">Numéro WhatsApp</label>
              <input {...register("whatsapp")} placeholder="+22997123456" className="input-field" />
              {errors.whatsapp && <p className="text-flash-danger text-xs mt-1">{errors.whatsapp.message}</p>}
            </div>

            {/* Pays */}
            <div>
              <label className="label">Pays</label>
              <div className="relative" ref={countryRef}>
                <button
                  type="button"
                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                  className={`w-full bg-flash-gray border rounded-2xl px-4 py-3 flex items-center justify-between transition-all duration-200 ${
                    isCountryOpen ? "border-flash-blue ring-2 ring-flash-blue-100" : "border-flash-gray-border"
                  }`}
                >
                  <span className={selectedCountry ? "text-flash-dark" : "text-flash-gray-text"}>
                    {selectedCountry ? (
                      <span className="flex items-center gap-2">
                        <span>{selectedCountry.flag}</span>
                        <span>{selectedCountry.name}</span>
                      </span>
                    ) : (
                      "Sélectionner un pays"
                    )}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-flash-gray-text transition-transform duration-200 ${isCountryOpen ? "rotate-180 text-flash-blue" : ""}`} />
                </button>

                {isCountryOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-flash-gray-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1">
                      {SUPPORTED_COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setValue("country", c.code as any);
                            setIsCountryOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
                            countryValue === c.code 
                              ? "bg-flash-blue-50 text-flash-blue font-semibold" 
                              : "text-flash-dark hover:bg-flash-gray"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-lg">{c.flag}</span>
                            <span>{c.name}</span>
                          </span>
                          {countryValue === c.code && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Champ caché pour la validation react-hook-form */}
                <input type="hidden" {...register("country")} />
              </div>
              {errors.country && <p className="text-flash-danger text-xs mt-1">{errors.country.message}</p>}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPwd ? "text" : "password"}
                  placeholder="Min. 8 caractères"
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-flash-gray-text hover:text-flash-blue"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-flash-danger text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirmation */}
            <div>
              <label className="label">Confirmer le mot de passe</label>
              <input
                {...register("password_confirmation")}
                type={showPwd ? "text" : "password"}
                placeholder="Répéter le mot de passe"
                className="input-field"
              />
              {errors.password_confirmation && (
                <p className="text-flash-danger text-xs mt-1">{errors.password_confirmation.message}</p>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Créer mon compte <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-flash-gray-text mt-6">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-flash-blue font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
