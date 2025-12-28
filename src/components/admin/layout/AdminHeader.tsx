/**
 * AdminHeader - Header do Admin Center com ações contextuais
 */

import { Building2, Crown, ArrowLeft, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { AdminSection } from "./AdminSidebar";

interface AdminHeaderProps {
  organizationName: string;
  currentSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onToggleSidebar?: () => void;
}

export function AdminHeader({
  organizationName,
  currentSection,
  onNavigate,
  onToggleSidebar,
}: AdminHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onToggleSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-display font-bold text-foreground">
                {organizationName}
              </h1>
              <AdminBreadcrumb
                currentSection={currentSection}
                onNavigate={onNavigate}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full hidden sm:flex items-center">
              <Crown className="w-4 h-4 mr-1" />
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
