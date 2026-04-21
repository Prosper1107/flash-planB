"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Zap, Mail, RefreshCw } from "lucide-react";
import { authApi } from "@/lib/api/client";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();

  const userId = params.get("user_id") || "";
  const email = params.get("email") || "";
  const encodedPwd = params.get("p") || "";
  const password = encodedPwd ? atob(decodeURIComponent(encodedPwd)) : "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  // Focus le premier input au montage
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      refs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) return toast.error("Entrez les 6 chiffres du code");

    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp({ user_id: userId, code });

      if (res.success) {
        toast.success("Email vérifié avec succès !");

        // Si on a le mot de passe, on fait un auto-login direct
        if (email && password) {
          try {
            await login(email, password);
            toast.success("Connexion automatique réussie !");
            router.push("/onboarding");
            return;
          } catch {
            // Si l'auto-login échoue, on redirige vers le login classique
          }
        }

        // Fallback : redirige vers la page login
        router.push("/auth/login");
      } else {
        toast.error(res.message || "Code incorrect");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || "Code invalide ou expiré");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authApi.regenerateOtp(email);
      toast.success("Nouveau code envoyé !");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-flash-gray font-poppins flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-flash-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-flash-blue" />
          </div>
          <h1 className="text-2xl font-bold text-flash-dark">
            Vérification email
          </h1>
          <p className="text-flash-gray-text text-sm mt-2 max-w-xs mx-auto">
            Un code à 6 chiffres a été envoyé à{" "}
            <span className="font-semibold text-flash-dark">
              {email || "votre email"}
            </span>
          </p>
        </div>

        <div className="card">
          {/* OTP inputs */}
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-2xl border-2 transition-all duration-200 focus:outline-none font-poppins
                  ${
                    digit
                      ? "border-flash-blue bg-flash-blue-50 text-flash-blue"
                      : "border-flash-gray-border bg-flash-gray text-flash-dark"
                  } focus:border-flash-blue focus:bg-flash-blue-50`}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={isLoading || otp.join("").length < 6}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Vérifier mon email"
            )}
          </button>

          <div className="text-center mt-4">
            {countdown > 0 ? (
              <p className="text-sm text-flash-gray-text">
                Renvoyer dans{" "}
                <span className="font-semibold text-flash-blue">
                  {countdown}s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-sm text-flash-blue font-semibold hover:underline flex items-center gap-1 mx-auto"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`}
                />
                Renvoyer le code
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-7 h-7 relative rounded-lg overflow-hidden shadow-sm">
            <Image 
              src="/images/logo.jpg" 
              alt="Flash Logo" 
              fill 
              className="object-cover"
            />
          </div>
          <span className="font-bold text-flash-blue text-sm uppercase tracking-tight">
            Flash Wallet
          </span>
        </div>
      </div>
    </div>
  );
}
