import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * ===========================================
 * HOOK: useAuth
 * ===========================================
 * 
 * Gerencia autenticação com Lovable Cloud.
 */

export interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  selected_title: string | null;
  created_at: string;
}

function getDefaultNickname(user: User) {
  const meta = (user.user_metadata as Record<string, unknown> | null) ?? {};
  const metaNick = typeof meta.nickname === "string" ? meta.nickname.trim() : "";
  const emailNick = user.email?.split("@")[0] ?? "";

  return (metaNick || emailNick || "Usuário").slice(0, 20);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const ensureProfile = useCallback(async (authUser: User) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) {
      setProfile(null);
      return;
    }

    if (data) {
      setProfile(data as Profile);
      return;
    }

    const nickname = getDefaultNickname(authUser);

    const { data: created, error: createError } = await supabase
      .from("profiles")
      .upsert({ id: authUser.id, nickname }, { onConflict: "id" })
      .select("*")
      .maybeSingle();

    if (!createError) {
      setProfile((created as Profile) ?? null);
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          ensureProfile(session.user);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        ensureProfile(session.user);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [ensureProfile]);

  const signUp = async (email: string, password: string, nickname: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { nickname },
      },
    });

    if (!error && data.session?.user) {
      await ensureProfile({
        ...data.session.user,
        user_metadata: { ...(data.session.user.user_metadata ?? {}), nickname },
      } as User);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateProfile = async (updates: {
    nickname?: string;
    avatar_url?: string;
    selected_title?: string | null;
  }) => {
    if (!user) return { error: new Error("Usuário não autenticado") };

    const nickname = updates.nickname || profile?.nickname || getDefaultNickname(user);

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        nickname,
        avatar_url: updates.avatar_url ?? profile?.avatar_url ?? null,
        selected_title: updates.selected_title ?? profile?.selected_title ?? null,
      }, { onConflict: "id" })
      .select("*")
      .maybeSingle();

    if (!error && data) {
      setProfile(data as Profile);
    }

    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  return {
    user,
    session,
    profile,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    refreshProfile: () => user && ensureProfile(user),
    isAuthenticated: !!session,
  };
}

