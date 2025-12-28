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
      api_request_logs: {
        Row: {
          api_key_id: string | null
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown
          method: string
          organization_id: string | null
          response_time_ms: number | null
          status_code: number | null
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: unknown
          method: string
          organization_id?: string | null
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown
          method?: string
          organization_id?: string | null
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_request_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "organization_api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_request_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_categories: {
        Row: {
          category_key: string
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          category_key: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          category_key?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      badge_requirements: {
        Row: {
          badge_id: string
          created_at: string | null
          id: string
          is_required: boolean | null
          requirement_key: string
          requirement_operator: string | null
          requirement_type: string
          requirement_value: Json
        }
        Insert: {
          badge_id: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          requirement_key: string
          requirement_operator?: string | null
          requirement_type: string
          requirement_value: Json
        }
        Update: {
          badge_id?: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          requirement_key?: string
          requirement_operator?: string | null
          requirement_type?: string
          requirement_value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "badge_requirements_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_trails: {
        Row: {
          category: string | null
          color: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          display_order: number | null
          estimated_hours: number | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          points_reward: number | null
          trail_key: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          display_order?: number | null
          estimated_hours?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          points_reward?: number | null
          trail_key: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          display_order?: number | null
          estimated_hours?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          points_reward?: number | null
          trail_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "badge_trails_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          badge_key: string
          category_id: string | null
          coins_reward: number | null
          created_at: string | null
          description: string | null
          icon: string
          id: string
          is_active: boolean | null
          is_secret: boolean | null
          name: string
          organization_id: string | null
          rarity: string | null
          xp_reward: number | null
        }
        Insert: {
          badge_key: string
          category_id?: string | null
          coins_reward?: number | null
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          is_active?: boolean | null
          is_secret?: boolean | null
          name: string
          organization_id?: string | null
          rarity?: string | null
          xp_reward?: number | null
        }
        Update: {
          badge_key?: string
          category_id?: string | null
          coins_reward?: number | null
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_secret?: boolean | null
          name?: string
          organization_id?: string | null
          rarity?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "badges_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "badge_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badges_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_assessments: {
        Row: {
          assessment_type: string
          attempts_count: number | null
          created_at: string | null
          id: string
          is_monitored: boolean | null
          max_score: number
          metadata: Json | null
          organization_id: string | null
          score: number
          skill_id: string | null
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          assessment_type: string
          attempts_count?: number | null
          created_at?: string | null
          id?: string
          is_monitored?: boolean | null
          max_score?: number
          metadata?: Json | null
          organization_id?: string | null
          score: number
          skill_id?: string | null
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          assessment_type?: string
          attempts_count?: number | null
          created_at?: string | null
          id?: string
          is_monitored?: boolean | null
          max_score?: number
          metadata?: Json | null
          organization_id?: string | null
          score?: number
          skill_id?: string | null
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competency_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_assessments_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_assessments_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "vw_org_skill_metrics"
            referencedColumns: ["skill_id"]
          },
          {
            foreignKeyName: "competency_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_analytics: {
        Row: {
          category_id: string | null
          created_at: string | null
          decision_quality_score: number | null
          id: string
          is_optimal_choice: boolean | null
          organization_id: string | null
          prioritization_accuracy: number | null
          reasoning_depth: string | null
          response_time_seconds: number | null
          scenario_id: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          decision_quality_score?: number | null
          id?: string
          is_optimal_choice?: boolean | null
          organization_id?: string | null
          prioritization_accuracy?: number | null
          reasoning_depth?: string | null
          response_time_seconds?: number | null
          scenario_id?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          decision_quality_score?: number | null
          id?: string
          is_optimal_choice?: boolean | null
          organization_id?: string | null
          prioritization_accuracy?: number | null
          reasoning_depth?: string | null
          response_time_seconds?: number | null
          scenario_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decision_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decision_analytics_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "decision_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decision_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      demo_leads: {
        Row: {
          company: string | null
          company_size: string | null
          contacted_at: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          company?: string | null
          company_size?: string | null
          contacted_at?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          company?: string | null
          company_size?: string | null
          contacted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
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
      game_configurations: {
        Row: {
          coins_base_reward: number | null
          coins_multiplier: number | null
          created_at: string | null
          description: string | null
          difficulty_multipliers: Json | null
          display_name: string
          game_type: string
          icon: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          skill_categories: string[] | null
          streak_bonus_config: Json | null
          time_bonus_config: Json | null
          updated_at: string | null
          xp_base_reward: number | null
          xp_multiplier: number | null
        }
        Insert: {
          coins_base_reward?: number | null
          coins_multiplier?: number | null
          created_at?: string | null
          description?: string | null
          difficulty_multipliers?: Json | null
          display_name: string
          game_type: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          skill_categories?: string[] | null
          streak_bonus_config?: Json | null
          time_bonus_config?: Json | null
          updated_at?: string | null
          xp_base_reward?: number | null
          xp_multiplier?: number | null
        }
        Update: {
          coins_base_reward?: number | null
          coins_multiplier?: number | null
          created_at?: string | null
          description?: string | null
          difficulty_multipliers?: Json | null
          display_name?: string
          game_type?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          skill_categories?: string[] | null
          streak_bonus_config?: Json | null
          time_bonus_config?: Json | null
          updated_at?: string | null
          xp_base_reward?: number | null
          xp_multiplier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      game_skill_mapping: {
        Row: {
          created_at: string | null
          game_type: string
          id: string
          is_primary: boolean | null
          skill_id: string
          xp_multiplier: number | null
        }
        Insert: {
          created_at?: string | null
          game_type: string
          id?: string
          is_primary?: boolean | null
          skill_id: string
          xp_multiplier?: number | null
        }
        Update: {
          created_at?: string | null
          game_type?: string
          id?: string
          is_primary?: boolean | null
          skill_id?: string
          xp_multiplier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_skill_mapping_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_tree"
            referencedColumns: ["id"]
          },
        ]
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
      insignias: {
        Row: {
          category: string
          coins_reward: number | null
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string
          id: string
          insignia_key: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          required_game_score_min: number | null
          required_game_type: string | null
          required_missions_completed: number | null
          required_skill_id: string | null
          required_skill_level: number | null
          required_streak_days: number | null
          required_xp: number | null
          shape: string
          star_level: number
          xp_reward: number | null
        }
        Insert: {
          category: string
          coins_reward?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          insignia_key: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          required_game_score_min?: number | null
          required_game_type?: string | null
          required_missions_completed?: number | null
          required_skill_id?: string | null
          required_skill_level?: number | null
          required_streak_days?: number | null
          required_xp?: number | null
          shape?: string
          star_level?: number
          xp_reward?: number | null
        }
        Update: {
          category?: string
          coins_reward?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          insignia_key?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          required_game_score_min?: number | null
          required_game_type?: string | null
          required_missions_completed?: number | null
          required_skill_id?: string | null
          required_skill_level?: number | null
          required_streak_days?: number | null
          required_xp?: number | null
          shape?: string
          star_level?: number
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "insignias_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insignias_required_skill_id_fkey"
            columns: ["required_skill_id"]
            isOneToOne: false
            referencedRelation: "skill_tree"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_attempts: {
        Row: {
          attempted_at: string | null
          id: string
          invite_code: string
          ip_address: string | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          attempted_at?: string | null
          id?: string
          invite_code: string
          ip_address?: string | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          attempted_at?: string | null
          id?: string
          invite_code?: string
          ip_address?: string | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
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
      level_configurations: {
        Row: {
          created_at: string | null
          id: string
          level: number
          organization_id: string | null
          perks: string[] | null
          rewards: Json | null
          title: string | null
          xp_required: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          level: number
          organization_id?: string | null
          perks?: string[] | null
          rewards?: Json | null
          title?: string | null
          xp_required: number
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number
          organization_id?: string | null
          perks?: string[] | null
          rewards?: Json | null
          title?: string | null
          xp_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "level_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          revoked_at: string | null
          scopes: string[] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
          revoked_at?: string | null
          scopes?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          revoked_at?: string | null
          scopes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_challenges: {
        Row: {
          coins_reward: number | null
          created_at: string
          created_by: string
          deadline: string | null
          description: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          title: string
          xp_reward: number | null
        }
        Insert: {
          coins_reward?: number | null
          created_at?: string
          created_by: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          title: string
          xp_reward?: number | null
        }
        Update: {
          coins_reward?: number | null
          created_at?: string
          created_by?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          title?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_challenges_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          created_at: string
          created_by: string
          email: string | null
          expires_at: string
          id: string
          invite_code: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          email?: string | null
          expires_at?: string
          id?: string
          invite_code?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string | null
          expires_at?: string
          id?: string
          invite_code?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          department: string | null
          id: string
          is_active: boolean
          job_title: string | null
          joined_at: string
          org_role: Database["public"]["Enums"]["org_role"] | null
          organization_id: string
          role: string
          team_id: string | null
          user_id: string
        }
        Insert: {
          department?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          joined_at?: string
          org_role?: Database["public"]["Enums"]["org_role"] | null
          organization_id: string
          role?: string
          team_id?: string | null
          user_id: string
        }
        Update: {
          department?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          joined_at?: string
          org_role?: Database["public"]["Enums"]["org_role"] | null
          organization_id?: string
          role?: string
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "organization_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_sso_config: {
        Row: {
          allowed_domains: string[]
          auto_join_enabled: boolean | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          organization_id: string
          require_domain_match: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_domains?: string[]
          auto_join_enabled?: boolean | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          organization_id: string
          require_domain_match?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_domains?: string[]
          auto_join_enabled?: boolean | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          organization_id?: string
          require_domain_match?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_sso_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_teams: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          manager_id: string | null
          name: string
          organization_id: string
          parent_team_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          manager_id?: string | null
          name: string
          organization_id: string
          parent_team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          organization_id?: string
          parent_team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_teams_parent_team_id_fkey"
            columns: ["parent_team_id"]
            isOneToOne: false
            referencedRelation: "organization_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_webhooks: {
        Row: {
          created_at: string
          created_by: string | null
          events: string[]
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          retry_count: number | null
          secret: string
          timeout_seconds: number | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          retry_count?: number | null
          secret: string
          timeout_seconds?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          retry_count?: number | null
          secret?: string
          timeout_seconds?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          owner_id: string
          size: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          size?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          size?: string | null
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_organization_id: string | null
          department: string | null
          id: string
          job_title: string | null
          nickname: string
          selected_title: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_organization_id?: string | null
          department?: string | null
          id: string
          job_title?: string | null
          nickname: string
          selected_title?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_organization_id?: string | null
          department?: string | null
          id?: string
          job_title?: string | null
          nickname?: string
          selected_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_organization_id_fkey"
            columns: ["current_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      reward_transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          source_id: string | null
          source_type: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      sales_client_personas: {
        Row: {
          avatar: string | null
          channel: string | null
          company_name: string | null
          company_type: string | null
          created_at: string | null
          decision_factors: string[] | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          pain_points: string[] | null
          personality: string
          role: string | null
          track_key: string | null
        }
        Insert: {
          avatar?: string | null
          channel?: string | null
          company_name?: string | null
          company_type?: string | null
          created_at?: string | null
          decision_factors?: string[] | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          pain_points?: string[] | null
          personality: string
          role?: string | null
          track_key?: string | null
        }
        Update: {
          avatar?: string | null
          channel?: string | null
          company_name?: string | null
          company_type?: string | null
          created_at?: string | null
          decision_factors?: string[] | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          pain_points?: string[] | null
          personality?: string
          role?: string | null
          track_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_client_personas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_conversation_stages: {
        Row: {
          channel: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          organization_id: string | null
          stage_key: string
          stage_label: string
          stage_order: number
          tips: string | null
          track_key: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          organization_id?: string | null
          stage_key: string
          stage_label: string
          stage_order: number
          tips?: string | null
          track_key?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          organization_id?: string | null
          stage_key?: string
          stage_label?: string
          stage_order?: number
          tips?: string | null
          track_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_conversation_stages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_game_sessions: {
        Row: {
          completed_at: string | null
          conversation_history: Json | null
          created_at: string | null
          final_rapport: number | null
          id: string
          organization_id: string | null
          persona_id: string | null
          product_id: string | null
          sale_closed: boolean | null
          skills_measured: Json | null
          stage_performance: Json | null
          started_at: string | null
          time_spent_seconds: number | null
          total_score: number | null
          track_key: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          conversation_history?: Json | null
          created_at?: string | null
          final_rapport?: number | null
          id?: string
          organization_id?: string | null
          persona_id?: string | null
          product_id?: string | null
          sale_closed?: boolean | null
          skills_measured?: Json | null
          stage_performance?: Json | null
          started_at?: string | null
          time_spent_seconds?: number | null
          total_score?: number | null
          track_key?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          conversation_history?: Json | null
          created_at?: string | null
          final_rapport?: number | null
          id?: string
          organization_id?: string | null
          persona_id?: string | null
          product_id?: string | null
          sale_closed?: boolean | null
          skills_measured?: Json | null
          stage_performance?: Json | null
          started_at?: string | null
          time_spent_seconds?: number | null
          total_score?: number | null
          track_key?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_game_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_game_sessions_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "sales_client_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_game_sessions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sales_products"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_message_templates: {
        Row: {
          client_message: string
          context_hint: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          persona_personality: string | null
          response_options: Json
          sequence_order: number | null
          stage_key: string
        }
        Insert: {
          client_message: string
          context_hint?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          persona_personality?: string | null
          response_options: Json
          sequence_order?: number | null
          stage_key: string
        }
        Update: {
          client_message?: string
          context_hint?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          persona_personality?: string | null
          response_options?: Json
          sequence_order?: number | null
          stage_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_message_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_objection_library: {
        Row: {
          created_at: string | null
          id: string
          objection_category: string
          objection_text: string
          organization_id: string | null
          product_id: string | null
          recommended_response: string | null
          severity: string | null
          technique: string | null
          track_key: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          objection_category: string
          objection_text: string
          organization_id?: string | null
          product_id?: string | null
          recommended_response?: string | null
          severity?: string | null
          technique?: string | null
          track_key?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          objection_category?: string
          objection_text?: string
          organization_id?: string | null
          product_id?: string | null
          recommended_response?: string | null
          severity?: string | null
          technique?: string | null
          track_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_objection_library_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_objection_library_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sales_products"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_opening_scripts: {
        Row: {
          channel: string
          context_tags: string[] | null
          created_at: string | null
          effectiveness_score: number | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          script_template: string
          track_key: string
          usage_count: number | null
        }
        Insert: {
          channel?: string
          context_tags?: string[] | null
          created_at?: string | null
          effectiveness_score?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          script_template: string
          track_key?: string
          usage_count?: number | null
        }
        Update: {
          channel?: string
          context_tags?: string[] | null
          created_at?: string | null
          effectiveness_score?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          script_template?: string
          track_key?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_opening_scripts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_products: {
        Row: {
          average_ticket: string | null
          case_studies: Json | null
          commission_structure: Json | null
          common_objections: Json | null
          competitive_advantages: Json | null
          created_at: string | null
          demo_points: Json | null
          description: string | null
          discovery_questions: Json | null
          faq: Json | null
          id: string
          is_active: boolean | null
          key_benefits: string[] | null
          name: string
          organization_id: string | null
          pitch_script: string | null
          pricing_info: string | null
          product_type: string | null
          sales_cycle_days: number | null
          target_audience: string | null
        }
        Insert: {
          average_ticket?: string | null
          case_studies?: Json | null
          commission_structure?: Json | null
          common_objections?: Json | null
          competitive_advantages?: Json | null
          created_at?: string | null
          demo_points?: Json | null
          description?: string | null
          discovery_questions?: Json | null
          faq?: Json | null
          id?: string
          is_active?: boolean | null
          key_benefits?: string[] | null
          name: string
          organization_id?: string | null
          pitch_script?: string | null
          pricing_info?: string | null
          product_type?: string | null
          sales_cycle_days?: number | null
          target_audience?: string | null
        }
        Update: {
          average_ticket?: string | null
          case_studies?: Json | null
          commission_structure?: Json | null
          common_objections?: Json | null
          competitive_advantages?: Json | null
          created_at?: string | null
          demo_points?: Json | null
          description?: string | null
          discovery_questions?: Json | null
          faq?: Json | null
          id?: string
          is_active?: boolean | null
          key_benefits?: string[] | null
          name?: string
          organization_id?: string | null
          pitch_script?: string | null
          pricing_info?: string | null
          product_type?: string | null
          sales_cycle_days?: number | null
          target_audience?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_tracks: {
        Row: {
          coins_reward: number | null
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          time_limit_seconds: number | null
          track_key: string
          xp_reward: number | null
        }
        Insert: {
          coins_reward?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          time_limit_seconds?: number | null
          track_key: string
          xp_reward?: number | null
        }
        Update: {
          coins_reward?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          time_limit_seconds?: number | null
          track_key?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_tracks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_configurations: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_unlocked_by_default: boolean | null
          level: number | null
          max_level: number | null
          name: string
          organization_id: string | null
          parent_skill_id: string | null
          related_games: string[] | null
          skill_key: string
          xp_per_level: number | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_unlocked_by_default?: boolean | null
          level?: number | null
          max_level?: number | null
          name: string
          organization_id?: string | null
          parent_skill_id?: string | null
          related_games?: string[] | null
          skill_key: string
          xp_per_level?: number | null
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_unlocked_by_default?: boolean | null
          level?: number | null
          max_level?: number | null
          name?: string
          organization_id?: string | null
          parent_skill_id?: string | null
          related_games?: string[] | null
          skill_key?: string
          xp_per_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_configurations_parent_skill_id_fkey"
            columns: ["parent_skill_id"]
            isOneToOne: false
            referencedRelation: "skill_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_configurations_parent_skill_id_fkey"
            columns: ["parent_skill_id"]
            isOneToOne: false
            referencedRelation: "vw_org_skill_metrics"
            referencedColumns: ["skill_id"]
          },
        ]
      }
      skill_events_log: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          skill_id: string | null
          source_id: string | null
          source_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          skill_id?: string | null
          source_id?: string | null
          source_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          skill_id?: string | null
          source_id?: string | null
          source_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_events_log_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_events_log_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "vw_org_skill_metrics"
            referencedColumns: ["skill_id"]
          },
          {
            foreignKeyName: "skill_events_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          limits: Json | null
          name: string
          price_monthly: number
          price_yearly: number
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name: string
          price_monthly?: number
          price_yearly?: number
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          slug?: string
        }
        Relationships: []
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
      system_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          organization_id: string | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          organization_id?: string | null
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          organization_id?: string | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      trail_missions: {
        Row: {
          coins_reward: number | null
          created_at: string
          description: string | null
          id: string
          instruction: string | null
          is_required: boolean | null
          mission_key: string
          mission_type: string
          name: string
          order_index: number | null
          target_value: number | null
          time_limit_minutes: number | null
          trail_id: string
          xp_reward: number | null
        }
        Insert: {
          coins_reward?: number | null
          created_at?: string
          description?: string | null
          id?: string
          instruction?: string | null
          is_required?: boolean | null
          mission_key: string
          mission_type: string
          name: string
          order_index?: number | null
          target_value?: number | null
          time_limit_minutes?: number | null
          trail_id: string
          xp_reward?: number | null
        }
        Update: {
          coins_reward?: number | null
          created_at?: string
          description?: string | null
          id?: string
          instruction?: string | null
          is_required?: boolean | null
          mission_key?: string
          mission_type?: string
          name?: string
          order_index?: number | null
          target_value?: number | null
          time_limit_minutes?: number | null
          trail_id?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trail_missions_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "badge_trails"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          content_data: Json | null
          content_type: string | null
          created_at: string | null
          description: string | null
          id: string
          is_required: boolean | null
          module_key: string
          name: string
          order_index: number | null
          time_minutes: number | null
          training_id: string
          xp_reward: number | null
        }
        Insert: {
          content_data?: Json | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          module_key: string
          name: string
          order_index?: number | null
          time_minutes?: number | null
          training_id: string
          xp_reward?: number | null
        }
        Update: {
          content_data?: Json | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          module_key?: string
          name?: string
          order_index?: number | null
          time_minutes?: number | null
          training_id?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "training_modules_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          category: string | null
          coins_reward: number | null
          color: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          display_order: number | null
          estimated_hours: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          training_key: string
          xp_reward: number | null
        }
        Insert: {
          category?: string | null
          coins_reward?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          display_order?: number | null
          estimated_hours?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          training_key: string
          xp_reward?: number | null
        }
        Update: {
          category?: string | null
          coins_reward?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          display_order?: number | null
          estimated_hours?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          training_key?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trainings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      user_activity_log: {
        Row: {
          activity_type: string
          coins_earned: number | null
          created_at: string | null
          game_type: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          skill_id: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          activity_type: string
          coins_earned?: number | null
          created_at?: string | null
          game_type?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          skill_id?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          activity_type?: string
          coins_earned?: number | null
          created_at?: string | null
          game_type?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          skill_id?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_log_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_log_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "vw_org_skill_metrics"
            referencedColumns: ["skill_id"]
          },
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badge_progress: {
        Row: {
          badge_id: string
          current_progress: Json | null
          id: string
          last_updated: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          current_progress?: Json | null
          id?: string
          last_updated?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          current_progress?: Json | null
          id?: string
          last_updated?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badge_progress_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          id: string
          is_displayed: boolean | null
          progress: Json | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          id?: string
          is_displayed?: boolean | null
          progress?: Json | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          id?: string
          is_displayed?: boolean | null
          progress?: Json | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          id: string
          score: number | null
          status: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          score?: number | null
          status?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          score?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "organization_challenges"
            referencedColumns: ["id"]
          },
        ]
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
      user_competency_scores: {
        Row: {
          assessments_count: number | null
          avg_score: number | null
          best_score: number | null
          current_score: number | null
          id: string
          last_assessed_at: string | null
          organization_id: string | null
          previous_score: number | null
          skill_id: string
          trend: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assessments_count?: number | null
          avg_score?: number | null
          best_score?: number | null
          current_score?: number | null
          id?: string
          last_assessed_at?: string | null
          organization_id?: string | null
          previous_score?: number | null
          skill_id: string
          trend?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assessments_count?: number | null
          avg_score?: number | null
          best_score?: number | null
          current_score?: number | null
          id?: string
          last_assessed_at?: string | null
          organization_id?: string | null
          previous_score?: number | null
          skill_id?: string
          trend?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_competency_scores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_competency_scores_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_competency_scores_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "vw_org_skill_metrics"
            referencedColumns: ["skill_id"]
          },
          {
            foreignKeyName: "user_competency_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      user_game_stats: {
        Row: {
          average_score: number | null
          best_score: number | null
          game_type: string
          id: string
          last_played_at: string | null
          total_games_played: number | null
          total_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_score?: number | null
          best_score?: number | null
          game_type: string
          id?: string
          last_played_at?: string | null
          total_games_played?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_score?: number | null
          best_score?: number | null
          game_type?: string
          id?: string
          last_played_at?: string | null
          total_games_played?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_insignias: {
        Row: {
          id: string
          insignia_id: string
          is_displayed: boolean | null
          progress_data: Json | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          insignia_id: string
          is_displayed?: boolean | null
          progress_data?: Json | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          insignia_id?: string
          is_displayed?: boolean | null
          progress_data?: Json | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_insignias_insignia_id_fkey"
            columns: ["insignia_id"]
            isOneToOne: false
            referencedRelation: "insignias"
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
      user_mission_progress: {
        Row: {
          attempts: number | null
          best_score: number | null
          completed_at: string | null
          current_value: number | null
          id: string
          mission_id: string
          user_id: string
        }
        Insert: {
          attempts?: number | null
          best_score?: number | null
          completed_at?: string | null
          current_value?: number | null
          id?: string
          mission_id: string
          user_id: string
        }
        Update: {
          attempts?: number | null
          best_score?: number | null
          completed_at?: string | null
          current_value?: number | null
          id?: string
          mission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "trail_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_module_progress: {
        Row: {
          completed_at: string | null
          id: string
          module_id: string
          score: number | null
          started_at: string | null
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          module_id: string
          score?: number | null
          started_at?: string | null
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          module_id?: string
          score?: number | null
          started_at?: string | null
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
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
      user_roles: {
        Row: {
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skill_levels: {
        Row: {
          created_at: string | null
          current_level: number | null
          current_xp: number | null
          id: string
          is_unlocked: boolean | null
          last_practiced: string | null
          mastery_level: number | null
          organization_id: string | null
          skill_id: string
          total_xp: number | null
          unlocked_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_level?: number | null
          current_xp?: number | null
          id?: string
          is_unlocked?: boolean | null
          last_practiced?: string | null
          mastery_level?: number | null
          organization_id?: string | null
          skill_id: string
          total_xp?: number | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_level?: number | null
          current_xp?: number | null
          id?: string
          is_unlocked?: boolean | null
          last_practiced?: string | null
          mastery_level?: number | null
          organization_id?: string | null
          skill_id?: string
          total_xp?: number | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skill_levels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skill_levels_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skill_levels_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "vw_org_skill_metrics"
            referencedColumns: ["skill_id"]
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
          organization_id: string | null
          total_active_days: number | null
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
          organization_id?: string | null
          total_active_days?: number | null
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
          organization_id?: string | null
          total_active_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          billing_cycle: string
          canceled_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          organization_id: string | null
          plan_id: string
          started_at: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          canceled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          organization_id?: string | null
          plan_id: string
          started_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          canceled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          organization_id?: string | null
          plan_id?: string
          started_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      user_trail_progress: {
        Row: {
          completed_at: string | null
          current_mission_index: number | null
          id: string
          started_at: string | null
          status: string | null
          trail_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_mission_index?: number | null
          id?: string
          started_at?: string | null
          status?: string | null
          trail_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_mission_index?: number | null
          id?: string
          started_at?: string | null
          status?: string | null
          trail_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_trail_progress_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "badge_trails"
            referencedColumns: ["id"]
          },
        ]
      }
      user_training_progress: {
        Row: {
          completed_at: string | null
          current_module_index: number | null
          id: string
          progress_percent: number | null
          started_at: string | null
          training_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_module_index?: number | null
          id?: string
          progress_percent?: number | null
          started_at?: string | null
          training_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_module_index?: number | null
          id?: string
          progress_percent?: number | null
          started_at?: string | null
          training_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_training_progress_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp_history: {
        Row: {
          coins_earned: number
          created_at: string | null
          difficulty: string | null
          id: string
          organization_id: string | null
          performance_score: number | null
          skill_id: string | null
          source: string
          source_id: string | null
          user_id: string
          xp_earned: number
        }
        Insert: {
          coins_earned?: number
          created_at?: string | null
          difficulty?: string | null
          id?: string
          organization_id?: string | null
          performance_score?: number | null
          skill_id?: string | null
          source: string
          source_id?: string | null
          user_id: string
          xp_earned?: number
        }
        Update: {
          coins_earned?: number
          created_at?: string | null
          difficulty?: string | null
          id?: string
          organization_id?: string | null
          performance_score?: number | null
          skill_id?: string | null
          source?: string
          source_id?: string | null
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_xp_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_xp_history_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_xp_history_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "vw_org_skill_metrics"
            referencedColumns: ["skill_id"]
          },
          {
            foreignKeyName: "user_xp_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt_count: number | null
          created_at: string
          delivered_at: string | null
          event_type: string
          id: string
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          response_status: number | null
          status: string | null
          webhook_id: string
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string
          delivered_at?: string | null
          event_type: string
          id?: string
          next_retry_at?: string | null
          payload: Json
          response_body?: string | null
          response_status?: number | null
          status?: string | null
          webhook_id: string
        }
        Update: {
          attempt_count?: number | null
          created_at?: string
          delivered_at?: string | null
          event_type?: string
          id?: string
          next_retry_at?: string | null
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          status?: string | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "organization_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_org_skill_metrics: {
        Row: {
          avg_level: number | null
          avg_total_xp: number | null
          category: string | null
          mastery_count: number | null
          organization_id: string | null
          skill_id: string | null
          skill_key: string | null
          skill_name: string | null
          total_users: number | null
          unlocked_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_user_skill_progress: {
        Row: {
          category: string | null
          color: string | null
          current_level: number | null
          current_xp: number | null
          description: string | null
          icon: string | null
          id: string | null
          is_maxed: boolean | null
          is_unlocked: boolean | null
          last_practiced: string | null
          mastery_level: number | null
          max_level: number | null
          organization_id: string | null
          parent_skill_id: string | null
          progress_percent: number | null
          related_games: string[] | null
          skill_id: string | null
          skill_key: string | null
          skill_name: string | null
          total_xp: number | null
          unlocked_at: string | null
          user_id: string | null
          xp_per_level: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_configurations_parent_skill_id_fkey"
            columns: ["parent_skill_id"]
            isOneToOne: false
            referencedRelation: "skill_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_configurations_parent_skill_id_fkey"
            columns: ["parent_skill_id"]
            isOneToOne: false
            referencedRelation: "vw_org_skill_metrics"
            referencedColumns: ["skill_id"]
          },
          {
            foreignKeyName: "user_skill_levels_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skill_levels_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "vw_org_skill_metrics"
            referencedColumns: ["skill_id"]
          },
        ]
      }
    }
    Functions: {
      accept_invite: { Args: { p_invite_code: string }; Returns: Json }
      accept_invite_with_rate_limit: {
        Args: { p_client_ip?: string; p_invite_code: string }
        Returns: Json
      }
      add_skill_xp: {
        Args: {
          p_skill_id: string
          p_source_id?: string
          p_source_type?: string
          p_user_id: string
          p_xp_amount: number
        }
        Returns: Json
      }
      can_view_user_data: {
        Args: { _org_id: string; _target_user_id: string }
        Returns: boolean
      }
      check_skills_health: { Args: never; Returns: Json }
      create_org_invite: {
        Args: {
          p_email?: string
          p_expires_in_days?: number
          p_organization_id: string
          p_role?: string
        }
        Returns: Json
      }
      get_games_report: {
        Args: { _org_id: string; _period?: string }
        Returns: Json
      }
      get_member_full_report: {
        Args: { _org_id: string; _period?: string; _user_id: string }
        Returns: Json
      }
      get_members_ranking: {
        Args: { _limit?: number; _org_id: string; _period?: string }
        Returns: Json
      }
      get_org_competency_metrics: { Args: { _org_id: string }; Returns: Json }
      get_org_decision_metrics: {
        Args: { _org_id: string; _period?: string }
        Returns: Json
      }
      get_org_engagement_metrics: {
        Args: { _org_id: string; _period?: string }
        Returns: Json
      }
      get_org_learning_metrics: {
        Args: { _org_id: string; _period?: string }
        Returns: Json
      }
      get_org_members_with_metrics: { Args: { _org_id: string }; Returns: Json }
      get_org_role: {
        Args: { _org_id: string; _user_id: string }
        Returns: string
      }
      get_team_report: {
        Args: { _org_id: string; _period?: string; _team_id: string }
        Returns: Json
      }
      get_teams_comparison: {
        Args: { _org_id: string; _period?: string }
        Returns: Json
      }
      get_temporal_evolution: {
        Args: { _granularity?: string; _org_id: string; _period?: string }
        Returns: Json
      }
      get_trainings_report: {
        Args: { _org_id: string; _period?: string }
        Returns: Json
      }
      get_user_role: {
        Args: { _org_id?: string; _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _org_id?: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _org_id?: string; _user_id: string }
        Returns: boolean
      }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member_or_owner: { Args: { _org_id: string }; Returns: boolean }
      list_org_invites: {
        Args: { p_organization_id: string }
        Returns: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invite_code: string
          is_expired: boolean
          is_used: boolean
          role: string
          used_at: string
          used_by: string
        }[]
      }
      log_audit_event: {
        Args: {
          _action: string
          _metadata?: Json
          _new_values?: Json
          _old_values?: Json
          _org_id?: string
          _resource_id?: string
          _resource_type: string
        }
        Returns: string
      }
      log_user_activity: {
        Args: {
          p_activity_type: string
          p_coins_earned?: number
          p_game_type?: string
          p_metadata?: Json
          p_score?: number
          p_user_id: string
          p_xp_earned?: number
        }
        Returns: string
      }
      revoke_org_invite: { Args: { p_invite_id: string }; Returns: Json }
      validate_email_domain: {
        Args: { p_email: string; p_organization_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "manager" | "user"
      friendship_status: "pending" | "accepted" | "blocked"
      gift_status: "pending" | "accepted" | "rejected"
      org_role: "owner" | "admin" | "manager" | "member"
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
      app_role: ["super_admin", "admin", "manager", "user"],
      friendship_status: ["pending", "accepted", "blocked"],
      gift_status: ["pending", "accepted", "rejected"],
      org_role: ["owner", "admin", "manager", "member"],
      quiz_difficulty: ["easy", "medium", "hard"],
      quiz_match_status: ["waiting", "in_progress", "finished", "cancelled"],
    },
  },
} as const
