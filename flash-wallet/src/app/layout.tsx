import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Flash Wallet - Wallet Bitcoin & Convertisseur FCFA",
  description:
    "Gérez vos satoshis et convertissez-les instantanément en FCFA via Mobile Money. Flash - le wallet intelligent et moyen de conversion pour l'Afrique de l'Ouest.",
  keywords: [
    "Bitcoin",
    "Lightning Network",
    "Mobile Money",
    "MTN MoMo",
    "Moov Money",
    "Bénin",
    "Togo",
    "Côte d'Ivoire",
    "Flash",
    "Wallet",
    "FCFA",
    "Satoshis",
  ],
  authors: [{ name: "Flash Wallet" }],
  openGraph: {
    title: "Flash Wallet",
    description:
      "Bitcoin Lightning & Mobile Money pour l'Afrique de l'Ouest francophone",
    type: "website",
  },
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1B4FE8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-poppins antialiased">
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: "Poppins, sans-serif",
                borderRadius: "16px",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: "500",
              },
              success: {
                style: {
                  background: "#ECFDF5",
                  color: "#065F46",
                  border: "1px solid #A7F3D0",
                },
              },
              error: {
                style: {
                  background: "#FEF2F2",
                  color: "#991B1B",
                  border: "1px solid #FECACA",
                },
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
