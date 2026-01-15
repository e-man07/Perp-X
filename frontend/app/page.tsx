import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowRight, TrendingUp, Shield, Zap, Target, Clock, BarChart2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 pt-24 pb-20 md:pt-32 md:pb-28 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-gray-300">Live on Arbitrum Sepolia</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
              Trade the{" "}
              <span className="text-gradient">Outcome</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto animate-slide-up delay-100">
              Leveraged prediction markets with forced expiry. No funding rates. Pure outcome-based trading.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
              <Link href="/trade">
                <Button size="xl" className="group">
                  Start Trading
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/markets">
                <Button size="xl" variant="outline">
                  View Markets
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500 animate-fade-in delay-300">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Self-Custody</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Instant Settlement</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Pyth Oracle</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative border-y border-gray-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="stat-value text-white group-hover:text-glow transition-all">3</div>
              <div className="stat-label mt-2">Active Markets</div>
            </div>
            <div className="text-center group">
              <div className="stat-value text-white group-hover:text-glow transition-all">40x</div>
              <div className="stat-label mt-2">Max Leverage</div>
            </div>
            <div className="text-center group">
              <div className="stat-value text-white group-hover:text-glow transition-all">$100K</div>
              <div className="stat-label mt-2">Treasury Pool</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why <span className="text-gradient">perpX</span>?
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A new paradigm in leveraged trading. Clean settlement, transparent mechanics, and gamified rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card variant="gradient" hoverable className="group">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Forced Expiry</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400">
              Markets expire after 24h, 7d, or 30d. Clean settlement like prediction markets, without perpetual funding rates.
            </CardContent>
          </Card>

          <Card variant="gradient" hoverable className="group">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Early Exit</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400">
              Close positions anytime before expiry with dynamic fees (0.5% → 0.1%). Capital efficient trading with instant settlement.
            </CardContent>
          </Card>

          <Card variant="gradient" hoverable className="group">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                <BarChart2 className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Treasury Model</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400">
              Self-balancing profit/loss pool. Losers fund winners. Protocol earns fees on early exits. No counterparty risk.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-24 border-t border-gray-800/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Simple mechanics, transparent execution. Get started in minutes.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Deposit Collateral",
                description: "Connect your wallet and deposit USDC as collateral. Your funds remain in your control.",
              },
              {
                step: "02",
                title: "Choose Your Position",
                description: "Select a market, pick your leverage (up to 40x), and go long or short on the price outcome.",
              },
              {
                step: "03",
                title: "Wait or Exit",
                description: "Hold until expiry for automatic settlement, or close early to lock in profits/cut losses.",
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start group">
                <div className="flex-shrink-0">
                  <div className="h-14 w-14 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center font-mono text-lg font-bold text-gray-500 group-hover:text-white group-hover:border-gray-700 transition-all">
                    {item.step}
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card variant="elevated" className="max-w-3xl mx-auto text-center p-12 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Trade?
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Connect your wallet and start trading BTC, ETH, and MON markets with up to 40x leverage.
            </p>
            <Link href="/trade">
              <Button size="xl" className="group">
                Launch Terminal
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/perpx-logo.png"
                alt="perpX"
                width={120}
                height={35}
                className="h-8 w-auto"
              />
            </Link>
            <div className="text-sm text-gray-500 text-center md:text-right">
              Built on Arbitrum Sepolia · Powered by Pyth Oracle
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
