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
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (aadharNumber.replace(/\D/g, "").length !== 12) {
      toast({
        title: "Invalid Aadhaar",
        description: "Enter 12-digit Aadhaar",
        variant: "destructive",
      });
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      toast({
        title: "Invalid Mobile",
        description: "Enter 10-digit mobile",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        "http://localhost:4000/api/aadhaar/initiate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aadhaarNumber: aadharNumber, mobile }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description:
            "Check backend console or your SMS if configured.",
        });
      } else {
        toast({
          title: "Error",
          description: data?.message || "Failed to send OTP",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Cannot reach backend",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.replace(/\D/g, "").length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Enter 6-digit OTP",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(
        "http://localhost:4000/api/aadhaar/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aadhaarNumber: aadharNumber, otp }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Login Successful", description: "Redirecting..." });
        localStorage.setItem("auth", "true");
        navigate("/dashboard");
      } else {
        toast({
          title: "Verification Failed",
          description: data?.message || "Invalid OTP",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Cannot reach backend",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">SecureVote</h1>
          <p className="text-sm text-muted-foreground">
            Login with Aadhaar + OTP
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login with Aadhaar</CardTitle>
            <CardDescription>
              Enter Aadhaar and mobile to receive OTP
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <input
                  type="text"
                  placeholder="12-digit Aadhaar"
                  value={aadharNumber}
                  onChange={(e) =>
                    setAadharNumber(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={12}
                  className="w-full px-3 py-2 border rounded"
                  disabled={isLoading}
                />
                <input
                  type="text"
                  placeholder="10-digit Mobile"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={10}
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
                <div className="text-sm">OTP sent to +91{mobile}</div>
                <input
                  type="text"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  className="w-full px-3 py-2 border rounded"
                  disabled={isLoading}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Login"}
                  </button>
                  <button
                    type="button"
                    className="flex-1 border py-2 rounded"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    disabled={isLoading}
                  >
                    Change / Resend
                  </button>
                </div>
              </form>
            )}
            <div className="mt-4 text-xs text-muted-foreground">
              Backend logs OTP when SMS provider is not configured. Do not use
              real Aadhaar without UIDAI authorization.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;