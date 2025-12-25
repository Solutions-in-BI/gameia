export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      decision_options: {
        Row: {
          cost_score: number | null
          created_at: string
          feedback: string
          id: string
          impact_score: number | null
          is_optimal: boolean | null
          option_text: string
          risk_score: number | null
          scenario_id: string
        }
        Insert: {
          cost_score?: number | null
          created_at?: string
          feedback: string
          id?: string
          impact_score?: number | null
          is_optimal?: boolean | null
          option_text: string
          risk_score?: number | null
          scenario_id: string
        }
        Update: {
          cost_score?: number | null
          created_at?: string
          feedback?: string
          id?: string
          impact_score?: number | null
          is_optimal?: boolean | null
          option_text?: string
          risk_score?: number | null
          scenario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decision_options_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "decision_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_scenarios: {
        Row: {
          category_id: string | null
          context: string
          created_at: string
          difficulty: string
          id: string
          title: string
          xp_reward: number | null
        }
        Insert: {
          category_id?: string | null
          context: string
          created_at?: string
          difficulty?: string
          id?: string
          title: string
          xp_reward?: number | null
        }
        Update: {
          category_id?: string | null
          context?: string
          created_at?: string
          difficulty?: string
          id?: string
          title?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "decision_scenarios_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "quiz_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "friend_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_groups: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          max_members: number | null
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          max_members?: number | null
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          max_members?: number | null
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Relationships: []
      }
      gifts: {
        Row: {
          coins_spent: number
          created_at: string
          id: string
          item_id: string
          message: string | null
          receiver_id: string
          responded_at: string | null
          sender_id: string
          status: Database["public"]["Enums"]["gift_status"]
        }
        Insert: {
          coins_spent: number
          created_at?: string
          id?: string
          item_id: string
          message?: string | null
          receiver_id: string
          responded_at?: string | null
          sender_id: string
          status?: Database["public"]["Enums"]["gift_status"]
        }
        Update: {
          coins_spent?: number
          created_at?: string
          id?: string
          item_id?: string
          message?: string | null
          receiver_id?: string
          responded_at?: string | null
          sender_id?: string
          status?: Database["public"]["Enums"]["gift_status"]
        }
        Relationships: [
          {
            foreignKeyName: "gifts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard: {
        Row: {
          created_at: string
          difficulty: string | null
          game_type: string
          id: string
          player_name: string
          score: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          difficulty?: string | null
          game_type: string
          id?: string
          player_name: string
          score: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          difficulty?: string | null
          game_type?: string
          id?: string
          player_name?: string
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string
          id: string
          is_active: boolean
          name: string
          price: number
          rarity: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          is_active?: boolean
          name: string
          price: number
          rarity?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          rarity?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          nickname: string
          selected_title: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          nickname: string
          selected_title?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          nickname?: string
          selected_title?: string | null
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answer_index: number
          created_at: string
          id: string
          is_correct: boolean
          match_id: string
          question_id: string
          time_taken: number
          user_id: string
        }
        Insert: {
          answer_index: number
          created_at?: string
          id?: string
          is_correct: boolean
          match_id: string
          question_id: string
          time_taken: number
          user_id: string
        }
        Update: {
          answer_index?: number
          created_at?: string
          id?: string
          is_correct?: boolean
          match_id?: string
          question_id?: string
          time_taken?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "quiz_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_bets: {
        Row: {
          bet_on_player_id: string
          coins_bet: number
          coins_won: number | null
          created_at: string
          id: string
          is_won: boolean | null
          match_id: string
          user_id: string
        }
        Insert: {
          bet_on_player_id: string
          coins_bet: number
          coins_won?: number | null
          created_at?: string
          id?: string
          is_won?: boolean | null
          match_id: string
          user_id: string
        }
        Update: {
          bet_on_player_id?: string
          coins_bet?: number
          coins_won?: number | null
          created_at?: string
          id?: string
          is_won?: boolean | null
          match_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_bets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "quiz_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      quiz_matches: {
        Row: {
          category_id: string
          created_at: string
          current_question: number
          finished_at: string | null
          game_mode: string | null
          id: string
          player1_id: string
          player1_score: number
          player2_id: string | null
          player2_score: number
          questions: Json | null
          status: Database["public"]["Enums"]["quiz_match_status"]
          winner_id: string | null
        }
        Insert: {
          category_id: string
          created_at?: string
          current_question?: number
          finished_at?: string | null
          game_mode?: string | null
          id?: string
          player1_id: string
          player1_score?: number
          player2_id?: string | null
          player2_score?: number
          questions?: Json | null
          status?: Database["public"]["Enums"]["quiz_match_status"]
          winner_id?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string
          current_question?: number
          finished_at?: string | null
          game_mode?: string | null
          id?: string
          player1_id?: string
          player1_score?: number
          player2_id?: string | null
          player2_score?: number
          questions?: Json | null
          status?: Database["public"]["Enums"]["quiz_match_status"]
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_matches_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "quiz_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          category_id: string
          correct_answer: number
          created_at: string
          difficulty: Database["public"]["Enums"]["quiz_difficulty"]
          explanation: string | null
          id: string
          options: Json
          question: string
          xp_reward: number
        }
        Insert: {
          category_id: string
          correct_answer: number
          created_at?: string
          difficulty?: Database["public"]["Enums"]["quiz_difficulty"]
          explanation?: string | null
          id?: string
          options: Json
          question: string
          xp_reward?: number
        }
        Update: {
          category_id?: string
          correct_answer?: number
          created_at?: string
          difficulty?: Database["public"]["Enums"]["quiz_difficulty"]
          explanation?: string | null
          id?: string
          options?: Json
          question?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "quiz_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_tree: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          icon: string
          id: string
          is_unlocked_by_default: boolean | null
          level: number
          name: string
          parent_skill_id: string | null
          xp_required: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_unlocked_by_default?: boolean | null
          level?: number
          name: string
          parent_skill_id?: string | null
          xp_required?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_unlocked_by_default?: boolean | null
          level?: number
          name?: string
          parent_skill_id?: string | null
          xp_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "skill_tree_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "quiz_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_tree_parent_skill_id_fkey"
            columns: ["parent_skill_id"]
            isOneToOne: false
            referencedRelation: "skill_tree"
            referencedColumns: ["id"]
          },
        ]
      }
      symbolic_rewards: {
        Row: {
          coins_required: number | null
          created_at: string
          description: string | null
          icon: string
          id: string
          is_active: boolean | null
          level_required: number | null
          name: string
          type: string
        }
        Insert: {
          coins_required?: number | null
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          is_active?: boolean | null
          level_required?: number | null
          name: string
          type: string
        }
        Update: {
          coins_required?: number | null
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          level_required?: number | null
          name?: string
          type?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_competency_profile: {
        Row: {
          consistency_score: number | null
          decision_speed_avg: number | null
          id: string
          impact_focus: number | null
          risk_tolerance: number | null
          strengths: string[] | null
          total_correct_decisions: number | null
          total_scenarios_completed: number | null
          updated_at: string
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          consistency_score?: number | null
          decision_speed_avg?: number | null
          id?: string
          impact_focus?: number | null
          risk_tolerance?: number | null
          strengths?: string[] | null
          total_correct_decisions?: number | null
          total_scenarios_completed?: number | null
          updated_at?: string
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          consistency_score?: number | null
          decision_speed_avg?: number | null
          id?: string
          impact_focus?: number | null
          risk_tolerance?: number | null
          strengths?: string[] | null
          total_correct_decisions?: number | null
          total_scenarios_completed?: number | null
          updated_at?: string
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      user_decision_answers: {
        Row: {
          created_at: string
          id: string
          option_id: string
          scenario_id: string
          time_taken: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          scenario_id: string
          time_taken: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          scenario_id?: string
          time_taken?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_decision_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "decision_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_decision_answers_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "decision_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_inventory: {
        Row: {
          id: string
          is_equipped: boolean
          item_id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_equipped?: boolean
          item_id: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_equipped?: boolean
          item_id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          created_at: string
          id: string
          redeemed_at: string | null
          reward_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          redeemed_at?: string | null
          reward_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          redeemed_at?: string | null
          reward_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "symbolic_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skills: {
        Row: {
          created_at: string
          id: string
          is_unlocked: boolean | null
          mastery_level: number | null
          skill_id: string
          unlocked_at: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_unlocked?: boolean | null
          mastery_level?: number | null
          skill_id: string
          unlocked_at?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_unlocked?: boolean | null
          mastery_level?: number | null
          skill_id?: string
          unlocked_at?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_tree"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          coins: number
          dino_best_score: number
          dino_games_played: number
          id: string
          level: number
          memory_best_moves: Json
          memory_best_time: Json
          memory_games_played: number
          snake_best_score: number
          snake_games_played: number
          snake_max_length: number
          tetris_best_level: number
          tetris_best_score: number
          tetris_games_played: number
          tetris_lines_cleared: number
          total_games_played: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          coins?: number
          dino_best_score?: number
          dino_games_played?: number
          id?: string
          level?: number
          memory_best_moves?: Json
          memory_best_time?: Json
          memory_games_played?: number
          snake_best_score?: number
          snake_games_played?: number
          snake_max_length?: number
          tetris_best_level?: number
          tetris_best_score?: number
          tetris_games_played?: number
          tetris_lines_cleared?: number
          total_games_played?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          coins?: number
          dino_best_score?: number
          dino_games_played?: number
          id?: string
          level?: number
          memory_best_moves?: Json
          memory_best_time?: Json
          memory_games_played?: number
          snake_best_score?: number
          snake_games_played?: number
          snake_max_length?: number
          tetris_best_level?: number
          tetris_best_score?: number
          tetris_games_played?: number
          tetris_lines_cleared?: number
          total_games_played?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_claimed_at: string | null
          last_played_at: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_claimed_at?: string | null
          last_played_at?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_claimed_at?: string | null
          last_played_at?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_titles: {
        Row: {
          id: string
          title_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      friendship_status: "pending" | "accepted" | "blocked"
      gift_status: "pending" | "accepted" | "rejected"
      quiz_difficulty: "easy" | "medium" | "hard"
      quiz_match_status: "waiting" | "in_progress" | "finished" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      friendship_status: ["pending", "accepted", "blocked"],
      gift_status: ["pending", "accepted", "rejected"],
      quiz_difficulty: ["easy", "medium", "hard"],
      quiz_match_status: ["waiting", "in_progress", "finished", "cancelled"],
    },
  },
} as const
