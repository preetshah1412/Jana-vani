import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, CalendarDays, ExternalLink, FileCheck2, MapPin, ShieldCheck, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoCard, InfoShell } from "@/components/InfoShell";

const officialLinks = [
  {
    title: "Election dates and notices",
    description: "Check the ECI’s latest election notices, schedules, constituencies and candidate information.",
    href: "https://www.eci.gov.in/election-management",
    label: "Open ECI election management",
    icon: <CalendarDays className="h-5 w-5" />,
    tone: "saffron" as const,
  },
  {
    title: "Election results",
    description: "See results published by the ECI. Jana Vani doesn’t publish or calculate official results.",
    href: "https://results.eci.gov.in/",
    label: "Open ECI results",
    icon: <FileCheck2 className="h-5 w-5" />,
    tone: "green" as const,
  },
  {
    title: "Find your voter and polling details",
    description: "Use official voter services to look up your electoral roll entry, constituency and polling details.",
    href: "https://electoralsearch.eci.gov.in/",
    label: "Search the official electoral roll",
    icon: <MapPin className="h-5 w-5" />,
    tone: "navy" as const,
  },
  {
    title: "ECI voter services",
    description: "Visit the ECI portal to register, request a correction, track an application or use other voter services.",
    href: "https://voters.eci.gov.in/",
    label: "Open ECI Voters’ Service Portal",
    icon: <ShieldCheck className="h-5 w-5" />,
    tone: "saffron" as const,
  },
  {
    title: "Panchayat and municipal elections",
    description: "Your State Election Commission handles these local public elections. Find its website through the Government of India directory.",
    href: "https://www.india.gov.in/directory/web-directory/apex-bodies",
    label: "Find a State Election Commission",
    icon: <Vote className="h-5 w-5" />,
    tone: "green" as const,
  },
];

const practiceTemplates = [
  { id: "parliament", title: "Lok Sabha-style constituency", place: "Fictional parliamentary constituency", detail: "Try a sample parliamentary ballot with made-up options." },
  { id: "assembly", title: "State Assembly-style constituency", place: "Fictional state and constituency", detail: "Practice a sample state Assembly ballot." },
  { id: "panchayat", title: "Gram Panchayat ward", place: "Fictional village ward", detail: "Practice a sample local-government ballot." },
];

export default function IndiaElections() {
  const navigate = useNavigate();
  const [starting, setStarting] = useState("");
  const [startError, setStartError] = useState("");

  const startPractice = async (template: string) => {
    setStarting(template);
    setStartError("");
    try {
      const response = await fetch(`/api/demo-elections/${template}`, { method: "POST" });
      const data = await response.json();
      if (response.status === 401) {
        navigate(`/auth?next=${encodeURIComponent("/india-elections")}`);
        return;
      }
      if (!response.ok) throw new Error(data.message || "We couldn’t start the practice poll. Please try again.");
      navigate(`/ballot/${data.election.id}`);
    } catch (error) {
      setStartError(error instanceof Error ? error.message : "We couldn’t start the practice poll. Please try again.");
    } finally {
      setStarting("");
    }
  };

  return (
    <InfoShell eyebrow="Official election links" title="Looking for election information?" description="Use these official websites for voter services, schedules and results. Jana Vani is a community poll demo and doesn’t manage public elections.">
      <section className="mb-7 rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-bold text-[#76501f]">For a public election, follow the instructions from the Election Commission responsible for it.</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Jana Vani can’t accept or count votes in Lok Sabha, Rajya Sabha, Assembly, Panchayat or Municipal elections. The ECI provides guidance on voting at your assigned polling station. Don’t enter your voter ID, Aadhaar number or one-time password here.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="https://www.eci.gov.in/faq/en/how-to-vote/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4">ECI: How to vote <ExternalLink className="h-3.5 w-3.5" /></a>
          <a href="https://www.eci.gov.in/evm-vvpat" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4">ECI: EVM and VVPAT <ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4"><p className="text-xs font-bold uppercase tracking-wider text-[#18864b]">Made-up examples</p><h2 className="mt-1 text-xl font-bold">Try a practice poll</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Start a fictional practice poll to explore the demo. The places and choices are made up. You’ll confirm your response with Google Authenticator and receive a private receipt. No real election or candidate is shown.</p></div>
        {startError && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{startError}</div>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {practiceTemplates.map((item) => <InfoCard key={item.id} icon={<Vote className="h-5 w-5" />} title={item.title} tone="navy">
            <p className="font-semibold text-foreground">{item.place}</p><p className="mt-1">{item.detail}</p>
            <Button className="mt-4 w-full" variant="secure" disabled={Boolean(starting)} onClick={() => void startPractice(item.id)}>{starting === item.id ? "Preparing practice ballot…" : "Start practice ballot"}</Button>
          </InfoCard>)}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {officialLinks.map((item) => (
          <InfoCard key={item.title} icon={item.icon} title={item.title} tone={item.tone}>
            <p>{item.description}</p>
            <a href={item.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 font-semibold text-primary underline underline-offset-4">
              {item.label} <ArrowUpRight className="h-4 w-4" />
            </a>
          </InfoCard>
        ))}
      </div>

      <section className="mt-7 rounded-2xl border border-border/70 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#edf1f7] text-primary"><ShieldCheck className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold">Explore community polls and the security demo</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">You can create or join non-binding community polls. Authenticator secrets are encrypted on this server, and SHA-256 commitments are recorded in its local hash chain. This is a technical demo—not an official ballot system, public blockchain or independent check of election results.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild><Link to="/dashboard">See community polls</Link></Button>
              <Button asChild variant="outline"><Link to="/security">How security works</Link></Button>
            </div>
          </div>
        </div>
      </section>
    </InfoShell>
  );
}
