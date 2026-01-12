import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";

export const metadata: Metadata = {
  title: "Perp-X | Leveraged Prediction Markets",
  description: "Trade outcome-based perpetuals with forced expiry on Arbitrum. Up to 40x leverage on BTC, ETH, and more.",
  keywords: ["crypto", "trading", "prediction markets", "perpetuals", "arbitrum", "defi"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <Web3Provider>
          <div className="relative min-h-screen bg-grid">
            {/* Subtle scan line effect */}
            <div className="scan-line" />
            {/* Content */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
