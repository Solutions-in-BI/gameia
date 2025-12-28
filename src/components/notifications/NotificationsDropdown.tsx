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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const typeIcons: Record<string, React.ReactNode> = {
  gift: <Gift className="w-4 h-4 text-pink-500" />,
  friend_request: <UserPlus className="w-4 h-4 text-blue-500" />,
  invite_accepted: <Building2 className="w-4 h-4 text-green-500" />,
  invite_used: <Building2 className="w-4 h-4 text-primary" />,
  achievement: <Trophy className="w-4 h-4 text-yellow-500" />,
  challenge: <Target className="w-4 h-4 text-orange-500" />,
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
}) {
  const icon = typeIcons[notification.type] || <Bell className="w-4 h-4 text-muted-foreground" />;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors",
        notification.is_read 
          ? "bg-background/50" 
          : "bg-primary/5 border-l-2 border-primary"
      )}
    >
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm",
          notification.is_read ? "text-muted-foreground" : "text-foreground font-medium"
        )}>
          {notification.title}
        </p>
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
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

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
