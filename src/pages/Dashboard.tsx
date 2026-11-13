import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/BrandLockup";
import { MobileInfoNav } from "@/components/MobileInfoNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Vote, Shield, CheckCircle, Clock, BarChart, Search, X, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatIndiaDateTime } from "@/lib/indiaDate";
import { SiteFooter } from "@/components/SiteFooter";

interface Election {
  id: string;
  title: string;
  description: string;
  pollType: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  candidates: number;
  totalVotes: number;
  hasVoted: boolean;
  canManage: boolean;
  isDemoElection?: boolean;
}

interface ElectionResponse extends Omit<Election, "candidates"> {
  candidates: { id: string; name: string; party?: string; description?: string }[];
}

type ElectionFilter = "all" | Election["status"];

const pollTypeLabels: Record<string, string> = {
  "housing-society": "Housing society / RWA",
  "student-council": "School / college student council",
  "club-association": "Club / association",
  "ngo-community": "NGO / community group",
  "local-issue": "Local issue · non-binding",
};

const Dashboard = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<ElectionFilter>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadElections = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/elections");
      const data = await response.json() as { elections?: ElectionResponse[]; message?: string };
      if (!response.ok) throw new Error(data.message || "We couldn’t load the polls. Please try again.");
      setElections((data.elections || []).map((poll) => ({ ...poll, candidates: poll.candidates.length, totalVotes: poll.totalVotes || 0 })));
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : "We couldn’t connect to the poll service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadElections(); }, [loadElections]);

  const filteredElections = elections.filter((election) => {
    const matchesFilter = activeFilter === "all" || election.status === activeFilter;
    const searchableText = `${election.title} ${election.description} ${pollTypeLabels[election.pollType] || "Community poll"}`.toLowerCase();
    return matchesFilter && searchableText.includes(searchTerm.trim().toLowerCase());
  });
  const filterCounts: Record<ElectionFilter, number> = {
    all: elections.length,
    active: elections.filter((election) => election.status === "active").length,
    upcoming: elections.filter((election) => election.status === "upcoming").length,
    completed: elections.filter((election) => election.status === "completed").length,
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      navigate("/auth");
    }
  };

  const closePoll = async (id: string) => {
    if (!window.confirm("Close this poll now? People won’t be able to respond after it closes.")) return;
    try {
      const response = await fetch(`/api/elections/${id}/close`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "We couldn’t close the poll. Please try again.");
      setElections((current) => current.map((poll) => poll.id === id ? { ...poll, status: "completed" } : poll));
      toast({ title: "Poll closed", description: "You can now see the combined results." });
    } catch (cause) {
      toast({ title: "We couldn’t close the poll", description: cause instanceof Error ? cause.message : "Please try again in a moment.", variant: "destructive" });
    }
  };

  const getStatusColor = (status: Election["status"]) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "upcoming": return "bg-warning text-warning-foreground";
      case "completed": return "bg-muted text-muted-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusIcon = (status: Election["status"]) => {
    switch (status) {
      case "active": return <Vote className="w-4 h-4" />;
      case "upcoming": return <Clock className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="h-1 tricolor-rule" />
      {/* Header */}
      <header className="civic-header sticky top-0 z-20 border-b backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <BrandLockup />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <nav aria-label="Information" className="civic-nav mr-2 hidden items-center gap-4 text-xs font-semibold lg:flex">
              <Link className="hover:text-primary" to="/about">About</Link>
              <Link className="hover:text-primary" to="/how-it-works">How it works</Link>
              <Link className="hover:text-primary" to="/india-elections">India elections</Link>
              <Link className="hover:text-primary" to="/security">Security</Link>
              <Link className="hover:text-primary" to="/help">Help</Link>
            </nav>
              <Button variant="outline" className="hidden sm:inline-flex" onClick={() => navigate("/verify")}>
              <Shield className="w-4 h-4" /> Check a receipt
            </Button>
            <Button variant="ghost" className="font-semibold text-white hover:bg-white/10 hover:text-white" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
        <MobileInfoNav />
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/70 bg-[#f2f5f9] py-10 sm:py-12">
        <div className="relative container mx-auto flex flex-col gap-7 px-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8d6be] bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9d5517]">
              <span className="h-2 w-2 rounded-full bg-[#18864b]" /> Independent community poll demo · not an ECI service
            </span>
            <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
              Welcome back<span className="text-[#bd6415]">.</span>
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
              Create a poll for your group, take part and keep a private receipt.
            </p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">This demo can’t check the voter register or submit an official vote. <a href="https://voters.eci.gov.in/" target="_blank" rel="noreferrer" className="font-semibold text-primary underline underline-offset-4">Visit official ECI voter services</a>.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Authenticator sign-in</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Community polls</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#bd6415]" />
              <span>Private receipt</span>
            </div>
          </div>
        </div>
      </section>

      {/* Elections Grid */}
      <main className="container mx-auto px-4 py-8">
        <section className="mb-8 flex flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div><p className="text-xs font-bold uppercase tracking-wider text-[#9d5517]">Official election information</p><h3 className="mt-1 text-lg font-bold">Looking for voter services or official results?</h3><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Jana Vani doesn’t run public elections. Visit the relevant Election Commission for official voting information and services.</p></div>
          <Button asChild variant="outline" className="shrink-0 border-[#e1c6a6] bg-white"><Link to="/india-elections">See official election links</Link></Button>
        </section>
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto_minmax(14rem,20rem)] lg:items-end">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Community polls</h3>
            <p className="text-muted-foreground">Start a poll for your group or join one that’s open.</p>
          </div>
          <Button onClick={() => navigate("/polls/create")}><Plus className="mr-1 h-4 w-4"/> Create a poll</Button>
          <label className="relative block w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Find a poll"
              aria-label="Search polls"
              className="h-11 w-full rounded-xl border border-input bg-white pl-10 pr-10 text-sm outline-none transition placeholder:text-muted-foreground/80 focus:border-[#d98a43] focus:ring-4 focus:ring-[#f3d6b7]/50"
            />
            {searchTerm && <button type="button" aria-label="Clear search" onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>}
          </label>
        </div>

        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter polls by status">
          {(["all", "active", "upcoming", "completed"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold capitalize transition ${activeFilter === filter ? "border-primary bg-primary text-white shadow-sm" : "border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-primary"}`}
            >
              {filter === "all" ? "All polls" : filter === "active" ? "Open" : filter === "upcoming" ? "Coming soon" : "Closed"}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeFilter === filter ? "bg-white/15 text-white" : "bg-muted text-muted-foreground"}`}>{filterCounts[filter]}</span>
            </button>
          ))}
          <span className="ml-auto self-center text-xs text-muted-foreground">Showing {filteredElections.length}</span>
        </div>

        {loadError && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><div className="flex flex-wrap items-center justify-between gap-3"><span>{loadError}</span><Button variant="outline" size="sm" onClick={() => void loadElections()}>Try again</Button></div></div>}
        {isLoading && <div role="status" className="mb-6 rounded-xl border bg-white p-8 text-center text-sm text-muted-foreground">Loading community polls…</div>}
        {!isLoading && !loadError && <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredElections.map((election) => (
            <Card key={election.id} className="group border-border/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="break-words text-lg">{election.title}</CardTitle>
                    <CardDescription className="mt-1 break-words line-clamp-3">
                      {election.description}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(election.status)}>
                    {getStatusIcon(election.status)}
                    {election.status === "active" ? "Open" : election.status === "upcoming" ? "Coming soon" : "Closed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <span className="inline-flex rounded-full bg-[#edf1f7] px-2.5 py-1 text-xs font-semibold text-primary">{election.isDemoElection ? "Fictional practice poll" : pollTypeLabels[election.pollType] || "Community poll"}</span>
                <div className="grid gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2">
                  <div className="min-w-0"><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5"/>Opens · IST</p><p className="mt-1 font-semibold">{formatIndiaDateTime(election.startDate)}</p></div>
                  <div className="min-w-0"><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5"/>Closes · IST</p><p className="mt-1 font-semibold">{formatIndiaDateTime(election.endDate)}</p></div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-muted-foreground"><Users className="h-3.5 w-3.5"/>{election.candidates} {election.candidates === 1 ? "choice" : "choices"}</span>
                  {election.status !== "upcoming" && <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-muted-foreground"><Vote className="h-3.5 w-3.5"/>{election.totalVotes.toLocaleString("en-IN")} recorded {election.totalVotes === 1 ? "response" : "responses"}</span>}
                  {election.hasVoted && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 font-semibold text-emerald-800"><CheckCircle className="h-3.5 w-3.5"/>You’ve taken part</span>}
                </div>

                {election.status === "active" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time left</span>
                      <span className="font-medium">{Math.max(0, Math.ceil((new Date(election.endDate).getTime() - Date.now()) / 86400000))} days left</span>
                    </div>
                    <Progress value={Math.min(100, Math.max(0, ((Date.now() - new Date(election.startDate).getTime()) / Math.max(1, new Date(election.endDate).getTime() - new Date(election.startDate).getTime())) * 100))} className="h-2" />
                  </div>
                )}

                <div className="pt-4 border-t">
                  {election.status === "active" && !election.hasVoted && (
                    <Button 
                      variant="secure" 
                      className="w-full"
                      onClick={() => navigate(`/ballot/${election.id}`)}
                    >
                      <Vote className="w-4 h-4" />
                      {election.isDemoElection ? "Try this practice poll" : "Take part in this poll"}
                    </Button>
                  )}
                  
                  {election.status === "active" && election.hasVoted && (
                    <Button variant="success" className="w-full" disabled>
                      <CheckCircle className="w-4 h-4" />
                      Response recorded
                    </Button>
                  )}
                  
                  {election.status === "upcoming" && (
                    <Button variant="outline" className="w-full" disabled>
                      <Clock className="w-4 h-4" />
                      Opens soon
                    </Button>
                  )}
                  
                  {election.status === "completed" && (
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={() => navigate(`/results/${election.id}`)}
                    >
                      <BarChart className="w-4 h-4" />
                      See results
                    </Button>
                  )}
                  {election.canManage && election.status !== "completed" && (
                    <Button variant="outline" className="mt-2 w-full" onClick={() => closePoll(election.id)}>Close poll</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>}
        {!isLoading && !loadError && filteredElections.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
            <Search className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <h4 className="mt-3 font-bold">{elections.length ? "We couldn’t find a matching poll" : "No polls yet"}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{elections.length ? "Try a different search or clear the filter." : "Create a poll for your group, then invite people to join in."}</p>
            {elections.length ? <button type="button" onClick={() => { setSearchTerm(""); setActiveFilter("all"); }} className="mt-4 text-sm font-semibold text-primary underline underline-offset-4">Clear search and filters</button> : <Button className="mt-4" onClick={() => navigate("/polls/create")}><Plus className="mr-1 h-4 w-4"/> Create a poll</Button>}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default Dashboard;
