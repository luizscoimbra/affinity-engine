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
      ad_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          placement: string
          sponsored_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          placement: string
          sponsored_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          placement?: string
          sponsored_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_events_sponsored_id_fkey"
            columns: ["sponsored_id"]
            isOneToOne: false
            referencedRelation: "sponsored_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          match_id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          match_id: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          match_id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_embeddings: {
        Row: {
          embedding: string | null
          profile_id: string
          source_text: string | null
          updated_at: string
        }
        Insert: {
          embedding?: string | null
          profile_id: string
          source_text?: string | null
          updated_at?: string
        }
        Update: {
          embedding?: string | null
          profile_id?: string
          source_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_embeddings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_interests: {
        Row: {
          categoria: string
          profile_id: string
          tag: string
        }
        Insert: {
          categoria?: string
          profile_id: string
          tag: string
        }
        Update: {
          categoria?: string
          profile_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_photos: {
        Row: {
          created_at: string
          id: string
          path: string
          position: number
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          position?: number
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          position?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string
          birth_date: string | null
          body_type: string | null
          city: string | null
          created_at: string
          display_name: string
          elemento: string | null
          eye_color: string | null
          gender: string | null
          hair_color: string | null
          height_cm: number | null
          id: string
          latitude: number | null
          location_source: string | null
          longitude: number | null
          max_age: number
          max_distance_km: number
          min_age: number
          onboarding_complete: boolean
          seeking: string[]
          signo: string | null
          updated_at: string
        }
        Insert: {
          bio?: string
          birth_date?: string | null
          body_type?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          elemento?: string | null
          eye_color?: string | null
          gender?: string | null
          hair_color?: string | null
          height_cm?: number | null
          id: string
          latitude?: number | null
          location_source?: string | null
          longitude?: number | null
          max_age?: number
          max_distance_km?: number
          min_age?: number
          onboarding_complete?: boolean
          seeking?: string[]
          signo?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string
          birth_date?: string | null
          body_type?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          elemento?: string | null
          eye_color?: string | null
          gender?: string | null
          hair_color?: string | null
          height_cm?: number | null
          id?: string
          latitude?: number | null
          location_source?: string | null
          longitude?: number | null
          max_age?: number
          max_distance_km?: number
          min_age?: number
          onboarding_complete?: boolean
          seeking?: string[]
          signo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
        }
        Relationships: []
      }
      sponsored_profiles: {
        Row: {
          accent: string
          active: boolean
          brand_name: string
          categoria: string
          city: string | null
          coupon_code: string | null
          coupon_text: string | null
          created_at: string
          cta_label: string
          cta_url: string | null
          description: string
          headline: string
          id: string
          latitude: number | null
          longitude: number | null
          tagline: string
          tags: string[]
        }
        Insert: {
          accent?: string
          active?: boolean
          brand_name: string
          categoria: string
          city?: string | null
          coupon_code?: string | null
          coupon_text?: string | null
          created_at?: string
          cta_label?: string
          cta_url?: string | null
          description: string
          headline: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          tagline: string
          tags?: string[]
        }
        Update: {
          accent?: string
          active?: boolean
          brand_name?: string
          categoria?: string
          city?: string | null
          coupon_code?: string | null
          coupon_text?: string | null
          created_at?: string
          cta_label?: string
          cta_url?: string | null
          description?: string
          headline?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          tagline?: string
          tags?: string[]
        }
        Relationships: []
      }
      swipes: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          liked: boolean
          target_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          liked: boolean
          target_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          liked?: boolean
          target_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buscar_candidatos: {
        Args: { p_limit?: number }
        Returns: {
          affinity: number
          bio: string
          body_type: string
          city: string
          display_name: string
          distance_km: number
          elemento: string
          eye_color: string
          gender: string
          hair_color: string
          height_cm: number
          id: string
          idade: number
          same_element: boolean
          shared_tags: string[]
          signo: string
          soft_score: number
          tags: string[]
        }[]
      }
      calc_elemento: { Args: { signo: string }; Returns: string }
      calc_signo: { Args: { d: string }; Returns: string }
      in_match: { Args: { m: string; u: string }; Returns: boolean }
      is_blocked: { Args: { a: string; b: string }; Returns: boolean }
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
