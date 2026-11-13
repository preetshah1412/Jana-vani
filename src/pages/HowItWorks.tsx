import { Link } from "react-router-dom";
import { ArrowRight, Fingerprint, Smartphone, Vote, ChartNoAxesColumnIncreasing, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoCard, InfoShell } from "@/components/InfoShell";

const steps = [
  { title: "Choose a demo code", text: "Use DEMO000001 or make up another code that starts with DEMO. Please don’t use your voter ID, Aadhaar number or phone number.", icon: <Fingerprint className="h-5 w-5" />, tone: "saffron" as const },
  { title: "Connect your authenticator app", text: "The first time you sign in, scan the QR code with Google Authenticator and enter the six-digit code it gives you.", icon: <Smartphone className="h-5 w-5" />, tone: "navy" as const },
  { title: "Start or join a community poll", text: "Ask your group a question and add choices, or join a poll that’s already open.", icon: <Vote className="h-5 w-5" />, tone: "green" as const },
  { title: "Confirm your response", text: "Enter a fresh authenticator code to record your choice. The receipt hides it at first, but the full saved receipt includes your choice and a secret. Keep that file private.", icon: <ChartNoAxesColumnIncreasing className="h-5 w-5" />, tone: "saffron" as const },
];

export default function HowItWorks() {
  return (
    <InfoShell eyebrow="Getting started" title="How to use the demo" description="Here’s how to set up your authenticator, take part in a community poll and check your receipt.">
      <div className="grid gap-4 md:grid-cols-2">
        {steps.map((step, index) => (
          <InfoCard key={step.title} icon={step.icon} title={`${String(index + 1).padStart(2, "0")} · ${step.title}`} tone={step.tone}>
            {step.text}
          </InfoCard>
        ))}
      </div>
      <div className="mt-7 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#dce9df] bg-[#f2f8f3] p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-start gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-[#18864b]" /><div><h2 className="font-bold text-foreground">A note about this demo</h2><p className="mt-1 text-sm text-muted-foreground">The hash chain runs on this server. Jana Vani doesn’t check voter eligibility or cast official election ballots.</p></div></div>
        <Button asChild variant="outline" className="shrink-0 rounded-xl border-[#bcd7c3] bg-white"><Link to="/security">See how security works <ArrowRight className="h-4 w-4" /></Link></Button>
      </div>
    </InfoShell>
  );
}
