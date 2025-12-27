/**
 * UserSettingsDropdown - Menu de configurações do usuário no header
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  User, 
  LogOut, 
  Flame, 
  Moon, 
  Sun,
  Bell,
  Volume2,
  VolumeX,
  ChevronDown,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";
import { usePreferences } from "@/hooks/usePreferences";
import { useOrganization } from "@/hooks/useOrganization";

interface UserSettingsDropdownProps {
  displayName: string;
  avatarUrl?: string | null;
  streak: number;
  onViewProfile: () => void;
  onViewStreak: () => void;
  onLogout: () => void;
}

export function UserSettingsDropdown({
  displayName,
  avatarUrl,
  streak,
  onViewProfile,
  onViewStreak,
  onLogout,
}: UserSettingsDropdownProps) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { preferences, updatePreference } = usePreferences();
  const { isAdmin, currentOrg } = useOrganization();
  
  const avatarInitial = displayName.charAt(0).toUpperCase() || "G";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted/50 transition-all group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-foreground text-sm font-semibold">
                {avatarInitial}
              </span>
            )}
          </div>
          
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-2">
        {/* User info header */}
        <div className="p-3 mb-2 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary-foreground font-semibold">
                  {avatarInitial}
                </span>
              )}
            </div>
            <div>
              <div className="font-semibold text-foreground">{displayName}</div>
              <div className="text-xs text-muted-foreground">Configurações da conta</div>
            </div>
          </div>
        </div>

        <DropdownMenuItem onClick={onViewProfile} className="gap-3 p-3 cursor-pointer">
          <User className="w-4 h-4" />
          <span>Ver Perfil</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onViewStreak} className="gap-3 p-3 cursor-pointer">
          <div className="flex items-center gap-3 flex-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Streak Diário</span>
          </div>
          {streak > 0 && (
            <span className="text-sm font-bold text-orange-500">{streak} dias</span>
          )}
        </DropdownMenuItem>

        {/* Admin Access - Only visible for admins with organization */}
        {isAdmin && currentOrg && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => navigate("/admin")} 
              className="gap-3 p-3 cursor-pointer bg-primary/5 hover:bg-primary/10"
            >
              <Building2 className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <span className="font-medium">Admin Center</span>
                <p className="text-xs text-muted-foreground">{currentOrg.name}</p>
              </div>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Quick settings */}
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wide px-3">
          Configurações Rápidas
        </DropdownMenuLabel>

        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-sm">Modo Escuro</span>
          </div>
          <Switch 
            checked={isDark} 
            onCheckedChange={toggleTheme} 
          />
        </div>

        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4" />
            <span className="text-sm">Notificações</span>
          </div>
          <Switch 
            checked={preferences?.notifications_enabled ?? true} 
            onCheckedChange={(checked) => updatePreference("notifications_enabled", checked)} 
          />
        </div>

        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {preferences?.sound_enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-sm">Sons</span>
          </div>
          <Switch 
            checked={preferences?.sound_enabled ?? true} 
            onCheckedChange={(checked) => updatePreference("sound_enabled", checked)} 
          />
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogout} className="gap-3 p-3 cursor-pointer text-destructive hover:text-destructive">
          <LogOut className="w-4 h-4" />
          <span>Sair da conta</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
