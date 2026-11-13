import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { indiaDateTimeInputToIso, toIndiaDateTimeInput } from "@/lib/indiaDate";
import { SiteFooter } from "@/components/SiteFooter";

const defaultDate = (days: number) => toIndiaDateTimeInput(new Date(Date.now() + days * 24 * 60 * 60 * 1000));
const pollTypes = [
  ["housing-society", "Housing society / Residents’ Welfare Association"],
  ["student-council", "School or college student council"],
  ["club-association", "Club, cooperative or association"],
  ["ngo-community", "NGO or community group"],
  ["local-issue", "Local community issue (non-binding)"],
] as const;

const CreatePoll = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pollType, setPollType] = useState<string>("housing-society");
  const [options, setOptions] = useState(["", ""]);
  const [startDate, setStartDate] = useState(defaultDate(0));
  const [endDate, setEndDate] = useState(defaultDate(7));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const create = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/elections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description, pollType, startDate: indiaDateTimeInputToIso(startDate), endDate: indiaDateTimeInputToIso(endDate), candidates: options.map((name) => ({ name: name.trim() })).filter((option) => option.name) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "We couldn’t create the poll. Please check your details and try again.");
      navigate("/dashboard");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "We couldn’t create the poll. Please try again."); }
    finally { setBusy(false); }
  };

  return <div className="min-h-screen bg-[#f7f8fa]"><header className="border-b bg-white"><div className="mx-auto flex max-w-3xl items-center px-4 py-4"><Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft className="h-4 w-4"/> Back to polls</Link></div></header>
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:py-12"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800"><Vote className="h-3.5 w-3.5"/> For your community</div><h1 className="text-3xl font-bold tracking-tight">Create a poll</h1><p className="mt-2 text-muted-foreground">Ask a question for your society, student council, club, association or community group.</p></div>
      <Card><CardHeader><CardTitle>Poll details</CardTitle><CardDescription>Set up a non-binding community poll for this demo.</CardDescription></CardHeader><CardContent><form onSubmit={create} className="space-y-6">
        <div><label htmlFor="pollType" className="mb-2 block text-sm font-semibold">What is this poll for?</label><select id="pollType" value={pollType} onChange={(event) => setPollType(event.target.value)} className="h-11 w-full rounded-lg border bg-white px-3">{pollTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div><label htmlFor="title" className="mb-2 block text-sm font-semibold">What’s your question?</label><input id="title" required maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="For example: Which community project should we choose?" className="h-11 w-full rounded-lg border bg-white px-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"/></div>
        <div><label htmlFor="description" className="mb-2 block text-sm font-semibold">Add a little context <span className="font-normal text-muted-foreground">(optional)</span></label><textarea id="description" rows={3} maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Share any details people may need before they choose." className="w-full rounded-lg border bg-white p-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"/></div>
        <section><div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-semibold">Add your choices</h2><p className="text-xs text-muted-foreground">Add at least two choices, and up to 20.</p></div><span className="text-xs text-muted-foreground">{options.length}/20</span></div><div className="space-y-3">{options.map((option, index) => <div key={index} className="flex gap-2"><input aria-label={`Choice ${index + 1}`} maxLength={80} value={option} onChange={(event) => setOptions((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder={`Choice ${index + 1}`} className="h-11 flex-1 rounded-lg border bg-white px-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"/>{options.length > 2 && <Button type="button" variant="outline" size="icon" aria-label={`Remove choice ${index + 1}`} onClick={() => setOptions((items) => items.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4"/></Button>}</div>)}</div><Button type="button" variant="outline" className="mt-3" disabled={options.length >= 20} onClick={() => setOptions((items) => [...items, ""])}><Plus className="mr-1 h-4 w-4"/> Add another choice</Button></section>
        <div><div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="start" className="mb-2 block text-sm font-semibold">When does it open? (IST)</label><input id="start" type="datetime-local" required value={startDate} onChange={(event) => setStartDate(event.target.value)} className="h-11 w-full rounded-lg border bg-white px-3"/></div><div><label htmlFor="end" className="mb-2 block text-sm font-semibold">When does it close? (IST)</label><input id="end" type="datetime-local" required value={endDate} onChange={(event) => setEndDate(event.target.value)} className="h-11 w-full rounded-lg border bg-white px-3"/></div></div><p className="mt-2 text-xs text-muted-foreground">Times are shown in India Standard Time (UTC+05:30).</p></div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>A quick reminder:</strong> This is an independent, non-binding poll. Anyone with a demo account can take part, and Jana Vani doesn’t check group membership or voter eligibility. Don’t use it for public elections, legally binding decisions or sensitive votes. Never ask people for voter ID, Aadhaar numbers or real phone numbers. Public elections are run by the relevant Election Commission. Visit the <a href="https://voters.eci.gov.in/" target="_blank" rel="noreferrer" className="font-semibold underline">ECI Voters’ Service Portal</a> or read <a href="https://www.legislative.gov.in/static/uploads/2025/08/cb1b190ea633a1746368ed1fac35fb30.pdf" target="_blank" rel="noreferrer" className="font-semibold underline">Articles 243K and 243ZA of the Constitution</a> for more information.</div>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Creating your poll…" : "Create poll"}</Button>
      </form></CardContent></Card>
    </main><SiteFooter />
  </div>;
};
export default CreatePoll;
