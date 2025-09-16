import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, ArrowLeft, Users, Shield, CheckCircle, Download, Share } from "lucide-react";

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
  status: "completed";
  totalVotes: number;
  candidates: Candidate[];
  startDate: string;
  endDate: string;
  verificationHash: string;
}

const Results = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching results
    setTimeout(() => {
      setResults({
        id: electionId || "3",
        title: "Community Budget Vote",
        description: "Allocation of community development funds",
        status: "completed",
        totalVotes: 8932,
        startDate: "2024-08-01",
        endDate: "2024-08-08",
        verificationHash: "0xf9e8d7c6b5a4321098765432109876543210fedcba0987654321fedcba098765",
        candidates: [
          {
            id: "1",
            name: "Parks & Recreation",
            party: "Public Infrastructure",
            votes: 3247,
            percentage: 36.4
          },
          {
            id: "2", 
            name: "Education Technology",
            party: "Digital Learning",
            votes: 2891,
            percentage: 32.4
          },
          {
            id: "3",
            name: "Transportation",
            party: "Public Transit",
            votes: 1876,
            percentage: 21.0
          },
          {
            id: "4",
            name: "Healthcare Access",
            party: "Community Health",
            votes: 918,
            percentage: 10.2
          }
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, [electionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading election results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return <div className="min-h-screen flex items-center justify-center">Results not found</div>;
  }

  const winner = results.candidates[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-hover rounded-md flex items-center justify-center">
              <BarChart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Election Results</h1>
              <p className="text-sm text-muted-foreground">Verified & Final</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4" />
              Share Results
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Election Info */}
        <Card className="mb-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{results.title}</CardTitle>
                <CardDescription className="text-base">{results.description}</CardDescription>
              </div>
              <Badge className="bg-success text-success-foreground">
                <CheckCircle className="w-4 h-4 mr-1" />
                Completed
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{results.totalVotes.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{results.candidates.length}</div>
                <div className="text-sm text-muted-foreground">Options</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">7</div>
                <div className="text-sm text-muted-foreground">Days Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">100%</div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Winner Announcement */}
        <Card className="mb-8 shadow-lg border-0 bg-gradient-to-r from-success/10 to-success/5 border-success/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="w-6 h-6" />
              Winner Declared
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <h2 className="text-3xl font-bold text-foreground mb-2">{winner.name}</h2>
              <p className="text-lg text-muted-foreground mb-4">{winner.party}</p>
              <div className="inline-flex items-center gap-4 text-lg">
                <span className="font-bold text-success">{winner.votes.toLocaleString()} votes</span>
                <span className="text-muted-foreground">•</span>
                <span className="font-bold text-success">{winner.percentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card className="mb-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Detailed Results
            </CardTitle>
            <CardDescription>
              Complete breakdown of all votes cast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {results.candidates.map((candidate, index) => (
                <div key={candidate.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                        <p className="text-sm text-muted-foreground">{candidate.party}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{candidate.percentage}%</div>
                      <div className="text-sm text-muted-foreground">
                        {candidate.votes.toLocaleString()} votes
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
              Blockchain Verification
            </CardTitle>
            <CardDescription>
              These results have been cryptographically verified and are tamper-proof
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="font-medium text-success">Fully Verified</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Total Commitments</label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{results.totalVotes.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Results Hash</label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <code className="font-mono text-sm break-all">{results.verificationHash}</code>
                </div>
              </div>

              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Cryptographically Secured</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      These results have been verified using blockchain technology and homomorphic encryption. 
                      Every vote was anonymously cast and cryptographically verified, ensuring complete integrity 
                      and transparency of the election process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Results;