/**
 * ProfileHeader - Cabeçalho do perfil com avatar animado e informações básicas
 */

import { useState, useRef } from "react";
import { Camera, Edit2, Crown, Medal, Star, ShoppingBag, Coins } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { GameButton } from "../common/GameButton";
import { CurrentTitleBadge } from "../common/TitlesSelector";
import { AnimatedAvatarFrame } from "../common/AnimatedAvatarFrame";
import { LevelBadge } from "../common/LevelBadge";
import { Profile, useAuth } from "@/hooks/useAuth";
import { InventoryItem } from "@/hooks/useMarketplace";
import { GameTitle } from "@/constants/titles";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Avatares especiais para top 3
const TOP_AVATARS = [
  { position: 1, icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/20", label: "Campeão" },
  { position: 2, icon: Medal, color: "text-gray-400", bg: "bg-gray-400/20", label: "Vice" },
  { position: 3, icon: Star, color: "text-amber-600", bg: "bg-amber-600/20", label: "Bronze" },
];

interface ProfileHeaderProps {
  profile: Profile | null;
  user: User | null;
  coins: number;
  level: number;
  xp: number;
  topRanks: Record<string, number>;
  selectedTitle: GameTitle | null;
  equippedAvatar: InventoryItem | undefined;
  equippedFrame: InventoryItem | undefined;
  onOpenMarketplace: () => void;
  onRefreshProfile: () => void;
}

export function ProfileHeader({
  profile,
  user,
  coins,
  level,
  xp,
  topRanks,
  selectedTitle,
  equippedAvatar,
  equippedFrame,
  onOpenMarketplace,
  onRefreshProfile,
}: ProfileHeaderProps) {
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { updateProfile } = useAuth();
  const { toast } = useToast();

  // Upload de foto
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Erro", description: "Selecione uma imagem", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Erro", description: "Imagem deve ter no máximo 2MB", variant: "destructive" });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: urlData.publicUrl + "?t=" + Date.now() });
      onRefreshProfile();
      
      toast({ title: "Foto atualizada!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao enviar foto", variant: "destructive" });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleUpdateNickname = async () => {
    if (!newNickname.trim() || newNickname.length < 2 || newNickname.length > 20) {
      toast({ title: "Apelido inválido", description: "Deve ter entre 2 e 20 caracteres", variant: "destructive" });
      return;
    }
    
    const { error } = await updateProfile({ nickname: newNickname.trim() });
    if (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o apelido", variant: "destructive" });
    } else {
      toast({ title: "Atualizado!", description: "Seu apelido foi alterado" });
      setIsEditingNickname(false);
    }
  };

  // Badges do top 3
  const getTopBadges = () => {
    return Object.entries(topRanks).map(([game, position]) => {
      const avatar = TOP_AVATARS.find(a => a.position === position);
      if (!avatar) return null;
      const Icon = avatar.icon;
      const gameNames: Record<string, string> = {
        snake: "Snake",
        dino: "Dino",
        tetris: "Tetris",
        memory: "Memória"
      };
      return { game, position, ...avatar, gameName: gameNames[game], Icon };
    }).filter(Boolean);
  };

  const topBadges = getTopBadges();

  return (
    <div className="space-y-4">
      {/* Card Principal */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
        <div className="flex items-start gap-4 sm:gap-6">
          {/* Avatar Animado */}
          <div className="relative group flex-shrink-0">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            
            <AnimatedAvatarFrame
              avatarUrl={profile?.avatar_url}
              nickname={profile?.nickname}
              equippedFrame={equippedFrame}
              equippedAvatar={equippedAvatar}
              size="lg"
              showAnimations={true}
            />
            
            {/* Botão de upload overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="absolute inset-0 w-full h-full rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30"
            >
              {isUploadingPhoto ? (
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Badge do melhor ranking */}
            {topBadges.length > 0 && (
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-card border border-border shadow-sm z-30">
                {(() => {
                  const best = topBadges.sort((a, b) => (a?.position || 4) - (b?.position || 4))[0];
                  if (!best) return null;
                  const Icon = best.Icon;
                  return <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", best.color)} />;
                })()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {isEditingNickname ? (
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="Novo apelido"
                  className="flex-1 min-w-[120px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                  maxLength={20}
                  autoFocus
                />
                <GameButton variant="primary" size="sm" onClick={handleUpdateNickname}>
                  Salvar
                </GameButton>
                <GameButton variant="muted" size="sm" onClick={() => setIsEditingNickname(false)}>
                  Cancelar
                </GameButton>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {profile?.nickname || "Jogador"}
                </h2>
                <button 
                  onClick={() => {
                    setNewNickname(profile?.nickname || "");
                    setIsEditingNickname(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )}
            
            {/* Título */}
            {selectedTitle && (
              <div className="mt-1">
                <CurrentTitleBadge title={selectedTitle} size="sm" />
              </div>
            )}
            
            <p className="text-muted-foreground text-xs sm:text-sm mt-1 truncate">{user?.email}</p>
            
            {/* Level e XP */}
            <div className="mt-3">
              <div className="flex items-center gap-3 mb-2">
                <LevelBadge level={level} xp={xp} size="lg" showProgress showTitle />
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                  style={{ width: `${xp % 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Nível {level}</span>
                <span>{xp % 100}/100 XP</span>
              </div>
            </div>

            {/* Moedas e Loja */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-2.5 py-1">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-bold text-yellow-500">{coins.toLocaleString()}</span>
              </div>
              <button
                onClick={onOpenMarketplace}
                className="flex items-center gap-1.5 bg-primary/20 border border-primary/30 rounded-lg px-2.5 py-1 hover:bg-primary/30 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Loja</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Badges do Top 3 */}
      {topBadges.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">🏆 Emblemas Especiais</h3>
          <div className="flex flex-wrap gap-2">
            {topBadges.map((badge) => {
              if (!badge) return null;
              const Icon = badge.Icon;
              return (
                <div 
                  key={badge.game}
                  className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", badge.bg)}
                >
                  <Icon className={cn("w-4 h-4", badge.color)} />
                  <span className="font-medium text-foreground">
                    {badge.label} em {badge.gameName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
