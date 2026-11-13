import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Hash, Search, Shield, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooter } from "@/components/SiteFooter";

interface VerificationResult {
  verified: boolean;
  commitment: string;
  blockIndex?: number;
  blockHash?: string;
  message: string;
}

export default function Verify() {
  const navigate = useNavigate();
  const [commitment, setCommitment] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    const value = commitment.trim().replace(/^0x/i, "");
    if (!/^[a-f0-9]{64}$/i.test(value)) {
      setError("Please enter the 64-character code from your receipt.");
      setResult(null);
      return;
    }
    setIsVerifying(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(`/api/receipts/${value}`);
      const data = await response.json();
      setResult({
        verified: Boolean(data.verified), commitment: data.commitment || value,
        blockIndex: data.blockIndex, blockHash: data.blockHash,
        message: data.message || "We couldn’t find that code in the demo ledger.",
      });
    } catch {
      setError("We couldn’t reach the receipt checker. Please try again in a moment.");
    } finally { setIsVerifying(false); }
  };

  return <div className="min-h-screen bg-[#f7f8fa]">
    <header className="border-b bg-white"><div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4">
      <Button variant="ghost" className="shrink-0 px-2 sm:px-4" onClick={() => navigate("/dashboard")}><ArrowLeft className="mr-1 h-4 w-4 sm:mr-2"/><span className="sm:hidden">Back</span><span className="hidden sm:inline">Back to polls</span></Button>
      <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted-foreground"><Shield className="h-4 w-4 text-emerald-700"/><span className="sm:hidden">Receipt check</span><span className="hidden sm:inline">Demo receipt checker</span></div>
    </div></header>
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:py-12">
      <div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"><Hash className="h-3.5 w-3.5"/> Check your receipt</div><h1 className="text-3xl font-bold tracking-tight">Look up your receipt code</h1><p className="mt-2 leading-6 text-muted-foreground">Enter the code from your receipt to see whether it’s in this demo’s ledger and whether the recorded links check out.</p></div>
      <Card><CardHeader><CardTitle>Receipt code</CardTitle><CardDescription>This check won’t show which choice you made.</CardDescription></CardHeader><CardContent className="space-y-4">
        <div className="space-y-2"><Label htmlFor="commitment">64-character code</Label><Input id="commitment" value={commitment} onChange={(event) => { setCommitment(event.target.value); setError(""); }} onKeyDown={(event) => { if (event.key === "Enter") void handleVerify(); }} placeholder="Paste the code from your receipt" className="h-12 font-mono text-sm" /></div>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Button className="w-full" size="lg" onClick={() => void handleVerify()} disabled={isVerifying}>{isVerifying ? "Looking it up…" : <><Search className="mr-2 h-4 w-4"/> Check my code</>}</Button>
      </CardContent></Card>
      {result && <Card className={result.verified ? "border-emerald-200" : "border-amber-200"}><CardHeader><CardTitle className="flex items-center gap-2">{result.verified ? <CheckCircle className="h-5 w-5 text-emerald-700"/> : <XCircle className="h-5 w-5 text-amber-700"/>}{result.verified ? "Receipt code found" : "We couldn’t verify this code"}</CardTitle><CardDescription>{result.message}</CardDescription></CardHeader><CardContent className="space-y-4">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your receipt code</p><code className="block break-all rounded-lg bg-slate-950 p-4 text-xs leading-6 text-emerald-200">{result.commitment}</code></div>
        {result.verified && <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Ledger entry</p><p className="mt-1 font-semibold">#{result.blockIndex}</p></div><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Hash for this entry</p><code className="mt-1 block break-all text-xs">{result.blockHash}</code></div></div>}
      </CardContent></Card>}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>A note about this demo:</strong> The hash chain is stored on this server; it isn’t a public blockchain. A successful check means the code is present and the links in this server’s record are intact. It doesn’t independently confirm the poll results or reveal your choice.</div>
    </main><SiteFooter />
  </div>;
}
