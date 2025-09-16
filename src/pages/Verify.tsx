import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, CheckCircle, XCircle, ArrowLeft, Hash, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import verifiedIcon from "@/assets/verified-icon.png";

interface VerificationResult {
  commitment: string;
  electionId: string;
  electionTitle: string;
  status: "verified" | "not_found" | "invalid";
  blockNumber?: number;
  timestamp?: string;
  transactionHash?: string;
}

const Verify = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [commitment, setCommitment] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!commitment.trim()) {
      toast({
        title: "Commitment Required",
        description: "Please enter a vote commitment hash to verify",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setResult(null);

    // Simulate blockchain verification
    setTimeout(() => {
      // Mock verification result
      const mockResult: VerificationResult = {
        commitment: commitment,
        electionId: "1",
        electionTitle: "2024 Municipal Elections",
        status: commitment.length > 10 ? "verified" : "not_found",
        blockNumber: 2845621,
        timestamp: new Date().toISOString(),
        transactionHash: "0x" + Math.random().toString(16).substring(2, 66)
      };

      setResult(mockResult);
      setIsVerifying(false);

      if (mockResult.status === "verified") {
        toast({
          title: "Vote Verified!",
          description: "Your vote was found on the blockchain",
        });
      } else {
        toast({
          title: "Vote Not Found",
          description: "This commitment was not found on the blockchain",
          variant: "destructive"
        });
      }
    }, 2000);
  };

  const sampleCommitments = [
    "0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    "0xf9e8d7c6b5a4321098765432109876543210fedcba0987654321fedcba098765",
    "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01"
  ];

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
              <h1 className="font-bold text-foreground">Vote Verification</h1>
              <p className="text-sm text-muted-foreground">Blockchain transparency</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>Decentralized Verification</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary-hover rounded-full mb-4 shadow-lg">
            <img src={verifiedIcon} alt="Verified" className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">Verify Your Vote</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Use your vote commitment hash to verify that your vote was successfully recorded on the blockchain. 
            This ensures complete transparency and tamper-proof verification.
          </p>
        </div>

        {/* Verification Form */}
        <Card className="mb-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Enter Vote Commitment
            </CardTitle>
            <CardDescription>
              Enter the commitment hash you received after voting to verify it on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="commitment">Vote Commitment Hash</Label>
              <Input
                id="commitment"
                placeholder="0x... (64-character hex string)"
                value={commitment}
                onChange={(e) => setCommitment(e.target.value)}
                className="h-12 font-mono text-sm"
              />
            </div>

            <Button 
              variant="secure" 
              size="lg" 
              className="w-full"
              onClick={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                  Verifying on Blockchain...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Verify Vote
                </>
              )}
            </Button>

            {/* Sample Commitments */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">Try these sample commitments:</p>
              <div className="grid gap-2">
                {sampleCommitments.map((sample, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="justify-start h-auto p-3 font-mono text-xs"
                    onClick={() => setCommitment(sample)}
                  >
                    {sample}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Result */}
        {result && (
          <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.status === "verified" ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-success" />
                    Vote Verified
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-destructive" />
                    Verification Failed
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {result.status === "verified" 
                  ? "Your vote has been successfully verified on the blockchain"
                  : "This commitment could not be found on the blockchain"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.status === "verified" ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">Election</Label>
                      <p className="font-semibold">{result.electionTitle}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">Block Number</Label>
                      <p className="font-mono text-sm">{result.blockNumber?.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">Timestamp</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm">{new Date(result.timestamp!).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Commitment Hash</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <code className="font-mono text-sm break-all">{result.commitment}</code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Transaction Hash</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <code className="font-mono text-sm break-all">{result.transactionHash}</code>
                    </div>
                  </div>

                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-foreground">Verification Complete</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your vote has been cryptographically verified and is permanently recorded on the blockchain. 
                          This ensures your vote was counted and cannot be tampered with.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Searched Commitment</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <code className="font-mono text-sm break-all">{result.commitment}</code>
                    </div>
                  </div>

                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-foreground">Not Found</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          This commitment hash was not found on the blockchain. Please check that you've entered 
                          the correct hash or contact support if you believe this is an error.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              How Verification Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Hash className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Commitment Generation</h3>
                <p className="text-sm text-muted-foreground">
                  When you vote, a unique cryptographic commitment is created from your encrypted ballot
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Blockchain Recording</h3>
                <p className="text-sm text-muted-foreground">
                  The commitment is permanently recorded on the blockchain for transparency
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Public Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Anyone can verify votes using commitment hashes while maintaining voter privacy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Verify;