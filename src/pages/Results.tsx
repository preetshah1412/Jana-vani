import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, ArrowLeft, Users, Shield, CheckCircle, Download, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SiteFooter } from "@/components/SiteFooter";

interface Candidate {
  id: string;
  name: string;
  party: string;
  votes: number;
  percentage: number;
}

interface ElectionResults {
  id: string;
  title: string;
  description: string;
  pollType: string;
  status: "completed";
  totalVotes: number;
  candidates: Candidate[];
  startDate: string;
  endDate: string;
  verificationHash: string;
}

const pollTypeLabels: Record<string, string> = {
  "housing-society": "Housing society / RWA",
  "student-council": "Student council",
  "club-association": "Club or association",
  "ngo-community": "NGO or community group",
  "local-issue": "Local community issue",
};

const Results = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingLedger, setIsExportingLedger] = useState(false);

  useEffect(() => {
    fetch(`/api/elections/${electionId}/results`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "We couldn’t load these poll results. Please try again.");
        const poll = data.election;
        const totalVotes = poll.totalVotes || 0;
        setResults({
          id: poll.id, title: poll.title, description: poll.description, pollType: poll.pollType || "local-issue", status: "completed",
          totalVotes, startDate: poll.startDate, endDate: poll.endDate,
          verificationHash: data.ledgerHead || "No ballots recorded",
          candidates: poll.candidates.map((option: { id: string; name: string; party: string; votes: number }) => ({
            id: option.id, name: option.name, party: option.party, votes: option.votes,
            percentage: totalVotes ? Number((option.votes * 100 / totalVotes).toFixed(1)) : 0,
          })),
        });
      })
      .catch((error) => toast({ title: "Results unavailable", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" }))
      .finally(() => setIsLoading(false));
  }, [electionId, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading poll results…</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return <div className="min-h-screen flex items-center justify-center">We couldn’t find these poll results.</div>;
  }

  const highestVotes = Math.max(0, ...results.candidates.map((candidate) => candidate.votes));
  const leaders = results.candidates.filter((candidate) => candidate.votes === highestVotes);
  const durationDays = Math.max(1, Math.round((new Date(results.endDate).getTime() - new Date(results.startDate).getTime()) / 86400000));

  const handleShare = async () => {
    const shareData = { title: results.title, text: "See how our community responded in the Jana Vani demo.", url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      if (!navigator.clipboard?.writeText) throw new Error("Sharing is unavailable in this browser.");
      await navigator.clipboard.writeText(shareData.url);
      toast({ title: "Link copied", description: "The poll results link is ready to share." });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      toast({ title: "Couldn’t share the results", description: error instanceof Error ? error.message : "Please try again in a moment.", variant: "destructive" });
    }
  };

  const handleExportCsv = () => {
    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = [
      ["Poll question", "Choice", "Group", "Responses", "Share of responses (%)"],
      ...results.candidates.map((candidate) => [results.title, candidate.name, candidate.party, candidate.votes, candidate.percentage]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;
    const fileUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `jana-vani-poll-results-${results.id}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(fileUrl);
    toast({ title: "Results downloaded", description: "Your CSV contains the poll’s combined totals." });
  };

  const handleExportLedger = async () => {
    setIsExportingLedger(true);
    try {
      const response = await fetch("/api/ledger/export");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "We couldn’t download the demo ledger.");
      const fileUrl = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `jana-vani-ledger-${results.id}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileUrl);
      toast({ title: "Demo ledger downloaded", description: "You can use the offline checker to review the links in the file." });
    } catch (error) {
      toast({ title: "Couldn’t download the demo ledger", description: error instanceof Error ? error.message : "Please try again in a moment.", variant: "destructive" });
    } finally { setIsExportingLedger(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/95 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Button variant="ghost" className="shrink-0 px-2 sm:px-4" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
              <span className="sm:hidden">Back</span><span className="hidden sm:inline">Back to polls</span>
            </Button>
            <div className="mx-1 hidden h-6 w-px bg-border sm:block sm:mx-2" />
            <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-r from-primary to-primary-hover sm:flex">
              <BarChart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-bold text-foreground"><span className="sm:hidden">Results</span><span className="hidden sm:inline">Community poll results</span></h1>
              <p className="hidden text-sm text-muted-foreground sm:block">Combined poll totals</p>
            </div>
          </div>
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-3">
            <Button variant="outline" size="sm" aria-label="Share poll results" onClick={handleShare}>
              <Share className="w-4 h-4" />
              <span className="hidden sm:inline">Share poll</span>
            </Button>
            <Button variant="outline" size="sm" aria-label="Export poll results as CSV" onClick={handleExportCsv}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><Shield className="mt-0.5 h-5 w-5 shrink-0"/><p><strong>Community poll demo.</strong> These are non-binding group responses, not official election results. Jana Vani is not an Election Commission service.</p></div>
        {/* Election Info */}
        <Card className="mb-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <CardTitle className="mb-2 break-words text-xl sm:text-2xl">{results.title}</CardTitle>
                <CardDescription className="text-base">{results.description}</CardDescription>
              </div>
              <Badge className="bg-success text-success-foreground">
                <CheckCircle className="w-4 h-4 mr-1" />
                Closed
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{results.totalVotes.toLocaleString("en-IN")}</div>
                <div className="text-sm text-muted-foreground">Responses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{results.candidates.length}</div>
                <div className="text-sm text-muted-foreground">Choices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{durationDays}</div>
                <div className="text-sm text-muted-foreground">Poll length (days)</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-foreground">{pollTypeLabels[results.pollType] || "Community poll"}</div>
                <div className="text-sm text-muted-foreground">Non-binding group poll</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Winner Announcement */}
        {results.totalVotes > 0 ? <Card className="mb-8 shadow-lg border-0 bg-gradient-to-r from-success/10 to-success/5 border-success/20">
          <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="w-6 h-6" />
              {leaders.length > 1 ? "The top choices are tied" : "Most popular choice"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              {leaders.map((leader) => <div key={leader.id} className="mb-4 last:mb-0"><h2 className="text-3xl font-bold text-foreground">{leader.name}</h2><p className="text-lg text-muted-foreground">{leader.party}</p><div className="mt-2 inline-flex items-center gap-3 text-lg"><span className="font-bold text-success">{leader.votes.toLocaleString("en-IN")} votes</span><span className="text-muted-foreground">•</span><span className="font-bold text-success">{leader.percentage}%</span></div></div>)}
            </div>
          </CardContent>
        </Card> : <Card className="mb-8 border-dashed"><CardContent className="py-8 text-center"><h2 className="font-bold">No responses this time</h2><p className="mt-1 text-sm text-muted-foreground">This poll closed without any responses.</p></CardContent></Card>}

        {/* Detailed Results */}
        <Card className="mb-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              How people responded
            </CardTitle>
            <CardDescription>
              Combined results for this community poll.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {results.candidates.map((candidate, index) => (
                <div key={candidate.id} className="space-y-2.5 rounded-xl border border-border/70 p-3 sm:border-0 sm:p-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <h3 className="break-words font-semibold text-foreground">{candidate.name}</h3>
                        <p className="break-words text-sm text-muted-foreground">{candidate.party}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{candidate.percentage}%</div>
                      <div className="text-xs leading-5 text-muted-foreground sm:text-sm">
                        {candidate.votes.toLocaleString("en-IN")} {candidate.votes === 1 ? "response" : "responses"}
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={candidate.percentage} 
                    className="h-3"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Verification Info */}
        <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Receipt and privacy
            </CardTitle>
          <CardDescription>
              Poll totals are stored separately from the private receipt codes in the demo ledger.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Ledger type</label>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Local hash chain</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Responses recorded</label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{results.totalVotes.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Latest demo ledger code</label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <code className="font-mono text-sm break-all">{results.verificationHash}</code>
                </div>
              </div>

              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">What this check means</h4>
                <p className="text-sm text-muted-foreground mt-1">
                      This local hash chain isn’t a public blockchain or an official election record. The code can show that a commitment exists in this server’s ledger; it doesn’t reveal your choice or independently confirm the poll totals.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="font-semibold text-foreground">Check the ledger file yourself</h4>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Download the demo ledger and use the offline checker to review the links it contains. That can’t confirm the file is complete or independently verify the poll totals.</p>
                <Button className="mt-3" variant="outline" onClick={() => void handleExportLedger()} disabled={isExportingLedger}>
                  <Download className="mr-2 h-4 w-4" /> {isExportingLedger ? "Getting the ledger ready…" : "Download demo ledger"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Results;
