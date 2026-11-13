import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ArrowRight, Check, Copy, Fingerprint, ShieldCheck, Smartphone, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/BrandLockup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooter } from "@/components/SiteFooter";

type AuthStage = "identify" | "setup" | "verify";

const Auth = () => {
  const [stage, setStage] = useState<AuthStage>("identify");
  const [demoCode, setDemoCode] = useState("");
  const [code, setCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const handleContinue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedDemoCode = demoCode.trim().toUpperCase();
    if (!/^DEMO[A-Z0-9]{6}$/.test(normalizedDemoCode)) {
      toast({ title: "Check your demo code", description: "It should start with DEMO and end with six made-up letters or numbers. Don’t use your voter ID or Aadhaar number.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoCode: normalizedDemoCode }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "We couldn’t start authenticator setup. Please try again.");

      setDemoCode(normalizedDemoCode);
      if (data.enrolled) {
        setCode("");
        setStage("verify");
      } else {
        setQrCode(data.qrCode);
        setManualKey(data.manualKey || "");
        setStage("setup");
      }
    } catch (error) {
      toast({ title: "We couldn’t start sign-in", description: error instanceof Error ? error.message : "Please try again in a moment.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      toast({ title: "Enter all six digits", description: "Use the current code from your authenticator app.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoCode, code }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "That code didn’t work. Check the latest code in your app and try again.");

      toast({ title: "You’re signed in", description: "Taking you to your community polls." });
      navigate(searchParams.get("next") === "/india-elections" ? "/india-elections" : "/dashboard");
    } catch (error) {
      toast({ title: "That code didn’t work", description: error instanceof Error ? error.message : "Check the latest code in your app and try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStage("identify");
    setCode("");
    setQrCode("");
    setManualKey("");
  };

  const copyManualKey = async () => {
    try {
      await navigator.clipboard.writeText(manualKey);
      toast({ title: "Setup key copied", description: "Paste it into Google Authenticator as a time-based key." });
    } catch {
      toast({ title: "Copy unavailable", description: "Select and copy the setup key manually.", variant: "destructive" });
    }
  };

  const resetDemoAuthenticator = async () => {
    if (!window.confirm(`Replace the authenticator secret for ${demoCode}? Its current Google Authenticator entry will stop working. Demo poll history remains attached to this demo code.`)) return;
    setIsResetting(true);
    try {
      const response = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoCode }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "We couldn’t reset this demo authenticator. Please try again.");
      setCode("");
      setQrCode(data.qrCode);
      setManualKey(data.manualKey || "");
      setStage("setup");
      toast({ title: "Your new QR code is ready", description: "Scan it with Google Authenticator, then enter the six-digit code from the app." });
    } catch (error) {
      toast({ title: "We couldn’t reset the authenticator", description: error instanceof Error ? error.message : "Please try again in a moment.", variant: "destructive" });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="h-1 tricolor-rule" />
      <header className="civic-header border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <button className="flex min-w-0 items-center gap-3 text-left" onClick={() => navigate("/")}>
            <BrandLockup />
          </button>
          <button onClick={() => navigate("/")} className="civic-link inline-flex shrink-0 items-center gap-2 text-sm font-semibold transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to home</span>
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[calc(100vh-6rem)] lg:grid-cols-[1fr_0.86fr] lg:gap-20">
        <section className="order-2 max-w-xl lg:order-1">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8d6be] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#9d5517]">
            <span className="h-2 w-2 rounded-full bg-[#18864b]" /> Community poll demo
          </div>
          <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-5xl">
            Welcome to Jana Vani.<br /><span className="text-[#bd6415]">Let’s get you started.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
            Use a made-up demo code and an authenticator app to sign in. Please don’t enter your real voter ID, Aadhaar number or phone number.
          </p>
          <div className="mt-9 space-y-4">
          <InfoStep icon={<Fingerprint className="h-5 w-5" />} tone="saffron" title="Choose a demo code" text="Use a made-up 10-character code. You can make more than one, so this demo can’t confirm that each account belongs to a different person." />
            <InfoStep icon={<Smartphone className="h-5 w-5" />} tone="navy" title="Set up your authenticator" text="Scan the QR code with Google Authenticator the first time you sign in." />
            <InfoStep icon={<ShieldCheck className="h-5 w-5" />} tone="green" title="Enter your code" text="Use the six-digit code from your app to open your community poll dashboard." />
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#dce9df] bg-[#f2f8f3] p-4 text-sm leading-6 text-[#3c6549]">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Your authenticator app creates codes on your phone. No SMS is sent, and the app can generate codes offline.</p>
          </div>
        </section>

        <Card className="relative order-1 mx-auto w-full max-w-[30rem] overflow-hidden rounded-2xl border-border bg-white shadow-sm lg:order-2">
          <div className="tricolor-rule absolute inset-x-0 top-0 h-1" />
          <CardHeader className="px-6 pb-4 pt-8 sm:px-8">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff3e5] text-[#bd6415]">
                {stage === "identify" ? <Fingerprint className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
              </div>
              <span className="rounded-full bg-[#f6f4ef] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Demo sign-in</span>
            </div>
            {stage !== "identify" && (
              <button type="button" className="mb-1 inline-flex w-fit items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary" onClick={reset} disabled={isLoading}>
                <ArrowLeft className="h-3.5 w-3.5" /> Change demo code
              </button>
            )}
            <CardTitle className="text-2xl tracking-tight">
              {stage === "identify" ? "Sign in to the demo" : stage === "setup" ? "Set up your authenticator" : "Enter your authenticator code"}
            </CardTitle>
            <CardDescription className="mt-1 leading-6">
              {stage === "identify" ? "Choose a made-up 10-character code, or use the sample code below." : stage === "setup" ? "Scan this QR code with Google Authenticator, then enter the six-digit code shown in the app." : `Enter the current code from Google Authenticator for ${demoCode}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-7 sm:px-8">
            {stage === "verify" && <div role="status" className="mb-5 rounded-xl border border-[#e8d6be] bg-[#fff8ef] p-4 text-sm leading-6 text-[#765b3e]">This demo code already has an authenticator set up, so its QR code won’t appear again. Use the current code in the authenticator app you set up earlier. {import.meta.env.DEV ? "Lost access to that entry? You can reset this local demo authenticator below and scan a new QR code. Your poll history will stay." : "If you no longer have that entry, choose “Change demo code” and use a different made-up code to set up a new demo account."}</div>}
            {stage === "verify" && import.meta.env.DEV && <Button type="button" variant="outline" className="mb-5 w-full border-[#e8d6be]" onClick={() => void resetDemoAuthenticator()} disabled={isLoading || isResetting}>{isResetting ? "Getting a new QR code ready…" : "Reset this demo authenticator"}</Button>}
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-[#f7f5f1] p-1.5">
              <StagePill active={stage === "identify"} complete={stage !== "identify"} number="01" label="Demo code" />
              <StagePill active={stage !== "identify"} complete={false} number="02" label="Authenticator app" />
            </div>

            {stage === "identify" && (
              <form onSubmit={handleContinue} className="space-y-4">
                <label className="block space-y-2 text-sm font-semibold" htmlFor="demo-code">
                  Your made-up demo code
                  <input
                    id="demo-code" type="text" autoComplete="username" placeholder="DEMO000001" value={demoCode}
                    onChange={(event) => setDemoCode(event.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10))}
                    maxLength={10} className="h-12 w-full rounded-xl border border-input bg-white px-4 font-normal uppercase tracking-[0.08em] outline-none transition placeholder:normal-case placeholder:tracking-normal focus:border-[#d98a43] focus:ring-4 focus:ring-[#f3d6b7]/50"
                    disabled={isLoading} required
                  />
                </label>
                <button type="button" onClick={() => setDemoCode("DEMO000001")} className="-mt-1 text-xs font-semibold text-[#9d5517] underline decoration-[#e6b37f] underline-offset-4 hover:text-primary">
                  Use the sample code DEMO000001
                </button>
                <Button type="submit" variant="secure" className="h-12 w-full rounded-xl text-sm font-bold" disabled={isLoading}>
                  {isLoading ? "Getting things ready…" : "Continue"} {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>
            )}

            {stage === "setup" && (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="flex justify-center rounded-2xl border border-border/70 bg-[#faf9f6] p-3">
                  <img src={qrCode} alt="Authenticator setup QR code" className="h-52 w-52 rounded-lg" />
                </div>
                <div className="rounded-xl bg-[#f7f5f1] px-4 py-3 text-sm leading-5 text-muted-foreground">
                  Open Google Authenticator, tap <strong className="text-foreground">+</strong>, then scan this QR code.
                </div>
                {manualKey && <details className="rounded-xl border border-border/70 bg-white p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-primary">Can’t scan it? Set up the key manually</summary>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">In Google Authenticator, tap <strong>+</strong>, then <strong>Enter a setup key</strong>. Name the account <strong>Jana Vani {demoCode}</strong>, paste this key and choose <strong>Time based</strong>.</p>
                  <div className="mt-3 flex items-center gap-2"><code className="min-w-0 flex-1 break-all rounded-lg bg-[#f7f5f1] p-3 font-mono text-xs tracking-wider">{manualKey}</code><Button type="button" variant="outline" size="icon" aria-label="Copy setup key" onClick={() => void copyManualKey()}><Copy className="h-4 w-4" /></Button></div>
                  <p className="mt-2 text-xs text-amber-800">Keep this key private. Anyone who has it can generate your codes.</p>
                </details>}
                <CodeInput code={code} setCode={setCode} isLoading={isLoading} />
                <Button type="submit" variant="secure" className="h-12 w-full rounded-xl font-bold" disabled={isLoading}>
                  {isLoading ? "Checking your code…" : "Confirm setup"}
                </Button>
              </form>
            )}

            {stage === "verify" && (
              <form onSubmit={handleVerify} className="space-y-4">
                <CodeInput code={code} setCode={setCode} isLoading={isLoading} />
                <Button type="submit" variant="secure" className="h-12 w-full rounded-xl font-bold" disabled={isLoading}>
                  {isLoading ? "Checking code…" : "Sign in"} {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>
            )}

            <div className="mt-6 rounded-xl border border-[#edd7bd] bg-[#fff8ef] px-4 py-3 text-xs leading-5 text-[#765b3e]">
              <strong className="font-bold text-[#6e4a22]">This is only a community poll demo.</strong> Demo codes don’t confirm who you are, and one person can create multiple accounts. Don’t enter your voter ID, Aadhaar number or phone number. Jana Vani can’t check voter eligibility or submit an official ballot. <Link to="/india-elections" className="font-semibold underline">Find official election services</Link>. Your authenticator setup is encrypted on this server, but there’s no recovery if you lose access to it.
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
};

function InfoStep({ icon, tone, title, text }: { icon: ReactNode; tone: "saffron" | "navy" | "green"; title: string; text: string }) {
  const palette = { saffron: "bg-[#fff3e5] text-[#bd6415]", navy: "bg-[#edf1f7] text-primary", green: "bg-[#eaf5ed] text-[#18864b]" };
  return (
    <div className="flex items-start gap-4">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${palette[tone]}`}>{icon}</div>
      <div><h2 className="text-sm font-bold text-foreground">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div>
    </div>
  );
}

function StagePill({ active, complete, number, label }: { active: boolean; complete: boolean; number: string; label: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${active ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}>
      <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${complete ? "bg-[#eaf5ed] text-[#18864b]" : active ? "bg-[#fff0df] text-[#bd6415]" : "bg-white text-muted-foreground"}`}>
        {complete ? <Check className="h-3 w-3" /> : number}
      </span>
      {label}
    </div>
  );
}

function CodeInput({ code, setCode, isLoading }: { code: string; setCode: (value: string) => void; isLoading: boolean }) {
  return (
    <label className="block space-y-2 text-sm font-semibold" htmlFor="authenticator-code">
      Six-digit authenticator code
      <input
        id="authenticator-code" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="000 000" value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6}
        className="h-12 w-full rounded-xl border border-input bg-white px-4 text-center font-mono text-lg tracking-[0.45em] outline-none transition placeholder:tracking-[0.3em] focus:border-[#d98a43] focus:ring-4 focus:ring-[#f3d6b7]/50"
        disabled={isLoading} required
      />
      <span className="block text-xs font-normal text-muted-foreground">The code refreshes in your authenticator app every 30 seconds.</span>
    </label>
  );
}

export default Auth;
