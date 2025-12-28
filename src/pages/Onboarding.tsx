/**
 * Página de Onboarding
 * Rota dedicada para novos usuários configurarem perfil e organização
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { Loader2 } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, profile } = useAuth();
  const { myOrganizations, isLoading: orgLoading } = useOrganization();
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading || orgLoading) return;

    // Redirect to auth if not logged in
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    // Check if user needs onboarding
    // Show onboarding if:
    // 1. Profile has no nickname set (new user)
    // 2. User has no organizations and no invite pending
    const needsOnboarding = !profile?.nickname || profile.nickname.startsWith("Usuário");
    setShouldShowOnboarding(needsOnboarding);

    // If onboarding not needed, redirect to home
    if (!needsOnboarding) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, orgLoading, profile, myOrganizations, navigate]);

  const handleComplete = () => {
    // Mark onboarding as complete (could store in localStorage or DB)
    localStorage.setItem("gameia_onboarding_complete", "true");
    navigate("/");
  };

  // Loading state
  if (authLoading || orgLoading || shouldShowOnboarding === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show onboarding wizard
  if (shouldShowOnboarding) {
    return <OnboardingWizard onComplete={handleComplete} />;
  }

  // Fallback (shouldn't reach here normally)
  return null;
}
