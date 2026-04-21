"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Zap, Wallet, ArrowLeftRight, Settings,
  LogOut, Menu, X, Bell, Send
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const NAV = [
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Déconnecté");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-flash-gray font-poppins flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-flash-gray-border fixed h-full z-30">
        <div className="p-6 border-b border-flash-gray-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 relative rounded-xl overflow-hidden shadow-sm">
              <Image 
                src="/images/logo.jpg" 
                alt="Flash Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <span className="text-xl font-bold text-flash-blue uppercase tracking-tight">Flash</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
                  active
                    ? "bg-flash-blue text-white shadow-flash"
                    : "text-flash-gray-text hover:bg-flash-gray hover:text-flash-dark"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-flash-gray-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-flash-gray-text hover:bg-red-50 hover:text-flash-danger w-full transition-all"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col transform transition-transform duration-300 lg:hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-6 flex items-center justify-between border-b border-flash-gray-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 relative rounded-xl overflow-hidden shadow-sm">
              <Image 
                src="/images/logo.jpg" 
                alt="Flash Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <span className="text-xl font-bold text-flash-blue uppercase tracking-tight">Flash</span>
          </div>
          <button onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-flash-gray-text" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
                  active
                    ? "bg-flash-blue text-white shadow-flash"
                    : "text-flash-gray-text hover:bg-flash-gray hover:text-flash-dark"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-flash-gray-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-flash-gray-text hover:bg-red-50 hover:text-flash-danger w-full"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar mobile */}
        <header className="lg:hidden bg-white border-b border-flash-gray-border px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-flash-dark" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 relative rounded-lg overflow-hidden shadow-sm">
              <Image 
                src="/images/logo.jpg" 
                alt="Flash Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <span className="font-bold text-flash-blue uppercase tracking-tight">Flash</span>
          </div>
          <button className="relative">
            <Bell className="w-5 h-5 text-flash-gray-text" />
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
