import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Marketing Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import Product from "./pages/Product";
import Services from "./pages/Services";
import UseCases from "./pages/UseCases";
import Demo from "./pages/Demo";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Security from "./pages/Security";

// Auth & Utility
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Invite from "./pages/Invite";
import CertificateVerify from "./pages/CertificateVerify";
import NotFound from "./pages/NotFound";

// Admin & Management
import Admin from "./pages/Admin";
import Manage from "./pages/Manage";
import Console from "./pages/Console";
import Profile from "./pages/Profile";
import { AdminGuard } from "./components/auth/AdminGuard";
import { AreaGuard } from "./components/auth/AreaGuard";

// App Layout & Pages
import { AppLayout } from "./components/layouts/AppLayout";
import OverviewPage from "./pages/app/OverviewPage";
import ArenaPage from "./pages/app/ArenaPage";
import DevelopmentPage from "./pages/app/DevelopmentPage";
import EvolutionPage from "./pages/app/EvolutionPage";
import CaminhoPage from "./pages/app/CaminhoPage";
import TrainingsListPage from "./pages/app/TrainingsListPage";
import TrainingDetail from "./pages/TrainingDetail";
import ModulePlayer from "./pages/ModulePlayer";
import JourneyPlayerPage from "./pages/app/JourneyPlayerPage";
import JourneyModulePlayer from "./pages/app/JourneyModulePlayer";
import Marketplace from "./pages/Marketplace";
import TrainingEditorPage from "./pages/console/TrainingEditorPage";
import RecreationPage from "./pages/app/RecreationPage";
import CertificatesPage from "./pages/app/CertificatesPage";

// Legacy redirect
import Dashboard from "./pages/Dashboard";

// QueryClient otimizado para reduzir re-fetches desnecessários
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20000,
      gcTime: 300000,
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: false,
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
          
          {/* App Routes - Nested under AppLayout */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="arena" element={<ArenaPage />} />
            <Route path="development" element={<DevelopmentPage />} />
            <Route path="evolution" element={<EvolutionPage />} />
            <Route path="caminho" element={<CaminhoPage />} />
            <Route path="trainings" element={<TrainingsListPage />} />
            <Route path="trainings/:id" element={<TrainingDetail />} />
            <Route path="trainings/:trainingId/module/:moduleId" element={<ModulePlayer />} />
            <Route path="journeys/:journeyId" element={<JourneyPlayerPage />} />
            <Route path="journeys/:journeyId/training/:trainingId/module/:moduleId" element={<JourneyModulePlayer />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="recreation" element={<RecreationPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
          </Route>
          
          {/* Legacy redirect - keep for backwards compat */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/perfil" element={<Profile />} />
          
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
          
          {/* Training Editor - Dedicated Page */}
          <Route
            path="/console/trainings/:id/editor"
            element={
              <AreaGuard area="console">
                <TrainingEditorPage />
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
