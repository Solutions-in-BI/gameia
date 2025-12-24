/**
 * FriendsPage - Página de gerenciamento de amigos e grupos
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Gift, 
  Crown, 
  Check, 
  X, 
  Search, 
  Plus,
  Trash2,
  LogOut,
  Send,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFriends } from "@/hooks/useFriends";
import { useMarketplace } from "@/hooks/useMarketplace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FriendsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FriendsPage({ isOpen, onClose }: FriendsPageProps) {
  const {
    friends,
    pendingRequests,
    groups,
    pendingGifts,
    isLoading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    createGroup,
    addToGroup,
    leaveGroup,
    deleteGroup,
    sendGift,
    acceptGift,
    rejectGift,
  } = useFriends();

  const { items } = useMarketplace();

  const [searchNickname, setSearchNickname] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupIcon, setSelectedGroupIcon] = useState("👥");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedFriendForGift, setSelectedFriendForGift] = useState<string | null>(null);
  const [giftMessage, setGiftMessage] = useState("");
  const [selectedGiftItem, setSelectedGiftItem] = useState<string | null>(null);

  const groupIcons = ["👥", "🎮", "🏆", "⚔️", "🌟", "🔥", "💎", "🎯"];

  const handleSendRequest = async () => {
    if (searchNickname.trim()) {
      const success = await sendFriendRequest(searchNickname.trim());
      if (success) {
        setSearchNickname("");
        setShowAddFriend(false);
      }
    }
  };

  const handleCreateGroup = async () => {
    if (newGroupName.trim()) {
      await createGroup(newGroupName.trim(), selectedGroupIcon);
      setNewGroupName("");
      setShowCreateGroup(false);
    }
  };

  const handleSendGift = async () => {
    if (selectedFriendForGift && selectedGiftItem) {
      await sendGift(selectedFriendForGift, selectedGiftItem, giftMessage);
      setSelectedFriendForGift(null);
      setSelectedGiftItem(null);
      setGiftMessage("");
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto"
    >
      <div className="container max-w-4xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Amigos</h1>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Notificações de presentes */}
        {pendingGifts.length > 0 && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6"
          >
            <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Presentes Pendentes ({pendingGifts.length})
            </h3>
            <div className="space-y-2">
              {pendingGifts.map(gift => (
                <div key={gift.id} className="flex items-center justify-between bg-card rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{gift.itemIcon}</span>
                    <div>
                      <p className="font-medium text-foreground">{gift.itemName}</p>
                      <p className="text-sm text-muted-foreground">de {gift.senderNickname}</p>
                      {gift.message && (
                        <p className="text-xs text-muted-foreground italic">"{gift.message}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => acceptGift(gift.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => rejectGift(gift.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Solicitações pendentes */}
        {pendingRequests.length > 0 && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6"
          >
            <h3 className="font-bold text-yellow-500 mb-3 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Solicitações de Amizade ({pendingRequests.length})
            </h3>
            <div className="space-y-2">
              {pendingRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between bg-card rounded-lg p-3">
                  <span className="font-medium text-foreground">{req.odNickname}</span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => acceptFriendRequest(req.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => rejectFriendRequest(req.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="friends">
              <Users className="w-4 h-4 mr-2" />
              Amigos ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="groups">
              <Crown className="w-4 h-4 mr-2" />
              Grupos ({groups.length})
            </TabsTrigger>
          </TabsList>

          {/* Lista de Amigos */}
          <TabsContent value="friends">
            <div className="flex justify-end mb-4">
              <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Amigo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Amigo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite o nickname..."
                        value={searchNickname}
                        onChange={(e) => setSearchNickname(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendRequest()}
                      />
                      <Button onClick={handleSendRequest}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {friends.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Você ainda não tem amigos.</p>
                <p className="text-sm">Adicione alguém para começar!</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {friends.map(friend => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold text-primary-foreground">
                        {friend.odNickname.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{friend.odNickname}</span>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedFriendForGift(friend.odId)}
                          >
                            <Gift className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Enviar Presente para {friend.odNickname}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4 max-h-96 overflow-y-auto">
                            <div className="grid grid-cols-3 gap-2">
                              {items.filter(item => item.category !== "boost").map(item => (
                                <button
                                  key={item.id}
                                  onClick={() => setSelectedGiftItem(item.id)}
                                  className={cn(
                                    "p-3 rounded-lg border text-center transition-all",
                                    selectedGiftItem === item.id
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:border-primary/50"
                                  )}
                                >
                                  <span className="text-2xl">{item.icon}</span>
                                  <p className="text-xs mt-1 truncate">{item.name}</p>
                                  <p className="text-xs text-yellow-500">{item.price} 🪙</p>
                                </button>
                              ))}
                            </div>
                            <Input
                              placeholder="Mensagem (opcional)"
                              value={giftMessage}
                              onChange={(e) => setGiftMessage(e.target.value)}
                            />
                            <Button 
                              className="w-full" 
                              onClick={handleSendGift}
                              disabled={!selectedGiftItem}
                            >
                              <Gift className="w-4 h-4 mr-2" />
                              Enviar Presente
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive"
                        onClick={() => removeFriend(friend.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Lista de Grupos */}
          <TabsContent value="groups">
            <div className="flex justify-end mb-4">
              <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Grupo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Grupo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Nome do grupo"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Escolha um ícone:</p>
                      <div className="flex gap-2 flex-wrap">
                        {groupIcons.map(icon => (
                          <button
                            key={icon}
                            onClick={() => setSelectedGroupIcon(icon)}
                            className={cn(
                              "w-10 h-10 rounded-lg border text-xl flex items-center justify-center transition-all",
                              selectedGroupIcon === icon
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleCreateGroup}>
                      Criar Grupo
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {groups.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Crown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Você não participa de nenhum grupo.</p>
                <p className="text-sm">Crie um para competir com amigos!</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {groups.map(group => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{group.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{group.name}</span>
                            {group.isOwner && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {group.memberCount}/{group.maxMembers} membros
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {group.isOwner ? (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive"
                            onClick={() => deleteGroup(group.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => leaveGroup(group.id)}
                          >
                            <LogOut className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
