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
      account: {
        Row: {
          accessToken: string | null
          accessTokenExpiresAt: string | null
          accountId: string
          createdAt: string
          id: string
          idToken: string | null
          password: string | null
          providerId: string
          refreshToken: string | null
          refreshTokenExpiresAt: string | null
          scope: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId: string
          createdAt: string
          id: string
          idToken?: string | null
          password?: string | null
          providerId: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt: string
          userId: string
        }
        Update: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId?: string
          createdAt?: string
          id?: string
          idToken?: string | null
          password?: string | null
          providerId?: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_classes: {
        Row: {
          created_at: string
          description: string | null
          id: number
          marathon_id: number
          name: string
          number_of_photos: number
          topic_start_index: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          marathon_id: number
          name: string
          number_of_photos: number
          topic_start_index?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          marathon_id?: number
          name?: string
          number_of_photos?: number
          topic_start_index?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_classes_marathon_id_fkey"
            columns: ["marathon_id"]
            isOneToOne: false
            referencedRelation: "marathons"
            referencedColumns: ["id"]
          },
        ]
      }
      device_groups: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: number
          marathon_id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: number
          marathon_id: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: number
          marathon_id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_groups_marathon_id_fkey"
            columns: ["marathon_id"]
            isOneToOne: false
            referencedRelation: "marathons"
            referencedColumns: ["id"]
          },
        ]
      }
      marathons: {
        Row: {
          created_at: string
          description: string | null
          domain: string
          end_date: string | null
          id: number
          languages: string
          logo_url: string | null
          name: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain: string
          end_date?: string | null
          id?: number
          languages?: string
          logo_url?: string | null
          name: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string
          end_date?: string | null
          id?: number
          languages?: string
          logo_url?: string | null
          name?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      participants: {
        Row: {
          competition_class_id: number | null
          created_at: string
          device_group_id: number | null
          domain: string
          email: string | null
          firstname: string
          id: number
          lastname: string
          marathon_id: number
          reference: string
          status: string
          updated_at: string | null
          upload_count: number
        }
        Insert: {
          competition_class_id?: number | null
          created_at?: string
          device_group_id?: number | null
          domain?: string
          email?: string | null
          firstname?: string
          id?: number
          lastname?: string
          marathon_id: number
          reference: string
          status?: string
          updated_at?: string | null
          upload_count?: number
        }
        Update: {
          competition_class_id?: number | null
          created_at?: string
          device_group_id?: number | null
          domain?: string
          email?: string | null
          firstname?: string
          id?: number
          lastname?: string
          marathon_id?: number
          reference?: string
          status?: string
          updated_at?: string | null
          upload_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "participants_competition_class_id_fkey"
            columns: ["competition_class_id"]
            isOneToOne: false
            referencedRelation: "competition_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_device_group_id_fkey"
            columns: ["device_group_id"]
            isOneToOne: false
            referencedRelation: "device_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_marathon_id_fkey"
            columns: ["marathon_id"]
            isOneToOne: false
            referencedRelation: "marathons"
            referencedColumns: ["id"]
          },
        ]
      }
      rule_configs: {
        Row: {
          created_at: string
          id: number
          marathon_id: number
          params: Json | null
          rule_key: string
          severity: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          marathon_id: number
          params?: Json | null
          rule_key: string
          severity?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          marathon_id?: number
          params?: Json | null
          rule_key?: string
          severity?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rule_configs_marathon_id_fkey"
            columns: ["marathon_id"]
            isOneToOne: false
            referencedRelation: "marathons"
            referencedColumns: ["id"]
          },
        ]
      }
      session: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          ipAddress: string | null
          token: string
          updatedAt: string
          userAgent: string | null
          userId: string
        }
        Insert: {
          createdAt: string
          expiresAt: string
          id: string
          ipAddress?: string | null
          token: string
          updatedAt: string
          userAgent?: string | null
          userId: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          ipAddress?: string | null
          token?: string
          updatedAt?: string
          userAgent?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          created_at: string
          exif: Json | null
          id: number
          key: string
          marathon_id: number
          metadata: Json | null
          mime_type: string | null
          participant_id: number
          preview_key: string | null
          size: number | null
          status: string
          thumbnail_key: string | null
          topic_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          exif?: Json | null
          id?: number
          key: string
          marathon_id: number
          metadata?: Json | null
          mime_type?: string | null
          participant_id: number
          preview_key?: string | null
          size?: number | null
          status?: string
          thumbnail_key?: string | null
          topic_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          exif?: Json | null
          id?: number
          key?: string
          marathon_id?: number
          metadata?: Json | null
          mime_type?: string | null
          participant_id?: number
          preview_key?: string | null
          size?: number | null
          status?: string
          thumbnail_key?: string | null
          topic_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_marathon_id_fkey"
            columns: ["marathon_id"]
            isOneToOne: false
            referencedRelation: "marathons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string
          id: number
          marathon_id: number
          name: string
          order_index: number
          scheduled_start: string | null
          updated_at: string | null
          visibility: string
        }
        Insert: {
          created_at?: string
          id?: number
          marathon_id: number
          name: string
          order_index?: number
          scheduled_start?: string | null
          updated_at?: string | null
          visibility?: string
        }
        Update: {
          created_at?: string
          id?: number
          marathon_id?: number
          name?: string
          order_index?: number
          scheduled_start?: string | null
          updated_at?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_marathon_id_fkey"
            columns: ["marathon_id"]
            isOneToOne: false
            referencedRelation: "marathons"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          createdAt: string
          email: string
          emailVerified: boolean
          id: string
          image: string | null
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt: string
          email: string
          emailVerified: boolean
          id: string
          image?: string | null
          name: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          email?: string
          emailVerified?: boolean
          id?: string
          image?: string | null
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      user_marathons: {
        Row: {
          created_at: string
          id: number
          marathon_id: number
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          marathon_id: number
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          marathon_id?: number
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_marathons_marathon_id_fkey"
            columns: ["marathon_id"]
            isOneToOne: false
            referencedRelation: "marathons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_marathons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_results: {
        Row: {
          created_at: string
          file_name: string | null
          id: number
          message: string
          outcome: string
          participant_id: number
          rule_key: string
          severity: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          id?: number
          message: string
          outcome: string
          participant_id: number
          rule_key: string
          severity: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          id?: number
          message?: string
          outcome?: string
          participant_id?: number
          rule_key?: string
          severity?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validation_results_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      verification: {
        Row: {
          createdAt: string | null
          expiresAt: string
          id: string
          identifier: string
          updatedAt: string | null
          value: string
        }
        Insert: {
          createdAt?: string | null
          expiresAt: string
          id: string
          identifier: string
          updatedAt?: string | null
          value: string
        }
        Update: {
          createdAt?: string | null
          expiresAt?: string
          id?: string
          identifier?: string
          updatedAt?: string | null
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_upload_counter: {
        Args: { participant_id: number; total_expected: number }
        Returns: Json
      }
      update_topic_order: {
        Args: { p_marathon_id: number; p_topic_ids: number[] }
        Returns: undefined
      }
    }
    Enums: {
      upload_status: "initialized" | "processing" | "error" | "completed"
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
    Enums: {
      upload_status: ["initialized", "processing", "error", "completed"],
    },
  },
} as const
