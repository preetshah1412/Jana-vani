import { Button } from "@/components/ui/button";
import { Shield, Lock, CheckCircle, Users, Vote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-voting.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-hover/20"></div>
        <img 
          src={heroImage} 
          alt="Secure blockchain voting portal" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-primary-hover rounded-full mb-8 shadow-xl">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Secure<span className="text-primary">Vote</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            The future of democratic participation powered by blockchain technology. 
            Vote securely, verify transparently, trust completely.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              variant="secure" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate("/auth")}
            >
              <Vote className="w-5 h-5" />
              Start Voting
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate("/verify")}
            >
              <CheckCircle className="w-5 h-5" />
              Verify Vote
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-2">End-to-End Encryption</h3>
              <p className="text-sm text-muted-foreground">
                Your vote is encrypted using advanced cryptographic techniques ensuring complete privacy
              </p>
            </div>
            
            <div className="text-center p-6 bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Blockchain Verified</h3>
              <p className="text-sm text-muted-foreground">
                Every vote is recorded on an immutable blockchain ledger for transparency and trust
              </p>
            </div>
            
            <div className="text-center p-6 bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Anonymous & Private</h3>
              <p className="text-sm text-muted-foreground">
                Advanced blind signature technology ensures your vote remains completely anonymous
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
