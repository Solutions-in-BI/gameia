import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import Product from "./pages/Product";
import Services from "./pages/Services";
import UseCases from "./pages/UseCases";
import Demo from "./pages/Demo";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Security from "./pages/Security";
import Admin from "./pages/Admin";
import Manage from "./pages/Manage";
import Console from "./pages/Console";
import Profile from "./pages/Profile";
import CertificateVerify from "./pages/CertificateVerify";
import { AdminGuard } from "./components/auth/AdminGuard";
import { AreaGuard } from "./components/auth/AreaGuard";
import NotFound from "./pages/NotFound";
import Subscription from "./pages/Subscription";
import Onboarding from "./pages/Onboarding";
import Invite from "./pages/Invite";
import Trainings from "./pages/Trainings";
import TrainingDetail from "./pages/TrainingDetail";
import Marketplace from "./pages/Marketplace";
import ModulePlayer from "./pages/ModulePlayer";

// QueryClient otimizado para reduzir re-fetches desnecessários
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20000,           // 20s antes de considerar stale
      gcTime: 300000,             // 5min no garbage collection
      refetchOnWindowFocus: false, // Não refetch ao focar janela
      retry: 1,                    // Apenas 1 retry em erro
      refetchOnMount: false,       // Não refetch ao montar se tiver cache válido
    },
  },
});

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
          <Route path="/perfil" element={<Profile />} />
          <Route path="/app/trainings" element={<Trainings />} />
          <Route path="/app/trainings/:id" element={<TrainingDetail />} />
          <Route path="/app/trainings/:trainingId/module/:moduleId" element={<ModulePlayer />} />
          <Route path="/app/marketplace" element={<Marketplace />} />
          
          {/* Auth & Onboarding */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Admin (legacy - redirect to console) */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <Admin />
              </AdminGuard>
            }
          />
          
          {/* Manage - Gestão de Pessoas */}
          <Route
            path="/manage"
            element={
              <AreaGuard area="manage">
                <Manage />
              </AreaGuard>
            }
          />
          
          {/* Console - Configuração da Plataforma */}
          <Route
            path="/console"
            element={
              <AreaGuard area="console">
                <Console />
              </AreaGuard>
            }
          />
          
          {/* Utility Routes */}
          <Route path="/invite/:code" element={<Invite />} />
          <Route path="/certificates/:code" element={<CertificateVerify />} />
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
