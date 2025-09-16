import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Shield } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [aadharNumber, setAadharNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (aadharNumber.length !== 12) {
      toast({
        title: "Invalid Aadhaar Number",
        description: "Please enter a valid 12-digit Aadhaar number",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    // Simulate sending OTP (in real app, call backend)
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description:
          "OTP has been sent to your registered mobile number (mock: check backend console)",
      });
    }, 1000);
  };

  // Step 2: Verify OTP and Login
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
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
    // Simulate OTP verification (in real app, call backend)
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login Successful",
        description: "You are now logged in",
      });
      localStorage.setItem("auth", "true");
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary-hover rounded-full mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            SecureVote
          </h1>
          <p className="text-muted-foreground">
            Blockchain-powered voting portal
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle>Login with Aadhaar</CardTitle>
            <CardDescription>
              Enter your Aadhaar number to receive OTP
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter 12-digit Aadhaar Number"
                  value={aadharNumber}
                  onChange={(e) =>
                    setAadharNumber(e.target.value.replace(/\D/, ""))
                  }
                  maxLength={12}
                  className="w-full px-3 py-2 border rounded"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 rounded"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/, ""))}
                  maxLength={6}
                  className="w-full px-3 py-2 border rounded"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 rounded"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Login"}
                </button>
              </form>
            )}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Shield className="w-4 h-4" />
                <span>Secured by Aadhaar Number & OTP</span>
              </div>
              <p className="text-xs text-muted-foreground">
                For demo purposes, OTP is mocked and login is allowed with any
                12-digit Aadhaar number and 6-digit OTP.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;