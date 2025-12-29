import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Settings2, ExternalLink } from "lucide-react";
import { useAreaPermissions } from "@/hooks/useAreaPermissions";

export function AdminQuickLinks() {
  const navigate = useNavigate();
  const { canAccessManage, canAccessConsole } = useAreaPermissions();

  if (!canAccessManage && !canAccessConsole) {
    return null;
  }

  return (
    <div className="surface p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Acessos Administrativos
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {canAccessManage && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/manage")}
            className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left group"
          >
            <div className="p-2.5 rounded-lg bg-secondary/20 text-secondary">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Painel de Gestão</p>
              <p className="text-xs text-muted-foreground">Gerenciar equipes e pessoas</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        )}
        
        {canAccessConsole && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/console")}
            className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left group"
          >
            <div className="p-2.5 rounded-lg bg-accent/20 text-accent">
              <Settings2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Console da Plataforma</p>
              <p className="text-xs text-muted-foreground">Configurações avançadas</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
