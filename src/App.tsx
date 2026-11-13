import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Ballot from "./pages/Ballot";
import Verify from "./pages/Verify";
import Results from "./pages/Results";
import HowItWorks from "./pages/HowItWorks";
import Security from "./pages/Security";
import Help from "./pages/Help";
import CreatePoll from "./pages/CreatePoll";
import NotFound from "./pages/NotFound";
import IndiaElections from "./pages/IndiaElections";
import About from "./pages/About";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"checking" | "authenticated" | "anonymous">("checking");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data) => { if (active) setStatus(data.authenticated ? "authenticated" : "anonymous"); })
      .catch(() => { if (active) setStatus("anonymous"); });
    return () => { active = false; };
  }, []);

  if (status === "checking") {
    return <div className="grid min-h-screen place-items-center bg-background text-sm font-medium text-muted-foreground">Checking that you’re signed in…</div>;
  }
  return status === "authenticated" ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/security" element={<Security />} />
          <Route path="/help" element={<Help />} />
          <Route path="/india-elections" element={<IndiaElections />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/polls/create" element={<ProtectedRoute><CreatePoll /></ProtectedRoute>} />
          <Route path="/ballot/:electionId" element={<ProtectedRoute><Ballot /></ProtectedRoute>} />
          <Route path="/verify" element={<ProtectedRoute><Verify /></ProtectedRoute>} />
          <Route path="/results/:electionId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
