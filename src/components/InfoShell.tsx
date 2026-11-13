import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BrandLockup } from "@/components/BrandLockup";
import { MobileInfoNav } from "@/components/MobileInfoNav";
import { SiteFooter } from "@/components/SiteFooter";

export function InfoShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-1 tricolor-rule" />
      <header className="civic-header border-b backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <BrandLockup />
          </Link>
          <nav aria-label="Main navigation" className="civic-nav hidden items-center gap-6 text-sm font-semibold lg:flex">
            <Link className="transition hover:text-primary" to="/about">About</Link>
            <Link className="transition hover:text-primary" to="/how-it-works">How it works</Link>
            <Link className="transition hover:text-primary" to="/india-elections">India elections</Link>
            <Link className="transition hover:text-primary" to="/security">Security</Link>
            <Link className="transition hover:text-primary" to="/help">Help</Link>
          </nav>
          <Link to="/" className="civic-link inline-flex items-center gap-2 text-sm font-semibold transition hover:text-white lg:hidden"><ArrowLeft className="h-4 w-4" /> Home</Link>
        </div>
        <MobileInfoNav />
      </header>
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8d6be] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9d5517]"><span className="h-2 w-2 rounded-full bg-[#18864b]" />{eyebrow}</span>
          <h1 className="text-4xl font-bold tracking-[-0.04em] text-foreground sm:text-5xl">{title}</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
        </div>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function InfoCard({ icon, title, children, tone = "saffron" }: { icon: ReactNode; title: string; children: ReactNode; tone?: "saffron" | "green" | "navy" }) {
  const palette = { saffron: "bg-[#fff3e5] text-[#bd6415]", green: "bg-[#eaf5ed] text-[#18864b]", navy: "bg-[#edf1f7] text-primary" };
  return (
    <section className="rounded-2xl border border-border/70 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3"><div className={`grid h-10 w-10 place-items-center rounded-xl ${palette[tone]}`}>{icon}</div><h2 className="text-lg font-bold tracking-tight">{title}</h2></div>
      <div className="text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}
