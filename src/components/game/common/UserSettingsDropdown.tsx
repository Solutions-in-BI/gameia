/**
 * UserSettingsDropdown - Menu de configurações do usuário no header
 */

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, 
  LogOut, 
  Flame, 
  Moon, 
  Sun,
  Bell,
  Volume2,
  VolumeX,
  Building2,
  Sparkles
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
import { UserProfileIndicator } from "./UserProfileIndicator";
import { getLevelInfo, getLevelProgress } from "@/constants/levels";

interface UserSettingsDropdownProps {
  displayName: string;
  avatarUrl?: string | null;
  streak: number;
  level: number;
  xp: number;
  selectedTitle?: string | null;
  onViewProfile: () => void;
  onViewStreak: () => void;
  onLogout: () => void;
}

export function UserSettingsDropdown({
  displayName,
  avatarUrl,
  streak,
  level,
  xp,
  selectedTitle,
  onViewProfile,
  onViewStreak,
  onLogout,
}: UserSettingsDropdownProps) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { preferences, updatePreference } = usePreferences();
  const { isAdmin, currentOrg } = useOrganization();
  
  const avatarInitial = displayName.charAt(0).toUpperCase() || "G";
  const levelInfo = getLevelInfo(level, xp);
  const progress = getLevelProgress(xp, level);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserProfileIndicator
          displayName={displayName}
          avatarUrl={avatarUrl}
          level={level}
          xp={xp}
          selectedTitle={selectedTitle}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-2">
        {/* Enhanced user info header with level progress */}
        <div className="p-4 mb-2 bg-gradient-to-br from-muted/80 to-muted/40 rounded-xl border border-border/50">
          <div className="flex items-start gap-4">
            {/* Avatar with ring progress */}
            <div className="relative">
              <svg className="w-14 h-14 -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted"
                />
                <motion.circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - progress / 100) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary-foreground font-semibold">
                      {avatarInitial}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* User info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground truncate">{displayName}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <Sparkles className="w-3 h-3 text-primary" />
                <span>{selectedTitle || levelInfo.title}</span>
              </div>
              
              {/* Level info */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-foreground">Nível {level}</span>
                  <span className="text-muted-foreground">
                    {xp.toLocaleString()} / {levelInfo.xpForNext.toLocaleString()} XP
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
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
