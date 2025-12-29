import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Invite from "./pages/Invite";
import Onboarding from "./pages/Onboarding";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Demo from "./pages/Demo";
import Product from "./pages/Product";
import UseCases from "./pages/UseCases";
import Security from "./pages/Security";
import Contact from "./pages/Contact";
import TrainingDetail from "./pages/TrainingDetail";
import ModulePlayer from "./pages/ModulePlayer";
import Trainings from "./pages/Trainings";
import Marketplace from "./pages/Marketplace";
import { AdminGuard } from "./components/auth/AdminGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Marketing Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/produto" element={<Product />} />
          <Route path="/casos-de-uso" element={<UseCases />} />
          <Route path="/planos" element={<Pricing />} />
          <Route path="/seguranca" element={<Security />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/demo" element={<Demo />} />
          
          {/* App Routes */}
          <Route path="/app" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/app/trainings" element={<Trainings />} />
          <Route path="/app/trainings/:id" element={<TrainingDetail />} />
          <Route path="/app/trainings/:trainingId/module/:moduleId" element={<ModulePlayer />} />
          <Route path="/app/marketplace" element={<Marketplace />} />
          
          {/* Auth & Onboarding */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <Admin />
              </AdminGuard>
            }
          />
          
          {/* Utility Routes */}
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
