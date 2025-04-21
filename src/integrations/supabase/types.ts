export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ad_platform_integrations: {
        Row: {
          account_id: string
          account_name: string | null
          business_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_connected: boolean | null
          last_synced: string | null
          metadata: Json | null
          needs_reauth: boolean | null
          platform: string
          refresh_token: string | null
          token: string | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          account_name?: string | null
          business_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_synced?: string | null
          metadata?: Json | null
          needs_reauth?: boolean | null
          platform: string
          refresh_token?: string | null
          token?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          account_name?: string | null
          business_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_synced?: string | null
          metadata?: Json | null
          needs_reauth?: boolean | null
          platform?: string
          refresh_token?: string | null
          token?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_platform_integrations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          brand_voice: Json | null
          business_type: string
          contact: Json
          created_at: string | null
          description: string | null
          id: string
          integrations: Json | null
          is_deleted: boolean | null
          name: string
          offerings: string[] | null
          onboarding_step: number
          settings: Json | null
          status: string
          target_audience: Json | null
          updated_at: string | null
        }
        Insert: {
          brand_voice?: Json | null
          business_type: string
          contact?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          integrations?: Json | null
          is_deleted?: boolean | null
          name: string
          offerings?: string[] | null
          onboarding_step?: number
          settings?: Json | null
          status?: string
          target_audience?: Json | null
          updated_at?: string | null
        }
        Update: {
          brand_voice?: Json | null
          business_type?: string
          contact?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          integrations?: Json | null
          is_deleted?: boolean | null
          name?: string
          offerings?: string[] | null
          onboarding_step?: number
          settings?: Json | null
          status?: string
          target_audience?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          session_id: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          metadata: Json | null
          status: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          status?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          status?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          business_id: string
          content_type: string
          created_at: string | null
          generated_from: Json | null
          id: string
          is_deleted: boolean | null
          metadata: Json | null
          params: Json
          parsed_content: Json
          raw_prompt: string | null
          raw_response: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          content_type: string
          created_at?: string | null
          generated_from?: Json | null
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          params?: Json
          parsed_content?: Json
          raw_prompt?: string | null
          raw_response?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          content_type?: string
          created_at?: string | null
          generated_from?: Json | null
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          params?: Json
          parsed_content?: Json
          raw_prompt?: string | null
          raw_response?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_results: {
        Row: {
          confidence_interval: Json | null
          created_at: string | null
          experiment_id: string
          id: string
          is_significant: boolean | null
          last_updated: string | null
          lift: number | null
          p_value: number | null
          results: Json | null
          updated_at: string | null
        }
        Insert: {
          confidence_interval?: Json | null
          created_at?: string | null
          experiment_id: string
          id?: string
          is_significant?: boolean | null
          last_updated?: string | null
          lift?: number | null
          p_value?: number | null
          results?: Json | null
          updated_at?: string | null
        }
        Update: {
          confidence_interval?: Json | null
          created_at?: string | null
          experiment_id?: string
          id?: string
          is_significant?: boolean | null
          last_updated?: string | null
          lift?: number | null
          p_value?: number | null
          results?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiment_results_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          business_id: string
          content_id_original: string
          content_id_variant: string
          created_at: string | null
          end_date: string
          id: string
          name: string
          split: Json
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          content_id_original: string
          content_id_variant: string
          created_at?: string | null
          end_date: string
          id?: string
          name: string
          split?: Json
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          content_id_original?: string
          content_id_variant?: string
          created_at?: string | null
          end_date?: string
          id?: string
          name?: string
          split?: Json
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_content_id_original_fkey"
            columns: ["content_id_original"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_content_id_variant_fkey"
            columns: ["content_id_variant"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_insights: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          metrics: Json | null
          other_insights: Json | null
          pattern_insights: Json | null
          primary_category: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          metrics?: Json | null
          other_insights?: Json | null
          pattern_insights?: Json | null
          primary_category: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          metrics?: Json | null
          other_insights?: Json | null
          pattern_insights?: Json | null
          primary_category?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_insights_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
