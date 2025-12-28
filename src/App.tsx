import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Invite from "./pages/Invite";
import Onboarding from "./pages/Onboarding";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Demo from "./pages/Demo";
import Subscription from "./pages/Subscription";
import { AdminGuard } from "./components/auth/AdminGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <Admin />
              </AdminGuard>
            }
          />
          <Route path="/invite/:code" element={<Invite />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
