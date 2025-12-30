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
      area_permissions: {
        Row: {
          area: string
          can_access: boolean | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          area: string
          can_access?: boolean | null
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          area?: string
          can_access?: boolean | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      assessment_360_results: {
        Row: {
          ai_insights: string | null
          consolidated_scores: Json | null
          created_at: string | null
          cycle_id: string | null
          development_areas: string[] | null
          id: string
          strengths: string[] | null
          user_id: string
        }
        Insert: {
          ai_insights?: string | null
          consolidated_scores?: Json | null
          created_at?: string | null
          cycle_id?: string | null
          development_areas?: string[] | null
          id?: string
          strengths?: string[] | null
          user_id: string
        }
        Update: {
          ai_insights?: string | null
          consolidated_scores?: Json | null
          created_at?: string | null
          cycle_id?: string | null
          development_areas?: string[] | null
          id?: string
          strengths?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_360_results_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "assessment_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_context_links: {
        Row: {
          assessment_cycle_id: string | null
          closed_at: string | null
          closure_reason: string | null
          context_skill_ids: string[] | null
          created_at: string | null
          id: string
          loop_status: string | null
          origin_event_id: string | null
          origin_id: string | null
          origin_type: string
        }
        Insert: {
          assessment_cycle_id?: string | null
          closed_at?: string | null
          closure_reason?: string | null
          context_skill_ids?: string[] | null
          created_at?: string | null
          id?: string
          loop_status?: string | null
          origin_event_id?: string | null
          origin_id?: string | null
          origin_type: string
        }
        Update: {
          assessment_cycle_id?: string | null
          closed_at?: string | null
          closure_reason?: string | null
          context_skill_ids?: string[] | null
          created_at?: string | null
          id?: string
          loop_status?: string | null
          origin_event_id?: string | null
          origin_id?: string | null
          origin_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_context_links_assessment_cycle_id_fkey"
            columns: ["assessment_cycle_id"]
            isOneToOne: false
            referencedRelation: "assessment_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_context_links_origin_event_id_fkey"
            columns: ["origin_event_id"]
            isOneToOne: false
            referencedRelation: "core_events"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_cycles: {
        Row: {
          config: Json | null
          context_id: string | null
          context_type: string | null
          created_at: string | null
          created_by: string | null
          cycle_type: string | null
          description: string | null
          end_date: string
          evaluated_skills: string[] | null
          feedback_questions: Json | null
          id: string
          name: string
          organization_id: string | null
          start_date: string
          status: string | null
        }
        Insert: {
          config?: Json | null
          context_id?: string | null
          context_type?: string | null
          created_at?: string | null
          created_by?: string | null
          cycle_type?: string | null
          description?: string | null
          end_date: string
          evaluated_skills?: string[] | null
          feedback_questions?: Json | null
          id?: string
          name: string
          organization_id?: string | null
          start_date: string
          status?: string | null
        }
        Update: {
          config?: Json | null
          context_id?: string | null
          context_type?: string | null
          created_at?: string | null
          created_by?: string | null
          cycle_type?: string | null
          description?: string | null
          end_date?: string
          evaluated_skills?: string[] | null
          feedback_questions?: Json | null
          id?: string
          name?: string
          organization_id?: string | null
          start_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_cycles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_suggestions: {
        Row: {
          accepted_at: string | null
          context_event_id: string | null
          context_id: string | null
          context_type: string | null
          created_at: string | null
          dismissed_at: string | null
          id: string
          organization_id: string | null
          priority: number | null
          reason: string | null
          skills_to_evaluate: string[] | null
          status: string | null
          suggestion_type: string
          trigger_id: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          context_event_id?: string | null
          context_id?: string | null
          context_type?: string | null
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          organization_id?: string | null
          priority?: number | null
          reason?: string | null
          skills_to_evaluate?: string[] | null
          status?: string | null
          suggestion_type: string
          trigger_id?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          context_event_id?: string | null
          context_id?: string | null
          context_type?: string | null
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          organization_id?: string | null
          priority?: number | null
          reason?: string | null
          skills_to_evaluate?: string[] | null
          status?: string | null
          suggestion_type?: string
          trigger_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_suggestions_context_event_id_fkey"
            columns: ["context_event_id"]
            isOneToOne: false
            referencedRelation: "core_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_suggestions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_suggestions_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "assessment_triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_triggers: {
        Row: {
          assessment_type: string | null
          created_at: string | null
          cycle_template: Json
          event_count: number | null
          event_type: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          schedule_cron: string | null
          skills_to_evaluate: string[] | null
          threshold_type: string | null
          threshold_value: number | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          assessment_type?: string | null
          created_at?: string | null
          cycle_template?: Json
          event_count?: number | null
          event_type?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          schedule_cron?: string | null
          skills_to_evaluate?: string[] | null
          threshold_type?: string | null
          threshold_value?: number | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          assessment_type?: string | null
          created_at?: string | null
          cycle_template?: Json
          event_count?: number | null
          event_type?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          schedule_cron?: string | null
          skills_to_evaluate?: string[] | null
          threshold_type?: string | null
          threshold_value?: number | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_triggers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments_360: {
        Row: {
          created_at: string | null
          cycle_id: string | null
          evaluatee_id: string
          evaluator_id: string
          id: string
          relationship: string
          responses: Json | null
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          created_at?: string | null
          cycle_id?: string | null
          evaluatee_id: string
          evaluator_id: string
          id?: string
          relationship: string
          responses?: Json | null
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          created_at?: string | null
          cycle_id?: string | null
          evaluatee_id?: string
          evaluator_id?: string
          id?: string
          relationship?: string
          responses?: Json | null
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_360_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "assessment_cycles"
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
      challenge_supporters: {
        Row: {
          coins_staked: number
          commitment_id: string
          created_at: string
          id: string
          reward_claimed: boolean
          supporter_id: string
        }
        Insert: {
          coins_staked?: number
          commitment_id: string
          created_at?: string
          id?: string
          reward_claimed?: boolean
          supporter_id: string
        }
        Update: {
          coins_staked?: number
          commitment_id?: string
          created_at?: string
          id?: string
          reward_claimed?: boolean
          supporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_supporters_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_supporters_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "vw_challenges_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      cognitive_profiles: {
        Row: {
          assessments_count: number | null
          attention_to_detail: number | null
          id: string
          last_assessed_at: string | null
          logical_reasoning: number | null
          numerical_ability: number | null
          organization_id: string | null
          overall_score: number | null
          processing_speed: number | null
          spatial_reasoning: number | null
          updated_at: string | null
          user_id: string
          verbal_reasoning: number | null
          working_memory: number | null
        }
        Insert: {
          assessments_count?: number | null
          attention_to_detail?: number | null
          id?: string
          last_assessed_at?: string | null
          logical_reasoning?: number | null
          numerical_ability?: number | null
          organization_id?: string | null
          overall_score?: number | null
          processing_speed?: number | null
          spatial_reasoning?: number | null
          updated_at?: string | null
          user_id: string
          verbal_reasoning?: number | null
          working_memory?: number | null
        }
        Update: {
          assessments_count?: number | null
          attention_to_detail?: number | null
          id?: string
          last_assessed_at?: string | null
          logical_reasoning?: number | null
          numerical_ability?: number | null
          organization_id?: string | null
          overall_score?: number | null
          processing_speed?: number | null
          spatial_reasoning?: number | null
          updated_at?: string | null
          user_id?: string
          verbal_reasoning?: number | null
          working_memory?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cognitive_test_questions: {
        Row: {
          avg_time_seconds: number | null
          content: Json
          correct_answer: string
          created_at: string | null
          difficulty: number | null
          id: string
          question_type: string
          sort_order: number | null
          test_id: string | null
        }
        Insert: {
          avg_time_seconds?: number | null
          content: Json
          correct_answer: string
          created_at?: string | null
          difficulty?: number | null
          id?: string
          question_type: string
          sort_order?: number | null
          test_id?: string | null
        }
        Update: {
          avg_time_seconds?: number | null
          content?: Json
          correct_answer?: string
          created_at?: string | null
          difficulty?: number | null
          id?: string
          question_type?: string
          sort_order?: number | null
          test_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "cognitive_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      cognitive_test_sessions: {
        Row: {
          answers: Json | null
          completed_at: string | null
          id: string
          is_proctored: boolean | null
          organization_id: string | null
          percentile: number | null
          score: number | null
          started_at: string | null
          status: string | null
          test_id: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          is_proctored?: boolean | null
          organization_id?: string | null
          percentile?: number | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          test_id?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          is_proctored?: boolean | null
          organization_id?: string | null
          percentile?: number | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          test_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_test_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_test_sessions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "cognitive_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      cognitive_tests: {
        Row: {
          coins_reward: number | null
          config: Json | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          questions_count: number | null
          related_skills: string[] | null
          reward_rules: Json | null
          skill_impact_config: Json | null
          target_score: number | null
          test_type: string
          time_limit_minutes: number | null
          xp_reward: number | null
        }
        Insert: {
          coins_reward?: number | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          questions_count?: number | null
          related_skills?: string[] | null
          reward_rules?: Json | null
          skill_impact_config?: Json | null
          target_score?: number | null
          test_type: string
          time_limit_minutes?: number | null
          xp_reward?: number | null
        }
        Update: {
          coins_reward?: number | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          questions_count?: number | null
          related_skills?: string[] | null
          reward_rules?: Json | null
          skill_impact_config?: Json | null
          target_score?: number | null
          test_type?: string
          time_limit_minutes?: number | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_tests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      commitment_participants: {
        Row: {
          commitment_id: string
          contributed: boolean
          id: string
          individual_progress: number
          joined_at: string
          reward_claimed: boolean
          user_id: string
        }
        Insert: {
          commitment_id: string
          contributed?: boolean
          id?: string
          individual_progress?: number
          joined_at?: string
          reward_claimed?: boolean
          user_id: string
        }
        Update: {
          commitment_id?: string
          contributed?: boolean
          id?: string
          individual_progress?: number
          joined_at?: string
          reward_claimed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commitment_participants_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitment_participants_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "vw_challenges_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      commitment_progress_logs: {
        Row: {
          change_amount: number | null
          commitment_id: string
          created_at: string
          id: string
          logged_by: string
          new_value: number
          note: string | null
          previous_value: number | null
          source: string
        }
        Insert: {
          change_amount?: number | null
          commitment_id: string
          created_at?: string
          id?: string
          logged_by: string
          new_value: number
          note?: string | null
          previous_value?: number | null
          source?: string
        }
        Update: {
          change_amount?: number | null
          commitment_id?: string
          created_at?: string
          id?: string
          logged_by?: string
          new_value?: number
          note?: string | null
          previous_value?: number | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "commitment_progress_logs_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitment_progress_logs_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "vw_challenges_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      commitments: {
        Row: {
          auto_enroll: boolean
          coins_reward: number
          created_at: string
          created_by: string
          current_value: number
          description: string
          ends_at: string
          icon: string | null
          id: string
          insignia_id: string | null
          is_featured: boolean | null
          max_participants: number | null
          metric_type: string
          name: string
          organization_id: string
          reward_items: Json | null
          reward_type: Database["public"]["Enums"]["commitment_reward_type"]
          scope: Database["public"]["Enums"]["commitment_scope"]
          source: Database["public"]["Enums"]["commitment_source"]
          starts_at: string
          status: Database["public"]["Enums"]["commitment_status"]
          success_criteria: string
          supporter_multiplier: number | null
          supporters_count: number | null
          target_value: number
          team_id: string | null
          total_staked: number | null
          updated_at: string
          xp_reward: number
        }
        Insert: {
          auto_enroll?: boolean
          coins_reward?: number
          created_at?: string
          created_by: string
          current_value?: number
          description: string
          ends_at: string
          icon?: string | null
          id?: string
          insignia_id?: string | null
          is_featured?: boolean | null
          max_participants?: number | null
          metric_type?: string
          name: string
          organization_id: string
          reward_items?: Json | null
          reward_type?: Database["public"]["Enums"]["commitment_reward_type"]
          scope: Database["public"]["Enums"]["commitment_scope"]
          source: Database["public"]["Enums"]["commitment_source"]
          starts_at: string
          status?: Database["public"]["Enums"]["commitment_status"]
          success_criteria: string
          supporter_multiplier?: number | null
          supporters_count?: number | null
          target_value?: number
          team_id?: string | null
          total_staked?: number | null
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          auto_enroll?: boolean
          coins_reward?: number
          created_at?: string
          created_by?: string
          current_value?: number
          description?: string
          ends_at?: string
          icon?: string | null
          id?: string
          insignia_id?: string | null
          is_featured?: boolean | null
          max_participants?: number | null
          metric_type?: string
          name?: string
          organization_id?: string
          reward_items?: Json | null
          reward_type?: Database["public"]["Enums"]["commitment_reward_type"]
          scope?: Database["public"]["Enums"]["commitment_scope"]
          source?: Database["public"]["Enums"]["commitment_source"]
          starts_at?: string
          status?: Database["public"]["Enums"]["commitment_status"]
          success_criteria?: string
          supporter_multiplier?: number | null
          supporters_count?: number | null
          target_value?: number
          team_id?: string | null
          total_staked?: number | null
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "commitments_insignia_id_fkey"
            columns: ["insignia_id"]
            isOneToOne: false
            referencedRelation: "insignias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "organization_teams"
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
      core_events: {
        Row: {
          coins_earned: number | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          score: number | null
          skill_ids: string[] | null
          team_id: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          coins_earned?: number | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          score?: number | null
          skill_ids?: string[] | null
          team_id?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          coins_earned?: number | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          score?: number | null
          skill_ids?: string[] | null
          team_id?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "core_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "core_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "organization_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_missions: {
        Row: {
          coins_reward: number
          completed_at: string | null
          created_at: string
          current_value: number
          description: string | null
          icon: string | null
          id: string
          is_bonus: boolean
          is_completed: boolean
          mission_date: string
          mission_type: string
          organization_id: string | null
          target_game_type: string | null
          target_skill_id: string | null
          target_value: number
          title: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          coins_reward?: number
          completed_at?: string | null
          created_at?: string
          current_value?: number
          description?: string | null
          icon?: string | null
          id?: string
          is_bonus?: boolean
          is_completed?: boolean
          mission_date?: string
          mission_type: string
          organization_id?: string | null
          target_game_type?: string | null
          target_skill_id?: string | null
          target_value?: number
          title: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          coins_reward?: number
          completed_at?: string | null
          created_at?: string
          current_value?: number
          description?: string | null
          icon?: string | null
          id?: string
          is_bonus?: boolean
          is_completed?: boolean
          mission_date?: string
          mission_type?: string
          organization_id?: string | null
          target_game_type?: string | null
          target_skill_id?: string | null
          target_value?: number
          title?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_missions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_missions_target_skill_id_fkey"
            columns: ["target_skill_id"]
            isOneToOne: false
            referencedRelation: "skill_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_missions_target_skill_id_fkey"
            columns: ["target_skill_id"]
            isOneToOne: false
            referencedRelation: "vw_org_skill_metrics"
            referencedColumns: ["skill_id"]
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
      development_goals: {
        Row: {
          auto_challenges_enabled: boolean | null
          auto_progress_enabled: boolean | null
          challenge_config: Json | null
          created_at: string | null
          description: string | null
          evidence_urls: string[] | null
          goal_type: string | null
          id: string
          last_auto_update: string | null
          linked_challenge_ids: string[] | null
          linked_cognitive_test_ids: string[] | null
          linked_insignia_ids: string[] | null
          linked_training_ids: string[] | null
          manager_notes: string | null
          plan_id: string | null
          priority: string | null
          progress: number | null
          related_games: string[] | null
          skill_id: string | null
          stagnant_since: string | null
          status: string | null
          success_criteria: string[] | null
          target_date: string | null
          title: string
          weight: number | null
          xp_reward: number | null
        }
        Insert: {
          auto_challenges_enabled?: boolean | null
          auto_progress_enabled?: boolean | null
          challenge_config?: Json | null
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          goal_type?: string | null
          id?: string
          last_auto_update?: string | null
          linked_challenge_ids?: string[] | null
          linked_cognitive_test_ids?: string[] | null
          linked_insignia_ids?: string[] | null
          linked_training_ids?: string[] | null
          manager_notes?: string | null
          plan_id?: string | null
          priority?: string | null
          progress?: number | null
          related_games?: string[] | null
          skill_id?: string | null
          stagnant_since?: string | null
          status?: string | null
          success_criteria?: string[] | null
          target_date?: string | null
          title: string
          weight?: number | null
          xp_reward?: number | null
        }
        Update: {
          auto_challenges_enabled?: boolean | null
          auto_progress_enabled?: boolean | null
          challenge_config?: Json | null
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          goal_type?: string | null
          id?: string
          last_auto_update?: string | null
          linked_challenge_ids?: string[] | null
          linked_cognitive_test_ids?: string[] | null
          linked_insignia_ids?: string[] | null
          linked_training_ids?: string[] | null
          manager_notes?: string | null
          plan_id?: string | null
          priority?: string | null
          progress?: number | null
          related_games?: string[] | null
          skill_id?: string | null
          stagnant_since?: string | null
          status?: string | null
          success_criteria?: string[] | null
          target_date?: string | null
          title?: string
          weight?: number | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "development_goals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "development_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_goals_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_goals_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "vw_org_skill_metrics"
            referencedColumns: ["skill_id"]
          },
        ]
      }
      development_plans: {
        Row: {
          created_at: string | null
          id: string
          manager_id: string | null
          organization_id: string | null
          overall_progress: number | null
          period_end: string | null
          period_start: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
          xp_on_completion: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          manager_id?: string | null
          organization_id?: string | null
          overall_progress?: number | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          xp_on_completion?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          manager_id?: string | null
          organization_id?: string | null
          overall_progress?: number | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          xp_on_completion?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "development_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      evolution_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          metadata: Json | null
          organization_id: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          severity: string
          suggested_action: string | null
          suggested_action_id: string | null
          suggested_action_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          severity?: string
          suggested_action?: string | null
          suggested_action_id?: string | null
          suggested_action_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          severity?: string
          suggested_action?: string | null
          suggested_action_id?: string | null
          suggested_action_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evolution_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      evolution_templates: {
        Row: {
          category: string
          certificate_min_score: number | null
          created_at: string | null
          generates_certificate: boolean | null
          id: string
          importance: string
          insignia_ids: string[] | null
          is_default: boolean | null
          level: string
          name: string
          organization_id: string | null
          skill_impacts: Json
          suggested_coins: number | null
          suggested_xp: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          certificate_min_score?: number | null
          created_at?: string | null
          generates_certificate?: boolean | null
          id?: string
          importance: string
          insignia_ids?: string[] | null
          is_default?: boolean | null
          level: string
          name: string
          organization_id?: string | null
          skill_impacts?: Json
          suggested_coins?: number | null
          suggested_xp?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          certificate_min_score?: number | null
          created_at?: string | null
          generates_certificate?: boolean | null
          id?: string
          importance?: string
          insignia_ids?: string[] | null
          is_default?: boolean | null
          level?: string
          name?: string
          organization_id?: string | null
          skill_impacts?: Json
          suggested_coins?: number | null
          suggested_xp?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evolution_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_requests: {
        Row: {
          completed_at: string | null
          completion_notes: string | null
          created_at: string | null
          id: string
          inventory_id: string
          notes: string | null
          organization_id: string
          preferred_date: string | null
          requested_at: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          id?: string
          inventory_id: string
          notes?: string | null
          organization_id: string
          preferred_date?: string | null
          requested_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          id?: string
          inventory_id?: string
          notes?: string | null
          organization_id?: string
          preferred_date?: string | null
          requested_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_requests_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "user_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_requests_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "vw_active_boosts"
            referencedColumns: ["inventory_id"]
          },
          {
            foreignKeyName: "experience_requests_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "vw_expiring_items"
            referencedColumns: ["inventory_id"]
          },
          {
            foreignKeyName: "experience_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      game_configurations: {
        Row: {
          advanced_config: Json | null
          allow_in_commitments: boolean | null
          coins_base_reward: number | null
          coins_multiplier: number | null
          config_version: number | null
          created_at: string | null
          default_difficulty: string | null
          description: string | null
          difficulty_multipliers: Json | null
          display_name: string
          duration_minutes: number | null
          game_type: string
          icon: string | null
          id: string
          is_active: boolean | null
          is_repeatable: boolean | null
          max_attempts_per_day: number | null
          organization_id: string | null
          participation_coins: number | null
          participation_xp: number | null
          primary_metric: string | null
          skill_categories: string[] | null
          streak_bonus_config: Json | null
          target_score: number | null
          time_bonus_config: Json | null
          updated_at: string | null
          visibility: string | null
          xp_base_reward: number | null
          xp_multiplier: number | null
        }
        Insert: {
          advanced_config?: Json | null
          allow_in_commitments?: boolean | null
          coins_base_reward?: number | null
          coins_multiplier?: number | null
          config_version?: number | null
          created_at?: string | null
          default_difficulty?: string | null
          description?: string | null
          difficulty_multipliers?: Json | null
          display_name: string
          duration_minutes?: number | null
          game_type: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_repeatable?: boolean | null
          max_attempts_per_day?: number | null
          organization_id?: string | null
          participation_coins?: number | null
          participation_xp?: number | null
          primary_metric?: string | null
          skill_categories?: string[] | null
          streak_bonus_config?: Json | null
          target_score?: number | null
          time_bonus_config?: Json | null
          updated_at?: string | null
          visibility?: string | null
          xp_base_reward?: number | null
          xp_multiplier?: number | null
        }
        Update: {
          advanced_config?: Json | null
          allow_in_commitments?: boolean | null
          coins_base_reward?: number | null
          coins_multiplier?: number | null
          config_version?: number | null
          created_at?: string | null
          default_difficulty?: string | null
          description?: string | null
          difficulty_multipliers?: Json | null
          display_name?: string
          duration_minutes?: number | null
          game_type?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_repeatable?: boolean | null
          max_attempts_per_day?: number | null
          organization_id?: string | null
          participation_coins?: number | null
          participation_xp?: number | null
          primary_metric?: string | null
          skill_categories?: string[] | null
          streak_bonus_config?: Json | null
          target_score?: number | null
          time_bonus_config?: Json | null
          updated_at?: string | null
          visibility?: string | null
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
      gamification_events: {
        Row: {
          coins_earned: number
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          source_id: string | null
          source_type: string | null
          user_id: string
          xp_earned: number
        }
        Insert: {
          coins_earned?: number
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string | null
          user_id: string
          xp_earned?: number
        }
        Update: {
          coins_earned?: number
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string | null
          user_id?: string
          xp_earned?: number
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
      goal_check_ins: {
        Row: {
          blockers: string | null
          checked_by: string | null
          created_at: string | null
          goal_id: string | null
          id: string
          new_progress: number | null
          progress_update: string | null
          user_id: string
        }
        Insert: {
          blockers?: string | null
          checked_by?: string | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          new_progress?: number | null
          progress_update?: string | null
          user_id: string
        }
        Update: {
          blockers?: string | null
          checked_by?: string | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          new_progress?: number | null
          progress_update?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_check_ins_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "development_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_progress_events: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          metadata: Json | null
          organization_id: string | null
          progress_after: number
          progress_before: number
          progress_delta: number
          source_id: string | null
          source_name: string | null
          source_type: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          progress_after?: number
          progress_before?: number
          progress_delta?: number
          source_id?: string | null
          source_name?: string | null
          source_type: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          progress_after?: number
          progress_before?: number
          progress_delta?: number
          source_id?: string | null
          source_name?: string | null
          source_type?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_events_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "development_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_progress_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      insignia_criteria: {
        Row: {
          avg_value: number | null
          context_config: Json | null
          created_at: string | null
          criterion_type: string
          description: string
          event_type: string | null
          id: string
          insignia_id: string
          is_required: boolean | null
          min_count: number | null
          min_value: number | null
          sort_order: number | null
          time_window_days: number | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          avg_value?: number | null
          context_config?: Json | null
          created_at?: string | null
          criterion_type: string
          description: string
          event_type?: string | null
          id?: string
          insignia_id: string
          is_required?: boolean | null
          min_count?: number | null
          min_value?: number | null
          sort_order?: number | null
          time_window_days?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          avg_value?: number | null
          context_config?: Json | null
          created_at?: string | null
          criterion_type?: string
          description?: string
          event_type?: string | null
          id?: string
          insignia_id?: string
          is_required?: boolean | null
          min_count?: number | null
          min_value?: number | null
          sort_order?: number | null
          time_window_days?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "insignia_criteria_insignia_id_fkey"
            columns: ["insignia_id"]
            isOneToOne: false
            referencedRelation: "insignias"
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
          insignia_key: string | null
          insignia_type: string
          is_active: boolean | null
          level: number | null
          name: string
          organization_id: string | null
          prerequisites: string[] | null
          related_skill_ids: string[] | null
          required_game_score_min: number | null
          required_game_type: string | null
          required_missions_completed: number | null
          required_skill_id: string | null
          required_skill_level: number | null
          required_streak_days: number | null
          required_xp: number | null
          shape: string
          star_level: number
          unlock_animation: string | null
          unlock_message: string | null
          unlock_rules: Json | null
          unlocks: Json | null
          version: number | null
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
          insignia_key?: string | null
          insignia_type?: string
          is_active?: boolean | null
          level?: number | null
          name: string
          organization_id?: string | null
          prerequisites?: string[] | null
          related_skill_ids?: string[] | null
          required_game_score_min?: number | null
          required_game_type?: string | null
          required_missions_completed?: number | null
          required_skill_id?: string | null
          required_skill_level?: number | null
          required_streak_days?: number | null
          required_xp?: number | null
          shape?: string
          star_level?: number
          unlock_animation?: string | null
          unlock_message?: string | null
          unlock_rules?: Json | null
          unlocks?: Json | null
          version?: number | null
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
          insignia_key?: string | null
          insignia_type?: string
          is_active?: boolean | null
          level?: number | null
          name?: string
          organization_id?: string | null
          prerequisites?: string[] | null
          related_skill_ids?: string[] | null
          required_game_score_min?: number | null
          required_game_type?: string | null
          required_missions_completed?: number | null
          required_skill_id?: string | null
          required_skill_level?: number | null
          required_streak_days?: number | null
          required_xp?: number | null
          shape?: string
          star_level?: number
          unlock_animation?: string | null
          unlock_message?: string | null
          unlock_rules?: Json | null
          unlocks?: Json | null
          version?: number | null
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
      item_usage_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          inventory_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          inventory_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          inventory_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_usage_log_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "user_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_usage_log_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "vw_active_boosts"
            referencedColumns: ["inventory_id"]
          },
          {
            foreignKeyName: "item_usage_log_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "vw_expiring_items"
            referencedColumns: ["inventory_id"]
          },
        ]
      }
      journey_trainings: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          journey_id: string
          order_index: number
          prerequisite_training_id: string | null
          training_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          journey_id: string
          order_index?: number
          prerequisite_training_id?: string | null
          training_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          journey_id?: string
          order_index?: number
          prerequisite_training_id?: string | null
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_trainings_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "training_journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_trainings_prerequisite_training_id_fkey"
            columns: ["prerequisite_training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_trainings_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
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
      marketplace_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          section: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          section?: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          section?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_items: {
        Row: {
          available_for_orgs_only: boolean | null
          behavior_type: string | null
          boost_duration_hours: number | null
          boost_type: string | null
          boost_value: number | null
          category: string
          configurable_by_org: boolean | null
          created_at: string
          created_by: string | null
          description: string | null
          expires_after_purchase: number | null
          expires_after_use: boolean | null
          icon: string
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean | null
          is_limited_edition: boolean | null
          item_type: string | null
          max_uses: number | null
          name: string
          organization_id: string | null
          price: number
          rarity: string
          requires_approval: boolean | null
          sort_order: number | null
          stock: number | null
          usage_instructions: string | null
        }
        Insert: {
          available_for_orgs_only?: boolean | null
          behavior_type?: string | null
          boost_duration_hours?: number | null
          boost_type?: string | null
          boost_value?: number | null
          category?: string
          configurable_by_org?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_after_purchase?: number | null
          expires_after_use?: boolean | null
          icon: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean | null
          is_limited_edition?: boolean | null
          item_type?: string | null
          max_uses?: number | null
          name: string
          organization_id?: string | null
          price: number
          rarity?: string
          requires_approval?: boolean | null
          sort_order?: number | null
          stock?: number | null
          usage_instructions?: string | null
        }
        Update: {
          available_for_orgs_only?: boolean | null
          behavior_type?: string | null
          boost_duration_hours?: number | null
          boost_type?: string | null
          boost_value?: number | null
          category?: string
          configurable_by_org?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_after_purchase?: number | null
          expires_after_use?: boolean | null
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean | null
          is_limited_edition?: boolean | null
          item_type?: string | null
          max_uses?: number | null
          name?: string
          organization_id?: string | null
          price?: number
          rarity?: string
          requires_approval?: boolean | null
          sort_order?: number | null
          stock?: number | null
          usage_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_transactions: {
        Row: {
          coins_amount: number
          created_at: string | null
          id: string
          item_id: string
          metadata: Json | null
          type: string
          user_id: string
        }
        Insert: {
          coins_amount: number
          created_at?: string | null
          id?: string
          item_id: string
          metadata?: Json | null
          type: string
          user_id: string
        }
        Update: {
          coins_amount?: number
          created_at?: string | null
          id?: string
          item_id?: string
          metadata?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_goals: {
        Row: {
          coins_reward: number
          completed_at: string | null
          created_at: string
          current_value: number
          description: string | null
          goal_month: string
          goal_type: string
          icon: string | null
          id: string
          insignia_reward_id: string | null
          organization_id: string | null
          status: string
          target_value: number
          title: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          coins_reward?: number
          completed_at?: string | null
          created_at?: string
          current_value?: number
          description?: string | null
          goal_month: string
          goal_type: string
          icon?: string | null
          id?: string
          insignia_reward_id?: string | null
          organization_id?: string | null
          status?: string
          target_value: number
          title: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          coins_reward?: number
          completed_at?: string | null
          created_at?: string
          current_value?: number
          description?: string | null
          goal_month?: string
          goal_type?: string
          icon?: string | null
          id?: string
          insignia_reward_id?: string | null
          organization_id?: string | null
          status?: string
          target_value?: number
          title?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_goals_insignia_reward_id_fkey"
            columns: ["insignia_reward_id"]
            isOneToOne: false
            referencedRelation: "insignias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      one_on_one_action_items: {
        Row: {
          assigned_to: string
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          meeting_id: string | null
          status: string | null
          title: string
        }
        Insert: {
          assigned_to: string
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_on_one_action_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "one_on_one_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      one_on_one_meetings: {
        Row: {
          ai_insights: string | null
          challenges_reviewed: string[] | null
          created_at: string | null
          duration_minutes: number | null
          employee_id: string
          id: string
          location: string | null
          manager_id: string
          organization_id: string | null
          outcomes: Json | null
          recurrence: string | null
          scheduled_at: string
          skills_discussed: string[] | null
          status: string | null
          suggested_topics: Json | null
          template_id: string | null
        }
        Insert: {
          ai_insights?: string | null
          challenges_reviewed?: string[] | null
          created_at?: string | null
          duration_minutes?: number | null
          employee_id: string
          id?: string
          location?: string | null
          manager_id: string
          organization_id?: string | null
          outcomes?: Json | null
          recurrence?: string | null
          scheduled_at: string
          skills_discussed?: string[] | null
          status?: string | null
          suggested_topics?: Json | null
          template_id?: string | null
        }
        Update: {
          ai_insights?: string | null
          challenges_reviewed?: string[] | null
          created_at?: string | null
          duration_minutes?: number | null
          employee_id?: string
          id?: string
          location?: string | null
          manager_id?: string
          organization_id?: string | null
          outcomes?: Json | null
          recurrence?: string | null
          scheduled_at?: string
          skills_discussed?: string[] | null
          status?: string | null
          suggested_topics?: Json | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "one_on_one_meetings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "one_on_one_meetings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "one_on_one_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      one_on_one_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          is_private: boolean | null
          meeting_id: string | null
          related_goal_id: string | null
          section: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          meeting_id?: string | null
          related_goal_id?: string | null
          section: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          meeting_id?: string | null
          related_goal_id?: string | null
          section?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_on_one_notes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "one_on_one_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "one_on_one_notes_related_goal_id_fkey"
            columns: ["related_goal_id"]
            isOneToOne: false
            referencedRelation: "development_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      one_on_one_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string | null
          questions: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id?: string | null
          questions?: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string | null
          questions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "one_on_one_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_training_config: {
        Row: {
          coins_multiplier: number | null
          created_at: string | null
          deadline_days: number | null
          id: string
          is_enabled: boolean | null
          organization_id: string
          requirement_type: string | null
          role_ids: string[] | null
          team_ids: string[] | null
          training_id: string
          updated_at: string | null
          xp_multiplier: number | null
        }
        Insert: {
          coins_multiplier?: number | null
          created_at?: string | null
          deadline_days?: number | null
          id?: string
          is_enabled?: boolean | null
          organization_id: string
          requirement_type?: string | null
          role_ids?: string[] | null
          team_ids?: string[] | null
          training_id: string
          updated_at?: string | null
          xp_multiplier?: number | null
        }
        Update: {
          coins_multiplier?: number | null
          created_at?: string | null
          deadline_days?: number | null
          id?: string
          is_enabled?: boolean | null
          organization_id?: string
          requirement_type?: string | null
          role_ids?: string[] | null
          team_ids?: string[] | null
          training_id?: string
          updated_at?: string | null
          xp_multiplier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "org_training_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_training_config_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
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
      organization_game_overrides: {
        Row: {
          advanced_config_override: Json | null
          allow_in_commitments: boolean | null
          coins_base_override: number | null
          coins_multiplier_override: number | null
          created_at: string | null
          game_type: string
          id: string
          is_active: boolean | null
          organization_id: string
          target_score_override: number | null
          updated_at: string | null
          visibility_override: string | null
          xp_base_override: number | null
          xp_multiplier_override: number | null
        }
        Insert: {
          advanced_config_override?: Json | null
          allow_in_commitments?: boolean | null
          coins_base_override?: number | null
          coins_multiplier_override?: number | null
          created_at?: string | null
          game_type: string
          id?: string
          is_active?: boolean | null
          organization_id: string
          target_score_override?: number | null
          updated_at?: string | null
          visibility_override?: string | null
          xp_base_override?: number | null
          xp_multiplier_override?: number | null
        }
        Update: {
          advanced_config_override?: Json | null
          allow_in_commitments?: boolean | null
          coins_base_override?: number | null
          coins_multiplier_override?: number | null
          created_at?: string | null
          game_type?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string
          target_score_override?: number | null
          updated_at?: string | null
          visibility_override?: string | null
          xp_base_override?: number | null
          xp_multiplier_override?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_game_overrides_organization_id_fkey"
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
      organization_marketplace_config: {
        Row: {
          auto_approve: boolean | null
          created_at: string | null
          custom_instructions: string | null
          id: string
          is_enabled: boolean | null
          item_id: string
          organization_id: string
          price_override: number | null
          requires_manager_approval: boolean | null
        }
        Insert: {
          auto_approve?: boolean | null
          created_at?: string | null
          custom_instructions?: string | null
          id?: string
          is_enabled?: boolean | null
          item_id: string
          organization_id: string
          price_override?: number | null
          requires_manager_approval?: boolean | null
        }
        Update: {
          auto_approve?: boolean | null
          created_at?: string | null
          custom_instructions?: string | null
          id?: string
          is_enabled?: boolean | null
          item_id?: string
          organization_id?: string
          price_override?: number | null
          requires_manager_approval?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_marketplace_config_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_marketplace_config_organization_id_fkey"
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
      pdi_linked_actions: {
        Row: {
          action_id: string | null
          action_name: string
          action_type: string
          completed_at: string | null
          dismissed_at: string | null
          expected_progress_impact: number | null
          goal_id: string
          id: string
          metadata: Json | null
          organization_id: string | null
          priority: number | null
          suggested_at: string
          user_id: string
        }
        Insert: {
          action_id?: string | null
          action_name: string
          action_type: string
          completed_at?: string | null
          dismissed_at?: string | null
          expected_progress_impact?: number | null
          goal_id: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: number | null
          suggested_at?: string
          user_id: string
        }
        Update: {
          action_id?: string | null
          action_name?: string
          action_type?: string
          completed_at?: string | null
          dismissed_at?: string | null
          expected_progress_impact?: number | null
          goal_id?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: number | null
          suggested_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdi_linked_actions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "development_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdi_linked_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      reward_history: {
        Row: {
          coins_earned: number
          created_at: string
          id: string
          metadata: Json | null
          organization_id: string | null
          performance_score: number | null
          source_id: string
          source_type: string
          target_met: boolean | null
          target_score: number | null
          user_id: string
          xp_earned: number
        }
        Insert: {
          coins_earned?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          performance_score?: number | null
          source_id: string
          source_type: string
          target_met?: boolean | null
          target_score?: number | null
          user_id: string
          xp_earned?: number
        }
        Update: {
          coins_earned?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          performance_score?: number | null
          source_id?: string
          source_type?: string
          target_met?: boolean | null
          target_score?: number | null
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "reward_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_items: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          item_id: string | null
          organization_id: string | null
          source_id: string
          source_type: string
          unlock_mode: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          organization_id?: string | null
          source_id: string
          source_type: string
          unlock_mode?: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          organization_id?: string | null
          source_id?: string
          source_type?: string
          unlock_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      skill_impact_events: {
        Row: {
          created_at: string | null
          id: string
          impact_type: string
          impact_value: number
          metadata: Json | null
          normalized_score: number | null
          organization_id: string | null
          skill_id: string
          source_id: string | null
          source_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          impact_type: string
          impact_value?: number
          metadata?: Json | null
          normalized_score?: number | null
          organization_id?: string | null
          skill_id: string
          source_id?: string | null
          source_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          impact_type?: string
          impact_value?: number
          metadata?: Json | null
          normalized_score?: number | null
          organization_id?: string | null
          skill_id?: string
          source_id?: string | null
          source_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_impact_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_impact_events_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_impact_events_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "vw_org_skill_metrics"
            referencedColumns: ["skill_id"]
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
      training_analytics: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          module_id: string | null
          organization_id: string | null
          score: number | null
          time_spent_seconds: number | null
          training_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          module_id?: string | null
          organization_id?: string | null
          score?: number | null
          time_spent_seconds?: number | null
          training_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          module_id?: string | null
          organization_id?: string | null
          score?: number | null
          time_spent_seconds?: number | null
          training_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_analytics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_analytics_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      training_certificates: {
        Row: {
          certificate_number: string
          expires_at: string | null
          final_score: number | null
          id: string
          insignia_id: string | null
          issued_at: string | null
          metadata: Json | null
          pdf_url: string | null
          skills_validated: string[] | null
          status: string | null
          training_id: string
          user_id: string
          verification_code: string | null
        }
        Insert: {
          certificate_number: string
          expires_at?: string | null
          final_score?: number | null
          id?: string
          insignia_id?: string | null
          issued_at?: string | null
          metadata?: Json | null
          pdf_url?: string | null
          skills_validated?: string[] | null
          status?: string | null
          training_id: string
          user_id: string
          verification_code?: string | null
        }
        Update: {
          certificate_number?: string
          expires_at?: string | null
          final_score?: number | null
          id?: string
          insignia_id?: string | null
          issued_at?: string | null
          metadata?: Json | null
          pdf_url?: string | null
          skills_validated?: string[] | null
          status?: string | null
          training_id?: string
          user_id?: string
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_certificates_insignia_id_fkey"
            columns: ["insignia_id"]
            isOneToOne: false
            referencedRelation: "insignias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_certificates_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_insignia_relation: {
        Row: {
          created_at: string
          id: string
          insignia_id: string
          relation_type: string
          training_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          insignia_id: string
          relation_type?: string
          training_id: string
        }
        Update: {
          created_at?: string
          id?: string
          insignia_id?: string
          relation_type?: string
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_insignia_relation_insignia_id_fkey"
            columns: ["insignia_id"]
            isOneToOne: false
            referencedRelation: "insignias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_insignia_relation_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      training_journeys: {
        Row: {
          aggregated_skills: Json | null
          bonus_coins: number | null
          bonus_insignia_id: string | null
          bonus_item_ids: Json | null
          bonus_xp: number | null
          category: string
          certificate_name: string | null
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          evolution_template_id: string | null
          generates_certificate: boolean | null
          icon: string | null
          id: string
          importance: string | null
          is_active: boolean | null
          journey_key: string
          level: string
          name: string
          order_type: string | null
          organization_id: string | null
          thumbnail_url: string | null
          total_coins: number | null
          total_estimated_hours: number | null
          total_trainings: number | null
          total_xp: number | null
          updated_at: string | null
        }
        Insert: {
          aggregated_skills?: Json | null
          bonus_coins?: number | null
          bonus_insignia_id?: string | null
          bonus_item_ids?: Json | null
          bonus_xp?: number | null
          category?: string
          certificate_name?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          evolution_template_id?: string | null
          generates_certificate?: boolean | null
          icon?: string | null
          id?: string
          importance?: string | null
          is_active?: boolean | null
          journey_key: string
          level?: string
          name: string
          order_type?: string | null
          organization_id?: string | null
          thumbnail_url?: string | null
          total_coins?: number | null
          total_estimated_hours?: number | null
          total_trainings?: number | null
          total_xp?: number | null
          updated_at?: string | null
        }
        Update: {
          aggregated_skills?: Json | null
          bonus_coins?: number | null
          bonus_insignia_id?: string | null
          bonus_item_ids?: Json | null
          bonus_xp?: number | null
          category?: string
          certificate_name?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          evolution_template_id?: string | null
          generates_certificate?: boolean | null
          icon?: string | null
          id?: string
          importance?: string | null
          is_active?: boolean | null
          journey_key?: string
          level?: string
          name?: string
          order_type?: string | null
          organization_id?: string | null
          thumbnail_url?: string | null
          total_coins?: number | null
          total_estimated_hours?: number | null
          total_trainings?: number | null
          total_xp?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_journeys_bonus_insignia_id_fkey"
            columns: ["bonus_insignia_id"]
            isOneToOne: false
            referencedRelation: "insignias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_journeys_evolution_template_id_fkey"
            columns: ["evolution_template_id"]
            isOneToOne: false
            referencedRelation: "evolution_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_journeys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_module_prerequisites: {
        Row: {
          created_at: string | null
          id: string
          module_id: string
          prerequisite_module_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_id: string
          prerequisite_module_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          module_id?: string
          prerequisite_module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_module_prerequisites_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_module_prerequisites_prerequisite_module_id_fkey"
            columns: ["prerequisite_module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          coins_reward: number | null
          content_data: Json | null
          content_type: string | null
          created_at: string | null
          description: string | null
          game_config: Json | null
          id: string
          is_checkpoint: boolean | null
          is_optional: boolean | null
          is_preview: boolean | null
          is_preview_available: boolean | null
          is_required: boolean | null
          level: number | null
          min_score: number | null
          module_key: string
          name: string
          numbering: string | null
          order_index: number | null
          parent_module_id: string | null
          requires_completion: boolean | null
          skill_ids: string[] | null
          skill_impacts: Json | null
          step_config: Json | null
          step_type: string | null
          thumbnail_url: string | null
          time_minutes: number | null
          training_id: string
          unlock_condition: Json | null
          validation_criteria: Json | null
          video_url: string | null
          xp_reward: number | null
        }
        Insert: {
          coins_reward?: number | null
          content_data?: Json | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          game_config?: Json | null
          id?: string
          is_checkpoint?: boolean | null
          is_optional?: boolean | null
          is_preview?: boolean | null
          is_preview_available?: boolean | null
          is_required?: boolean | null
          level?: number | null
          min_score?: number | null
          module_key: string
          name: string
          numbering?: string | null
          order_index?: number | null
          parent_module_id?: string | null
          requires_completion?: boolean | null
          skill_ids?: string[] | null
          skill_impacts?: Json | null
          step_config?: Json | null
          step_type?: string | null
          thumbnail_url?: string | null
          time_minutes?: number | null
          training_id: string
          unlock_condition?: Json | null
          validation_criteria?: Json | null
          video_url?: string | null
          xp_reward?: number | null
        }
        Update: {
          coins_reward?: number | null
          content_data?: Json | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          game_config?: Json | null
          id?: string
          is_checkpoint?: boolean | null
          is_optional?: boolean | null
          is_preview?: boolean | null
          is_preview_available?: boolean | null
          is_required?: boolean | null
          level?: number | null
          min_score?: number | null
          module_key?: string
          name?: string
          numbering?: string | null
          order_index?: number | null
          parent_module_id?: string | null
          requires_completion?: boolean | null
          skill_ids?: string[] | null
          skill_impacts?: Json | null
          step_config?: Json | null
          step_type?: string | null
          thumbnail_url?: string | null
          time_minutes?: number | null
          training_id?: string
          unlock_condition?: Json | null
          validation_criteria?: Json | null
          video_url?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "training_modules_parent_module_id_fkey"
            columns: ["parent_module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_modules_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      training_notes: {
        Row: {
          content: string
          content_type: string
          created_at: string
          game_context: Json | null
          id: string
          is_favorite: boolean | null
          module_id: string
          organization_id: string | null
          quiz_question_index: number | null
          skill_ids: string[] | null
          status: string
          tags: string[] | null
          text_selection: string | null
          timestamp_seconds: number | null
          title: string | null
          training_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string
          game_context?: Json | null
          id?: string
          is_favorite?: boolean | null
          module_id: string
          organization_id?: string | null
          quiz_question_index?: number | null
          skill_ids?: string[] | null
          status?: string
          tags?: string[] | null
          text_selection?: string | null
          timestamp_seconds?: number | null
          title?: string | null
          training_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          game_context?: Json | null
          id?: string
          is_favorite?: boolean | null
          module_id?: string
          organization_id?: string | null
          quiz_question_index?: number | null
          skill_ids?: string[] | null
          status?: string
          tags?: string[] | null
          text_selection?: string | null
          timestamp_seconds?: number | null
          title?: string | null
          training_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_notes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_notes_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      training_notes_analytics: {
        Row: {
          avg_notes_per_user: number | null
          created_at: string | null
          id: string
          module_id: string | null
          notes_by_status: Json | null
          organization_id: string
          period_end: string
          period_start: string
          total_notes: number | null
          training_id: string
          unique_users: number | null
          updated_at: string | null
        }
        Insert: {
          avg_notes_per_user?: number | null
          created_at?: string | null
          id?: string
          module_id?: string | null
          notes_by_status?: Json | null
          organization_id: string
          period_end: string
          period_start: string
          total_notes?: number | null
          training_id: string
          unique_users?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_notes_per_user?: number | null
          created_at?: string | null
          id?: string
          module_id?: string | null
          notes_by_status?: Json | null
          organization_id?: string
          period_end?: string
          period_start?: string
          total_notes?: number | null
          training_id?: string
          unique_users?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_notes_analytics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_notes_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_notes_analytics_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      training_skill_impact: {
        Row: {
          created_at: string
          id: string
          impact_weight: string
          skill_id: string
          training_id: string
          xp_multiplier: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          impact_weight?: string
          skill_id: string
          training_id: string
          xp_multiplier?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          impact_weight?: string
          skill_id?: string
          training_id?: string
          xp_multiplier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "training_skill_impact_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_skill_impact_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "vw_org_skill_metrics"
            referencedColumns: ["skill_id"]
          },
          {
            foreignKeyName: "training_skill_impact_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          allow_retry: boolean | null
          area: string | null
          bonus_rules: Json | null
          category: string | null
          certificate_enabled: boolean | null
          certificate_min_score: number | null
          certificate_name: string | null
          certificate_require_checkpoints: boolean | null
          certificate_type: string | null
          certificate_validity_months: number | null
          coins_reward: number | null
          color: string | null
          completion_criteria: Json | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          display_order: number | null
          estimated_hours: number | null
          evolution_snapshot: Json | null
          evolution_template_id: string | null
          icon: string | null
          id: string
          importance: string | null
          insignia_reward_id: string | null
          is_active: boolean | null
          is_onboarding: boolean | null
          max_attempts: number | null
          name: string
          organization_id: string | null
          required_level: string | null
          reward_items: Json | null
          reward_rules: Json | null
          skill_ids: string[] | null
          thumbnail_url: string | null
          training_key: string
          training_status: string | null
          xp_reward: number | null
        }
        Insert: {
          allow_retry?: boolean | null
          area?: string | null
          bonus_rules?: Json | null
          category?: string | null
          certificate_enabled?: boolean | null
          certificate_min_score?: number | null
          certificate_name?: string | null
          certificate_require_checkpoints?: boolean | null
          certificate_type?: string | null
          certificate_validity_months?: number | null
          coins_reward?: number | null
          color?: string | null
          completion_criteria?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          display_order?: number | null
          estimated_hours?: number | null
          evolution_snapshot?: Json | null
          evolution_template_id?: string | null
          icon?: string | null
          id?: string
          importance?: string | null
          insignia_reward_id?: string | null
          is_active?: boolean | null
          is_onboarding?: boolean | null
          max_attempts?: number | null
          name: string
          organization_id?: string | null
          required_level?: string | null
          reward_items?: Json | null
          reward_rules?: Json | null
          skill_ids?: string[] | null
          thumbnail_url?: string | null
          training_key: string
          training_status?: string | null
          xp_reward?: number | null
        }
        Update: {
          allow_retry?: boolean | null
          area?: string | null
          bonus_rules?: Json | null
          category?: string | null
          certificate_enabled?: boolean | null
          certificate_min_score?: number | null
          certificate_name?: string | null
          certificate_require_checkpoints?: boolean | null
          certificate_type?: string | null
          certificate_validity_months?: number | null
          coins_reward?: number | null
          color?: string | null
          completion_criteria?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          display_order?: number | null
          estimated_hours?: number | null
          evolution_snapshot?: Json | null
          evolution_template_id?: string | null
          icon?: string | null
          id?: string
          importance?: string | null
          insignia_reward_id?: string | null
          is_active?: boolean | null
          is_onboarding?: boolean | null
          max_attempts?: number | null
          name?: string
          organization_id?: string | null
          required_level?: string | null
          reward_items?: Json | null
          reward_rules?: Json | null
          skill_ids?: string[] | null
          thumbnail_url?: string | null
          training_key?: string
          training_status?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trainings_evolution_template_id_fkey"
            columns: ["evolution_template_id"]
            isOneToOne: false
            referencedRelation: "evolution_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainings_insignia_reward_id_fkey"
            columns: ["insignia_reward_id"]
            isOneToOne: false
            referencedRelation: "insignias"
            referencedColumns: ["id"]
          },
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
          awarded_by: string | null
          coins_awarded: number | null
          id: string
          insignia_id: string
          is_displayed: boolean | null
          progress_data: Json | null
          progress_snapshot: Json | null
          source_events: string[] | null
          unlocked_at: string | null
          user_id: string
          xp_awarded: number | null
        }
        Insert: {
          awarded_by?: string | null
          coins_awarded?: number | null
          id?: string
          insignia_id: string
          is_displayed?: boolean | null
          progress_data?: Json | null
          progress_snapshot?: Json | null
          source_events?: string[] | null
          unlocked_at?: string | null
          user_id: string
          xp_awarded?: number | null
        }
        Update: {
          awarded_by?: string | null
          coins_awarded?: number | null
          id?: string
          insignia_id?: string
          is_displayed?: boolean | null
          progress_data?: Json | null
          progress_snapshot?: Json | null
          source_events?: string[] | null
          unlocked_at?: string | null
          user_id?: string
          xp_awarded?: number | null
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
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          boost_active_until: string | null
          expires_at: string | null
          id: string
          is_equipped: boolean
          item_id: string
          purchased_at: string
          rejection_reason: string | null
          status: string | null
          used_at: string | null
          user_id: string
          uses_remaining: number | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          boost_active_until?: string | null
          expires_at?: string | null
          id?: string
          is_equipped?: boolean
          item_id: string
          purchased_at?: string
          rejection_reason?: string | null
          status?: string | null
          used_at?: string | null
          user_id: string
          uses_remaining?: number | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          boost_active_until?: string | null
          expires_at?: string | null
          id?: string
          is_equipped?: boolean
          item_id?: string
          purchased_at?: string
          rejection_reason?: string | null
          status?: string | null
          used_at?: string | null
          user_id?: string
          uses_remaining?: number | null
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
      user_journey_progress: {
        Row: {
          bonus_claimed: boolean | null
          certificate_issued_at: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          journey_id: string
          organization_id: string | null
          started_at: string | null
          status: string | null
          total_coins_earned: number | null
          total_xp_earned: number | null
          trainings_completed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bonus_claimed?: boolean | null
          certificate_issued_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          journey_id: string
          organization_id?: string | null
          started_at?: string | null
          status?: string | null
          total_coins_earned?: number | null
          total_xp_earned?: number | null
          trainings_completed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bonus_claimed?: boolean | null
          certificate_issued_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          journey_id?: string
          organization_id?: string | null
          started_at?: string | null
          status?: string | null
          total_coins_earned?: number | null
          total_xp_earned?: number | null
          trainings_completed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_progress_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "training_journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_journey_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          attempts: number | null
          completed_at: string | null
          id: string
          metadata: Json | null
          module_id: string
          passed_validation: boolean | null
          score: number | null
          started_at: string | null
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          id?: string
          metadata?: Json | null
          module_id: string
          passed_validation?: boolean | null
          score?: number | null
          started_at?: string | null
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          id?: string
          metadata?: Json | null
          module_id?: string
          passed_validation?: boolean | null
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
      user_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          language: string | null
          push_notifications: boolean | null
          sound_effects: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          push_notifications?: boolean | null
          sound_effects?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          push_notifications?: boolean | null
          sound_effects?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          assigned_at: string | null
          assigned_by: string | null
          attempts: number | null
          average_score: number | null
          bonus_xp_earned: number | null
          completed_at: string | null
          current_module_index: number | null
          deadline_at: string | null
          id: string
          progress_percent: number | null
          started_at: string | null
          total_time_seconds: number | null
          training_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          attempts?: number | null
          average_score?: number | null
          bonus_xp_earned?: number | null
          completed_at?: string | null
          current_module_index?: number | null
          deadline_at?: string | null
          id?: string
          progress_percent?: number | null
          started_at?: string | null
          total_time_seconds?: number | null
          training_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          attempts?: number | null
          average_score?: number | null
          bonus_xp_earned?: number | null
          completed_at?: string | null
          current_module_index?: number | null
          deadline_at?: string | null
          id?: string
          progress_percent?: number | null
          started_at?: string | null
          total_time_seconds?: number | null
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
      user_unlocked_items: {
        Row: {
          id: string
          item_id: string
          organization_id: string | null
          source_id: string
          source_type: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          item_id: string
          organization_id?: string | null
          source_id: string
          source_type: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          item_id?: string
          organization_id?: string | null
          source_id?: string
          source_type?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_unlocked_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_unlocked_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      vw_active_boosts: {
        Row: {
          boost_active_until: string | null
          boost_type: string | null
          boost_value: number | null
          hours_remaining: number | null
          inventory_id: string | null
          item_icon: string | null
          item_name: string | null
          user_id: string | null
        }
        Relationships: []
      }
      vw_challenges_with_stats: {
        Row: {
          auto_enroll: boolean | null
          calculated_supporters_count: number | null
          calculated_total_staked: number | null
          coins_reward: number | null
          created_at: string | null
          created_by: string | null
          current_value: number | null
          description: string | null
          ends_at: string | null
          icon: string | null
          id: string | null
          insignia_id: string | null
          is_featured: boolean | null
          max_participants: number | null
          metric_type: string | null
          name: string | null
          organization_id: string | null
          progress_percentage: number | null
          reward_type:
            | Database["public"]["Enums"]["commitment_reward_type"]
            | null
          scope: Database["public"]["Enums"]["commitment_scope"] | null
          source: Database["public"]["Enums"]["commitment_source"] | null
          starts_at: string | null
          status: Database["public"]["Enums"]["commitment_status"] | null
          success_criteria: string | null
          supporter_multiplier: number | null
          supporters_count: number | null
          target_value: number | null
          team_id: string | null
          total_staked: number | null
          updated_at: string | null
          xp_reward: number | null
        }
        Relationships: [
          {
            foreignKeyName: "commitments_insignia_id_fkey"
            columns: ["insignia_id"]
            isOneToOne: false
            referencedRelation: "insignias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "organization_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_expiring_items: {
        Row: {
          days_remaining: number | null
          expires_at: string | null
          inventory_id: string | null
          item_icon: string | null
          item_name: string | null
          item_type: string | null
          user_id: string | null
        }
        Relationships: []
      }
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
      activate_boost: { Args: { p_inventory_id: string }; Returns: Json }
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
      calculate_criterion_progress: {
        Args: { p_criterion_id: string; p_user_id: string }
        Returns: Json
      }
      calculate_supporter_multiplier: {
        Args: { p_commitment_id: string }
        Returns: number
      }
      can_access_area: {
        Args: { _area: string; _user_id: string }
        Returns: boolean
      }
      can_view_user_data: {
        Args: { _org_id: string; _target_user_id: string }
        Returns: boolean
      }
      check_and_unlock_eligible_insignias: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_certificate_eligibility: {
        Args: { p_training_id: string; p_user_id: string }
        Returns: Json
      }
      check_insignia_criteria: {
        Args: { p_insignia_id: string; p_user_id: string }
        Returns: Json
      }
      check_skills_health: { Args: never; Returns: Json }
      complete_daily_mission: { Args: { p_mission_id: string }; Returns: Json }
      complete_training_with_rewards: {
        Args: { p_training_id: string; p_user_id: string }
        Returns: Json
      }
      create_assessment_notification: {
        Args: {
          p_action_url?: string
          p_data?: Json
          p_message: string
          p_notification_type: string
          p_priority?: string
          p_title: string
          p_user_id: string
        }
        Returns: string
      }
      create_contextual_assessment: {
        Args: {
          p_assessment_type?: string
          p_evaluators?: string[]
          p_origin_event_id: string
          p_origin_id: string
          p_origin_type: string
          p_skill_ids: string[]
          p_user_id: string
        }
        Returns: string
      }
      create_org_invite: {
        Args: {
          p_email?: string
          p_expires_in_days?: number
          p_organization_id: string
          p_role?: string
        }
        Returns: Json
      }
      create_pdi_goal_from_suggestion: {
        Args: {
          p_description: string
          p_origin_assessment_id?: string
          p_plan_id: string
          p_priority?: string
          p_skill_id: string
          p_target_date?: string
          p_title: string
          p_xp_reward?: number
        }
        Returns: string
      }
      distribute_challenge_rewards: {
        Args: { p_commitment_id: string }
        Returns: undefined
      }
      generate_daily_missions: {
        Args: { p_user_id: string }
        Returns: {
          coins_reward: number
          completed_at: string | null
          created_at: string
          current_value: number
          description: string | null
          icon: string | null
          id: string
          is_bonus: boolean
          is_completed: boolean
          mission_date: string
          mission_type: string
          organization_id: string | null
          target_game_type: string | null
          target_skill_id: string | null
          target_value: number
          title: string
          user_id: string
          xp_reward: number
        }[]
        SetofOptions: {
          from: "*"
          to: "daily_missions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      generate_verification_code: { Args: never; Returns: string }
      get_assessment_notifications: {
        Args: { p_user_id: string }
        Returns: {
          action_url: string
          created_at: string
          data: Json
          id: string
          is_read: boolean
          message: string
          priority: string
          title: string
          type: string
        }[]
      }
      get_consolidated_skill_score: {
        Args: { p_period_days?: number; p_skill_id: string; p_user_id: string }
        Returns: Json
      }
      get_evolution_suggestions: {
        Args: { p_limit?: number; p_user_id: string }
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
      get_pdi_suggestions_for_user: {
        Args: { p_user_id: string }
        Returns: {
          priority: string
          reason: string
          skill_id: string
          skill_name: string
          source_id: string
          source_type: string
          suggested_title: string
          suggestion_type: string
          xp_reward: number
        }[]
      }
      get_team_event_stats: {
        Args: { p_days?: number; p_team_id: string }
        Returns: {
          event_count: number
          event_type: string
          total_coins: number
          total_xp: number
          unique_users: number
        }[]
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
      get_training_metrics: {
        Args: {
          p_end_date?: string
          p_org_id?: string
          p_start_date?: string
          p_training_id: string
        }
        Returns: Json
      }
      get_trainings_report: {
        Args: { _org_id: string; _period?: string }
        Returns: Json
      }
      get_user_event_stats: {
        Args: { p_days?: number; p_user_id: string }
        Returns: {
          avg_score: number
          event_count: number
          event_type: string
          total_coins: number
          total_xp: number
        }[]
      }
      get_user_insignias_progress: {
        Args: { p_user_id: string }
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
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member_or_owner: { Args: { _org_id: string }; Returns: boolean }
      is_team_manager: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      issue_certificate: {
        Args: { p_training_id: string; p_user_id: string }
        Returns: Json
      }
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
      notify_team_assessment_cycle: {
        Args: { p_cycle_id: string; p_team_id: string }
        Returns: number
      }
      process_assessment_completion: {
        Args: { p_assessment_id: string }
        Returns: Json
      }
      purchase_marketplace_item: { Args: { p_item_id: string }; Returns: Json }
      recalculate_journey_totals: {
        Args: { p_journey_id: string }
        Returns: undefined
      }
      recalculate_pdi_progress: {
        Args: { plan_id_param: string }
        Returns: undefined
      }
      record_core_event: {
        Args: {
          p_coins_earned?: number
          p_event_type: string
          p_metadata?: Json
          p_organization_id?: string
          p_score?: number
          p_skill_ids?: string[]
          p_team_id?: string
          p_user_id: string
          p_xp_earned?: number
        }
        Returns: string
      }
      record_skill_impact: {
        Args: {
          p_impact_type: string
          p_impact_value: number
          p_metadata?: Json
          p_skill_id: string
          p_source_id: string
          p_source_type: string
          p_user_id: string
        }
        Returns: string
      }
      revoke_org_invite: { Args: { p_invite_id: string }; Returns: Json }
      suggest_assessments_for_user: {
        Args: { p_user_id: string }
        Returns: {
          context_id: string
          context_type: string
          priority: number
          reason: string
          skill_ids: string[]
          suggestion_type: string
        }[]
      }
      suggest_pdi_goals_from_assessment: {
        Args: { p_assessment_cycle_id: string; p_user_id: string }
        Returns: Json
      }
      unlock_insignia: {
        Args: {
          p_insignia_id: string
          p_source_events?: string[]
          p_user_id: string
        }
        Returns: string
      }
      update_mission_progress: {
        Args: {
          p_game_type?: string
          p_increment?: number
          p_mission_type: string
        }
        Returns: Json
      }
      update_mission_progress_for_event: {
        Args: {
          p_event_type: string
          p_game_type?: string
          p_increment?: number
          p_user_id: string
        }
        Returns: undefined
      }
      update_xp_mission_progress: {
        Args: { p_user_id: string; p_xp_earned: number }
        Returns: undefined
      }
      validate_certificate: {
        Args: { p_verification_code: string }
        Returns: Json
      }
      validate_email_domain: {
        Args: { p_email: string; p_organization_id: string }
        Returns: boolean
      }
      validate_module_completion: {
        Args: { p_module_id: string; p_score?: number; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "manager" | "user" | "owner"
      commitment_reward_type: "coins" | "xp" | "both" | "insignia"
      commitment_scope: "team" | "global" | "personal"
      commitment_source: "internal" | "external"
      commitment_status:
        | "draft"
        | "active"
        | "completed"
        | "failed"
        | "cancelled"
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
      app_role: ["super_admin", "admin", "manager", "user", "owner"],
      commitment_reward_type: ["coins", "xp", "both", "insignia"],
      commitment_scope: ["team", "global", "personal"],
      commitment_source: ["internal", "external"],
      commitment_status: [
        "draft",
        "active",
        "completed",
        "failed",
        "cancelled",
      ],
      friendship_status: ["pending", "accepted", "blocked"],
      gift_status: ["pending", "accepted", "rejected"],
      org_role: ["owner", "admin", "manager", "member"],
      quiz_difficulty: ["easy", "medium", "hard"],
      quiz_match_status: ["waiting", "in_progress", "finished", "cancelled"],
    },
  },
} as const
