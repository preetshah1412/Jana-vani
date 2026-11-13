import { Link } from "react-router-dom";
import { ArrowRight, HelpCircle, KeyRound, RotateCcw, Smartphone } from "lucide-react";
import { InfoCard, InfoShell } from "@/components/InfoShell";

const questions = [
  { q: "What demo code should I use?", a: "Use DEMO000001, or make up a 10-character code that starts with DEMO. Don’t enter your voter ID, Aadhaar number, phone number or other real personal details." },
  { q: "How do I set up Google Authenticator?", a: "Enter your demo code, scan the QR code in Google Authenticator, then enter the six-digit code shown in the app. That confirms your setup." },
  { q: "Why didn’t my code work?", a: "Authenticator codes change every 30 seconds, and each code can only be used once. If you just used one to sign in, wait for the next code before confirming your poll response. Check that your phone’s time is set automatically. Too many incorrect tries will temporarily lock sign-in." },
  { q: "Can I make a poll for my group?", a: "Yes. You can make a non-binding poll for a society or RWA, student council, club, association, NGO or community group. Jana Vani doesn’t check group membership, so don’t use it for official, legally binding or sensitive decisions." },
  { q: "Can Jana Vani run an official Indian election?", a: "No. Jana Vani is an independent demo and isn’t authorised by the Election Commission of India or a State Election Commission. For official voter services and election information, use the ECI or your State Election Commission’s website." },
  { q: "What does my receipt hash tell me?", a: "It lets you check whether a receipt commitment appears in this demo’s local hash chain and whether the chain links are intact on this server. It doesn’t independently verify the poll results. Your full receipt includes your choice and a secret, so keep it private." },
  { q: "Will Jana Vani send me an SMS or Aadhaar OTP?", a: "No. This demo uses Google Authenticator. It doesn’t collect Aadhaar or phone numbers, and it doesn’t send SMS. Please don’t enter real identity details here." },
  { q: "What if I restart the app or lose my phone?", a: "If the app’s data and encryption key are kept, your authenticator setup and session information remain after a restart. You’ll be signed out after eight hours or when you sign out yourself. There’s no way to recover a lost authenticator entry, so keep access to the app you set up." },
];

export default function Help() {
  return (
    <InfoShell eyebrow="Help" title="Need a hand?" description="Find quick answers about demo codes, Google Authenticator and community polls.">
      <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <InfoCard icon={<Smartphone className="h-5 w-5" />} title="Your authenticator app" tone="saffron">Google Authenticator creates codes on your phone. You don’t need SMS, a phone number or an internet connection to generate them.</InfoCard>
          <InfoCard icon={<KeyRound className="h-5 w-5" />} title="Your demo code" tone="navy">Try DEMO000001. It’s made up and doesn’t check your identity or connect to the voter register.</InfoCard>
        </div>
        <section className="rounded-2xl border border-border/70 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-2 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf5ed] text-[#18864b]"><HelpCircle className="h-5 w-5" /></div><h2 className="text-lg font-bold">Common questions</h2></div>
          <div className="divide-y divide-border/70">
            {questions.map((item) => <details key={item.q} className="group py-4"><summary className="cursor-pointer list-none pr-6 text-sm font-bold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">{item.q}<span className="float-right text-[#bd6415] transition group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.a}</p></details>)}
          </div>
        </section>
      </div>
      <div className="mt-7 flex flex-col items-start justify-between gap-4 rounded-2xl bg-primary p-5 text-white sm:flex-row sm:items-center sm:p-6">
        <div><h2 className="font-bold">Want to try the demo?</h2><p className="mt-1 text-sm text-white/75">Start with the made-up code DEMO000001. For official voter services, visit the ECI portal.</p></div>
        <div className="flex flex-wrap gap-2"><Link to="/auth" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#f4a44f] px-4 text-sm font-bold text-[#202a38] transition hover:bg-[#f6b56e]">Try the demo <ArrowRight className="h-4 w-4" /></Link><a href="https://voters.eci.gov.in/" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-xl border border-white/40 px-4 text-sm font-semibold text-white hover:bg-white/10">Visit ECI voter services</a></div>
      </div>
      <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><RotateCcw className="h-3.5 w-3.5" />Want to know what the demo does and doesn’t protect? <Link to="/security" className="font-semibold text-primary underline underline-offset-4">Read about security</Link>.</p>
    </InfoShell>
  );
}
