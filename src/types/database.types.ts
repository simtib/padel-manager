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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      courts: {
        Row: {
          court_number: number | null
          created_at: string
          facility_id: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          court_number?: number | null
          created_at?: string
          facility_id: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          court_number?: number | null
          created_at?: string
          facility_id?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "courts_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      event_admins: {
        Row: {
          created_at: string
          event_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_admins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_courts: {
        Row: {
          court_id: string
          event_id: string
        }
        Insert: {
          court_id: string
          event_id: string
        }
        Update: {
          court_id?: string
          event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_courts_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_courts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          event_id: string
          guest_player_id: string | null
          id: string
          joined_at: string
          registered_by: string | null
          registration_status: string
          user_id: string | null
        }
        Insert: {
          event_id: string
          guest_player_id?: string | null
          id?: string
          joined_at?: string
          registered_by?: string | null
          registration_status?: string
          user_id?: string | null
        }
        Update: {
          event_id?: string
          guest_player_id?: string | null
          id?: string
          joined_at?: string
          registered_by?: string | null
          registration_status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_guest_player_id_fkey"
            columns: ["guest_player_id"]
            isOneToOne: false
            referencedRelation: "guest_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_type: string
          facility_id: string | null
          id: string
          invite_code: string
          max_players: number
          name: string
          owner_id: string
          start_time: string
          status: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_type: string
          facility_id?: string | null
          id?: string
          invite_code: string
          max_players?: number
          name: string
          owner_id: string
          start_time: string
          status?: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_type?: string
          facility_id?: string | null
          id?: string
          invite_code?: string
          max_players?: number
          name?: string
          owner_id?: string
          start_time?: string
          status?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          address: string
          city: string
          country: string
          created_at: string
          created_by: string | null
          google_maps_url: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          country?: string
          created_at?: string
          created_by?: string | null
          google_maps_url?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          country?: string
          created_at?: string
          created_by?: string | null
          google_maps_url?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facilities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_players: {
        Row: {
          claimed_by_user_id: string | null
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          claimed_by_user_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          claimed_by_user_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_players_claimed_by_user_id_fkey"
            columns: ["claimed_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_players_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_sets: {
        Row: {
          match_id: string
          set_number: number
          team_a_score: number
          team_b_score: number
        }
        Insert: {
          match_id: string
          set_number: number
          team_a_score: number
          team_b_score: number
        }
        Update: {
          match_id?: string
          set_number?: number
          team_a_score?: number
          team_b_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_sets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          court_id: string | null
          created_at: string
          event_id: string
          group_id: string | null
          id: string
          next_match_id: string | null
          next_match_slot: string | null
          round_number: number
          scheduled_order: number | null
          stage: string
          status: string
          team_a_id: string | null
          team_a_score: number | null
          team_b_id: string | null
          team_b_score: number | null
          updated_at: string
          winner_team_id: string | null
        }
        Insert: {
          court_id?: string | null
          created_at?: string
          event_id: string
          group_id?: string | null
          id?: string
          next_match_id?: string | null
          next_match_slot?: string | null
          round_number?: number
          scheduled_order?: number | null
          stage: string
          status?: string
          team_a_id?: string | null
          team_a_score?: number | null
          team_b_id?: string | null
          team_b_score?: number | null
          updated_at?: string
          winner_team_id?: string | null
        }
        Update: {
          court_id?: string | null
          created_at?: string
          event_id?: string
          group_id?: string | null
          id?: string
          next_match_id?: string | null
          next_match_slot?: string | null
          round_number?: number
          scheduled_order?: number | null
          stage?: string
          status?: string
          team_a_id?: string | null
          team_a_score?: number | null
          team_b_id?: string | null
          team_b_score?: number | null
          updated_at?: string
          winner_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "tournament_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_next_match_id_fkey"
            columns: ["next_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_requests: {
        Row: {
          created_at: string
          event_id: string
          id: string
          requested_participant_id: string
          requester_participant_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          requested_participant_id: string
          requester_participant_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          requested_participant_id?: string
          requester_participant_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_requests_requested_participant_id_fkey"
            columns: ["requested_participant_id"]
            isOneToOne: false
            referencedRelation: "event_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_requests_requester_participant_id_fkey"
            columns: ["requester_participant_id"]
            isOneToOne: false
            referencedRelation: "event_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      player_group_members: {
        Row: {
          created_at: string
          group_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "player_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          participant_id: string
          team_id: string
        }
        Insert: {
          participant_id: string
          team_id: string
        }
        Update: {
          participant_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "event_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_locked: boolean
          name: string | null
          team_number: number | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_locked?: boolean
          name?: string | null
          team_number?: number | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_locked?: boolean
          name?: string | null
          team_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_group_teams: {
        Row: {
          group_id: string
          seed: number | null
          team_id: string
        }
        Insert: {
          group_id: string
          seed?: number | null
          team_id: string
        }
        Update: {
          group_id?: string
          seed?: number | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_group_teams_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "tournament_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_group_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_groups: {
        Row: {
          created_at: string
          event_id: string
          group_order: number
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          event_id: string
          group_order?: number
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          event_id?: string
          group_order?: number
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_groups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_rules: {
        Row: {
          allow_draw: boolean
          created_at: string
          event_id: string
          id: string
          points_draw: number
          points_loss: number
          points_win: number
          qualifiers_per_group: number
          ranking_rules: Json
          updated_at: string
        }
        Insert: {
          allow_draw?: boolean
          created_at?: string
          event_id: string
          id?: string
          points_draw?: number
          points_loss?: number
          points_win?: number
          qualifiers_per_group?: number
          ranking_rules?: Json
          updated_at?: string
        }
        Update: {
          allow_draw?: boolean
          created_at?: string
          event_id?: string
          id?: string
          points_draw?: number
          points_loss?: number
          points_win?: number
          qualifiers_per_group?: number
          ranking_rules?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_rules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_event: { Args: { target_event_id: string }; Returns: boolean }
      is_event_admin: { Args: { target_event_id: string }; Returns: boolean }
      record_match_score: {
        Args: {
          score_a: number
          score_b: number
          set_scores?: Json
          target_event_id: string
          target_match_id: string
        }
        Returns: Json
      }
      register_for_event: { Args: { target_event_id: string }; Returns: string }
      remove_event_participant: {
        Args: { target_event_id: string; target_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
