/**
 * ConsoleHeader - Header do console de configuração
 */

import { Link, useNavigate } from "react-router-dom";
import { 
  Settings, 
  LogOut, 
  ChevronDown,
  Gamepad2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useAreaPermissions } from "@/hooks/useAreaPermissions";
import { Logo } from "@/components/common/Logo";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function ConsoleHeader() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { canAccessManage } = useAreaPermissions();

  // Buscar profile separadamente
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const displayName = profile?.nickname || user?.email?.split('@')[0] || "Admin";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="h-16 bg-card border-b border-border px-4 flex items-center justify-between sticky top-0 z-50">
      {/* Logo + Area indicator */}
      <div className="flex items-center gap-4">
        <Link to="/app" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="font-bold text-lg text-foreground hidden sm:block">Gameia</span>
        </Link>
        
        <div className="h-6 w-px bg-border hidden sm:block" />
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full">
          <Settings className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-500">Console</span>
        </div>
      </div>

      {/* Navigation + User */}
      <div className="flex items-center gap-2">
        {/* Quick links */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app")}
          className="hidden sm:flex items-center gap-2"
        >
          <Gamepad2 className="h-4 w-4" />
          App
        </Button>

        {canAccessManage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/manage")}
            className="hidden sm:flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Gestão
          </Button>
        )}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-amber-500/10 text-amber-500 text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:block">{displayName}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/app")}>
              <Gamepad2 className="h-4 w-4 mr-2" />
              Ir para App
            </DropdownMenuItem>
            {canAccessManage && (
              <DropdownMenuItem onClick={() => navigate("/manage")}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Gestão
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
