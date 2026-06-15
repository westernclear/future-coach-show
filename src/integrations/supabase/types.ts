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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_verifications: {
        Row: {
          email_verified_at: string | null
          phone_verified_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          email_verified_at?: string | null
          phone_verified_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          email_verified_at?: string | null
          phone_verified_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_scores: {
        Row: {
          calculated_at: string
          coach_id: string
          context_points: number
          decision_points: number
          editorial_points: number
          event_count: number
          game_id: string | null
          id: string
          is_final: boolean
          movement: number | null
          objective_points: number
          performance_points: number
          rank: number | null
          scope: string
          scope_key: string
          scoring_breakdown: Json
          total_points: number
          updated_at: string
        }
        Insert: {
          calculated_at?: string
          coach_id: string
          context_points?: number
          decision_points?: number
          editorial_points?: number
          event_count?: number
          game_id?: string | null
          id?: string
          is_final?: boolean
          movement?: number | null
          objective_points?: number
          performance_points?: number
          rank?: number | null
          scope: string
          scope_key: string
          scoring_breakdown?: Json
          total_points?: number
          updated_at?: string
        }
        Update: {
          calculated_at?: string
          coach_id?: string
          context_points?: number
          decision_points?: number
          editorial_points?: number
          event_count?: number
          game_id?: string | null
          id?: string
          is_final?: boolean
          movement?: number | null
          objective_points?: number
          performance_points?: number
          rank?: number | null
          scope?: string
          scope_key?: string
          scoring_breakdown?: Json
          total_points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_scores_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_scores_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          biography: string | null
          created_at: string
          full_name: string
          id: string
          image_url: string | null
          metadata: Json
          provider_refs: Json
          role: string
          slug: string
          sport_id: string
          status: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          biography?: string | null
          created_at?: string
          full_name: string
          id?: string
          image_url?: string | null
          metadata?: Json
          provider_refs?: Json
          role: string
          slug: string
          sport_id: string
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          biography?: string | null
          created_at?: string
          full_name?: string
          id?: string
          image_url?: string | null
          metadata?: Json
          provider_refs?: Json
          role?: string
          slug?: string
          sport_id?: string
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaches_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_entries: {
        Row: {
          contest_id: string
          created_at: string
          entry_name: string
          id: string
          rank: number | null
          submitted_at: string | null
          tiebreaker_value: number | null
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contest_id: string
          created_at?: string
          entry_name: string
          id?: string
          rank?: number | null
          submitted_at?: string | null
          tiebreaker_value?: number | null
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contest_id?: string
          created_at?: string
          entry_name?: string
          id?: string
          rank?: number | null
          submitted_at?: string | null
          tiebreaker_value?: number | null
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_entries_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contests: {
        Row: {
          created_at: string
          description: string
          eligibility_rules: Json
          ends_at: string
          entry_price_cents: number
          entry_type: Database["public"]["Enums"]["contest_entry_type"]
          format: Database["public"]["Enums"]["contest_format"]
          guaranteed_prize_cents: number
          head_to_head_size: number | null
          id: string
          is_featured: boolean
          is_published: boolean
          league_id: string | null
          locks_at: string
          max_entries_per_user: number
          name: string
          opens_at: string
          payout_structure: Json
          platform_fee_bps: number
          roster_size: number
          rules: Json
          settlement_status: Database["public"]["Enums"]["contest_settlement_status"]
          slug: string
          sport_id: string | null
          status: Database["public"]["Enums"]["contest_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          eligibility_rules?: Json
          ends_at: string
          entry_price_cents?: number
          entry_type?: Database["public"]["Enums"]["contest_entry_type"]
          format?: Database["public"]["Enums"]["contest_format"]
          guaranteed_prize_cents?: number
          head_to_head_size?: number | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          league_id?: string | null
          locks_at: string
          max_entries_per_user?: number
          name: string
          opens_at: string
          payout_structure?: Json
          platform_fee_bps?: number
          roster_size: number
          rules?: Json
          settlement_status?: Database["public"]["Enums"]["contest_settlement_status"]
          slug: string
          sport_id?: string | null
          status?: Database["public"]["Enums"]["contest_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          eligibility_rules?: Json
          ends_at?: string
          entry_price_cents?: number
          entry_type?: Database["public"]["Enums"]["contest_entry_type"]
          format?: Database["public"]["Enums"]["contest_format"]
          guaranteed_prize_cents?: number
          head_to_head_size?: number | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          league_id?: string | null
          locks_at?: string
          max_entries_per_user?: number
          name?: string
          opens_at?: string
          payout_structure?: Json
          platform_fee_bps?: number
          roster_size?: number
          rules?: Json
          settlement_status?: Database["public"]["Enums"]["contest_settlement_status"]
          slug?: string
          sport_id?: string | null
          status?: Database["public"]["Enums"]["contest_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contests_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contests_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          away_score: number
          away_team_id: string
          clock_display: string | null
          created_at: string
          home_score: number
          home_team_id: string
          id: string
          league_id: string
          period_label: string | null
          provider_refs: Json
          source_updated_at: string | null
          starts_at: string
          status: Database["public"]["Enums"]["game_status"]
          updated_at: string
          venue: string | null
        }
        Insert: {
          away_score?: number
          away_team_id: string
          clock_display?: string | null
          created_at?: string
          home_score?: number
          home_team_id: string
          id?: string
          league_id: string
          period_label?: string | null
          provider_refs?: Json
          source_updated_at?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["game_status"]
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away_score?: number
          away_team_id?: string
          clock_display?: string | null
          created_at?: string
          home_score?: number
          home_team_id?: string
          id?: string
          league_id?: string
          period_label?: string | null
          provider_refs?: Json
          source_updated_at?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["game_status"]
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_verifications: {
        Row: {
          address_status: string
          government_id_status: string
          location_status: string
          provider_reference: string | null
          selfie_match_status: string
          status: string
          tax_status: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          address_status?: string
          government_id_status?: string
          location_status?: string
          provider_reference?: string | null
          selfie_match_status?: string
          status?: string
          tax_status?: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          address_status?: string
          government_id_status?: string
          location_status?: string
          provider_reference?: string | null
          selfie_match_status?: string
          status?: string
          tax_status?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      leagues: {
        Row: {
          country_code: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          provider_refs: Json
          slug: string
          sport_id: string
          updated_at: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          provider_refs?: Json
          slug: string
          sport_id: string
          updated_at?: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          provider_refs?: Json
          slug?: string
          sport_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leagues_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_alert_state: {
        Row: {
          consecutive_failures: number
          id: boolean
          last_alert_sent_at: string | null
          last_alert_signature: string | null
          updated_at: string
        }
        Insert: {
          consecutive_failures?: number
          id?: boolean
          last_alert_sent_at?: string | null
          last_alert_signature?: string | null
          updated_at?: string
        }
        Update: {
          consecutive_failures?: number
          id?: boolean
          last_alert_sent_at?: string | null
          last_alert_signature?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      monitoring_events: {
        Row: {
          created_at: string
          duration_ms: number | null
          id: string
          kind: Database["public"]["Enums"]["monitoring_event_kind"]
          message: string
          metadata: Json
          route: string | null
          severity: Database["public"]["Enums"]["monitoring_severity"]
          status_code: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          kind: Database["public"]["Enums"]["monitoring_event_kind"]
          message: string
          metadata?: Json
          route?: string | null
          severity?: Database["public"]["Enums"]["monitoring_severity"]
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["monitoring_event_kind"]
          message?: string
          metadata?: Json
          route?: string | null
          severity?: Database["public"]["Enums"]["monitoring_severity"]
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      prize_awards: {
        Row: {
          amount: number
          awarded_at: string
          contest_id: string
          created_at: string
          currency: string | null
          entry_id: string | null
          fulfilled_at: string | null
          fulfillment_reference: string | null
          id: string
          kind: Database["public"]["Enums"]["reward_kind"]
          metadata: Json
          placement: number
          status: Database["public"]["Enums"]["reward_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          awarded_at?: string
          contest_id: string
          created_at?: string
          currency?: string | null
          entry_id?: string | null
          fulfilled_at?: string | null
          fulfillment_reference?: string | null
          id?: string
          kind: Database["public"]["Enums"]["reward_kind"]
          metadata?: Json
          placement: number
          status?: Database["public"]["Enums"]["reward_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          awarded_at?: string
          contest_id?: string
          created_at?: string
          currency?: string | null
          entry_id?: string | null
          fulfilled_at?: string | null
          fulfillment_reference?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["reward_kind"]
          metadata?: Json
          placement?: number
          status?: Database["public"]["Enums"]["reward_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prize_awards_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prize_awards_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "contest_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_upload_rejections: {
        Row: {
          byte_size: number
          claimed_type: string | null
          created_at: string
          detected_type: string | null
          height: number | null
          id: string
          reason_code: string
          user_id: string
          validation_duration_ms: number
          width: number | null
        }
        Insert: {
          byte_size: number
          claimed_type?: string | null
          created_at?: string
          detected_type?: string | null
          height?: number | null
          id?: string
          reason_code: string
          user_id: string
          validation_duration_ms: number
          width?: number | null
        }
        Update: {
          byte_size?: number
          claimed_type?: string | null
          created_at?: string
          detected_type?: string | null
          height?: number | null
          id?: string
          reason_code?: string
          user_id?: string
          validation_duration_ms?: number
          width?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_confirmed_at: string | null
          avatar_type: string
          avatar_url: string | null
          bio: string | null
          country_code: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string
          fantasy_skill_level: string | null
          favorite_sport: string | null
          favorite_sports: string[]
          favorite_team: string | null
          favorite_team_ids: string[]
          id: string
          legal_name: string | null
          location: string | null
          location_confirmed_at: string | null
          mobile_number: string | null
          notification_preferences: Json
          onboarding_completed_at: string | null
          onboarding_step: number
          preferred_league: string | null
          region: string | null
          updated_at: string
          username: string
        }
        Insert: {
          age_confirmed_at?: string | null
          avatar_type?: string
          avatar_url?: string | null
          bio?: string | null
          country_code?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name: string
          fantasy_skill_level?: string | null
          favorite_sport?: string | null
          favorite_sports?: string[]
          favorite_team?: string | null
          favorite_team_ids?: string[]
          id: string
          legal_name?: string | null
          location?: string | null
          location_confirmed_at?: string | null
          mobile_number?: string | null
          notification_preferences?: Json
          onboarding_completed_at?: string | null
          onboarding_step?: number
          preferred_league?: string | null
          region?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          age_confirmed_at?: string | null
          avatar_type?: string
          avatar_url?: string | null
          bio?: string | null
          country_code?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string
          fantasy_skill_level?: string | null
          favorite_sport?: string | null
          favorite_sports?: string[]
          favorite_team?: string | null
          favorite_team_ids?: string[]
          id?: string
          legal_name?: string | null
          location?: string | null
          location_confirmed_at?: string | null
          mobile_number?: string | null
          notification_preferences?: Json
          onboarding_completed_at?: string | null
          onboarding_step?: number
          preferred_league?: string | null
          region?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      reward_badges: {
        Row: {
          created_at: string
          criteria: Json
          description: string
          icon: string
          id: string
          is_active: boolean
          name: string
          slug: string
          tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description: string
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      reward_ledger: {
        Row: {
          amount: number
          awarded_at: string
          contest_id: string | null
          created_at: string
          currency: string | null
          description: string
          entry_id: string | null
          expires_at: string | null
          fulfilled_at: string | null
          id: string
          kind: Database["public"]["Enums"]["reward_kind"]
          metadata: Json
          reference_key: string | null
          status: Database["public"]["Enums"]["reward_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          awarded_at?: string
          contest_id?: string | null
          created_at?: string
          currency?: string | null
          description: string
          entry_id?: string | null
          expires_at?: string | null
          fulfilled_at?: string | null
          id?: string
          kind: Database["public"]["Enums"]["reward_kind"]
          metadata?: Json
          reference_key?: string | null
          status?: Database["public"]["Enums"]["reward_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          awarded_at?: string
          contest_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string
          entry_id?: string | null
          expires_at?: string | null
          fulfilled_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["reward_kind"]
          metadata?: Json
          reference_key?: string | null
          status?: Database["public"]["Enums"]["reward_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_ledger_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_ledger_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "contest_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      roster_picks: {
        Row: {
          coach_id: string
          created_at: string
          entry_id: string
          id: string
          locked_at: string | null
          points: number
          slot: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          entry_id: string
          id?: string
          locked_at?: string | null
          points?: number
          slot: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          entry_id?: string
          id?: string
          locked_at?: string | null
          points?: number
          slot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roster_picks_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_picks_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "contest_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      score_events: {
        Row: {
          coach_id: string
          confidence: number | null
          created_at: string
          event_type: string
          evidence: Json
          explanation: string
          game_id: string
          id: string
          idempotency_key: string
          is_published: boolean
          occurred_at: string
          points: number
          review_status: Database["public"]["Enums"]["review_status"]
          reviewed_at: string | null
          reviewed_by: string | null
          scoring_rule_id: string
          source_ref: string | null
          source_type: string
          supersedes_event_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          confidence?: number | null
          created_at?: string
          event_type: string
          evidence?: Json
          explanation: string
          game_id: string
          id?: string
          idempotency_key: string
          is_published?: boolean
          occurred_at: string
          points: number
          review_status?: Database["public"]["Enums"]["review_status"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          scoring_rule_id: string
          source_ref?: string | null
          source_type: string
          supersedes_event_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          confidence?: number | null
          created_at?: string
          event_type?: string
          evidence?: Json
          explanation?: string
          game_id?: string
          id?: string
          idempotency_key?: string
          is_published?: boolean
          occurred_at?: string
          points?: number
          review_status?: Database["public"]["Enums"]["review_status"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          scoring_rule_id?: string
          source_ref?: string | null
          source_type?: string
          supersedes_event_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_events_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_events_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_events_scoring_rule_id_fkey"
            columns: ["scoring_rule_id"]
            isOneToOne: false
            referencedRelation: "scoring_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_events_supersedes_event_id_fkey"
            columns: ["supersedes_event_id"]
            isOneToOne: false
            referencedRelation: "score_events"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_rules: {
        Row: {
          coach_role: string
          config: Json
          created_at: string
          description: string
          effective_from: string
          effective_to: string | null
          event_type: string
          id: string
          is_active: boolean
          name: string
          points: number
          sport_id: string
          updated_at: string
          version: number
        }
        Insert: {
          coach_role: string
          config?: Json
          created_at?: string
          description: string
          effective_from: string
          effective_to?: string | null
          event_type: string
          id?: string
          is_active?: boolean
          name: string
          points: number
          sport_id: string
          updated_at?: string
          version: number
        }
        Update: {
          coach_role?: string
          config?: Json
          created_at?: string
          description?: string
          effective_from?: string
          effective_to?: string | null
          event_type?: string
          id?: string
          is_active?: boolean
          name?: string
          points?: number
          sport_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "scoring_rules_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      security_findings: {
        Row: {
          created_at: string
          description: string
          external_id: string
          first_detected_at: string
          id: string
          last_detected_at: string
          owner: string | null
          remediation: string
          resolved_at: string | null
          scan_run_id: string | null
          scanner: string
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          external_id: string
          first_detected_at?: string
          id?: string
          last_detected_at?: string
          owner?: string | null
          remediation?: string
          resolved_at?: string | null
          scan_run_id?: string | null
          scanner: string
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          external_id?: string
          first_detected_at?: string
          id?: string
          last_detected_at?: string
          owner?: string | null
          remediation?: string
          resolved_at?: string | null
          scan_run_id?: string | null
          scanner?: string
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_findings_scan_run_id_fkey"
            columns: ["scan_run_id"]
            isOneToOne: false
            referencedRelation: "security_scan_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      security_notifications: {
        Row: {
          created_at: string
          event_type: string
          finding_id: string
          id: string
          message: string
          read_at: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          finding_id: string
          id?: string
          message: string
          read_at?: string | null
          severity: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          finding_id?: string
          id?: string
          message?: string
          read_at?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_notifications_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "security_findings"
            referencedColumns: ["id"]
          },
        ]
      }
      security_scan_runs: {
        Row: {
          created_at: string
          critical_count: number
          high_count: number
          id: string
          issues_found: number
          low_count: number
          medium_count: number
          scanned_at: string
          scanner_version: string | null
          source: string
          status: string
        }
        Insert: {
          created_at?: string
          critical_count?: number
          high_count?: number
          id?: string
          issues_found?: number
          low_count?: number
          medium_count?: number
          scanned_at?: string
          scanner_version?: string | null
          source: string
          status?: string
        }
        Update: {
          created_at?: string
          critical_count?: number
          high_count?: number
          id?: string
          issues_found?: number
          low_count?: number
          medium_count?: number
          scanned_at?: string
          scanner_version?: string | null
          source?: string
          status?: string
        }
        Relationships: []
      }
      sports: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          abbreviation: string
          city: string | null
          created_at: string
          id: string
          is_active: boolean
          league_id: string
          logo_url: string | null
          name: string
          provider_refs: Json
          slug: string
          updated_at: string
        }
        Insert: {
          abbreviation: string
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          league_id: string
          logo_url?: string | null
          name: string
          provider_refs?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          abbreviation?: string
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          league_id?: string
          logo_url?: string | null
          name?: string
          provider_refs?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          contest_id: string | null
          created_at: string
          id: string
          metadata: Json
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          contest_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          contest_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "reward_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consents: {
        Row: {
          accepted_at: string
          created_at: string
          document_type: string
          document_version: string
          id: string
          metadata: Json
          user_id: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          document_type: string
          document_version: string
          id?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          document_type?: string
          document_version?: string
          id?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          fantasy_points: number
          promotional_tokens: number
          reward_credits: number
          updated_at: string
          user_id: string
          winnings_cents: number
        }
        Insert: {
          fantasy_points?: number
          promotional_tokens?: number
          reward_credits?: number
          updated_at?: string
          user_id: string
          winnings_cents?: number
        }
        Update: {
          fantasy_points?: number
          promotional_tokens?: number
          reward_credits?: number
          updated_at?: string
          user_id?: string
          winnings_cents?: number
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
      app_role: "admin" | "editor" | "scoring_analyst" | "user"
      contest_entry_type: "free" | "paid"
      contest_format: "global" | "private_league" | "head_to_head"
      contest_settlement_status:
        | "unsettled"
        | "pending_review"
        | "settled"
        | "cancelled"
        | "refunded"
      contest_status:
        | "draft"
        | "open"
        | "locked"
        | "live"
        | "final"
        | "cancelled"
      game_status: "scheduled" | "live" | "final" | "postponed" | "cancelled"
      monitoring_event_kind:
        | "client_error"
        | "server_error"
        | "probe_failure"
        | "probe_success"
        | "alert_sent"
      monitoring_severity: "info" | "warning" | "error" | "critical"
      review_status: "pending" | "approved" | "rejected" | "overridden"
      reward_kind:
        | "points"
        | "contest_ticket"
        | "badge"
        | "merchandise"
        | "cash"
      reward_status:
        | "pending"
        | "available"
        | "fulfilled"
        | "cancelled"
        | "expired"
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
      app_role: ["admin", "editor", "scoring_analyst", "user"],
      contest_entry_type: ["free", "paid"],
      contest_format: ["global", "private_league", "head_to_head"],
      contest_settlement_status: [
        "unsettled",
        "pending_review",
        "settled",
        "cancelled",
        "refunded",
      ],
      contest_status: ["draft", "open", "locked", "live", "final", "cancelled"],
      game_status: ["scheduled", "live", "final", "postponed", "cancelled"],
      monitoring_event_kind: [
        "client_error",
        "server_error",
        "probe_failure",
        "probe_success",
        "alert_sent",
      ],
      monitoring_severity: ["info", "warning", "error", "critical"],
      review_status: ["pending", "approved", "rejected", "overridden"],
      reward_kind: ["points", "contest_ticket", "badge", "merchandise", "cash"],
      reward_status: [
        "pending",
        "available",
        "fulfilled",
        "cancelled",
        "expired",
      ],
    },
  },
} as const
