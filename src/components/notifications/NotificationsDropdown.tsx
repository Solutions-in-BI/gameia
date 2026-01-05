/**
 * Dropdown de notificações no header
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Gift, 
  UserPlus, 
  Building2, 
  Trophy,
  Target,
  X,
  Brain,
  Users,
  Calendar,
  ClipboardCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const typeIcons: Record<string, React.ReactNode> = {
  gift: <Gift className="w-4 h-4 text-accent" />,
  friend_request: <UserPlus className="w-4 h-4 text-gameia-info" />,
  invite_accepted: <Building2 className="w-4 h-4 text-gameia-success" />,
  invite_used: <Building2 className="w-4 h-4 text-primary" />,
  achievement: <Trophy className="w-4 h-4 text-primary" />,
  challenge: <Target className="w-4 h-4 text-accent" />,
  // Novos tipos de avaliação
  assessment_suggestion: <Sparkles className="w-4 h-4 text-secondary-foreground" />,
  assessment_completed: <ClipboardCheck className="w-4 h-4 text-gameia-success" />,
  pdi_goal_due: <AlertCircle className="w-4 h-4 text-gameia-warning" />,
  team_assessment: <Users className="w-4 h-4 text-gameia-info" />,
  feedback_request: <Brain className="w-4 h-4 text-secondary-foreground" />,
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
}: {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
  onNavigate?: () => void;
}) {
  const icon = typeIcons[notification.type] || <Bell className="w-4 h-4 text-muted-foreground" />;
  const priority = notification.priority || 'normal';
  
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead();
    }
    if (notification.action_url && onNavigate) {
      onNavigate();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer",
        notification.is_read 
          ? "bg-background/50 hover:bg-muted/30" 
          : "bg-primary/5 border-l-2 border-primary hover:bg-primary/10",
        priority === 'urgent' && "border-l-destructive bg-destructive/5",
        priority === 'high' && "border-l-orange-500 bg-orange-500/5"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        priority === 'urgent' ? "bg-destructive/10" :
        priority === 'high' ? "bg-orange-500/10" : "bg-muted"
      )}>
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-sm",
            notification.is_read ? "text-muted-foreground" : "text-foreground font-medium"
          )}>
            {notification.title}
          </p>
          {priority === 'urgent' && (
            <Badge variant="destructive" className="text-[10px] h-4 px-1">Urgente</Badge>
          )}
          {priority === 'high' && (
            <Badge variant="outline" className="text-[10px] h-4 px-1 border-gameia-warning text-gameia-warning">Alta</Badge>
          )}
        </div>
        {notification.message && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground/70 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { 
            addSuffix: true, 
            locale: ptBR 
          })}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead();
            }}
          >
            <Check className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const handleNavigate = (notification: Notification) => {
    if (notification.action_url) {
      setOpen(false);
      navigate(notification.action_url);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "absolute -top-1 -right-1 flex items-center justify-center",
                "min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground",
                "text-xs font-medium px-1"
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        align="end" 
        className="w-80 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Notificações</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={markAllAsRead}
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Ler todas
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                onClick={clearAll}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => markAsRead(notification.id)}
                    onDelete={() => deleteNotification(notification.id)}
                    onNavigate={() => handleNavigate(notification)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
