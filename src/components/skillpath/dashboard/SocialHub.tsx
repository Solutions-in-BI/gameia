/**
 * Hub social - Amigos, Grupos, Presentes
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Gift, 
  UserPlus,
  MessageCircle,
  Check,
  X,
  ChevronRight,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Friend {
  id: string;
  odNickname: string;
  status: string;
  isRequester: boolean;
}

interface PendingGift {
  id: string;
  senderNickname: string;
  itemName: string;
  itemIcon: string;
}

interface SocialHubProps {
  friends: Friend[];
  pendingRequests: Friend[];
  pendingGifts: PendingGift[];
  onSendRequest: (nickname: string) => Promise<boolean>;
  onAcceptRequest: (id: string) => Promise<boolean>;
  onRejectRequest: (id: string) => Promise<boolean>;
  onAcceptGift: (id: string) => Promise<boolean>;
  onRejectGift: (id: string) => Promise<boolean>;
  onViewFriends: () => void;
}

export function SocialHub({
  friends,
  pendingRequests,
  pendingGifts,
  onSendRequest,
  onAcceptRequest,
  onRejectRequest,
  onAcceptGift,
  onRejectGift,
  onViewFriends,
}: SocialHubProps) {
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const acceptedFriends = friends.filter(f => f.status === "accepted");
  const hasNotifications = pendingRequests.length > 0 || pendingGifts.length > 0;

  const handleSendRequest = async () => {
    if (!nickname.trim()) return;
    setIsLoading(true);
    const success = await onSendRequest(nickname);
    if (success) {
      setNickname("");
      setShowAddFriend(false);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Social
          {hasNotifications && (
            <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center animate-pulse">
              {pendingRequests.length + pendingGifts.length}
            </span>
          )}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddFriend(!showAddFriend)}
          className="text-muted-foreground hover:text-foreground"
        >
          <UserPlus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {/* Add friend form */}
      <AnimatePresence>
        {showAddFriend && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 p-3 rounded-xl bg-card/50 border border-border/50">
              <Input
                placeholder="Nickname do amigo"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendRequest()}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleSendRequest}
                disabled={isLoading || !nickname.trim()}
              >
                Enviar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Pending requests */}
        {pendingRequests.length > 0 && (
          <div className="p-4 rounded-2xl bg-card/50 border border-border/50 space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-warning" />
              Solicitações ({pendingRequests.length})
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {pendingRequests.slice(0, 3).map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-foreground truncate">
                    {req.odNickname}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-green-500 hover:bg-green-500/10"
                      onClick={() => onAcceptRequest(req.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => onRejectRequest(req.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending gifts */}
        {pendingGifts.length > 0 && (
          <div className="p-4 rounded-2xl bg-card/50 border border-border/50 space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Gift className="w-4 h-4 text-pink-500" />
              Presentes ({pendingGifts.length})
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {pendingGifts.slice(0, 3).map((gift) => (
                <div key={gift.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{gift.itemIcon}</span>
                    <div className="min-w-0">
                      <div className="text-sm text-foreground truncate">{gift.itemName}</div>
                      <div className="text-xs text-muted-foreground truncate">de {gift.senderNickname}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-green-500 hover:bg-green-500/10"
                      onClick={() => onAcceptGift(gift.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => onRejectGift(gift.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends list preview */}
        <div 
          onClick={onViewFriends}
          className={cn(
            "p-4 rounded-2xl bg-card/50 border border-border/50 cursor-pointer",
            "hover:bg-card hover:border-primary/30 transition-all",
            pendingRequests.length === 0 && pendingGifts.length === 0 && "sm:col-span-2"
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              Amigos ({acceptedFriends.length})
            </h3>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          {acceptedFriends.length > 0 ? (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex -space-x-2">
                {acceptedFriends.slice(0, 5).map((friend, i) => (
                  <div 
                    key={friend.id}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-xs font-semibold border-2 border-background"
                  >
                    {friend.odNickname.charAt(0).toUpperCase()}
                  </div>
                ))}
                {acceptedFriends.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-semibold border-2 border-background">
                    +{acceptedFriends.length - 5}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              Adicione amigos para competir e enviar presentes
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
