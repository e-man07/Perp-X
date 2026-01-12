'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Activity, BarChart3, Briefcase, Menu, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Trade", href: "/trade", icon: Activity },
  { name: "Markets", href: "/markets", icon: BarChart3 },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient line at top */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="glass border-b border-gray-800/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Logo mark */}
              <div className="relative">
                <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center group-hover:shadow-glow-md transition-shadow duration-300">
                  <span className="text-black font-bold text-lg">P</span>
                </div>
                {/* Animated pulse */}
                <div className="absolute -top-0.5 -right-0.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                  </span>
                </div>
              </div>
              {/* Logo text */}
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight">PERP-X</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider -mt-0.5">Trading Terminal</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Network indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/50 border border-gray-800">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-mono text-gray-400">Arbitrum Sepolia</span>
            </div>

            {/* Wallet connect */}
            <appkit-button />

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800/50">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                    {isActive && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-success" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
