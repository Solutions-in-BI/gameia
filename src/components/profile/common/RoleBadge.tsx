import { Crown, Shield, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "super_admin" | "owner" | "admin" | "manager" | "user";

interface RoleBadgeProps {
  role: Role;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const roleConfig: Record<Role, { 
  label: string; 
  icon: typeof Crown; 
  className: string;
}> = {
  super_admin: {
    label: "Master",
    icon: Crown,
    className: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400"
  },
  owner: {
    label: "Owner",
    icon: Crown,
    className: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400"
  },
  admin: {
    label: "Admin",
    icon: Shield,
    className: "bg-primary/10 border-primary/30 text-primary"
  },
  manager: {
    label: "Gestor",
    icon: Shield,
    className: "bg-secondary/10 border-secondary/30 text-secondary"
  },
  user: {
    label: "Usuário",
    icon: UserIcon,
    className: "bg-muted border-border text-muted-foreground"
  }
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2"
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4"
};

export function RoleBadge({ role, size = "md", showLabel = true }: RoleBadgeProps) {
  const config = roleConfig[role] || roleConfig.user;
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.className,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}
