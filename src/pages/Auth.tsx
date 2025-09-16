import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, Lock, CheckCircle, Smartphone, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [aadharNumber, setAadharNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"aadhar" | "otp" | "voter-id">("aadhar");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (aadharNumber.length !== 12) {
      toast({
        title: "Invalid Aadhar Number",
        description: "Please enter a valid 12-digit Aadhar number",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    // Simulate OTP sending
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: "Please check your registered mobile number",
      });
    }, 2000);
  };

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Aadhar Verified",
        description: "Your identity has been verified successfully",
      });
      localStorage.setItem("auth", "true");
      navigate("/dashboard");
    }, 2000);
  };

  const handleVoterRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate voter ID verification and registration
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Voter Registration Successful",
        description: "Your voter ID has been verified and account created",
      });
      localStorage.setItem("auth", "true");
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary-hover rounded-full mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">SecureVote</h1>
          <p className="text-muted-foreground">Blockchain-powered voting portal</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle>Secure Authentication</CardTitle>
            <CardDescription>
              Access your verified voting account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="verify" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="verify">Aadhar Verify</TabsTrigger>
                <TabsTrigger value="register">New Voter</TabsTrigger>
              </TabsList>

              <TabsContent value="verify">
                {step === "aadhar" && (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="aadhar-number">Aadhar Number</Label>
                      <Input 
                        id="aadhar-number" 
                        type="text" 
                        placeholder="Enter 12-digit Aadhar number"
                        value={aadharNumber}
                        onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        required
                        maxLength={12}
                        className="h-11 font-mono tracking-wider"
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll send an OTP to your registered mobile number
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      variant="secure" 
                      size="lg" 
                      className="w-full"
                      disabled={isLoading || aadharNumber.length !== 12}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-4 h-4" />
                          Send OTP
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {step === "otp" && (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Enter OTP</Label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={(value) => setOtp(value)}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        OTP sent to mobile number ending with **{aadharNumber.slice(-2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="lg" 
                        className="w-full"
                        onClick={() => setStep("aadhar")}
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        variant="secure" 
                        size="lg" 
                        className="w-full"
                        disabled={isLoading || otp.length !== 6}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Verify & Login
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleVoterRegistration} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-aadhar">Aadhar Number</Label>
                    <Input 
                      id="new-aadhar" 
                      type="text" 
                      placeholder="Enter 12-digit Aadhar number"
                      required
                      maxLength={12}
                      className="h-11 font-mono tracking-wider"
                      onChange={(e) => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 12)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voter-id">Voter ID</Label>
                    <Input 
                      id="voter-id" 
                      placeholder="Enter your Voter ID (EPIC number)"
                      required
                      className="h-11 font-mono tracking-wider"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input 
                      id="mobile" 
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      required
                      maxLength={10}
                      className="h-11 font-mono tracking-wider"
                      onChange={(e) => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="secure" 
                    size="lg" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                        Verifying Details...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Register as New Voter
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Shield className="w-4 h-4" />
                <span>Secured by Government Authentication</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your Aadhar and Voter ID are verified through official channels for secure voting
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;