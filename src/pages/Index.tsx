import { Link, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { ArrowRight, Check, ShieldCheck, Smartphone, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/BrandLockup";
import { MobileInfoNav } from "@/components/MobileInfoNav";
import { SiteFooter } from "@/components/SiteFooter";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <div className="h-1 tricolor-rule" />
      <header className="civic-header relative z-10 border-b backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Brand />
          <div className="flex items-center gap-3">
            <nav aria-label="Main navigation" className="civic-nav hidden items-center gap-5 text-sm font-semibold lg:flex">
              <Link className="transition hover:text-primary" to="/about">About</Link>
              <Link className="transition hover:text-primary" to="/how-it-works">How it works</Link>
              <Link className="transition hover:text-primary" to="/india-elections">India elections</Link>
              <Link className="transition hover:text-primary" to="/security">Security</Link>
              <Link className="transition hover:text-primary" to="/help">Help</Link>
            </nav>
            <span className="hidden rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/85 sm:inline-flex">
              DEMO PORTAL
            </span>
            <Button variant="ghost" className="font-semibold text-white hover:bg-white/10 hover:text-white" onClick={() => navigate("/auth")}>
              Sign in <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
        <MobileInfoNav />
      </header>

      <main>
        <section className="relative">
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-20">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e8d6be] bg-white/80 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#18864b]" />
                Community poll demo · Not affiliated with the ECI
              </div>
              <h1 className="max-w-2xl text-[clamp(2.25rem,8vw,3rem)] font-bold leading-[1.06] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-[4.5rem]">
                Bring your community’s <span className="relative inline-block text-[#bd6415]">voice<span className="absolute -bottom-1 left-0 h-2 w-full rounded-full bg-[#f4c38d]/70" /></span> together.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Create a simple, non-binding poll for your society, student council, club or community group. Try the demo, confirm a response with Google Authenticator and keep a private receipt.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button variant="secure" size="lg" className="h-12 rounded-xl px-6 text-[15px] font-bold" onClick={() => navigate("/auth")}>
                  <Vote className="h-5 w-5" />
                  Enter the demo
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-xl border-border bg-white px-6 text-[15px]">
                  <Link to="/how-it-works">
                  See how it works <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#18864b]" /> No SMS required</span>
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#18864b]" /> Free authenticator app</span>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">Looking for official voter services? <Link className="font-semibold text-primary underline underline-offset-4" to="/india-elections">Go to the official election links</Link>.</p>
            </div>

            <div className="relative mx-auto w-full max-w-[34rem]">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#f3a453]/20 via-transparent to-[#18864b]/10 blur-xl" />
              <div className="relative overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
                <div className="tricolor-rule absolute inset-x-0 top-0 h-1" />
                <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-5 pt-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Getting started</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight">How it works</h2>
                  </div>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#fff3e5] text-[#bd6415]">
                    <Vote className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-3 py-5">
                  <JourneyStep number="01" icon={<Smartphone className="h-4 w-4" />} title="Set up your sign-in" text="Scan the QR code once, then use the six-digit code from your authenticator app." color="saffron" />
                  <JourneyStep number="02" icon={<Vote className="h-4 w-4" />} title="Start or join a poll" text="Create your own question and choices, or take part in an open community poll." color="navy" />
                  <JourneyStep number="03" icon={<ShieldCheck className="h-4 w-4" />} title="Confirm and check your receipt" text="Confirm with your authenticator, then check that your receipt appears in the demo ledger." color="green" last />
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-[#f8f6f1] p-4">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#18864b] shadow-sm"><ShieldCheck className="h-4 w-4" /></div>
                  <p className="text-xs leading-5 text-muted-foreground">For community poll demonstrations. <span className="font-semibold text-foreground">Not an official election service.</span></p>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-4 hidden rounded-2xl border border-white bg-white px-4 py-3 shadow-lg sm:flex sm:items-center sm:gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[#eaf5ed] text-[#18864b]"><Check className="h-4 w-4" /></div>
                <div><p className="text-xs font-bold text-foreground">Built for clarity</p><p className="text-[11px] text-muted-foreground">Simple at every step</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/70 bg-white/70">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:grid-cols-3 sm:px-8">
            <Feature title="No SMS needed" text="Your authenticator app creates codes on your phone, even when you’re offline." icon={<Smartphone className="h-5 w-5" />} />
            <Feature title="Clear steps" text="Each screen guides you through one part of the process." icon={<Check className="h-5 w-5" />} />
            <Feature title="Clear about the limits" text="We explain what your receipt and this demo’s hash chain can—and can’t—show." icon={<ShieldCheck className="h-5 w-5" />} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

function Brand() {
  return <BrandLockup />;
}

function JourneyStep({ number, icon, title, text, color, last = false }: { number: string; icon: ReactNode; title: string; text: string; color: "saffron" | "navy" | "green"; last?: boolean }) {
  const palette = {
    saffron: "bg-[#fff3e5] text-[#bd6415]",
    navy: "bg-[#edf1f7] text-primary",
    green: "bg-[#eaf5ed] text-[#18864b]",
  };
  return (
    <div className="relative flex gap-4 rounded-xl p-3 transition-colors hover:bg-[#faf9f6]">
      {!last && <span className="absolute bottom-[-0.9rem] left-[2.05rem] top-[3.6rem] w-px bg-border" />}
      <div className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${palette[color]}`}>{icon}</div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-foreground">{title}</h3><span className="text-[10px] font-bold tracking-wider text-muted-foreground/70">{number}</span></div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function Feature({ title, text, icon }: { title: string; text: string; icon: ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f6efe4] text-[#bd6415]">{icon}</div>
      <div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div>
    </div>
  );
}

export default Index;
