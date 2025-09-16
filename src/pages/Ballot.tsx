import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Shield, User, CheckCircle, AlertTriangle, ArrowLeft, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
}

interface Election {
  id: string;
  title: string;
  description: string;
  candidates: Candidate[];
}

const Ballot = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [election, setElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [step, setStep] = useState<"vote" | "confirm" | "submit">("vote");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cryptoProgress, setCryptoProgress] = useState(0);

  useEffect(() => {
    // Simulate fetching election data
    setElection({
      id: electionId || "1",
      title: "2024 Municipal Elections",
      description: "City Council and Mayor election for downtown district",
      candidates: [
        {
          id: "1",
          name: "Sarah Johnson",
          party: "Democratic Party",
          description: "Former city planner with 15 years of public service experience"
        },
        {
          id: "2", 
          name: "Michael Rodriguez",
          party: "Republican Party",
          description: "Local business owner and community advocate"
        },
        {
          id: "3",
          name: "Emma Chen",
          party: "Independent",
          description: "Environmental lawyer and sustainability expert"
        },
        {
          id: "4",
          name: "David Thompson",
          party: "Green Party",
          description: "Public health professional and education reform advocate"
        }
      ]
    });
  }, [electionId]);

  const handleVoteConfirm = () => {
    if (!selectedCandidate) {
      toast({
        title: "Selection Required",
        description: "Please select a candidate before proceeding",
        variant: "destructive"
      });
      return;
    }
    setStep("confirm");
  };

  const handleSubmitVote = async () => {
    setStep("submit");
    setIsSubmitting(true);
    setCryptoProgress(0);

    // Simulate cryptographic operations
    const steps = [
      { progress: 20, message: "Generating encryption keys..." },
      { progress: 40, message: "Encrypting ballot with Paillier..." },
      { progress: 60, message: "Creating blind signature..." },
      { progress: 80, message: "Computing blockchain commitment..." },
      { progress: 100, message: "Broadcasting to blockchain..." }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCryptoProgress(step.progress);
      toast({
        title: step.message,
        description: "Cryptographic operation in progress...",
      });
    }

    // Simulate successful submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Vote Submitted Successfully!",
        description: "Your vote has been encrypted and recorded on the blockchain",
      });
      navigate("/dashboard");
    }, 1500);
  };

  if (!election) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const selectedCandidateData = election.candidates.find(c => c.id === selectedCandidate);

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
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Secure Ballot</h1>
              <p className="text-sm text-muted-foreground">End-to-end encrypted</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Blockchain Secured</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Election Info */}
        <Card className="mb-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{election.title}</CardTitle>
            <CardDescription className="text-base">{election.description}</CardDescription>
          </CardHeader>
        </Card>

        {step === "vote" && (
          <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Select Your Candidate
              </CardTitle>
              <CardDescription>
                Choose one candidate. Your vote will be encrypted and anonymized.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
                <div className="space-y-4">
                  {election.candidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-start space-x-3">
                      <RadioGroupItem 
                        value={candidate.id} 
                        id={candidate.id}
                        className="mt-1.5"
                      />
                      <Label 
                        htmlFor={candidate.id} 
                        className="flex-1 cursor-pointer"
                      >
                        <div className="p-4 rounded-lg border-2 border-transparent hover:border-primary/20 transition-colors hover:bg-muted/30">
                          <div className="font-semibold text-foreground">{candidate.name}</div>
                          <div className="text-sm font-medium text-primary mb-1">{candidate.party}</div>
                          <div className="text-sm text-muted-foreground">{candidate.description}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="mt-8 pt-6 border-t">
                <Button 
                  variant="secure" 
                  size="lg" 
                  className="w-full"
                  onClick={handleVoteConfirm}
                  disabled={!selectedCandidate}
                >
                  <CheckCircle className="w-5 h-5" />
                  Review Your Vote
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "confirm" && selectedCandidateData && (
          <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Confirm Your Vote
              </CardTitle>
              <CardDescription>
                Please review your selection before submitting. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-lg text-foreground mb-2">You selected:</h3>
                <div className="text-xl font-bold text-primary">{selectedCandidateData.name}</div>
                <div className="text-sm text-muted-foreground">{selectedCandidateData.party}</div>
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Important Notice</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Once submitted, your vote will be encrypted and recorded on the blockchain. 
                      This process is irreversible and ensures election integrity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1"
                  onClick={() => setStep("vote")}
                >
                  Change Selection
                </Button>
                <Button 
                  variant="secure" 
                  size="lg" 
                  className="flex-1"
                  onClick={handleSubmitVote}
                >
                  <Lock className="w-5 h-5" />
                  Submit Vote
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "submit" && (
          <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Processing Your Vote
              </CardTitle>
              <CardDescription>
                Encrypting and submitting your vote to the blockchain...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Cryptographic Processing</span>
                    <span className="font-medium">{cryptoProgress}%</span>
                  </div>
                  <Progress value={cryptoProgress} className="h-3" />
                </div>

                <div className="bg-muted/50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="font-medium">Securing your vote...</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>Ballot encrypted with Paillier homomorphic encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>Anonymous signature generated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {cryptoProgress >= 80 ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted animate-pulse" />
                      )}
                      <span>Blockchain commitment created</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Ballot;