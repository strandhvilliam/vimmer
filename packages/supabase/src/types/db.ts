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
          id: number
          marathon_id: number
          name: string
          number_of_photos: number
          topic_start_index: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          marathon_id: number
          name: string
          number_of_photos: number
          topic_start_index?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
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
      demologs: {
        Row: {
          created_at: string
          id: number
          message: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: number
          message: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: string
          type?: string
        }
        Relationships: []
      }
      device_groups: {
        Row: {
          created_at: string
          icon: string
          id: number
          marathon_id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: number
          marathon_id: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
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
          domain: string
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          domain: string
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          domain?: string
          id?: number
          name?: string
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
          id: number
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
          id?: number
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
          id?: number
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
      submission_errors: {
        Row: {
          context: Json | null
          created_at: string
          description: string | null
          error_code: string
          id: number
          message: string
          severity: string
          submission_id: number | null
          submission_key: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          description?: string | null
          error_code: string
          id?: number
          message: string
          severity?: string
          submission_id?: number | null
          submission_key?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          description?: string | null
          error_code?: string
          id?: number
          message?: string
          severity?: string
          submission_id?: number | null
          submission_key?: string | null
        }
        Relationships: []
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
      validation_errors: {
        Row: {
          created_at: string
          dismissed: boolean
          id: number
          message: string | null
          participant_id: number
          severity: string
          submission_id: number | null
        }
        Insert: {
          created_at?: string
          dismissed?: boolean
          id?: number
          message?: string | null
          participant_id: number
          severity?: string
          submission_id?: number | null
        }
        Update: {
          created_at?: string
          dismissed?: boolean
          id?: number
          message?: string | null
          participant_id?: number
          severity?: string
          submission_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "validation_errors_participant_id_fkey"
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
        Args: {
          participant_id: number
          total_expected: number
        }
        Returns: Json
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
