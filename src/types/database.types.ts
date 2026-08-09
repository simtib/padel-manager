export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          display_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          display_name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          display_name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      facilities: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          country: string;
          google_maps_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city: string;
          country?: string;
          google_maps_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          city?: string;
          country?: string;
          google_maps_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      courts: {
        Row: {
          id: string;
          facility_id: string;
          name: string;
          court_number: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          facility_id: string;
          name: string;
          court_number?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          facility_id?: string;
          name?: string;
          court_number?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          owner_id: string;
          event_type: 'normal_game' | 'tournament';
          name: string;
          description: string | null;
          event_date: string;
          start_time: string;
          facility_id: string | null;
          status: 'draft' | 'open' | 'full' | 'teams_generated' | 'ready' | 'in_progress' | 'knockout' | 'completed' | 'cancelled';
          visibility: 'private' | 'public';
          max_players: number;
          invite_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          event_type: 'normal_game' | 'tournament';
          name: string;
          description?: string | null;
          event_date: string;
          start_time: string;
          facility_id?: string | null;
          status?: 'draft' | 'open' | 'full' | 'teams_generated' | 'ready' | 'in_progress' | 'knockout' | 'completed' | 'cancelled';
          visibility?: 'private' | 'public';
          max_players?: number;
          invite_code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          event_type?: 'normal_game' | 'tournament';
          name?: string;
          description?: string | null;
          event_date?: string;
          start_time?: string;
          facility_id?: string | null;
          status?: 'draft' | 'open' | 'full' | 'teams_generated' | 'ready' | 'in_progress' | 'knockout' | 'completed' | 'cancelled';
          visibility?: 'private' | 'public';
          max_players?: number;
          invite_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_participants: {
        Row: {
          id: string;
          event_id: string;
          user_id: string | null;
          guest_player_id: string | null;
          registration_status: 'confirmed' | 'waiting_list' | 'withdrawn';
          registered_by: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id?: string | null;
          guest_player_id?: string | null;
          registration_status?: 'confirmed' | 'waiting_list' | 'withdrawn';
          registered_by?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string | null;
          guest_player_id?: string | null;
          registration_status?: 'confirmed' | 'waiting_list' | 'withdrawn';
          registered_by?: string | null;
          joined_at?: string;
        };
      };
      partner_requests: {
        Row: {
          id: string;
          event_id: string;
          requester_participant_id: string;
          requested_participant_id: string;
          status: 'pending' | 'accepted' | 'declined';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          requester_participant_id: string;
          requested_participant_id: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          requester_participant_id?: string;
          requested_participant_id?: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          event_id: string;
          name: string | null;
          team_number: number | null;
          is_locked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name?: string | null;
          team_number?: number | null;
          is_locked?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string | null;
          team_number?: number | null;
          is_locked?: boolean;
          created_at?: string;
        };
      };
      team_members: {
        Row: {
          team_id: string;
          participant_id: string;
        };
        Insert: {
          team_id: string;
          participant_id: string;
        };
        Update: {
          team_id?: string;
          participant_id?: string;
        };
      };
      tournament_groups: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          group_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          group_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          group_order?: number;
          created_at?: string;
        };
      };
      tournament_group_teams: {
        Row: {
          group_id: string;
          team_id: string;
          seed: number | null;
        };
        Insert: {
          group_id: string;
          team_id: string;
          seed?: number | null;
        };
        Update: {
          group_id?: string;
          team_id?: string;
          seed?: number | null;
        };
      };
      matches: {
        Row: {
          id: string;
          event_id: string;
          group_id: string | null;
          stage: 'group' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final' | 'normal';
          round_number: number;
          court_id: string | null;
          team_a_id: string | null;
          team_b_id: string | null;
          team_a_score: number | null;
          team_b_score: number | null;
          winner_team_id: string | null;
          status: 'scheduled' | 'ready' | 'in_progress' | 'completed';
          scheduled_order: number | null;
          next_match_id: string | null;
          next_match_slot: '1' | '2' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          group_id?: string | null;
          stage: 'group' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final' | 'normal';
          round_number?: number;
          court_id?: string | null;
          team_a_id?: string | null;
          team_b_id?: string | null;
          team_a_score?: number | null;
          team_b_score?: number | null;
          winner_team_id?: string | null;
          status?: 'scheduled' | 'ready' | 'in_progress' | 'completed';
          scheduled_order?: number | null;
          next_match_id?: string | null;
          next_match_slot?: '1' | '2' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          group_id?: string | null;
          stage?: 'group' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final' | 'normal';
          round_number?: number;
          court_id?: string | null;
          team_a_id?: string | null;
          team_b_id?: string | null;
          team_a_score?: number | null;
          team_b_score?: number | null;
          winner_team_id?: string | null;
          status?: 'scheduled' | 'ready' | 'in_progress' | 'completed';
          scheduled_order?: number | null;
          next_match_id?: string | null;
          next_match_slot?: '1' | '2' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tournament_rules: {
        Row: {
          id: string;
          event_id: string;
          points_win: number;
          points_draw: number;
          points_loss: number;
          qualifiers_per_group: number;
          allow_draw: boolean;
          ranking_rules: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          points_win?: number;
          points_draw?: number;
          points_loss?: number;
          qualifiers_per_group?: number;
          allow_draw?: boolean;
          ranking_rules?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          points_win?: number;
          points_draw?: number;
          points_loss?: number;
          qualifiers_per_group?: number;
          allow_draw?: boolean;
          ranking_rules?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      player_groups: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      player_group_members: {
        Row: {
          group_id: string;
          user_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          group_id: string;
          user_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          group_id?: string;
          user_id?: string;
          status?: string;
          created_at?: string;
        };
      };
    };
  };
}
