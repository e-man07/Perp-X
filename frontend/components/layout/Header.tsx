'use client'

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-white" />
            <span className="text-xl font-bold">Perp-X</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/trade" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Trade
            </Link>
            <Link href="/markets" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Markets
            </Link>
            <Link href="/portfolio" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Portfolio
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <appkit-button />
        </div>
      </div>
    </header>
  );
}
