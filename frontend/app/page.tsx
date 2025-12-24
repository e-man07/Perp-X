import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Trade the{" "}
            <span className="text-gray-400">Outcome</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Leveraged prediction markets with forced expiry. No funding rates. Pure outcome-based trading on Monad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trade">
              <Button size="lg" className="group">
                Start Trading
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/markets">
              <Button size="lg" variant="secondary">
                Explore Markets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16 border-y border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">3</div>
            <div className="text-muted-foreground">Active Markets</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">40x</div>
            <div className="text-muted-foreground">Max Leverage</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">$100K</div>
            <div className="text-muted-foreground">Treasury Pool</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Perp-X?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 mb-4" />
              <CardTitle>Forced Expiry</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Markets expire after 24h, 7d, or 30d. Clean settlement like prediction markets, without perpetual funding rates.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 mb-4" />
              <CardTitle>Early Exit</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Close positions anytime before expiry with dynamic fees (0.5% → 0.1%). Capital efficient trading with instant settlement.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 mb-4" />
              <CardTitle>Treasury Model</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Self-balancing profit/loss pool. Losers fund winners. Protocol earns fees on early exits. No counterparty risk.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center bg-secondary rounded-lg p-12 border border-border">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Trade?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Connect your wallet and start trading BTC, ETH, and MON markets with up to 40x leverage.
          </p>
          <Link href="/trade">
            <Button size="lg">
              Launch App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built on Monad Testnet · Powered by Pyth Oracle</p>
        </div>
      </footer>
    </div>
  );
}
