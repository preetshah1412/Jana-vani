import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Vote, Shield, CheckCircle, Clock, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-voting.jpg";

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  candidates: number;
  totalVotes: number;
  hasVoted: boolean;
}

const Dashboard = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching elections
    setElections([
      {
        id: "1",
        title: "2024 Municipal Elections",
        description: "City Council and Mayor election for downtown district",
        startDate: "2024-09-15",
        endDate: "2024-09-22",
        status: "active",
        candidates: 8,
        totalVotes: 15420,
        hasVoted: false,
      },
      {
        id: "2", 
        title: "School Board Election",
        description: "District 5 school board representative election",
        startDate: "2024-10-01",
        endDate: "2024-10-08",
        status: "upcoming",
        candidates: 4,
        totalVotes: 0,
        hasVoted: false,
      },
      {
        id: "3",
        title: "Community Budget Vote",
        description: "Allocation of community development funds",
        startDate: "2024-08-01",
        endDate: "2024-08-08",
        status: "completed",
        candidates: 6,
        totalVotes: 8932,
        hasVoted: true,
      }
    ]);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/auth");
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-hover rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SecureVote Portal</h1>
              <p className="text-sm text-muted-foreground">Verified Voter Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/verify")}>
              <Shield className="w-4 h-4" />
              Verify Votes
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-hover/10"></div>
        <img 
          src={heroImage} 
          alt="Secure voting portal" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Your Voice, Secured by Blockchain
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Participate in transparent, verifiable elections with end-to-end encryption and blockchain verification.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Blockchain Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-success" />
              <span>Anonymous Voting</span>
            </div>
          </div>
        </div>
      </section>

      {/* Elections Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-2">Available Elections</h3>
          <p className="text-muted-foreground">Participate in secure, verified elections</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {elections.map((election) => (
            <Card key={election.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{election.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {election.description}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(election.status)}>
                    {getStatusIcon(election.status)}
                    {election.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Start:</span>
                  </div>
                  <span className="font-medium">{new Date(election.startDate).toLocaleDateString()}</span>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">End:</span>
                  </div>
                  <span className="font-medium">{new Date(election.endDate).toLocaleDateString()}</span>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Candidates:</span>
                  </div>
                  <span className="font-medium">{election.candidates}</span>
                  
                  {election.status !== "upcoming" && (
                    <>
                      <div className="flex items-center gap-2">
                        <Vote className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Votes:</span>
                      </div>
                      <span className="font-medium">{election.totalVotes.toLocaleString()}</span>
                    </>
                  )}
                </div>

                {election.status === "active" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Election Progress</span>
                      <span className="font-medium">6 days remaining</span>
                    </div>
                    <Progress value={35} className="h-2" />
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
                      Cast Your Vote
                    </Button>
                  )}
                  
                  {election.status === "active" && election.hasVoted && (
                    <Button variant="success" className="w-full" disabled>
                      <CheckCircle className="w-4 h-4" />
                      Vote Submitted
                    </Button>
                  )}
                  
                  {election.status === "upcoming" && (
                    <Button variant="outline" className="w-full" disabled>
                      <Clock className="w-4 h-4" />
                      Election Upcoming
                    </Button>
                  )}
                  
                  {election.status === "completed" && (
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={() => navigate(`/results/${election.id}`)}
                    >
                      <BarChart className="w-4 h-4" />
                      View Results
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;