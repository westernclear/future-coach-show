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
      coach_scores: {
        Row: {
          calculated_at: string
          coach_id: string
          editorial_points: number
          event_count: number
          game_id: string | null
          id: string
          is_final: boolean
          movement: number | null
          objective_points: number
          rank: number | null
          scope: string
          scope_key: string
          total_points: number
          updated_at: string
        }
        Insert: {
          calculated_at?: string
          coach_id: string
          editorial_points?: number
          event_count?: number
          game_id?: string | null
          id?: string
          is_final?: boolean
          movement?: number | null
          objective_points?: number
          rank?: number | null
          scope: string
          scope_key: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          calculated_at?: string
          coach_id?: string
          editorial_points?: number
          event_count?: number
          game_id?: string | null
          id?: string
          is_final?: boolean
          movement?: number | null
          objective_points?: number
          rank?: number | null
          scope?: string
          scope_key?: string
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
          ends_at: string
          id: string
          is_featured: boolean
          is_published: boolean
          locks_at: string
          max_entries_per_user: number
          name: string
          opens_at: string
          roster_size: number
          rules: Json
          slug: string
          sport_id: string | null
          status: Database["public"]["Enums"]["contest_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          ends_at: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          locks_at: string
          max_entries_per_user?: number
          name: string
          opens_at: string
          roster_size: number
          rules?: Json
          slug: string
          sport_id?: string | null
          status?: Database["public"]["Enums"]["contest_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          ends_at?: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          locks_at?: string
          max_entries_per_user?: number
          name?: string
          opens_at?: string
          roster_size?: number
          rules?: Json
          slug?: string
          sport_id?: string | null
          status?: Database["public"]["Enums"]["contest_status"]
          updated_at?: string
        }
        Relationships: [
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          favorite_sports: string[]
          favorite_team_ids: string[]
          id: string
          location: string | null
          notification_preferences: Json
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          favorite_sports?: string[]
          favorite_team_ids?: string[]
          id: string
          location?: string | null
          notification_preferences?: Json
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          favorite_sports?: string[]
          favorite_team_ids?: string[]
          id?: string
          location?: string | null
          notification_preferences?: Json
          updated_at?: string
          username?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "editor" | "scoring_analyst" | "user"
      contest_status:
        | "draft"
        | "open"
        | "locked"
        | "live"
        | "final"
        | "cancelled"
      game_status: "scheduled" | "live" | "final" | "postponed" | "cancelled"
      review_status: "pending" | "approved" | "rejected" | "overridden"
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
      contest_status: ["draft", "open", "locked", "live", "final", "cancelled"],
      game_status: ["scheduled", "live", "final", "postponed", "cancelled"],
      review_status: ["pending", "approved", "rejected", "overridden"],
    },
  },
} as const
