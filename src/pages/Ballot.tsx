import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Copy, LockKeyhole, ShieldCheck, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatIndiaDateTime } from "@/lib/indiaDate";
import { SiteFooter } from "@/components/SiteFooter";

interface Option { id: string; name: string; party: string; description: string }
interface Poll { id: string; title: string; description: string; status: string; candidates: Option[]; isDemoElection?: boolean }
interface Receipt { receiptId: string; electionId: string; electionTitle: string; candidateId: string; candidate: string; nonce: string; commitment: string; blockIndex: number; blockHash: string; recordedAt: string }

const Ballot = () => {
  const { electionId = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selected, setSelected] = useState("");
  const [code, setCode] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [showPrivateSelection, setShowPrivateSelection] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receiptCheck, setReceiptCheck] = useState("");
  const [ledgerCheck, setLedgerCheck] = useState("");

  useEffect(() => {
    fetch(`/api/elections/${electionId}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "We couldn’t open this poll. Please try again.");
      setPoll(data.election);
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "We couldn’t open this poll. Please try again."));
  }, [electionId]);

  const submitVote = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/votes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ electionId, candidateId: selected, code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "We couldn’t record your response. Please try again.");
      setReceipt(data.receipt);
      toast({ title: "Response recorded", description: "Your private receipt is ready." });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn’t record your response. Please try again.");
    } finally { setBusy(false); }
  };

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast({ title: "Copied", description: "The receipt code is on your clipboard." });
  };

  const saveReceipt = () => {
    if (!receipt) return;
    const file = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = `jana-vani-private-receipt-${receipt.receiptId}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const verifyPrivateReceipt = async () => {
    if (!receipt) return;
    const payload = new TextEncoder().encode(`${receipt.electionId}|${receipt.candidateId}|${receipt.nonce}`);
    const digest = await crypto.subtle.digest("SHA-256", payload);
    const calculated = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const verified = calculated === receipt.commitment;
    setReceiptCheck(verified ? "Your choice and private code match this receipt." : "This receipt doesn’t match the choice and code saved with it.");
  };

  const verifyLedgerEntry = async () => {
    if (!receipt) return;
    try {
      const response = await fetch(`/api/receipts/${receipt.commitment}`);
      const data = await response.json();
      setLedgerCheck(data.verified ? "This code is in the demo ledger, and the recorded links check out." : data.message || "We couldn’t confirm this code in the demo ledger.");
    } catch { setLedgerCheck("We couldn’t reach the demo ledger. Please try again in a moment."); }
  };

  if (error && !poll && !receipt) return <main className="mx-auto max-w-2xl p-6"><Card><CardContent className="p-8 text-center"><p className="mb-5 text-muted-foreground">{error}</p><Button onClick={() => navigate("/dashboard")}>Back to polls</Button></CardContent></Card></main>;
  if (!poll && !receipt) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading community poll…</div>;

  return <div className="min-h-screen bg-[#f7f8fa]">
    <header className="border-b bg-white"><div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft className="h-4 w-4"/> Back to polls</Link>
      <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-emerald-800"><LockKeyhole className="h-4 w-4"/><span className="sm:hidden">Authenticator</span><span className="hidden sm:inline">Confirm with Google Authenticator</span></div>
    </div></header>
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:py-12">
      {receipt ? <>
        <Card className="overflow-hidden border-emerald-200 shadow-sm"><div className="h-1.5 bg-emerald-600"/><CardHeader className="text-center">
          <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle className="h-8 w-8"/></div>
          <CardTitle className="text-2xl">Your response is recorded</CardTitle><CardDescription>{receipt.electionTitle} · {formatIndiaDateTime(receipt.recordedAt)} IST</CardDescription>
        </CardHeader><CardContent className="space-y-5">
          <div className="rounded-xl border bg-slate-50 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your choice</div>{showPrivateSelection ? <><div className="mt-1 text-xl font-bold">{receipt.candidate}</div><p className="mt-2 text-xs text-muted-foreground">Anyone who can see this screen or your full receipt can see your choice.</p></> : <><div className="mt-1 text-xl font-bold">Hidden for now</div><p className="mt-2 text-xs text-muted-foreground">We’re hiding your choice on this screen. This doesn’t make the poll an official or fully anonymous election.</p><Button variant="outline" size="sm" className="mt-3" onClick={() => setShowPrivateSelection(true)}>Show my choice</Button></>}</div>
          <div className="space-y-2"><div className="flex items-center justify-between text-sm font-semibold"><span>Receipt commitment</span><button type="button" onClick={() => copy(receipt.commitment)} className="inline-flex items-center gap-1 text-primary"><Copy className="h-3.5 w-3.5"/>Copy code</button></div><code className="block break-all rounded-lg bg-slate-950 p-4 text-xs leading-6 text-emerald-200">{receipt.commitment}</code></div>
          <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Entry in the demo ledger</div><div className="mt-1 font-semibold">Block #{receipt.blockIndex}</div></div><div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Receipt reference</div><div className="mt-1 break-all font-mono text-xs">{receipt.receiptId}</div></div></div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Keep your receipt private.</strong> The full receipt includes your choice and a random secret. Anyone with the file can see your choice. The ledger check only checks this server’s record; it isn’t an independent audit of the poll results.</div>
          <div className="flex flex-col gap-3 sm:flex-row"><Button className="flex-1" onClick={saveReceipt}>Download full private receipt</Button>{showPrivateSelection && <Button variant="outline" className="flex-1" onClick={() => setShowPrivateSelection(false)}>Hide my choice</Button>}</div>
          {showPrivateSelection && <><Button variant="outline" className="w-full" onClick={verifyPrivateReceipt}>Check my receipt</Button>{receiptCheck && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{receiptCheck}</p>}</>}
          <Button variant="outline" className="w-full" onClick={verifyLedgerEntry}>Check this code in the demo ledger</Button>
          {ledgerCheck && <p role="status" className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{ledgerCheck}</p>}
          <Button variant="ghost" className="w-full" onClick={() => navigate("/dashboard")}>Back to polls</Button>
        </CardContent></Card>
        <p className="text-center text-xs leading-5 text-muted-foreground">This demo uses a hash chain stored on this server. It isn’t a public blockchain or official election verification.</p>
      </> : <>
        <div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800"><Vote className="h-3.5 w-3.5"/> {poll?.isDemoElection ? "FICTIONAL PRACTICE POLL" : "COMMUNITY POLL DEMO"}</div><h1 className="text-3xl font-bold tracking-tight">{poll?.title}</h1><p className="mt-2 text-muted-foreground">{poll?.description || "Choose an option, then confirm your response with your authenticator app."}</p></div>
        <Card><CardHeader><CardTitle>{reviewing ? "Review your response" : "Choose one option"}</CardTitle><CardDescription>{reviewing ? "Check your choice before sending it. Once recorded, you can’t change this response." : "You’ll get a chance to review your choice before it is recorded. This demo can’t guarantee ballot secrecy or run an official election."}</CardDescription></CardHeader><CardContent>{!reviewing ? <><RadioGroup value={selected} onValueChange={(value) => { setSelected(value); setReviewing(false); }} className="space-y-3">
          {poll?.candidates.map((option) => <Label key={option.id} htmlFor={option.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${selected === option.id ? "border-emerald-600 bg-emerald-50/60" : "hover:border-slate-400"}`}><RadioGroupItem id={option.id} value={option.id} className="mt-1"/><span className="min-w-0 break-words"><span className="block font-semibold">{option.name}</span>{option.description && <span className="mt-1 block text-sm text-muted-foreground">{option.description}</span>}</span></Label>)}
        </RadioGroup>
        {selected && <div className="mt-6 border-t pt-5"><label htmlFor="totp" className="mb-2 block text-sm font-semibold">Confirm with Google Authenticator</label><p className="mb-3 text-sm text-muted-foreground">Enter a current six-digit code that you haven’t used to sign in. Codes change every 30 seconds. The code isn’t saved in the ledger.</p><input id="totp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className="h-12 w-full max-w-xs rounded-lg border bg-white px-4 text-center font-mono text-xl tracking-[0.35em] outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"/></div>}
        </> : <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5"><div><p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Your selection</p><p className="mt-1 break-words text-xl font-bold">{poll?.candidates.find((option) => option.id === selected)?.name}</p><p className="mt-2 text-sm text-muted-foreground">Your authenticator code has been entered. It will be checked when you confirm.</p></div><div className="flex flex-col gap-3 sm:flex-row"><Button variant="outline" className="flex-1" onClick={() => setReviewing(false)}>Change my choice</Button><Button className="flex-1" disabled={busy || poll?.status !== "active"} onClick={() => void submitVote()}>{busy ? "Recording your response…" : "Confirm and record response"}</Button></div></div>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="mt-6 flex items-start gap-3 rounded-lg border bg-slate-50 p-4 text-sm leading-6 text-muted-foreground"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"/><span>{poll?.isDemoElection ? "This is a fictional practice poll, not a real election." : "This is a non-binding poll for a community group."} It won’t submit an official Indian ballot. Don’t enter your voter ID, Aadhaar number or other real identity details. <a href="https://voters.eci.gov.in/" target="_blank" rel="noreferrer" className="font-semibold text-primary underline underline-offset-4">Visit ECI voter services</a>.</span></div>
        {!reviewing && <Button className="mt-5 w-full" size="lg" disabled={!selected || code.length !== 6 || busy || poll?.status !== "active"} onClick={() => setReviewing(true)}>Review my response</Button>}
        </CardContent></Card>
      </>}
    </main>
    <SiteFooter />
  </div>;
};

export default Ballot;
