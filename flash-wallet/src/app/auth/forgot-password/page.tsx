"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { authApi } from "@/lib/api/client";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email("Email invalide"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await authApi.requestPasswordReset(data.email);
      setSent(true);
    } catch {
      toast.error("Erreur lors de l'envoi. Vérifiez votre email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-flash-gray font-poppins flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/auth/login" className="inline-flex items-center gap-2 mb-6 text-flash-gray-text hover:text-flash-blue transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Retour à la connexion
          </Link>
          <div className="w-14 h-14 bg-flash-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-flash-blue" />
          </div>
          <h1 className="text-2xl font-bold text-flash-dark">Mot de passe oublié</h1>
          <p className="text-flash-gray-text text-sm mt-1">
            {sent ? "Email envoyé !" : "Entrez votre email pour réinitialiser"}
          </p>
        </div>

        <div className="card">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-flash-success mx-auto mb-4" />
              <p className="text-flash-dark font-semibold mb-2">Email envoyé !</p>
              <p className="text-sm text-flash-gray-text mb-6">
                Un lien de réinitialisation a été envoyé à{" "}
                <span className="font-semibold text-flash-dark">{getValues("email")}</span>.
                Vérifiez votre boîte de réception.
              </p>
              <Link href="/auth/login" className="btn-primary inline-flex">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Adresse email</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="jean@exemple.com"
                  className="input-field"
                />
                {errors.email && (
                  <p className="text-flash-danger text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : "Envoyer le lien"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
